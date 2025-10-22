import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import WorkforceNav from "@/components/WorkforceNav";
import { ArrowLeft, Users, Calendar, TrendingUp, Lightbulb, UserCheck, Eye, Star } from "lucide-react";
import { zones } from "@/data/zones";
import { mockEmployees, Employee } from "@/data/workforce";
import ZoneRosterCalendar from "@/components/ZoneRosterCalendar";
import EmployeeSchedule from "@/components/EmployeeSchedule";
import { toast } from "@/components/ui/sonner";

const ParkZone = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const zone = useMemo(() => zones.find((z) => z.id === zoneId), [zoneId]);

  const zoneEmployees = useMemo(() => {
    if (!zone) return [];
    return mockEmployees.filter((emp) =>
      emp.shifts.some((shift) => shift.zone === zone.name)
    );
  }, [zone]);

  const onDutyToday = useMemo(() => {
    if (!zone) return 0;
    const today = format(new Date(), "yyyy-MM-dd");
    let count = 0;
    mockEmployees.forEach((emp) => {
      if (emp.shifts.some((shift) => shift.date === today && shift.zone === zone.name)) {
        count++;
      }
    });
    return count;
  }, [zone]);

  const avgAttendance = useMemo(() => {
    if (zoneEmployees.length === 0) return 0;
    const total = zoneEmployees.reduce((acc, emp) => acc + emp.attendance, 0);
    return Math.round(total / zoneEmployees.length);
  }, [zoneEmployees]);

  const handleActionClick = (featureName: string) => {
    toast.info(`${featureName} feature is coming soon!`);
  };

  if (!zone) {
    return (
      <>
        <WorkforceNav />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Zone Not Found</h1>
            <Button onClick={() => navigate("/")}>Back to Park Map</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-teal-50/20">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 hover:bg-primary/10 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Park Map
        </Button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
            {zone.name} Dashboard
          </h1>
          <p className="text-muted-foreground">{zone.description}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned Team</p>
                <p className="text-3xl font-bold text-foreground">{zoneEmployees.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">On Duty Today</p>
                <p className="text-3xl font-bold text-foreground">{onDutyToday}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Attendance</p>
                <p className="text-3xl font-bold text-foreground">{avgAttendance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-teal-500" />
            </div>
          </Card>
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Shifts</p>
                <p className="text-3xl font-bold text-foreground">3</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* AI & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-500" /> AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 list-disc list-inside text-sm text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">Peak Hour Support:</span> Add 2 more team members
                  during 3-5 PM to reduce wait times, which are 25% above average for this zone.
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleActionClick("Request Zone Coverage")}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Users className="w-4 h-4" /> Request Zone Coverage
              </Button>
              <Button onClick={() => navigate("/admin")} className="w-full justify-start gap-2" variant="outline">
                <TrendingUp className="w-4 h-4" /> View Zone-Specific Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Full-width content area */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Weekly Zone Roster</h2>
            <ZoneRosterCalendar zoneId={zone.id} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Team Performance</h2>
            <Card className="bg-card/80 backdrop-blur-sm border-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zoneEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell className="text-center text-green-600 font-semibold">{employee.attendance}%</TableCell>
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
                              onClick={() => setSelectedEmployee(employee)}
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

export default ParkZone;