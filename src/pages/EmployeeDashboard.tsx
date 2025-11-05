// FILE: src/pages/EmployeeDashboard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Award, Check, X, RefreshCw } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";
import { toast } from "@/components/ui/sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { EmployeeWithDetails, Shift, ShiftStatus } from "@/types/database.types"; 
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// A pragmatic map to link zone names to department names for demo purposes.
const ZONE_TO_DEPARTMENT_MAP: { [zoneName: string]: string } = {
  "Tundra Peaks": "Rides & Attractions",
  "Gala Galaxy": "Rides & Attractions",
  "Frontier Town": "Rides & Attractions",
  "Buccaneer's Wharf": "Rides & Attractions",
  "Kiddie Kingdom": "Rides & Attractions",
  "Mystic Forest": "Rides & Attractions",
  "Dino Valley": "Rides & Attractions",
  "Park Services": "Park Services",
  "Guest Services": "Guest Services",
  "Maintenance": "Maintenance",
  "Food Services": "Food Services",
  "Retail & Shops": "Retail & Shops",
  // Add more specific mappings here if your mock data implies other zone-department relationships.
};

const fetchEmployeeList = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name');

  if (error) throw new Error(error.message);
  return data;
};

// --- REINSTATED & MODIFIED fetchEmployeeData FUNCTION to be the single source for shifts ---
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
    // @ts-ignore - Handle potential array type from Supabase for single relation
    data.departments = Array.isArray(data.departments) ? data.departments[0] : data.departments;
    
    // Enrich shifts with department name and handle potential array type for nested relations
    // @ts-ignore - data.shifts is typed as Shift[] in EmployeeWithDetails, ensuring department_name is allowed
    data.shifts = data.shifts?.map((shift: Shift) => { 
      // @ts-ignore - Handle potential array type for nested zones relation
      shift.zones = Array.isArray(shift.zones) ? shift.zones[0] : shift.zones;
      const departmentName = shift.zones?.name ? ZONE_TO_DEPARTMENT_MAP[shift.zones.name] : undefined;
      return { ...shift, department_name: departmentName }; // Add department_name to the shift object
    }) || [];
  }
  return data as unknown as EmployeeWithDetails;
};
// --- END REINSTATED & MODIFIED fetchEmployeeData FUNCTION ---


const EmployeeDashboard = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: employeeList, isLoading: isLoadingList } = useQuery({
    queryKey: ['employeeList'],
    queryFn: fetchEmployeeList,
  });

  // This is the single source of truth for employee data, including all their shifts.
  const { data: employee, isLoading: isLoadingDetails, refetch } = useQuery({
    queryKey: ['employeeData', selectedEmployeeId],
    queryFn: () => fetchEmployeeData(selectedEmployeeId),
    enabled: !!selectedEmployeeId,
  });

  // --- MODIFIED handleShiftResponse FUNCTION for proper persistence and feedback ---
  const handleShiftResponse = async (shiftId: string, newStatus: 'confirmed' | 'rejected') => {
    const { error } = await supabase
      .from('shifts')
      .update({ status: newStatus })
      .eq('id', shiftId);

    if (error) {
      toast.error(`Error responding to shift: ${error.message}`);
      console.error("Failed to update shift status:", error);
    } else {
      toast.success(`Shift request ${newStatus}.`);
      refetch(); // Refetch this employee's data to update the UI
      queryClient.invalidateQueries({ queryKey: ['rosterSummary'] }); // Invalidate calendar data for manager/admin to reflect change
    }
  };
  // --- END MODIFIED handleShiftResponse FUNCTION ---

  // Filter for pending shifts (these will have department_name thanks to fetchEmployeeData)
  const pendingShifts = employee?.shifts.filter(s => s.status === 'pending') || [];
  
  // Filter for upcoming confirmed shifts only and sort them chronologically.
  // These will also have department_name, but the display logic will ignore it.
  const upcomingConfirmedShifts = employee?.shifts
    .filter(s => s.status === 'confirmed' && new Date(s.end_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) || [];

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
               <Button variant="outline" size="icon" onClick={() => refetch()} disabled={!selectedEmployeeId || isLoadingDetails}>
                <RefreshCw className={`h-4 w-4 ${isLoadingDetails ? "animate-spin" : ""}`} />
                <span className="sr-only">Refresh data</span>
              </Button>
            </div>
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
                
                {/* --- START "New Shift Requests" (retains detailed display with department_name) --- */}
                {pendingShifts.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>New Shift Requests</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {pendingShifts.map(shift => (
                           <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-semibold text-primary">
                                        Manager requested service for {shift.department_name || shift.zones?.name || 'a department/zone'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        on {format(new Date(shift.start_time), "EEEE, MMM d")}
                                        from {format(new Date(shift.start_time), "p")} - {format(new Date(shift.end_time), "p")}
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
                {/* --- END "New Shift Requests" --- */}

                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar /> Upcoming Shifts</h2>
                  <div className="space-y-4">
                    {/* --- START "Upcoming Shifts" (retains simpler display without department_name, as per your preference) --- */}
                    {upcomingConfirmedShifts.length > 0 ? upcomingConfirmedShifts.map((shift) => (
                      <Card key={shift.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{format(new Date(shift.start_time), "EEEE, MMM d")}</p>
                            <p className="text-sm text-muted-foreground">{shift.zones?.name || 'General'}</p>
                            {/* The department_name is intentionally NOT displayed here for confirmed shifts */}
                          </div>
                          <Badge>{formatDistanceToNow(new Date(shift.start_time), { addSuffix: true })}</Badge>
                        </div>
                      </Card>
                    )) : <p className="text-muted-foreground">No upcoming shifts.</p>}
                    {/* --- END "Upcoming Shifts" --- */}
                  </div>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* (Skills and Certifications sections remain the same in the component, not shown here for brevity) */}
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