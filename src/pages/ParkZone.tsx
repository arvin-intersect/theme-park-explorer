import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Users, Clock } from "lucide-react";
import { zones } from "@/data/zones";

const ParkZone = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const zone = zones.find((z) => z.id === zoneId);

  if (!zone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Zone Not Found</h1>
          <Button onClick={() => navigate("/")}>Back to Park</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Park
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${zone.color} animate-pulse-glow`} />
            <span className="font-semibold text-foreground">{zone.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="animate-zoom-in">
          {/* Hero Section */}
          <div
            className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl"
            style={{
              transform: "perspective(1000px) rotateX(2deg)",
              transition: "var(--transition-smooth)",
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-br opacity-90"
              style={{
                background: `linear-gradient(135deg, ${zone.gradient.from}, ${zone.gradient.to})`,
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
              <div className="text-7xl mb-6 animate-float">{zone.icon}</div>
              <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">{zone.name}</h1>
              <p className="text-xl text-center max-w-2xl drop-shadow-md">{zone.description}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Rating</p>
                  <p className="text-2xl font-bold text-foreground">{zone.stats.rating}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Visitors Today</p>
                  <p className="text-2xl font-bold text-foreground">{zone.stats.visitors}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-accent transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-foreground">{zone.stats.waitTime}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Attractions Grid */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">Attractions & Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zone.attractions.map((attraction, index) => (
                <Card
                  key={index}
                  className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                  style={{
                    animation: `slide-in 0.5s ease-out ${index * 0.1}s backwards`,
                    transform: "translateZ(0)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "perspective(1000px) rotateY(5deg) translateZ(20px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "perspective(1000px) rotateY(0deg) translateZ(0)";
                  }}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {attraction.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{attraction.name}</h3>
                  <p className="text-muted-foreground mb-4">{attraction.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {attraction.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParkZone;
