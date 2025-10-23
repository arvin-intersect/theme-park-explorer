import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkforceNav from "@/components/WorkforceNav";
import { ArrowLeft, Eye, Star } from "lucide-react";
import ZoneRosterCalendar from "@/components/ZoneRosterCalendar";
import EmployeeSchedule from "@/components/EmployeeSchedule";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { EmployeeWithDetails } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";

const fetchZoneData = async (zoneSlug: string | undefined) => {
  if (!zoneSlug) return null;

  // 1. Fetch the basic zone information. This is fast.
  const { data: zone, error: zoneError } = await supabase
    .from('zones')
    .select('*')
    .eq('slug', zoneSlug)
    .single();

  if (zoneError || !zone) throw new Error("Zone not found");

  // 2. THIS IS THE OPTIMIZATION:
  // Instead of fetching ALL shifts, only get shifts from the last 90 days.
  // This dramatically reduces the amount of data we need to process.
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: recentShifts, error: shiftError } = await supabase
    .from('shifts')
    .select('employee_id')
    .eq('zone_id', zone.id)
    .gte('start_time', ninetyDaysAgo.toISOString());

  if(shiftError) throw new Error(shiftError.message);

  // Create a unique list of RECENT employees. This list is now much smaller.
  const employeeIds = [...new Set(recentShifts.map(s => s.employee_id))];
  
  if (employeeIds.length === 0) {
    return { zone, employees: [] };
  }

  // 3. Fetch full details ONLY for this smaller, relevant list of employees.
  const { data: employees, error: empError } = await supabase
    .from('profiles')
    .select(`
      id, full_name, role,
      departments (id, name),
      performance_reviews ( performance_rating ),
      shifts ( id, start_time, end_time, zones (name) ),
      employee_skills ( skills (name) ),
      employee_certifications ( certifications (name) )
    `)
    .in('id', employeeIds);
  
  if (empError) throw new Error(empError.message);

  // Normalize the data structure to match what components expect
  const normalizedEmployees = employees?.map(emp => ({
    ...emp,
    departments: Array.isArray(emp.departments) ? emp.departments[0] : emp.departments,
    shifts: emp.shifts.map(shift => ({
        ...shift,
        zones: Array.isArray(shift.zones) ? shift.zones[0] : shift.zones,
    }))
  })) || [];

  return { zone, employees: normalizedEmployees as unknown as EmployeeWithDetails[] };
};

const ParkZone = () => {
  const { zoneSlug } = useParams();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['zoneData', zoneSlug],
    queryFn: () => fetchZoneData(zoneSlug),
    enabled: !!zoneSlug,
    // THIS IS THE CACHING MECHANISM
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  const { zone, employees } = data || { zone: null, employees: [] };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <WorkforceNav />
        <main className="container mx-auto px-4 py-8"><Skeleton className="w-full h-screen" /></main>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Zone Not Found</h1>
          <Button onClick={() => navigate("/")}>Back to Park Map</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Park Map
        </Button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{zone.name} Dashboard</h1>
          <p className="text-muted-foreground">{zone.description}</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Weekly Zone Roster</h2>
            <ZoneRosterCalendar zoneId={zone.id} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Team Performance (Last 90 Days)</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees?.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.full_name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="gap-1">
                          {employee.performance_reviews?.[0]?.performance_rating?.toFixed(1) || 'N/A'} <Star className="w-3 h-3 text-amber-400" />
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing details for ${employee.full_name} is coming soon!`)} className="gap-2">
                          <Eye className="w-4 h-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
        {selectedEmployee && (
          <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  Details for <span className="text-primary">{selectedEmployee.full_name}</span>
                </DialogTitle>
              </DialogHeader>
              <EmployeeSchedule employee={selectedEmployee} />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default ParkZone;