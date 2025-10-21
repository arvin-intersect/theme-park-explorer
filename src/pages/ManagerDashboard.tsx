import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rosterData, mockEmployees } from "@/data/workforce";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Calendar, TrendingUp, Lightbulb, UserCheck } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";

const ManagerDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-workspace-light/20 to-workspace-teal/5">
      <WorkforceNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-workspace-navy to-workspace-teal bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground">Department operations and team management</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                <p className="text-3xl font-bold text-foreground">45</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-success transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">On Duty Today</p>
                <p className="text-3xl font-bold text-foreground">38</p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-workspace-teal transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Attendance</p>
                <p className="text-3xl font-bold text-foreground">96%</p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: "hsl(192, 60%, 51%)" }} />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-warning transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Shifts</p>
                <p className="text-3xl font-bold text-foreground">7</p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Roster */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Weekly Roster Overview</h2>
                <Button className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Edit Schedule
                </Button>
              </div>
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={rosterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="rides" fill="hsl(186, 75%, 40%)" name="Rides" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="food" fill="hsl(30, 95%, 60%)" name="Food" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="retail" fill="hsl(340, 85%, 55%)" name="Retail" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maintenance" fill="hsl(38, 92%, 50%)" name="Maintenance" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Team Members */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Team Performance</h2>
              <div className="space-y-4">
                {mockEmployees.map((employee, index) => (
                  <Card
                    key={employee.id}
                    className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 hover:shadow-xl"
                    style={{
                      animation: `slide-in 0.5s ease-out ${index * 0.1}s backwards`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-workspace-teal flex items-center justify-center text-white font-bold text-lg">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                          <p className="text-xs text-muted-foreground">{employee.department}</p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20 border">
                        ACTIVE
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full"
                              style={{ width: `${employee.attendance}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {employee.attendance}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reliability</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${employee.reliability}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {employee.reliability}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-warning" />
                AI Suggestions
              </h2>
              <Card className="p-6 bg-gradient-to-br from-warning/5 to-warning/10 border-2 border-warning/20">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-warning mt-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Optimize Saturday staffing
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add 3 more staff to Rides department during 2-6 PM peak hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Cross-training opportunity
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sarah Johnson qualified for Food Services certification
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Schedule efficiency</p>
                      <p className="text-xs text-muted-foreground">
                        Current roster saves $2.4K vs. manual planning
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Calendar className="w-4 h-4" />
                  Create New Shift
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Users className="w-4 h-4" />
                  Request Coverage
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
