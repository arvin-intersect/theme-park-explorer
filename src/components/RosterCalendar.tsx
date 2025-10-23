import { useState, useMemo } from "react";
import { format, getMonth, getYear, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DayPicker, DayProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner"; // NEW: Import toast

const fetchRosterSummary = async (month: Date) => {
    const startDate = startOfMonth(month).toISOString();
    const endDate = endOfMonth(month).toISOString();

    const { data, error } = await supabase.rpc('get_roster_summary', { start_date: startDate, end_date: endDate });
    if (error) throw new Error(error.message);
    return data;
}

const RosterCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  
  const { data: dailyRosterSummary, isLoading } = useQuery({
      queryKey: ['rosterSummary', getYear(currentMonth), getMonth(currentMonth)],
      queryFn: () => fetchRosterSummary(currentMonth),
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const summaryByDate = useMemo(() => {
    if (!dailyRosterSummary) return {};
    const acc = {};
    dailyRosterSummary.forEach((summary) => {
      acc[summary.shift_date] = summary;
    });
    return acc;
  }, [dailyRosterSummary]);

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDayClick = (day: Date) => {
    const dateString = format(day, "yyyy-MM-dd");
    if (summaryByDate[dateString]) {
      setSelectedDay(day);
      setIsDialogOpen(true);
    }
  };

  // FIX: This now shows a toast instead of navigating
  const handleCellClick = (departmentName: string) => {
    toast.info(`Navigating to the ${departmentName} dashboard is coming soon!`);
    setIsDialogOpen(false);
  };
  
  // A placeholder for the detailed dialog content
  const rosterData = [
    { time: "09:00 AM", rides: 120, food: 80, retail: 60, maintenance: 40 },
    { time: "12:00 PM", rides: 150, food: 120, retail: 90, maintenance: 50 },
    { time: "03:00 PM", rides: 180, food: 150, retail: 100, maintenance: 60 },
  ];
  const departments = [
      { id: 'rides', name: 'Rides & Attractions', icon: '🎢'},
      { id: 'food', name: 'Food Services', icon: '🍔'},
      { id: 'retail', name: 'Retail & Shops', icon: '🛍️'},
      { id: 'maintenance', name: 'Maintenance', icon: '🔧'},
  ]

  const CustomDay = (props: DayProps) => {
    const { date, displayMonth } = props;
    const dateString = format(date, "yyyy-MM-dd");
    const summary = summaryByDate[dateString];
    const isOutside = date.getMonth() !== displayMonth.getMonth();
    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    if (isLoading && !isOutside) {
        return (
            <div className="relative flex h-full w-full flex-col items-start p-2 text-left rounded-lg bg-muted/50">
                <Skeleton className="w-6 h-4 self-end"/>
                <div className="w-full space-y-1 mt-2">
                    <Skeleton className="w-full h-4"/>
                    <Skeleton className="w-full h-4"/>
                    <Skeleton className="w-full h-4"/>
                    <Skeleton className="w-full h-4"/>
                </div>
            </div>
        )
    }

    return (
      <div
        className={`relative flex h-full w-full flex-col items-start p-2 text-left transition-all duration-200 ${
          summary && !isOutside
            ? "cursor-pointer border-2 border-border/50 hover:border-primary hover:shadow-lg hover:scale-[1.02] rounded-lg bg-gradient-to-br from-card to-card/90"
            : "border-2 border-transparent rounded-lg"
        } ${isToday && !isOutside ? "ring-2 ring-primary/50 ring-offset-background" : ""}`}
        onClick={() => handleDayClick(date)}
      >
        <div className={`self-end font-bold text-sm mb-1 ${ isOutside ? "text-muted-foreground/30" : isToday ? "text-primary" : "text-foreground/70" }`}>
          {format(date, "d")}
        </div>
        {summary && !isOutside && (
          <div className="flex-1 w-full space-y-1">
            <div className="flex items-center justify-between rounded-lg px-2 py-0.5 bg-teal-50 dark:bg-teal-900/50">
              <span className="text-sm">🎢</span>
              <span className="font-bold text-sm text-teal-700 dark:text-teal-300">{summary.rides}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-0.5 bg-orange-50 dark:bg-orange-900/50">
              <span className="text-sm">🍔</span>
              <span className="font-bold text-sm text-orange-700 dark:text-orange-300">{summary.food}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-0.5 bg-pink-50 dark:bg-pink-900/50">
              <span className="text-sm">🛍️</span>
              <span className="font-bold text-sm text-pink-700 dark:text-pink-300">{summary.retail}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/50">
              <span className="text-sm">🔧</span>
              <span className="font-bold text-sm text-yellow-800 dark:text-yellow-300">{summary.maintenance}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm border-2 shadow-xl">
        <CardContent className="p-4 sm:p-6">
          <DayPicker
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            showOutsideDays
            fixedWeeks
            classNames={{
              root: "w-full", months: "w-full", month: "space-y-6 w-full", caption: "flex justify-center pt-1 relative items-center", caption_label: "text-lg font-medium", nav: "space-x-1 flex items-center", nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100", table: "w-full border-collapse", head_row: "flex justify-around mb-2", head_cell: "text-muted-foreground font-bold text-sm rounded-md w-full capitalize", row: "flex w-full mt-2 justify-around gap-2", cell: "h-32 sm:h-36 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20", day: "h-full w-full", day_today: "", day_outside: "opacity-30",
            }}
            components={{ Day: CustomDay }}
          />
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              Shift Roster: {selectedDay && format(selectedDay, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription className="text-base">
              Detailed breakdown of team members scheduled.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Card className="border-2 shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[120px] font-bold">Time Slot</TableHead>
                    {departments.map((dept) => (
                      <TableHead key={dept.id} className="text-center font-bold">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg">{dept.icon}</span>
                          <span className="text-xs">{dept.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rosterData.map((row, idx) => (
                    <TableRow key={row.time} className={idx % 2 === 0 ? "bg-muted/20" : ""}>
                      <TableCell className="font-bold text-base">{row.time}</TableCell>
                      <TableCell className="text-center"><Button variant="link" className="text-xl font-bold text-primary p-0 h-auto" onClick={() => handleCellClick("Rides & Attractions")}>{row.rides}</Button></TableCell>
                      <TableCell className="text-center"><Button variant="link" className="text-xl font-bold p-0 h-auto" style={{ color: "hsl(30, 95%, 60%)" }} onClick={() => handleCellClick("Food Services")}>{row.food}</Button></TableCell>
                      <TableCell className="text-center"><Button variant="link" className="text-xl font-bold p-0 h-auto" style={{ color: "hsl(340, 85%, 55%)" }} onClick={() => handleCellClick("Retail & Shops")}>{row.retail}</Button></TableCell>
                      <TableCell className="text-center"><Button variant="link" className="text-xl font-bold p-0 h-auto" style={{ color: "hsl(38, 92%, 50%)" }} onClick={() => handleCellClick("Maintenance")}>{row.maintenance}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RosterCalendar;