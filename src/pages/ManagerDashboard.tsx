// FILE: src/pages/ManagerDashboard.tsx
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, setHours, addHours } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import WorkforceNav from "@/components/WorkforceNav";
import RosterCalendar, { RosterSummary } from "@/components/RosterCalendar";
import { EmployeeSelector } from "@/components/EmployeeSelector";
import { Department, Zone } from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { RefreshCw, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type PerformanceEmployee = {
  id: string;
  full_name: string;
  role: string;
  avg_performance_rating: number;
};

const fetchDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase.from('departments').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchDepartmentPerformance = async (departmentId: string | null): Promise<PerformanceEmployee[]> => {
  if (!departmentId) return [];
  const { data, error } = await supabase.rpc('get_department_employees_by_performance', { target_department_id: departmentId });
  if (error) throw new Error(error.message);
  return data || [];
};

const DepartmentCalendar = ({ departmentId, onDayClick }: { departmentId: string; onDayClick: (date: Date, summary: RosterSummary) => void; }) => {
  if (!departmentId) {
    return <Skeleton className="w-full h-[400px]" />;
  }
  return <RosterCalendar onDayClick={onDayClick} departmentId={departmentId} />;
};

const ManagerDashboard = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [associatedZoneId, setAssociatedZoneId] = useState<string | null>(null); // <<< NEW STATE
  const [isRosterDialogOpen, setIsRosterDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; summary: RosterSummary } | null>(null);
  
  const queryClient = useQueryClient();

  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });
  
  // Set initial department
  useEffect(() => {
    if (departments && departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(departments[0].id);
    }
  }, [departments, selectedDeptId]);

  // <<< NEW EFFECT: Find the zone associated with the selected department
  useEffect(() => {
    const findAssociatedZone = async () => {
      if (!selectedDeptId || !departments) {
        setAssociatedZoneId(null);
        return;
      }
      
      const dept = departments.find(d => d.id === selectedDeptId);
      if (!dept) return;

      // Logic borrowed from AdminDashboard to find a matching zone by name
      const deptFirstName = dept.name.split(' ')[0];
      const { data: zone } = await supabase
        .from('zones')
        .select('id')
        .ilike('name', `%${deptFirstName}%`)
        .single();
      
      if (zone) {
        setAssociatedZoneId(zone.id);
      } else {
        // Fallback: just grab the first available zone if no direct match
        const { data: fallbackZone } = await supabase.from('zones').select('id').limit(1).single();
        setAssociatedZoneId(fallbackZone?.id || null);
        console.warn(`No direct zone match for ${dept.name}, using fallback.`);
      }
    };
    findAssociatedZone();
  }, [selectedDeptId, departments]);

  const { data: employees, isLoading: isLoadingEmployees, isFetching } = useQuery({
    queryKey: ['departmentPerformance', selectedDeptId],
    queryFn: () => fetchDepartmentPerformance(selectedDeptId),
    enabled: !!selectedDeptId
  });

  const handleDayClick = (date: Date, summary: RosterSummary) => {
    setSelectedDay({ date, summary });
    setIsRosterDialogOpen(true);
  };
  
  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
    queryClient.invalidateQueries({ queryKey: ['rosterSummary'] });
    queryClient.invalidateQueries({ queryKey: ['departmentPerformance', selectedDeptId] });
  };
  
  const handleAddShift = async (employee: { id: string; fullName: string }) => {
    if (!selectedDay || !associatedZoneId) {
      toast.error("Cannot create shift: missing day or associated zone information.");
      return;
    };
    
    const startTime = setHours(selectedDay.date, 9);
    const endTime = addHours(startTime, 8);

    const { error } = await supabase.from('shifts').insert({
      employee_id: employee.id,
      zone_id: associatedZoneId, // <<< FIX: Provide the zone_id
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'pending'
    });

    if (error) {
      toast.error(`Failed to request shift: ${error.message}`);
    } else {
      toast.success(`Shift request sent to ${employee.fullName}.`);
    }
    setIsRosterDialogOpen(false);
  };

  const staffGap = selectedDay ? selectedDay.summary.target_staff_count - selectedDay.summary.rostered_staff_count : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-teal-50/20">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        {/* ... (rest of the JSX is the same) ... */}
         <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground">Departmental Rostering & Performance</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Department Roster Health</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDepts ? (
              <Skeleton className="w-full h-12" />
            ) : departments && departments.length > 0 ? (
              <Tabs value={selectedDeptId || ''} onValueChange={setSelectedDeptId}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto flex-wrap">
                  {departments.map((dept) => (
                    <TabsTrigger key={dept.id} value={dept.id}>{dept.name}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No departments found
              </div>
            )}
            <div className="mt-4">
              {selectedDeptId && <DepartmentCalendar departmentId={selectedDeptId} onDayClick={handleDayClick} />}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Team Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Avg. Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingEmployees ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={2}>
                        <Skeleton className="h-8 w-full"/>
                      </TableCell>
                    </TableRow>
                  ))
                ) : employees && employees.length > 0 ? (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.full_name}</div>
                        <div className="text-sm text-muted-foreground">{employee.role}</div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        <div className="flex items-center justify-center gap-1">
                          {employee.avg_performance_rating.toFixed(1)} <Star className="w-4 h-4 text-amber-400" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                      No employee data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedDay && selectedDeptId && (
          <Dialog open={isRosterDialogOpen} onOpenChange={setIsRosterDialogOpen}>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Roster for {format(selectedDay.date, "EEEE, MMMM d")}</DialogTitle>
                <DialogDescription>
                  Fill the staffing gap by assigning available team members.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <Card className="p-4 text-center">
                  <CardHeader className="p-2">
                    <CardTitle>Target</CardTitle>
                  </CardHeader>
                  <p className="text-4xl font-bold">{selectedDay.summary.target_staff_count}</p>
                </Card>
                <Card className="p-4 text-center">
                  <CardHeader className="p-2">
                    <CardTitle>Rostered</CardTitle>
                  </CardHeader>
                  <p className="text-4xl font-bold">{selectedDay.summary.rostered_staff_count}</p>
                </Card>
                <Card className={`p-4 text-center border-2 ${staffGap > 0 ? 'border-orange-400' : 'border-green-400'}`}>
                  <CardHeader className="p-2">
                    <CardTitle>Gap</CardTitle>
                  </CardHeader>
                  <p className={`text-4xl font-bold ${staffGap > 0 ? 'text-orange-500' : 'text-green-500'}`}>{staffGap}</p>
                </Card>
              </div>
              {staffGap > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Assign an Available Employee</h3>
                  <EmployeeSelector
                    shiftStartTime={selectedDay.date}
                    onSelectEmployee={handleAddShift}
                    departmentId={selectedDeptId}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;