// FILE: src/pages/AdminDashboard.tsx
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import RosterCalendar, { RosterSummary } from "@/components/RosterCalendar";

const fetchDepartmentStats = async () => {
  const { data, error } = await supabase.rpc('get_department_stats');
  if (error) throw new Error(error.message);
  return data;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: departments, isLoading } = useQuery({
    queryKey: ["departmentStats"],
    queryFn: fetchDepartmentStats,
    staleTime: 1000 * 60 * 5,
  });

  const handleDeptCardClick = async (departmentName: string) => {
    if (departmentName === 'Maintenance' || departmentName === 'Guest Services') {
      toast.info(`Navigating to the ${departmentName} dashboard is not yet implemented.`);
      return;
    }
    
    const { data: zone } = await supabase.from('zones').select('slug').ilike('name', `%${departmentName.split(' ')[0]}%`).single();
    
    if (zone?.slug) {
      navigate(`/zone/${zone.slug}`);
    } else {
      toast.error(`Could not find a matching zone for ${departmentName}.`);
    }
  };

  const handleDayClick = (day: Date, summary: RosterSummary) => {
    toast.info(`Viewing details for ${day.toLocaleDateString()} is available on the Manager Dashboard.`);
  };

  const getStatus = (efficiency: number) => {
    if (efficiency > 90) return { text: "optimal", color: "bg-success/10 text-success border-success/20" };
    if (efficiency > 80) return { text: "adequate", color: "bg-warning/10 text-warning border-warning/20" };
    return { text: "critical", color: "bg-destructive/10 text-destructive border-destructive/20" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-workspace-light/20 to-primary/5">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-workspace-navy to-workspace-teal bg-clip-text text-transparent">
            Master Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time park operations and future rostering overview</p>
        </div>

        <div className="my-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">3-Month Park-Wide Roster Health</h2>
          {/* Admin view of the calendar shows park-wide data (departmentId is null) */}
          <RosterCalendar onDayClick={handleDayClick} departmentId={null} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Department Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  [...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
                ) : departments?.length > 0 ? (
                  departments.map((dept: any) => {
                    const status = getStatus(dept.avg_efficiency);
                    return (
                      <Card
                        key={dept.id}
                        onClick={() => handleDeptCardClick(dept.name)}
                        className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{dept.icon}</div>
                            <div>
                              <h3 className="font-bold text-foreground">{dept.name}</h3>
                              <p className="text-sm text-muted-foreground">{dept.staff_count} team members</p>
                            </div>
                          </div>
                          <Badge className={`${status.color} border font-semibold`}>
                            {status.text.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Efficiency</span>
                            <span className="font-semibold text-foreground">{Math.round(dept.avg_efficiency)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${dept.avg_efficiency}%`, backgroundColor: dept.color }}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="p-6 col-span-2">
                    <div className="text-center text-muted-foreground">
                      No department data available
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              Active Alerts
            </h2>
            <div className="space-y-4">
              <Card className="p-4">
                <p className="text-muted-foreground">Alerts data from Supabase would be shown here.</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;