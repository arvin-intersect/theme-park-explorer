import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockEmployees } from "@/data/workforce"; // CORRECTED: Removed zones from here
import { zones } from "@/data/zones"; // CORRECTED: Added correct import for zones
import { DayPicker, DayProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar } from "lucide-react";

interface ZoneRosterCalendarProps {
  zoneId: string;
}

const ZoneRosterCalendar = ({ zoneId }: ZoneRosterCalendarProps) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const zoneName = useMemo(() => zones.find((z) => z.id === zoneId)?.name, [zoneId]);

  const scheduleByDate = useMemo(() => {
    if (!zoneName) return {};

    const schedule = {};
    mockEmployees.forEach((employee) => {
      employee.shifts.forEach((shift) => {
        if (shift.zone === zoneName) {
          if (!schedule[shift.date]) {
            schedule[shift.date] = [];
          }
          schedule[shift.date].push({ ...employee, shiftInfo: shift });
        }
      });
    });
    return schedule;
  }, [zoneName]);

  const handleDayClick = (day: Date) => {
    const dateString = format(day, "yyyy-MM-dd");
    if (scheduleByDate[dateString]) {
      setSelectedDay(day);
      setIsDialogOpen(true);
    }
  };

  const CustomDay = (props: DayProps) => {
    const { date, displayMonth } = props;
    const dateString = format(date, "yyyy-MM-dd");
    const scheduledEmployees = scheduleByDate[dateString] || [];
    const isOutside = date.getMonth() !== displayMonth.getMonth();
    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    return (
      <div
        className={`relative flex h-full w-full flex-col items-start p-2 text-left transition-all duration-200 ${
          scheduledEmployees.length > 0 && !isOutside
            ? "cursor-pointer border-2 border-border/50 hover:border-primary hover:shadow-lg hover:scale-[1.02] rounded-lg bg-card"
            : "border-2 border-transparent rounded-lg"
        } ${isToday && !isOutside ? "ring-2 ring-primary/50 ring-offset-background" : ""}`}
        onClick={() => handleDayClick(date)}
      >
        <div className={`self-end font-bold text-sm ${isOutside ? "text-muted-foreground/30" : "text-foreground/70"}`}>
          {format(date, "d")}
        </div>
        {!isOutside && scheduledEmployees.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            <TooltipProvider>
              {scheduledEmployees.slice(0, 3).map((emp) => (
                <Tooltip key={emp.id}>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{emp.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {scheduledEmployees.length > 3 && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">+{scheduledEmployees.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </TooltipProvider>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-sm border-2 shadow-xl">
        <CardContent className="p-4 sm:p-6">
          <DayPicker
            showOutsideDays
            fixedWeeks
            defaultMonth={new Date(2025, 9)}
            classNames={{
              root: "w-full",
              months: "w-full",
              month: "space-y-6 w-full",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-lg font-medium",
              nav: "space-x-1 flex items-center",
              table: "w-full border-collapse",
              head_row: "flex justify-around mb-2",
              head_cell: "text-muted-foreground font-bold text-sm rounded-md w-full capitalize",
              row: "flex w-full mt-2 justify-around gap-2",
              cell: "h-28 sm:h-32 w-full text-center text-sm p-0 relative",
              day: "h-full w-full",
              day_outside: "opacity-30",
            }}
            components={{ Day: CustomDay }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              Roster for {selectedDay && format(selectedDay, "EEEE, MMMM d")}
            </DialogTitle>
            <DialogDescription className="text-base">Team members scheduled for {zoneName}.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Shift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(scheduleByDate[format(selectedDay || new Date(), "yyyy-MM-dd")] || []).map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>
                      {emp.shiftInfo.time} ({emp.shiftInfo.duration})
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ZoneRosterCalendar;