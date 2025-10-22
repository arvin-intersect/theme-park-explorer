import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import WorkforceNav from "@/components/WorkforceNav";
import { ArrowLeft, Star, Users, Clock, PlusCircle, ShoppingCart, UserCog } from "lucide-react";
import { zones } from "@/data/zones";
import { useAuth } from "@/contexts/AuthContext";
import { mockEmployees } from "@/data/workforce";

const ParkZone = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isManagerOrAdmin = role === "admin" || role === "manager";
  const zone = zones.find((z) => z.id === zoneId);
  const assignedEmployeesData = mockEmployees.filter((emp) => zone?.assignedEmployees.includes(emp.id));

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
      <WorkforceNav />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 hover:bg-primary/10 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Park Map
        </Button>
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

          {/* Attractions / Restaurant Performance */}
          {zone.id === "food" ? (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Restaurant Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zone.attractions.map((vendor, index) => (
                  <Card key={index} className="p-4 bg-card/80 backdrop-blur-sm border-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">{vendor.icon}</div>
                      <div>
                        <h3 className="font-bold text-foreground">{vendor.name}</h3>
                        <p className="text-xs text-muted-foreground">{vendor.description}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Revenue Target</span>
                        <span className="font-semibold text-foreground">
                          ${vendor.revenue?.toLocaleString()} / ${vendor.revenueTarget?.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(vendor.revenue / vendor.revenueTarget) * 100} className="h-2" />
                    </div>
                    <div className="flex justify-between text-xs mt-3 text-muted-foreground">
                      <span>Team Members Required: {vendor.teamMembersRequired}</span>
                      <span>
                        Working:{" "}
                        <span
                          className={
                            vendor.teamMembersWorking < vendor.teamMembersRequired
                              ? "text-destructive font-bold"
                              : "text-success font-bold"
                          }
                        >
                          {vendor.teamMembersWorking}
                        </span>
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Attractions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zone.attractions.map((attraction, index) => (
                  <Card key={index} className="p-4 bg-card/80 backdrop-blur-sm border-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">{attraction.icon}</div>
                      <h3 className="font-bold text-foreground">{attraction.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{attraction.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {attraction.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Workforce Management */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Workforce Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedEmployeesData.map((employee, index) => (
                <Card
                  key={employee.id}
                  className="p-4 bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50 transition-all group"
                  style={{ animation: `slide-in 0.5s ease-out ${index * 0.1}s backwards` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-workspace-teal flex items-center justify-center text-white font-bold text-lg">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{employee.name}</h3>
                        <p className="text-xs text-muted-foreground">{employee.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {employee.performanceRating} <Star className="w-3 h-3 text-yellow-400" />
                    </Badge>
                  </div>
                  <div className="space-y-3 text-sm mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-semibold text-foreground">{employee.attendance}%</span>
                      </div>
                      <Progress value={employee.attendance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Reliability</span>
                        <span className="font-semibold text-foreground">{employee.reliability}%</span>
                      </div>
                      <Progress value={employee.reliability} className="h-2" />
                    </div>
                  </div>
                  {employee.ordersServed && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3 mt-3">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                      <span>{employee.ordersServed} orders served today</span>
                    </div>
                  )}
                  {isManagerOrAdmin && (
                    <div className="mt-4 flex gap-2 border-t pt-4">
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <UserCog className="w-4 h-4" /> Re-assign
                      </Button>
                      <Button size="sm" variant="destructive" className="w-full">
                        Remove
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
              {isManagerOrAdmin && (
                <Card className="border-2 border-dashed flex flex-col items-center justify-center p-4 hover:border-primary hover:text-primary transition-all text-muted-foreground">
                  <PlusCircle className="w-12 h-12 mb-2" />
                  <h3 className="font-bold">Add Team Member</h3>
                  <p className="text-xs text-center">Assign new member to this zone</p>
                </Card>
              )}
            </div>
          </div>

          {/* Future Planning */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Future Planning & Insights</h2>
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
              <h3 className="font-bold text-xl mb-4 text-foreground">AI-Powered Recommendations</h3>
              <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                <li>
                  Based on visitor forecast, consider adding 2 ride operators for the weekend evening shift.
                </li>
                <li>
                  Visitor satisfaction in this zone has dropped by 5% during peak hours. Suggests a need for an
                  additional queue manager.
                </li>
                <li>
                  Profitability can be increased by 15% by introducing a premium fast-pass option for the top 2
                  attractions in this zone.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParkZone;