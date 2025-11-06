// FILE: src/components/RoasterDialog.tsx
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
import { RosterSummary, SuggestedEmployee, ShiftWithEmployee, EmployeeWithDetails, ProjectedShift, Department, Skill, Certification, PerformanceReview } from '@/types/database.types'; // Make sure all types are imported
import EmployeeSchedule from '@/components/EmployeeSchedule';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { UserPlus, UserX, Star, Ban, Award, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RosterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  day: { date: Date; summary: RosterSummary } | null;
  departmentId: string | null;
  zoneId: string | null;
}

const fetchProjectedShifts = async (employeeId: string | null, dateToExclude: Date | null): Promise<ProjectedShift[]> => {
  if (!employeeId) return [];
  const today = new Date();
  const thirtyDaysFromNow = addHours(today, 24 * 30);

  const { data, error } = await supabase.rpc('get_projected_employee_schedule', {
    p_employee_id: employeeId,
    p_start_date: format(today, 'yyyy-MM-dd'),
    p_end_date: format(thirtyDaysFromNow, 'yyyy-MM-dd')
  });

  if (error) throw new Error(error.message);
  
  // De-duplicate shifts: only take the first one for any given day.
  const uniqueShifts: ProjectedShift[] = [];
  const seenDates = new Set<string>();

  const excludeDateString = dateToExclude ? format(dateToExclude, 'yyyy-MM-dd') : null;

  if (data) {
    for (const shift of data) {
      const shiftDay = format(new Date(shift.start_time), 'yyyy-MM-dd');
      if (!seenDates.has(shiftDay)) {
        // If the current shift's day is the one we're trying to book, skip it
        if (shiftDay === excludeDateString) {
          continue;
        }

        uniqueShifts.push(shift);
        seenDates.add(shiftDay);
      }
    }
  }
  return uniqueShifts;
}

const fetchEmployeeData = async (employeeId: string | null): Promise<EmployeeWithDetails | null> => {
  if (!employeeId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, full_name, role, department_id,
      departments (id, name, icon, color),
      employee_skills ( skills (name) ),
      employee_certifications ( certifications (name) ),
      performance_reviews ( attendance_score, reliability_score, performance_rating )
    `)
    .eq('id', employeeId)
    .single();

  if (error) throw new Error(error.message);
  
  if (data) {
    // Supabase can return joined `departments` as an array even if it's single
    // Ensure it's correctly typed as a single object or null
    // @ts-ignore // Ignore the potential type mismatch for data.departments for now
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

// NEW: Raw interface for the data structure directly returned by Supabase's .select()
interface RawEmployeeDataFromSelect {
  id: string;
  full_name: string;
  role: string;
  department_id: string | null;
  // Supabase returns departments as an array of objects even for one-to-one relationships
  departments: { id: string; name: string; icon: string | null; color: string | null }[] | null;
  employee_skills: { skills: Skill }[];
  employee_certifications: { certifications: Certification }[];
  performance_reviews: PerformanceReview[];
}

// NEW: Fetch all employees with their full details (used as a base for suggestions)
const fetchAllEmployeesWithFullDetails = async (): Promise<EmployeeWithDetails[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, full_name, role, department_id,
      departments (id, name, icon, color),
      employee_skills ( skills (name) ),
      employee_certifications ( certifications (name) ),
      performance_reviews ( attendance_score, reliability_score, performance_rating )
    `);
  if (error) {
    console.error("Error fetching all employees with full details:", error);
    throw new Error(error.message);
  }

  // Safely transform the raw data into the EmployeeWithDetails type
  return (data as unknown as RawEmployeeDataFromSelect[] || []).map(rawEmployee => ({
    ...rawEmployee,
    // Extract the first department object from the array, or null if not present
    departments: rawEmployee.departments && rawEmployee.departments.length > 0
                 ? rawEmployee.departments[0] as Department
                 : null,
  })) as EmployeeWithDetails[];
};


// MODIFIED: fetchAvailableEmployees to return SuggestedEmployee with full details
const fetchAvailableEmployees = async (date: Date, departmentId: string | null): Promise<SuggestedEmployee[]> => {
    const allEmployees = await fetchAllEmployeesWithFullDetails(); // Get all employees with full details
    const rosteredShifts = await fetchRosterForDay(departmentId!, date); // Get who is rostered for this day/dept

    const rosteredEmployeeIds = new Set(rosteredShifts.map(s => s.profiles?.id).filter(Boolean));

    const available = allEmployees
        .filter(emp => !rosteredEmployeeIds.has(emp.id)) // Filter out those already rostered
        .filter(emp => !departmentId || emp.departments?.id === departmentId) // Filter by department if specified
        .map(emp => {
            // Calculate avg_performance_rating from performance_reviews
            const performanceRatings = emp.performance_reviews?.map(pr => pr.performance_rating).filter(p => p !== null) || [];
            const avg_performance_rating = performanceRatings.length > 0
                ? performanceRatings.reduce((sum, rating) => sum + rating!, 0) / performanceRatings.length
                : 0;

            return {
                ...emp,
                avg_performance_rating: parseFloat(avg_performance_rating.toFixed(1)) // Attach for convenience
            } as SuggestedEmployee;
        })
        .sort((a, b) => b.avg_performance_rating - a.avg_performance_rating) // Sort by performance (highest first)
        .slice(0, 15); // Limit suggestions to a reasonable number, e.g., top 15

    return available;
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
    queryKey: ['availableEmployees', day?.date, departmentId], // Add departmentId to key for accurate caching
    queryFn: () => fetchAvailableEmployees(day!.date, departmentId),
    enabled: queryEnabled,
    staleTime: 1000 * 60, // 1 minute
  });

  const { data: employeeDetails, isLoading: isLoadingEmployeeDetails } = useQuery({
    queryKey: ['employeeData', detailEmployee?.id],
    queryFn: () => fetchEmployeeData(detailEmployee!.id),
    enabled: !!detailEmployee,
  });

  const { data: projectedShifts, isLoading: isLoadingProjectedShifts } = useQuery({
    queryKey: ['projectedShifts', detailEmployee?.id, day?.date], // Add day.date to key for distinction
    queryFn: () => fetchProjectedShifts(detailEmployee!.id, day?.date ?? null),
    enabled: !!detailEmployee,
  });

  const { confirmed, pending } = useMemo(() => {
    const confirmed = shifts?.filter(s => s.status === 'confirmed' && s.profiles) || [];
    const pending = shifts?.filter(s => s.status === 'pending' && s.profiles) || [];
    return { confirmed, pending };
  }, [shifts]);

  const handleRosterAction = async (action: 'create' | 'delete', employeeId: string, shiftId?: string) => {
    let error;
    if (action === 'create' && day && zoneId) {
        // Assume a standard 9 AM to 5 PM shift for new requests
        const startTime = setHours(day.date, 9);
        const endTime = addHours(startTime, 8); // 8-hour shift
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
        queryClient.invalidateQueries({ queryKey: ['projectedShifts'] }); // Invalidate for selected employee if they were detailed
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
              (suggestions && suggestions.length > 0) ? suggestions.map(emp => {
                const skills = emp.employee_skills?.map(es => es.skills.name) || [];
                const certs = emp.employee_certifications?.map(ec => ec.certifications.name) || [];
                const performance = emp.performance_reviews?.[0]; // Taking the first review for simplicity

                const reasoning: string[] = [];
                // Reasoning based on performance rating
                if (emp.avg_performance_rating >= 4.5) {
                  reasoning.push(`Top Rated (${emp.avg_performance_rating.toFixed(1)}/5)`);
                } else if (emp.avg_performance_rating >= 4.0) {
                  reasoning.push(`High Rated (${emp.avg_performance_rating.toFixed(1)}/5)`);
                }
                
                // Reasoning based on skills
                if (skills.includes('Ride Operation')) reasoning.push('Ride Operation Skill');
                if (skills.includes('First Aid')) reasoning.push('First Aid Skill');
                if (skills.includes('Customer Service')) reasoning.push('Customer Service Skill');
                if (skills.includes('Cash Handling')) reasoning.push('Cash Handling Skill');

                // Reasoning based on certifications
                if (certs.includes('Ride Safety Level 1')) reasoning.push('Ride Safety Certified');
                if (certs.includes('CPR Certified')) reasoning.push('CPR Certified');
                if (certs.includes('ServSafe')) reasoning.push('ServSafe Certified');

                // Reasoning based on attendance/reliability (from the first performance review)
                if (performance) {
                  if ((performance.attendance_score || 0) > 95) reasoning.push('Excellent Attendance');
                  if ((performance.reliability_score || 0) > 95) reasoning.push('Highly Reliable');
                }

                // If no specific reasoning, provide a general one
                if (reasoning.length === 0) {
                    reasoning.push('Good fit based on overall profile.');
                }

                return (
                  <div key={emp.id} className="cursor-pointer" onClick={() => setDetailEmployee(emp)}>
                    <EmployeeRow buttons={null}> {/* Buttons for detail actions are handled by SheetFooter */}
                      <Avatar><AvatarFallback>{emp.full_name.charAt(0)}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{emp.full_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {emp.role} {emp.avg_performance_rating > 0 && `• ${emp.avg_performance_rating.toFixed(1)}`} <Star className="h-3 w-3 text-amber-400" />
                        </p>
                        {/* Displaying reasoning */}
                        {reasoning.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 text-xs">
                              {reasoning.slice(0,3).map((r, rIdx) => ( // Show top 3 reasons as badges
                                  <Badge key={rIdx} variant="outline" className="text-primary-foreground/80 bg-primary/20">
                                      {r.includes("Top Rated") || r.includes("High Rated") ? <Star className="h-3 w-3 mr-1 text-amber-400" /> : 
                                       r.includes("Attendance") || r.includes("Reliable") ? <Clock className="h-3 w-3 mr-1 text-green-500" /> : 
                                       r.includes("Skill") ? <Award className="h-3 w-3 mr-1 text-purple-400" /> :
                                       r.includes("Certified") ? <CheckCircle className="h-3 w-3 mr-1 text-blue-400" /> : null}
                                      {r}
                                  </Badge>
                              ))}
                              {reasoning.length > 3 && (
                                  <Badge variant="outline" className="text-primary-foreground/80 bg-primary/20">
                                      +{reasoning.length - 3} more
                                  </Badge>
                              )}
                          </div>
                        )}
                      </div>
                    </EmployeeRow>
                  </div>
                );
              }) : <div className="text-center text-sm text-muted-foreground pt-8">No available employees to suggest.</div>
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