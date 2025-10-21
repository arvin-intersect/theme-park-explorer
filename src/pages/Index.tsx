import parkMap from "@/assets/park-map.png";
import ZoneHotspot from "@/components/ZoneHotspot";
import WorkforceNav from "@/components/WorkforceNav";
import { zones } from "@/data/zones";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, DollarSign, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayHighlights } from "@/data/workforce";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10">
      <WorkforceNav />

      {/* Main Park Map */}
      <main className="container mx-auto px-4 py-12">
        {/* Today's Highlights */}
        <div className="animate-slide-in">
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-foreground">Today's Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {/* Total Visitors */}
                <div className="flex flex-col items-center">
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{todayHighlights.visitors.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Visitors</p>
                </div>

                {/* Total Revenue */}
                <div className="flex flex-col items-center">
                  <DollarSign className="w-8 h-8 text-success mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    ${(todayHighlights.revenue / 1000).toFixed(1)}k
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>

                {/* Total Spend */}
                <div className="flex flex-col items-center">
                  <TrendingDown className="w-8 h-8 text-warning mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    ${(todayHighlights.spend / 1000).toFixed(1)}k
                  </p>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                </div>

                {/* Profit Today */}
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 text-success mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    ${(todayHighlights.profit / 1000).toFixed(1)}k
                  </p>
                  <p className="text-sm text-muted-foreground">Profit Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-zoom-in mt-12">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
            {/* Park Map Image */}
            <img
              src={parkMap}
              alt="Peakville Amusement Park Map"
              className="w-full h-auto"
            />

            {/* Interactive Hotspots Overlay */}
            <div className="absolute inset-0">
              {zones.map((zone) => (
                <ZoneHotspot key={zone.id} zone={zone} />
              ))}
            </div>

            {/* Overall Metrics Button */}
            <div className="absolute top-4 right-4 animate-slide-in">
              <Button onClick={() => navigate("/admin")} className="gap-2 shadow-lg">
                <TrendingUp className="w-4 h-4" />
                Overall Metrics
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © Peakville Park CRM. Open Daily 9 AM - 10 PM.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;