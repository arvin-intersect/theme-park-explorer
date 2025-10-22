import { Calendar } from "@/components/ui/calendar";
import { Employee } from "@/data/workforce";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";
import { addDays, format, parseISO } from "date-fns";

interface EmployeeScheduleProps {
  employee: Employee;
}

const EmployeeSchedule = ({ employee }: EmployeeScheduleProps) => {
  const workingDays = useMemo(() => employee.shifts.map((shift) => parseISO(shift.date)), [employee.shifts]);

  // Dummy data for demo purposes
  const offDays = [addDays(new Date(), 2), addDays(new Date(), 3), addDays(new Date(), 10)];
  const availableDays = [addDays(new Date(), 5), addDays(new Date(), 12)];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <Calendar
          mode="multiple"
          selected={workingDays}
          defaultMonth={workingDays.length > 0 ? workingDays[0] : new Date()}
          className="rounded-md border p-0"
          modifiers={{
            off: offDays,
            available: availableDays,
          }}
          modifiersStyles={{
            off: {
              backgroundColor: "hsl(var(--destructive) / 0.1)",
              color: "hsl(var(--destructive))",
              fontWeight: "bold",
            },
            available: {
              backgroundColor: "hsl(var(--warning) / 0.1)",
              color: "hsl(var(--warning))",
            },
            selected: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            },
          }}
        />
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span>Working</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive/20" />
            <span>Day Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-warning/20" />
            <span>Available (Not Working)</span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-80">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {employee.shifts
                .filter((shift) => new Date(shift.date) >= new Date())
                .slice(0, 5)
                .map((shift, index) => (
                  <li key={index} className="border-l-4 border-primary pl-3 py-1">
                    <p className="font-semibold">{format(parseISO(shift.date), "EEEE, MMM d")}</p>
                    <p className="text-sm text-muted-foreground">
                      {shift.time} ({shift.duration})
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {shift.zone}
                    </Badge>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeSchedule;