import { useState, useMemo } from "react";
import { format, getMonth, getYear } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DayPicker, DayProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface ZoneRosterCalendarProps {
  zoneId: string;
}

const fetchZoneShifts = async (zoneId: string, month: Date) => {
    const { data, error } = await supabase
        .from('shifts')
        .select(`id, start_time, profiles (id, full_name)`)
        .eq('zone_id', zoneId);
        // In a production app with lots of data, you'd filter by month here.
        // .gte('start_time', format(startOfMonth(month), 'yyyy-MM-dd'))
        // .lte('start_time', format(endOfMonth(month), 'yyyy-MM-dd'));

    if (error) throw new Error(error.message);

    const scheduleByDate = {};
    data?.forEach(shift => {
        const dateKey = format(new Date(shift.start_time), 'yyyy-MM-dd');
        if (!scheduleByDate[dateKey]) {
            scheduleByDate[dateKey] = [];
        }
        if (shift.profiles) {
            scheduleByDate[dateKey].push(shift.profiles);
        }
    });
    return scheduleByDate;
}

const ZoneRosterCalendar = ({ zoneId }: ZoneRosterCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: scheduleByDate } = useQuery({
      queryKey: ['zoneShifts', zoneId, getYear(currentMonth), getMonth(currentMonth)],
      queryFn: () => fetchZoneShifts(zoneId, currentMonth),
  });

  const CustomDay = (props: DayProps) => {
    const { date, displayMonth } = props;
    const dateString = format(date, "yyyy-MM-dd");
    const scheduledEmployees = scheduleByDate?.[dateString] || [];
    const isOutside = date.getMonth() !== displayMonth.getMonth();
    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    return (
      <div className={`relative flex h-full w-full flex-col items-start p-2 text-left transition-all duration-200 ${ scheduledEmployees.length > 0 && !isOutside ? "cursor-pointer border-2 border-border/50 hover:border-primary hover:shadow-lg hover:scale-[1.02] rounded-lg bg-card" : "border-2 border-transparent rounded-lg" } ${isToday && !isOutside ? "ring-2 ring-primary/50 ring-offset-background" : ""}`} >
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
                      <AvatarFallback className="text-xs">{emp.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent><p>{emp.full_name}</p></TooltipContent>
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
    <Card className="bg-card/80 backdrop-blur-sm border-2 shadow-xl">
      <CardContent className="p-4 sm:p-6">
        <DayPicker
          showOutsideDays
          fixedWeeks
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          // THIS IS THE RESTORED STYLING
          classNames={{
            root: "w-full",
            months: "w-full",
            month: "space-y-6 w-full",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-lg font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
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
  );
};

export default ZoneRosterCalendar;