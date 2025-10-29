// FILE: src/components/RosterDialog.tsx
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, setHours, addHours } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { RosterSummary, SuggestedEmployee, ShiftWithEmployee, EmployeeWithDetails, ProjectedShift } from '@/types/database.types';
import EmployeeSchedule from '@/components/EmployeeSchedule';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { UserPlus, UserX, Star, Ban } from 'lucide-react';

interface RosterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  day: { date: Date; summary: RosterSummary } | null;
  departmentId: string | null;
  zoneId: string | null;
}

const fetchProjectedShifts = async (employeeId: string | null): Promise<ProjectedShift[]> => {
  if (!employeeId) return [];
  const today = new Date();
  const thirtyDaysFromNow = addHours(today, 24 * 30);

  const { data, error } = await supabase.rpc('get_projected_employee_schedule', {
    p_employee_id: employeeId,
    p_start_date: format(today, 'yyyy-MM-dd'),
    p_end_date: format(thirtyDaysFromNow, 'yyyy-MM-dd')
  });

  if (error) throw new Error(error.message);
  return data || [];
}

const fetchEmployeeData = async (employeeId: string | null): Promise<EmployeeWithDetails | null> => {
  if (!employeeId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, full_name, role,
      departments (name),
      employee_skills ( skills (name) ),
      employee_certifications ( certifications (name) ),
      performance_reviews ( attendance_score, reliability_score, performance_rating )
    `)
    .eq('id', employeeId)
    .single();

  if (error) throw new Error(error.message);
  
  if (data) {
    // @ts-ignore
    data.departments = Array.isArray(data.departments) ? data.departments[0] : data.departments;
  }
  return data as unknown as EmployeeWithDetails;
};

// This function correctly gets who is already booked for the specific department
const fetchRosterForDay = async (departmentId: string, date: Date) => {
    const { data, error } = await supabase.rpc('get_roster_for_day', {
        target_department_id: departmentId,
        target_date: format(date, 'yyyy-MM-dd')
    });
    if (error) throw new Error(error.message);
    return data.map(item => ({
      id: item.id, status: item.status,
      profiles: { id: item.employee_id, full_name: item.employee_full_name, role: item.employee_role }
    })) as ShiftWithEmployee[];
};

const fetchAvailableEmployees = async (date: Date): Promise<SuggestedEmployee[]> => {
    const { data, error } = await supabase.rpc('get_available_employees_for_day', {
        target_date: format(date, 'yyyy-MM-dd')
    });
    if (error) {
        console.error("Suggestion fetch error:", error);
        throw new Error(error.message);
    }
    return data || [];
};

export function RosterDialog({ isOpen, onOpenChange, day, departmentId, zoneId }: RosterDialogProps) {
  const queryClient = useQueryClient();
  const [detailEmployee, setDetailEmployee] = useState<SuggestedEmployee | null>(null);
  const queryEnabled = isOpen && !!departmentId && !!day;

  const { data: shifts, isLoading: isLoadingShifts } = useQuery({
    queryKey: ['rosterForDay', departmentId, day?.date],
    queryFn: () => fetchRosterForDay(departmentId!, day!.date),
    enabled: queryEnabled,
  });

  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['availableEmployees', day?.date],
    queryFn: () => fetchAvailableEmployees(day!.date),
    enabled: queryEnabled,
  });

  const { data: employeeDetails, isLoading: isLoadingEmployeeDetails } = useQuery({
    queryKey: ['employeeData', detailEmployee?.id],
    queryFn: () => fetchEmployeeData(detailEmployee!.id),
    enabled: !!detailEmployee,
  });

  const { data: projectedShifts, isLoading: isLoadingProjectedShifts } = useQuery({
    queryKey: ['projectedShifts', detailEmployee?.id],
    queryFn: () => fetchProjectedShifts(detailEmployee!.id),
    enabled: !!detailEmployee
  });

  const { confirmed, pending } = useMemo(() => {
    const confirmed = shifts?.filter(s => s.status === 'confirmed' && s.profiles) || [];
    const pending = shifts?.filter(s => s.status === 'pending' && s.profiles) || [];
    return { confirmed, pending };
  }, [shifts]);

  const handleRosterAction = async (action: 'create' | 'delete', employeeId: string, shiftId?: string) => {
    let error;
    if (action === 'create' && day && zoneId) {
        const startTime = setHours(day.date, 9);
        const endTime = addHours(startTime, 8);
        ({ error } = await supabase.from('shifts').insert({
            employee_id: employeeId, zone_id: zoneId,
            start_time: startTime.toISOString(), end_time: endTime.toISOString(),
            status: 'pending'
        }));
        if (!error) toast.success("Shift request sent!");
    } else if (action === 'delete' && shiftId) {
        ({ error } = await supabase.from('shifts').delete().eq('id', shiftId));
        if (!error) toast.success("Shift removed/cancelled.");
    }
    
    if (error) { toast.error(`Operation failed: ${error.message}`); } 
    else {
        // Invalidate all relevant queries to refresh the UI completely
        queryClient.invalidateQueries({ queryKey: ['rosterForDay'] });
        queryClient.invalidateQueries({ queryKey: ['availableEmployees'] });
        queryClient.invalidateQueries({ queryKey: ['rosterSummary'] });
    }
  };

  const target = day?.summary.target_staff_count ?? 0;
  const rostered = day?.summary.rostered_staff_count ?? 0;
  const staffGap = target - rostered;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Roster for {day ? format(day.date, "EEEE, MMMM d") : ''}</DialogTitle>
          <DialogDescription>View rostered staff and fill remaining slots.</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <Card className="p-4 text-center"><CardHeader className="p-2"><CardTitle>Target</CardTitle></CardHeader><p className="text-4xl font-bold">{target}</p></Card>
            <Card className="p-4 text-center"><CardHeader className="p-2"><CardTitle>Confirmed</CardTitle></CardHeader><p className="text-4xl font-bold">{rostered}</p></Card>
            <Card className={`p-4 text-center border-2 ${staffGap > 0 ? 'border-orange-400' : 'border-green-400'}`}>
                <CardHeader className="p-2"><CardTitle>Gap</CardTitle></CardHeader>
                <p className={`text-4xl font-bold ${staffGap > 0 ? 'text-orange-500' : 'text-green-500'}`}>{staffGap}</p>
            </Card>
        </div>

        <Tabs defaultValue="suggestions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Suggestions ({isLoadingSuggestions ? '...' : (suggestions?.length || 0)})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({isLoadingShifts ? '...' : pending.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({isLoadingShifts ? '...' : confirmed.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="mt-4 max-h-[300px] overflow-y-auto">
            {isLoadingSuggestions ? <Skeleton className="h-40 w-full" /> : 
              (suggestions && suggestions.length > 0) ? suggestions.map(emp => (
                <div key={emp.id} onClick={() => setDetailEmployee(emp)} className="cursor-pointer">
                  <EmployeeRow buttons={null}>
                    <Avatar><AvatarFallback>{emp.full_name.charAt(0)}</AvatarFallback></Avatar>
                    <div><p className="font-semibold">{emp.full_name}</p><p className="text-xs text-muted-foreground flex items-center gap-1">{emp.role} • <Star className="h-3 w-3 text-amber-400" /> {emp.avg_performance_rating.toFixed(1)}</p></div>
                  </EmployeeRow>
                </div>
              )) : <div className="text-center text-sm text-muted-foreground pt-8">No available employees to suggest.</div>
            }
          </TabsContent>

          <TabsContent value="pending" className="mt-4 max-h-[300px] overflow-y-auto">
             {isLoadingShifts ? <Skeleton className="h-40 w-full" /> : (pending && pending.length > 0) ? pending.map(shift => ( <EmployeeRow key={shift.id} buttons={<Button size="sm" variant="destructive" onClick={() => handleRosterAction('delete', shift.profiles!.id, shift.id)}><Ban className="mr-2 h-4 w-4" /> Cancel</Button>}> <Avatar><AvatarFallback>{shift.profiles!.full_name.charAt(0)}</AvatarFallback></Avatar> <div><p className="font-semibold">{shift.profiles!.full_name}</p><p className="text-xs text-muted-foreground">{shift.profiles!.role}</p></div> </EmployeeRow> )) : <div className="text-center text-sm text-muted-foreground pt-8">No pending shift requests.</div> }
          </TabsContent>
          <TabsContent value="confirmed" className="mt-4 max-h-[300px] overflow-y-auto">
            {isLoadingShifts ? <Skeleton className="h-40 w-full" /> : (confirmed && confirmed.length > 0) ? confirmed.map(shift => ( <EmployeeRow key={shift.id} buttons={<Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRosterAction('delete', shift.profiles!.id, shift.id)}><UserX className="mr-2 h-4 w-4" /> Remove</Button>}> <Avatar><AvatarFallback>{shift.profiles!.full_name.charAt(0)}</AvatarFallback></Avatar> <div><p className="font-semibold">{shift.profiles!.full_name}</p><p className="text-xs text-muted-foreground">{shift.profiles!.role}</p></div> </EmployeeRow> )) : <div className="text-center text-sm text-muted-foreground pt-8">No staff confirmed for this day.</div> }
          </TabsContent>
        </Tabs>
        
        <Sheet open={!!detailEmployee} onOpenChange={(open) => !open && setDetailEmployee(null)}>
          <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{detailEmployee?.full_name}</SheetTitle>
              <SheetDescription>{detailEmployee?.role}</SheetDescription>
            </SheetHeader>
            <div className="py-4">
              {(isLoadingEmployeeDetails || isLoadingProjectedShifts) && <Skeleton className="h-64 w-full" />}
              {employeeDetails && projectedShifts && <EmployeeSchedule employee={employeeDetails} shifts={projectedShifts} />}
            </div>
            <SheetFooter>
              <Button onClick={() => {
                handleRosterAction('create', detailEmployee!.id);
                setDetailEmployee(null);
              }}>
                <UserPlus className="mr-2 h-4 w-4" /> Request Shift
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </DialogContent>
    </Dialog>
  )
}

const EmployeeRow = ({ children, buttons }: { children: React.ReactNode, buttons: React.ReactNode }) => (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-3">{children}</div>
      <div className="flex gap-2">{buttons}</div>
    </div>
);