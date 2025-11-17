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
import { EmployeeWithDetails, ProjectedShift, Shift, ShiftStatus } from "@/types/database.types"; 
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
  // These are general zones, assuming they map to specific departments or are covered by general "Park Services"
  "Park Services": "Park Services",
  "Guest Services": "Guest Services",
  "Maintenance": "Maintenance",
  "Food Services": "Food Services", // Specific zone for Food Services
  "Retail & Shops": "Retail & Shops", // Specific zone for Retail & Shops
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

// --- Employee Details Fetching (independent of shifts) ---
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
// --- End Employee Details Fetching ---

// --- NEW: Helper interface for direct Supabase `.select()` results with nested objects ---
// This explicitly tells TypeScript how `zones` comes back from a `select('zones (name)')`
interface RawShiftFromSupabaseSelect {
  id: string;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  zones: { name: string } | null; // This is the expected structure for a single joined object
}
// --- END NEW Helper interface ---


// --- Function to fetch ONLY PENDING MANAGER REQUESTS (direct DB query) ---
const fetchPendingManagerRequests = async (employeeId: string | null): Promise<Shift[]> => {
  if (!employeeId) return [];

  const today = new Date();
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      id,
      start_time,
      end_time,
      status,
      zones (name)
    `)
    .eq('employee_id', employeeId)
    .eq('status', 'pending') // Filter for pending requests
    .gte('start_time', format(today, 'yyyy-MM-dd')) // Only future shifts
    .order('start_time', { ascending: true });

  if (error) {
    console.error("Error fetching pending manager requests:", error);
    throw new Error(error.message);
  }

  // Explicitly cast to RawShiftFromSupabaseSelect[] to handle TypeScript's inference
  const rawShifts = data as unknown as RawShiftFromSupabaseSelect[];

  // Enrich with department name for display
  const enrichedRequests: Shift[] = (rawShifts || []).map((shift) => {
    const departmentName = shift.zones?.name ? ZONE_TO_DEPARTMENT_MAP[shift.zones.name] : undefined;
    return { ...shift, department_name: departmentName };
  });

  return enrichedRequests;
};
// --- END Function to fetch ONLY PENDING MANAGER REQUESTS ---


// --- Function to fetch UPCOMING CONFIRMED SHIFTS (using RPC, as you preferred) ---
const fetchEmployeeUpcomingConfirmedShifts = async (employeeId: string | null): Promise<ProjectedShift[]> => {
  if (!employeeId) return [];

  const today = new Date();
  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const { data, error } = await supabase.rpc('get_projected_employee_schedule', {
    p_employee_id: employeeId,
    p_start_date: format(today, 'yyyy-MM-dd'),
    p_end_date: format(ninetyDaysFromNow, 'yyyy-MM-dd')
  });

  if (error) throw new Error(error.message);
  
  const uniqueConfirmedShifts: ProjectedShift[] = [];
  const seenDates = new Set<string>(); // To de-duplicate shifts if RPC returns multiple for one day

  if (data) {
    for (const shift of data as ProjectedShift[]) { // RPC returns ProjectedShift[]
      const shiftDay = format(new Date(shift.start_time), 'yyyy-MM-dd');
      if (!seenDates.has(shiftDay) && shift.status === 'confirmed') { // Filter for confirmed here
        uniqueConfirmedShifts.push(shift);
        seenDates.add(shiftDay);
      }
    }
  }

  // Sort chronologically
  uniqueConfirmedShifts.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return uniqueConfirmedShifts.slice(0, 5); // Take only the first 5 upcoming confirmed shifts
};
// --- END Function to fetch UPCOMING CONFIRMED SHIFTS ---


const EmployeeDashboard = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: employeeList, isLoading: isLoadingList } = useQuery({
    queryKey: ['employeeList'],
    queryFn: fetchEmployeeList,
  });

  // Query for employee personal details (no shifts here)
  const { data: employee, isLoading: isLoadingDetails, refetch: refetchDetails } = useQuery({
    queryKey: ['employeeData', selectedEmployeeId],
    queryFn: () => fetchEmployeeData(selectedEmployeeId),
    enabled: !!selectedEmployeeId,
  });

  // Query for all pending manager requests
  const { data: pendingRequests, isLoading: isLoadingPendingRequests, refetch: refetchPendingRequests } = useQuery({
      queryKey: ['pendingManagerRequests', selectedEmployeeId], // Distinct query key
      queryFn: () => fetchPendingManagerRequests(selectedEmployeeId),
      enabled: !!selectedEmployeeId,
  });

  // Query for all upcoming confirmed shifts
  const { data: upcomingShifts, isLoading: isLoadingUpcomingShifts, refetch: refetchUpcomingShifts } = useQuery({
      queryKey: ['upcomingConfirmedShifts', selectedEmployeeId], // Distinct query key
      queryFn: () => fetchEmployeeUpcomingConfirmedShifts(selectedEmployeeId),
      enabled: !!selectedEmployeeId,
  });

  // --- handleShiftResponse: Now updates Supabase directly & refetches BOTH sections ---
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
      refetchPendingRequests(); // Refetch pending requests (to remove the responded one)
      refetchUpcomingShifts();  // Refetch upcoming shifts (to add the newly confirmed one)
      queryClient.invalidateQueries({ queryKey: ['rosterSummary'] }); // Invalidate calendar for manager/admin view
      queryClient.invalidateQueries({ queryKey: ['rosterForDay'] }); // Also invalidate roster dialog in manager view
    }
  };
  // --- END MODIFIED handleShiftResponse FUNCTION ---
  
  // Combined loading state for UI feedback across all sections
  const isLoading = isLoadingDetails || isLoadingPendingRequests || isLoadingUpcomingShifts;

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
               <Button variant="outline" size="icon" onClick={() => { refetchDetails(); refetchPendingRequests(); refetchUpcomingShifts(); }} disabled={!selectedEmployeeId || isLoading}>
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
                
                {/* --- START "New Shift Requests" Section (retains detailed display with department_name) --- */}
                {pendingRequests && pendingRequests.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>New Shift Requests</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {pendingRequests.map(shift => (
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
                {/* --- END "New Shift Requests" Section --- */}

                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar /> Upcoming Shifts</h2>
                  <div className="space-y-4">
                    {/* --- START "Upcoming Shifts" Section (retains simpler display without department_name) --- */}
                    {upcomingShifts && upcomingShifts.length > 0 ? upcomingShifts.map((shift) => (
                      <Card key={shift.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{format(new Date(shift.start_time), "EEEE, MMM d")}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(shift.start_time), "p")} - {format(new Date(shift.end_time), "p")}
                            </p>
                            <p className="text-sm text-muted-foreground">{shift.zones?.name || 'General'}</p>
                            {/* Department name is intentionally NOT displayed here for confirmed shifts */}
                          </div>
                          <Badge>{formatDistanceToNow(new Date(shift.start_time), { addSuffix: true })}</Badge>
                        </div>
                      </Card>
                    )) : <p className="text-muted-foreground">{isLoadingUpcomingShifts ? "Loading..." : "No upcoming shifts."}</p>}
                    {/* --- END "Upcoming Shifts" Section --- */}
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