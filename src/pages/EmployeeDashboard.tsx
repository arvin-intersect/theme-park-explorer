// FILE: src/pages/EmployeeDashboard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Check, X, RefreshCw } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";
import { toast } from "@/components/ui/sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { EmployeeWithDetails } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetchEmployeeList = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name');

  if (error) throw new Error(error.message);
  return data;
};

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

const fetchProjectedShiftsWithStatus = async (employeeId: string | null) => {
  if (!employeeId) return { pending: [], confirmed: [] };

  const today = new Date();
  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const { data, error } = await supabase.rpc('get_projected_employee_schedule', {
    p_employee_id: employeeId,
    p_start_date: format(today, 'yyyy-MM-dd'),
    p_end_date: format(ninetyDaysFromNow, 'yyyy-MM-dd')
  });

  if (error) throw new Error(error.message);
  
  // De-duplicate shifts: only take the first one for any given day.
  const uniqueShifts = [];
  const seenDates = new Set();
  if (data) {
    for (const shift of data) {
      const shiftDay = format(new Date(shift.start_time), 'yyyy-MM-dd');
      if (!seenDates.has(shiftDay)) {
        uniqueShifts.push(shift);
        seenDates.add(shiftDay);
      }
    }
  }

  const pending = uniqueShifts.filter(s => s.status === 'pending');
  const confirmed = uniqueShifts.filter(s => s.status === 'confirmed');
  return { pending, confirmed };
}

const EmployeeDashboard = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: employeeList, isLoading: isLoadingList } = useQuery({
    queryKey: ['employeeList'],
    queryFn: fetchEmployeeList,
  });

  const { data: employee, isLoading: isLoadingDetails, refetch: refetchDetails } = useQuery({
    queryKey: ['employeeData', selectedEmployeeId],
    queryFn: () => fetchEmployeeData(selectedEmployeeId),
    enabled: !!selectedEmployeeId,
  });

  const { data: shifts, isLoading: isLoadingShifts, refetch: refetchShifts } = useQuery({
      queryKey: ['projectedShifts', selectedEmployeeId],
      queryFn: () => fetchProjectedShiftsWithStatus(selectedEmployeeId),
      enabled: !!selectedEmployeeId
  });

  const handleShiftResponse = async (shiftId: string, newStatus: 'confirmed' | 'rejected') => {
    toast.warning("This is a demo action. Shift status is not persisted for projected shifts.");
    // In a real app, you would find the original shift ID from the pattern and update it.
    // For this demo, we'll just optimistically refetch.
    refetchShifts();
    queryClient.invalidateQueries({ queryKey: ['rosterSummary'] });
  };
  
  const isLoading = isLoadingDetails || isLoadingShifts;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-workspace-light/20 to-primary/5">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
            <CardHeader className="p-0 mb-4">
              <CardTitle>Employee View</CardTitle>
              <CardDescription>Select an employee to view their dashboard or refresh their current data.</CardDescription>
            </CardHeader>
            <div className="flex w-full items-center gap-2">
              <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId || ''}>
                  <SelectTrigger><SelectValue placeholder={isLoadingList ? "Loading..." : "Select an employee"} /></SelectTrigger>
                  <SelectContent>
                      {employeeList?.map(emp => (<SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>))}
                  </SelectContent>
              </Select>
               <Button variant="outline" size="icon" onClick={() => { refetchDetails(); refetchShifts(); }} disabled={!selectedEmployeeId || isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Refresh data</span>
              </Button>
            </div>
        </Card>

        {!selectedEmployeeId && (<div className="text-center text-muted-foreground mt-16"><p>Please select an employee.</p></div>)}
        {isLoading && selectedEmployeeId && (<div><Skeleton className="w-full h-96" /></div>)}

        {employee && (
          <>
            <div className="mb-8 animate-slide-in">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-workspace-teal flex items-center justify-center text-white font-bold text-3xl shadow-lg">{employee.full_name.charAt(0)}</div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">{employee.full_name}</h1>
                  <p className="text-muted-foreground">{employee.role}</p>
                  <p className="text-sm text-muted-foreground">{employee.departments?.name}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                
                {shifts && shifts.pending.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>New Shift Requests</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {shifts.pending.map(shift => (
                           <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-semibold">{format(new Date(shift.start_time), "EEEE, MMM d")}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(shift.start_time), "p")} - {format(new Date(shift.end_time), "p")}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-success" onClick={() => handleShiftResponse(shift.id, 'confirmed')}><Check className="w-4 h-4"/></Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => handleShiftResponse(shift.id, 'rejected')}><X className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                  </Card>
                )}

                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar /> Upcoming Shifts</h2>
                  <div className="space-y-4">
                    {shifts && shifts.confirmed.length > 0 ? shifts.confirmed.slice(0, 5).map((shift) => (
                      <Card key={shift.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{format(new Date(shift.start_time), "EEEE, MMM d")}</p>
                            <p className="text-sm text-muted-foreground">{shift.zones?.name || 'General'}</p>
                          </div>
                          <Badge>{formatDistanceToNow(new Date(shift.start_time), { addSuffix: true })}</Badge>
                        </div>
                      </Card>
                    )) : <p className="text-muted-foreground">{isLoadingShifts ? "Loading..." : "No upcoming shifts."}</p>}
                  </div>
                </div>

              </div>
              
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Quick Actions</h2>
                <Button className="w-full justify-start gap-2"><Calendar/>Request Time Off</Button>
                <Button className="w-full justify-start gap-2" variant="outline"><User/>Update Availability</Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;