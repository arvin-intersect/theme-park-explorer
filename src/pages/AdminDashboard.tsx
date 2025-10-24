// FILE: src/pages/AdminDashboard.tsx
import { useState } from "react";
import WorkforceNav from "@/components/WorkforceNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import RosterCalendar from "@/components/RosterCalendar";
import { AdminRosterBreakdownDialog } from "@/components/AdminRosterBreakdownDialog";
import { RosterSummary } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fetchDepartmentStats = async () => {
  const { data, error } = await supabase.rpc('get_department_stats');
  if (error) throw new Error(error.message);
  return data;
};

const AdminDashboard = () => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departmentStats"],
    queryFn: fetchDepartmentStats,
  });

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsBreakdownOpen(true);
  };

  const getStatus = (efficiency: number) => {
    if (efficiency > 90) return { text: "optimal", color: "bg-success/10 text-success border-success/20" };
    if (efficiency > 80) return { text: "adequate", color: "bg-warning/10 text-warning border-warning/20" };
    return { text: "critical", color: "bg-destructive/10 text-destructive border-destructive/20" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-workspace-navy to-workspace-teal bg-clip-text text-transparent">
            Master Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Park-wide operational and rostering overview.</p>
        </div>

        <div className="my-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Park-Wide Roster Health</h2>
          <RosterCalendar onDayClick={handleDayClick} departmentId={null} />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-foreground">Department Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? ([...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)) 
            : departments?.map((dept: any) => {
                const status = getStatus(dept.avg_efficiency);
                return (
                    <Card key={dept.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                        <div className="text-4xl">{dept.icon}</div>
                        <div>
                            <h3 className="font-bold text-foreground">{dept.name}</h3>
                            <p className="text-sm text-muted-foreground">{dept.staff_count} team members</p>
                        </div>
                        </div>
                        <Badge className={`${status.color} border font-semibold`}>{status.text.toUpperCase()}</Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className="font-semibold text-foreground">{Math.round(dept.avg_efficiency)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${dept.avg_efficiency}%`, backgroundColor: dept.color }}/>
                        </div>
                    </div>
                    </Card>
                );
            })}
        </div>

        <AdminRosterBreakdownDialog 
            isOpen={isBreakdownOpen}
            onOpenChange={setIsBreakdownOpen}
            date={selectedDate}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;