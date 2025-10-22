import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { departments, visitorForecast, alerts } from "@/data/workforce";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, AlertTriangle, Activity } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";

const AdminDashboard = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-success/10 text-success border-success/20";
      case "adequate":
        return "bg-warning/10 text-warning border-warning/20";
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-l-destructive bg-destructive/5";
      case "warning":
        return "border-l-warning bg-warning/5";
      default:
        return "border-l-primary bg-primary/5";
    }
  };

  const totalTeamMembers = departments.reduce((sum, dept) => sum + dept.staffCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-workspace-light/20 to-primary/5">
      <WorkforceNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-workspace-navy to-workspace-teal bg-clip-text text-transparent">
            Master Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time park operations overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Team Members</p>
                <p className="text-3xl font-bold text-foreground">{totalTeamMembers.toLocaleString()}</p>
                <p className="text-xs text-success mt-1">↑ 8% from last week</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-workspace-teal transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Visitors</p>
                <p className="text-3xl font-bold text-foreground">36,247</p>
                <p className="text-xs text-success mt-1">↑ 12% vs yesterday</p>
              </div>
              <div className="p-3 bg-workspace-teal/10 rounded-xl">
                <Activity className="w-6 h-6" style={{ color: "hsl(192, 60%, 51%)" }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-success transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Today</p>
                <p className="text-3xl font-bold text-foreground">$1.45M</p>
                <p className="text-xs text-success mt-1">↑ 15% vs average</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-warning transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Efficiency</p>
                <p className="text-3xl font-bold text-foreground">87.5%</p>
                <p className="text-xs text-warning mt-1">↓ 2% needs attention</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Departments */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Department Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept, index) => (
                  <Card
                    key={dept.id}
                    className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl cursor-pointer group"
                    style={{
                      animation: `slide-in 0.5s ease-out ${index * 0.1}s backwards`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="text-4xl group-hover:scale-110 transition-transform"
                          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                        >
                          {dept.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{dept.name}</h3>
                          <p className="text-sm text-muted-foreground">{dept.staffCount} team members</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(dept.status)} border font-semibold`}>
                        {dept.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className="font-semibold text-foreground">{dept.efficiency}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${dept.efficiency}%`,
                            backgroundColor: dept.color,
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Visitor Forecast */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">14-Day Visitor Forecast</h2>
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={visitorForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="hsl(186, 75%, 40%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(186, 75%, 40%)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          {/* Alerts Sidebar */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              Active Alerts
            </h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`p-4 border-l-4 ${getAlertColor(alert.type)} backdrop-blur-sm`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={
                        alert.type === "critical"
                          ? "border-destructive text-destructive"
                          : alert.type === "warning"
                          ? "border-warning text-warning"
                          : "border-primary text-primary"
                      }
                    >
                      {alert.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.department}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;