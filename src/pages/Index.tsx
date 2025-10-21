import parkMap from "@/assets/park-map.png";
import ZoneHotspot from "@/components/ZoneHotspot";
import WorkforceNav from "@/components/WorkforceNav";
import { zones } from "@/data/zones";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10">
      <WorkforceNav />

      {/* Main Park Map */}
      <main className="container mx-auto px-4 py-12">
        <div className="animate-zoom-in">
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

            {/* Corner decoration */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border-2 border-primary/30 animate-slide-in">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Interactive Map
              </p>
              <p className="text-xs text-muted-foreground">CRM Overview</p>
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