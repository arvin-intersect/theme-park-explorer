import parkMap from "@/assets/park-map.png";
import ZoneHotspot from "@/components/ZoneHotspot";
import { zones } from "@/data/zones";
import { Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Peakville Amusement Park
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-center text-muted-foreground mt-2 text-sm">
            Click on any zone to explore attractions and experiences!
          </p>
        </div>
      </header>

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
              <p className="text-xs text-muted-foreground">
                {zones.length} zones to explore
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🎢</div>
              <h3 className="text-xl font-bold text-foreground mb-2">30+ Attractions</h3>
              <p className="text-muted-foreground text-sm">
                From thrilling roller coasters to family-friendly rides
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🍔</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Dining & Shops</h3>
              <p className="text-muted-foreground text-sm">
                Delicious food courts and unique souvenir shops
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Premium Experience</h3>
              <p className="text-muted-foreground text-sm">
                Top-rated attractions and world-class entertainment
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            🎡 Open Daily 9 AM - 10 PM | 🎟️ Get Your Tickets Online
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
