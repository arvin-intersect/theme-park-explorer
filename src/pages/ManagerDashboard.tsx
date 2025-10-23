import { useState, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Star, RefreshCw } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";
import RosterCalendar from "@/components/RosterCalendar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { EmployeeWithDetails } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner"; // Ensure toast is imported

const fetchManagerData = async () => {
  const { data: departments, error: deptError } = await supabase.from('departments').select('*');
  
  const { data: employees, error: empError } = await supabase
    .from('profiles')
    .select(`
      id, full_name, role,
      departments (id, name),
      performance_reviews ( attendance_score, reliability_score, performance_rating )
    `);

  if (deptError || empError) throw new Error(deptError?.message || empError?.message);

  // Normalize data to handle Supabase's inconsistent return types
  const normalizedEmployees = employees?.map(emp => ({
    ...emp,
    departments: Array.isArray(emp.departments) ? emp.departments[0] : emp.departments,
  })) || [];

  return { departments, employees: normalizedEmployees as unknown as EmployeeWithDetails[] };
}

const ManagerDashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const rosterRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['managerData'],
    queryFn: fetchManagerData,
    staleTime: 1000 * 60 * 5,
  });

  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];
    if (selectedDepartment === "All") return data.employees;
    return data.employees.filter(emp => emp.departments?.name === selectedDepartment);
  }, [selectedDepartment, data?.employees]);
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['managerData'] });
    queryClient.invalidateQueries({ queryKey: ['rosterSummary'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-teal-50/20">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground">Overall Team & Schedule Management</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        <div ref={rosterRef} className="my-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Weekly Roster Overview</h2>
          <RosterCalendar />
        </div>
        <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Team Performance</h2>
            <Card className="bg-card/80 backdrop-blur-sm border-2">
              <div className="p-4 border-b">
                <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto flex-wrap">
                    <TabsTrigger value="All">All</TabsTrigger>
                    {data?.departments?.map((dept) => (
                      <TabsTrigger key={dept.id} value={dept.name}>{dept.name}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? [...Array(5)].map((_, i) => ( <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full"/></TableCell></TableRow>
                  )) : filteredEmployees.map((employee) => {
                    const latestReview = employee.performance_reviews?.[0];
                    return (
                    <TableRow key={employee.id}>
                      <TableCell><div className="font-medium">{employee.full_name}</div><div className="text-sm text-muted-foreground hidden md:block">{employee.role}</div></TableCell>
                      <TableCell className="hidden md:table-cell">{employee.departments?.name}</TableCell>
                      <TableCell className="text-center text-green-600 font-semibold">{latestReview?.attendance_score || 'N/A'}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="gap-1">
                          {latestReview?.performance_rating?.toFixed(1) || 'N/A'} <Star className="w-3 h-3 text-amber-400" />
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {/* THIS IS THE FIX: The onClick handler now triggers a toast */}
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Viewing employee details is coming soon!")} className="gap-2">
                          <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </Card>
          </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;