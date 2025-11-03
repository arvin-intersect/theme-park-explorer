import WorkforceNav from "@/components/WorkforceNav";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, DollarSign, TrendingDown, Shield, LayoutDashboard, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const fetchTodayHighlights = async () => {
  // FIX: Use the same pattern logic as ZoneHotspot to get today's projection
  const pattern_start_date = new Date('2024-01-01');
  const today = new Date();
  const days_since_pattern_start = Math.floor((today.getTime() - pattern_start_date.getTime()) / (1000 * 3600 * 24));
  const pattern_date = new Date(pattern_start_date);
  pattern_date.setDate(pattern_start_date.getDate() + (days_since_pattern_start % 14));

  const { data, error } = await supabase
    .from("daily_visitor_predictions")
    .select("predicted_visitors, target_staff_count")
    .eq("date", format(pattern_date, 'yyyy-MM-dd'))
    .single();

  if (error) {
    console.error("Highlights fetch error:", error);
    throw new Error(error.message);
  };
  
  // Simulate revenue/spend for the highlights card
  const revenue = (data?.predicted_visitors || 0) * 55;
  const spend = (data?.target_staff_count || 0) * 150;

  return {
    visitors: data?.predicted_visitors || 0,
    revenue,
    spend,
    profit: revenue - spend,
  };
};

const Index = () => {
  const navigate = useNavigate();
  
  const { data: todayHighlights, isLoading: isLoadingHighlights } = useQuery({
    queryKey: ["todayHighlights"],
    queryFn: fetchTodayHighlights,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight mb-4 animate-slide-in">
            Welcome to Peakville Park CRM
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-zoom-in">
            Your central hub for workforce management, operational insights, and park performance at Peakville Amusement Park.
          </p>
        </div>
        <div className="mb-12 animate-slide-in">
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-foreground">
                Daily Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHighlights || !todayHighlights ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="w-24 h-8" />
                      <Skeleton className="w-20 h-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="w-8 h-8 text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {todayHighlights.visitors.toLocaleString() ?? '0'}
                    </p>
                    <p className="text-sm text-muted-foreground">Est. Visitors</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <DollarSign className="w-8 h-8 text-success mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      ${(todayHighlights.revenue / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-sm text-muted-foreground">Est. Revenue</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <TrendingDown className="w-8 h-8 text-warning mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      ${(todayHighlights.spend / 1000).toFixed(1)}k
                    </p>
                    <p className="text-sm text-muted-foreground">Est. Spend</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <TrendingUp className="w-8 h-8 text-success mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      ${(todayHighlights.profit / 1000).toFixed(1)}k
                    </p>
                    <p className="text-sm text-muted-foreground">Est. Profit</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-zoom-in">
          <Card className="text-center group hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-blue-600 group-hover:text-blue-800 transition-colors duration-300 mb-2" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage park-wide settings and monitor overall health.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/admin")} className="w-full">
                Go to Admin
              </Button>
            </CardContent>
          </Card>
          <Card className="text-center group hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center">
              <LayoutDashboard className="w-12 h-12 text-teal-600 group-hover:text-teal-800 transition-colors duration-300 mb-2" />
              <CardTitle>Manager Dashboard</CardTitle>
              <CardDescription>
                Oversee departmental rosters and team performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/manager")} variant="secondary" className="w-full">
                Go to Manager
              </Button>
            </CardContent>
          </Card>
          <Card className="text-center group hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center">
              <User className="w-12 h-12 text-purple-600 group-hover:text-purple-800 transition-colors duration-300 mb-2" />
              <CardTitle>Employee Portal</CardTitle>
              <CardDescription>
                View your schedule, requests, and personal info.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/employee")} variant="outline" className="w-full">
                Go to Employee
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="mt-12 py-8 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">© Peakville Park CRM. Open Daily 9 AM - 10 PM.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;