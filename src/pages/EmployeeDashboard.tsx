// FILE: src/pages/EmployeeDashboard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Award, Check, X } from "lucide-react";
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

// ... (fetchEmployeeList is the same)
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
      shifts ( id, start_time, end_time, status, zones (name) ),
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
    data.shifts?.forEach(shift => { 
      // @ts-ignore
      shift.zones = Array.isArray(shift.zones) ? shift.zones[0] : shift.zones;
    });
  }
  return data as unknown as EmployeeWithDetails;
};

const EmployeeDashboard = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: employeeList, isLoading: isLoadingList } = useQuery({
    queryKey: ['employeeList'],
    queryFn: fetchEmployeeList,
  });

  const { data: employee, isLoading: isLoadingDetails, refetch } = useQuery({
    queryKey: ['employeeData', selectedEmployeeId],
    queryFn: () => fetchEmployeeData(selectedEmployeeId),
    enabled: !!selectedEmployeeId,
  });

  const handleShiftResponse = async (shiftId: string, newStatus: 'confirmed' | 'rejected') => {
    const { error } = await supabase
      .from('shifts')
      .update({ status: newStatus })
      .eq('id', shiftId);

    if (error) {
      toast.error(`Error responding to shift: ${error.message}`);
    } else {
      toast.success(`Shift ${newStatus}.`);
      refetch(); // Refetch this employee's data
      queryClient.invalidateQueries({ queryKey: ['rosterSummary'] }); // Invalidate calendar data for manager/admin
    }
  };

  const pendingShifts = employee?.shifts.filter(s => s.status === 'pending') || [];
  const confirmedShifts = employee?.shifts.filter(s => s.status === 'confirmed') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-workspace-light/20 to-primary/5">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-2">Select an Employee to View Dashboard</h2>
            <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId || ''}>
                <SelectTrigger><SelectValue placeholder={isLoadingList ? "Loading..." : "Select an employee"} /></SelectTrigger>
                <SelectContent>
                    {employeeList?.map(emp => (<SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>))}
                </SelectContent>
            </Select>
        </Card>

        {!selectedEmployeeId && (<div className="text-center text-muted-foreground mt-16"><p>Please select an employee.</p></div>)}
        {isLoadingDetails && selectedEmployeeId && (<div><Skeleton className="w-full h-96" /></div>)}

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
                
                {pendingShifts.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>New Shift Requests</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {pendingShifts.map(shift => (
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
                    {confirmedShifts.length > 0 ? confirmedShifts.map((shift) => (
                      <Card key={shift.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{format(new Date(shift.start_time), "EEEE, MMM d")}</p>
                            <p className="text-sm text-muted-foreground">{shift.zones?.name || 'General'}</p>
                          </div>
                          <Badge>{formatDistanceToNow(new Date(shift.start_time), { addSuffix: true })}</Badge>
                        </div>
                      </Card>
                    )) : <p className="text-muted-foreground">No upcoming shifts.</p>}
                  </div>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* (Skills and Certifications sections remain the same) */}
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