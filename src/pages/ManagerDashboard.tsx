// FILE: src/pages/ManagerDashboard.tsx
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import WorkforceNav from "@/components/WorkforceNav";
import RosterCalendar from "@/components/RosterCalendar";
import { RosterDialog } from "@/components/RoasterDialog";
import { Department, RosterSummary } from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
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

// <<< NEW: Define park-wide departments that don't map to a single zone >>>
const PARK_WIDE_DEPARTMENTS = ["Rides & Attractions", "Maintenance", "Park Services", "Guest Services"];

const ManagerDashboard = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [associatedZoneId, setAssociatedZoneId] = useState<string | null>(null);
  const [isRosterDialogOpen, setIsRosterDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; summary: RosterSummary } | null>(null);
  
  const queryClient = useQueryClient();

  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  useEffect(() => {
    const channel = supabase.channel('shifts-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' },
        (payload) => {
          console.log('Realtime shift change received!', payload);
          toast.info("Roster has been updated in real-time.");
          queryClient.invalidateQueries({ queryKey: ['rosterSummary'] });
          queryClient.invalidateQueries({ queryKey: ['shiftsForDay'] });
          queryClient.invalidateQueries({ queryKey: ['suggestedEmployees'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  useEffect(() => {
    if (departments && departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(departments[0].id);
    }
  }, [departments, selectedDeptId]);

  // <<< UPDATED: More robust logic to find the zone >>>
  useEffect(() => {
    const findAssociatedZone = async () => {
      if (!selectedDeptId || !departments) {
        setAssociatedZoneId(null);
        return;
      }
      const dept = departments.find(d => d.id === selectedDeptId);
      if (!dept) return;

      let zone = null;
      // If the department is NOT a park-wide one, try to find a matching zone
      if (!PARK_WIDE_DEPARTMENTS.includes(dept.name)) {
        const deptFirstName = dept.name.split(' ')[0];
        const { data } = await supabase.from('zones').select('id').ilike('name', `%${deptFirstName}%`).maybeSingle();
        zone = data;
      }
      
      if (zone) {
        setAssociatedZoneId(zone.id);
      } else {
        // If it's a park-wide department OR no match was found, fall back to the first zone
        const { data: fallbackZone } = await supabase.from('zones').select('id').limit(1).single();
        if (fallbackZone) {
          setAssociatedZoneId(fallbackZone.id);
        } else {
            toast.error("Error: No zones found in the database.");
            setAssociatedZoneId(null);
        }
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
    toast.info("Refreshing all dashboard data...");
    queryClient.invalidateQueries();
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
            <p className="text-muted-foreground">Departmental Rostering & Performance</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader><CardTitle>Department Roster Health</CardTitle></CardHeader>
          <CardContent>
            {isLoadingDepts ? <Skeleton className="w-full h-12" /> : (
              <Tabs value={selectedDeptId || ''} onValueChange={setSelectedDeptId}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto flex-wrap">
                  {departments?.map((dept) => <TabsTrigger key={dept.id} value={dept.id}>{dept.name}</TabsTrigger>)}
                </TabsList>
              </Tabs>
            )}
            <div className="mt-4">
              {selectedDeptId && <DepartmentCalendar departmentId={selectedDeptId} onDayClick={handleDayClick} />}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Top Team Performers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-center">Avg. Rating</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoadingEmployees ? ([...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={2}><Skeleton className="h-8 w-full"/></TableCell></TableRow>))
                : employees && employees.length > 0 ? (employees.map((employee) => (
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
                  )))
                : (<TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">No employee data</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <RosterDialog 
            isOpen={isRosterDialogOpen}
            onOpenChange={setIsRosterDialogOpen}
            day={selectedDay}
            departmentId={selectedDeptId}
            zoneId={associatedZoneId}
        />
      </main>
    </div>
  );
};

export default ManagerDashboard;