import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { rosterData, mockEmployees, Employee } from "@/data/workforce";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Calendar, TrendingUp, Lightbulb, UserCheck, Eye, Star } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";
import EmployeeSchedule from "@/components/EmployeeSchedule";

const ManagerDashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleViewSchedule = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

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

            {/* Team Members Table */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Team Performance</h2>
              <Card className="bg-card/80 backdrop-blur-sm border-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-center">Reliability</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">{employee.role}</div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell className="text-center text-success font-semibold">
                          {employee.attendance}%
                        </TableCell>
                        <TableCell className="text-center text-primary font-semibold">
                          {employee.reliability}%
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="gap-1">
                            {employee.performanceRating} <Star className="w-3 h-3 text-yellow-400" />
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSchedule(employee)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" /> View Schedule
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <Card className="bg-card/80 backdrop-blur-sm border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-warning" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 list-disc list-inside text-sm text-muted-foreground">
                  <li>
                    <span className="font-semibold text-foreground">Optimize Saturday staffing:</span> Add 3 more team
                    members to Rides department during 2-6 PM peak hours.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Cross-training opportunity:</span> Sarah Johnson is
                    qualified for Food Services certification.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Schedule efficiency:</span> Current roster saves
                    $2.4K vs. manual planning.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/80 backdrop-blur-sm border-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule Dialog */}
        {selectedEmployee && (
          <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  Schedule for <span className="text-primary">{selectedEmployee.name}</span>
                </DialogTitle>
              </DialogHeader>
              <EmployeeSchedule employee={selectedEmployee} />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;