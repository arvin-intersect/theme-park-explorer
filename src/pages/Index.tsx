  import parkMap from "@/assets/park-map.png";
  import ZoneHotspot from "@/components/ZoneHotspot";
  import WorkforceNav from "@/components/WorkforceNav";
  import { Button } from "@/components/ui/button";
  import { useNavigate } from "react-router-dom";
  import { TrendingUp, Users, DollarSign, TrendingDown } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { useQuery } from "@tanstack/react-query";
  import { supabase } from "@/lib/supabaseClient";
  import { Zone } from "@/types/database.types";
  import { Skeleton } from "@/components/ui/skeleton";

  const fetchZones = async (): Promise<Zone[]> => {
    const { data, error } = await supabase.from("zones").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  };

  const fetchTodayHighlights = async () => {
    // Step 1: Find the most recent date with data
    const { data: latestDateData, error: dateError } = await supabase
      .from("daily_operational_stats")
      .select("date")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (dateError || !latestDateData) throw new Error("No operational stats found.");

    const latestDate = latestDateData.date;

    // Step 2: Fetch all stats for that most recent date
    const { data, error } = await supabase
      .from("daily_operational_stats")
      .select("visitor_count, revenue, operating_cost")
      .eq("date", latestDate)
      .eq("entity_type", "zone");

    if (error) throw new Error(error.message);

    const totals = (data || []).reduce(
      (acc, curr) => {
        acc.visitors += curr.visitor_count || 0;
        acc.revenue += curr.revenue || 0;
        acc.spend += curr.operating_cost || 0;
        return acc;
      },
      { visitors: 0, revenue: 0, spend: 0 }
    );

    return {
      ...totals,
      profit: totals.revenue - totals.spend,
    };
  };

  const Index = () => {
    const navigate = useNavigate();
    const { data: zones, isLoading: isLoadingZones } = useQuery({
      queryKey: ["zones"],
      queryFn: fetchZones,
    });
    const { data: todayHighlights, isLoading: isLoadingHighlights } = useQuery({
      queryKey: ["todayHighlights"],
      queryFn: fetchTodayHighlights,
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10">
        <WorkforceNav />
        <main className="container mx-auto px-4 py-12">
          <div className="animate-slide-in">
            <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-foreground">
                  Latest Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHighlights ? (
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
                        {todayHighlights?.visitors.toLocaleString() ?? '0'}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Visitors</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <DollarSign className="w-8 h-8 text-success mb-2" />
                      <p className="text-2xl font-bold text-foreground">
                        ${((todayHighlights?.revenue || 0) / 1000000).toFixed(2)}M
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <TrendingDown className="w-8 h-8 text-warning mb-2" />
                      <p className="text-2xl font-bold text-foreground">
                        ${((todayHighlights?.spend || 0) / 1000).toFixed(1)}k
                      </p>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <TrendingUp className="w-8 h-8 text-success mb-2" />
                      <p className="text-2xl font-bold text-foreground">
                        ${((todayHighlights?.profit || 0) / 1000).toFixed(1)}k
                      </p>
                      <p className="text-sm text-muted-foreground">Profit Today</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="animate-zoom-in mt-12">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
              <img src={parkMap} alt="Peakville Amusement Park Map" className="w-full h-auto" />
              <div className="absolute inset-0">
                {isLoadingZones ? (
                  <div className="w-full h-full bg-black/10 backdrop-blur-sm flex items-center justify-center text-white font-bold">
                    Loading Park Zones...
                  </div>
                ) : (
                  zones?.map((zone) => <ZoneHotspot key={zone.id} zone={zone} />)
                )}
              </div>
              <div className="absolute top-4 right-4 animate-slide-in">
                <Button onClick={() => navigate("/admin")} className="gap-2 shadow-lg">
                  <TrendingUp className="w-4 h-4" />
                  Overall Metrics
                </Button>
              </div>
            </div>
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