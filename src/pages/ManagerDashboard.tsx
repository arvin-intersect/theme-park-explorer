import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEmployees, Employee, departments } from "@/data/workforce";
import { Users, Calendar, TrendingUp, Lightbulb, UserCheck, Eye, Star } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";
import EmployeeSchedule from "@/components/EmployeeSchedule";
import RosterCalendar from "@/components/RosterCalendar";
import { toast } from "@/components/ui/sonner";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const rosterRef = useRef<HTMLDivElement>(null);

  const handleViewSchedule = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const scrollToRoster = () => {
    rosterRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleActionClick = (featureName: string) => {
    toast.info(`${featureName} feature is coming soon!`);
  };

  const filteredEmployees = useMemo(() => {
    if (selectedDepartment === "All") {
      return mockEmployees;
    }
    return mockEmployees.filter((employee) => employee.department === selectedDepartment);
  }, [selectedDepartment]);

  const totalTeamMembers = departments.reduce((acc, dept) => acc + dept.staffCount, 0);
  const onDutyToday = 1130;
  const openShifts = 45;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-teal-50/20">
      <WorkforceNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground">Overall Team & Schedule Management</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Team Members</p>
                <p className="text-3xl font-bold text-foreground">{totalTeamMembers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-green-500 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">On Duty Today</p>
                <p className="text-3xl font-bold text-foreground">{onDutyToday.toLocaleString()}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-teal-500 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Attendance</p>
                <p className="text-3xl font-bold text-foreground">96%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-teal-500" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-amber-500 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Shifts</p>
                <p className="text-3xl font-bold text-foreground">{openShifts}</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* AI Suggestions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 list-disc list-inside text-sm text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">Optimize Saturday staffing:</span> Add 12 more team
                  members to Rides department during 2-6 PM peak hours based on visitor forecast.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Cross-training opportunity:</span> Sarah Johnson is
                  qualified for Food Services certification. Consider scheduling a training shift.
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={scrollToRoster} className="w-full justify-start gap-2" variant="outline">
                <Calendar className="w-4 h-4" />
                Create New Shift
              </Button>
              <Button
                onClick={() => handleActionClick("Request Coverage")}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Users className="w-4 h-4" />
                Request Coverage for Open Shifts
              </Button>
              <Button onClick={() => navigate("/admin")} className="w-full justify-start gap-2" variant="outline">
                <TrendingUp className="w-4 h-4" />
                View Full Workforce Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Full-width content area */}
        <div className="space-y-8">
          {/* Weekly Roster Calendar */}
          <div ref={rosterRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Weekly Roster Overview</h2>
              <Button onClick={scrollToRoster} className="gap-2">
                <Calendar className="w-4 h-4" />
                Edit Schedule
              </Button>
            </div>
            <RosterCalendar />
          </div>

          {/* Team Members Table */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Team Performance</h2>
            <Card className="bg-card/80 backdrop-blur-sm border-2">
              <div className="p-4 border-b">
                <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto flex-wrap">
                    <TabsTrigger value="All">All</TabsTrigger>
                    {departments.map((dept) => (
                      <TabsTrigger key={dept.id} value={dept.name}>
                        {dept.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Reliability</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground hidden md:block">{employee.role}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
                      <TableCell className="text-center text-green-600 font-semibold">{employee.attendance}%</TableCell>
                      <TableCell className="text-center text-blue-600 font-semibold hidden md:table-cell">
                        {employee.reliability}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="gap-1">
                          {employee.performanceRating} <Star className="w-3 h-3 text-amber-400" />
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
                              <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View Schedule</span>
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

        {/* Schedule Dialog */}
        {selectedEmployee && (
          <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
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