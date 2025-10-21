import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockEmployees } from "@/data/workforce";
import { User, Calendar, Award, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";

const EmployeeDashboard = () => {
  // Using first employee as demo
  const employee = mockEmployees[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-workspace-light/20 to-primary/5">
      <WorkforceNav />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-workspace-teal flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{employee.name}</h1>
              <p className="text-muted-foreground">{employee.role}</p>
              <p className="text-sm text-muted-foreground">{employee.department}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-success transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                      <p className="text-4xl font-bold text-foreground">{employee.attendance}%</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-xl">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${employee.attendance}%` }}
                    />
                  </div>
                  <p className="text-xs text-success mt-2">Excellent performance! 🎉</p>
                </Card>

                <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reliability Score</p>
                      <p className="text-4xl font-bold text-foreground">{employee.reliability}%</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${employee.reliability}%` }}
                    />
                  </div>
                  <p className="text-xs text-primary mt-2">Top 10% of team members</p>
                </Card>
              </div>
            </div>

            {/* Upcoming Shifts */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Upcoming Shifts
              </h2>
              <div className="space-y-4">
                {employee.shifts.map((shift, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 hover:shadow-xl"
                    style={{
                      animation: `slide-in 0.5s ease-out ${index * 0.1}s backwards`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {new Date(shift.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">{shift.zone}</p>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 border">
                        {shift.duration}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{shift.time}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Skills & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Skills</h2>
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
                  <div className="space-y-3">
                    {employee.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">{skill}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                  <Award className="w-6 h-6 text-warning" />
                  Certifications
                </h2>
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
                  <div className="space-y-3">
                    {employee.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-warning" />
                        <span className="text-sm text-foreground">{cert}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Request Time Off
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <User className="w-4 h-4" />
                  Update Availability
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Clock className="w-4 h-4" />
                  Swap Shifts
                </Button>
              </div>
            </div>

            {/* Stats Summary */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-workspace-teal/10 border-2 border-primary/20">
              <h3 className="font-bold text-foreground mb-4">This Month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Hours Worked</span>
                    <span className="font-semibold text-foreground">156</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-4/5" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Shifts Completed</span>
                    <span className="font-semibold text-foreground">22/23</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full w-11/12" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Customer Rating</span>
                    <span className="font-semibold text-foreground">4.9/5.0</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning rounded-full w-full" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/20">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-card rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Perfect Attendance</p>
                    <p className="text-xs text-muted-foreground">October 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-card rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Team Player Award</p>
                    <p className="text-xs text-muted-foreground">September 2025</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
