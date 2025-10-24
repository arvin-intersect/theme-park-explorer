// FILE: src/components/RosterCalendar.tsx
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, getYear, getMonth, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { DayPicker, DayProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

export type RosterSummary = {
  calendar_date: string;
  predicted_visitors: number;
  target_staff_count: number;
  rostered_staff_count: number;
  department_id?: string;
  department_name?: string;
};

// No changes to fetchRosterSummary needed, as it already gets the correct counts.
const fetchRosterSummary = async (month: Date, departmentId: string | null = null): Promise<RosterSummary[]> => {
  try {
    const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

    const params: any = { 
      start_date: startDate, 
      end_date: endDate
    };

    if (departmentId) {
      params.target_department_id = departmentId;
    }

    // The RPC now only counts 'confirmed' shifts, so this is accurate.
    const { data, error } = await supabase.rpc('get_calendar_overview', params);

    if (error) {
      console.error('❌ RPC Error:', error);
      throw new Error(`RPC failed: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('💥 fetchRosterSummary error:', error);
    throw error;
  }
};


// UPDATED URGENCY LOGIC
const getUrgency = (rosterPct: number, date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysOut = differenceInDays(date, today);

  if (daysOut < 0) return { level: 'past', label: 'Past', color: 'bg-muted/30 text-muted-foreground/50' };

  if (rosterPct < 0.7) {
    if (daysOut <= 14) return { level: 'critical', label: 'Critical', color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' };
    return { level: 'high', label: 'High', color: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' };
  } else if (rosterPct < 0.9) {
    if (daysOut <= 7) return { level: 'high', label: 'High', color: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' };
    return { level: 'medium', label: 'Medium', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' };
  }
  return { level: 'low', label: 'Optimal', color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' };
};


interface RosterCalendarProps {
  onDayClick?: (day: Date, summary: RosterSummary) => void;
  departmentId?: string | null;
}

const RosterCalendar = ({ onDayClick, departmentId = null }: RosterCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  
  // Always generate data for the next 3 months dynamically
  const { data: dailyRosterSummary, isLoading, error } = useQuery({
    queryKey: ['rosterSummary', getYear(currentMonth), getMonth(currentMonth), departmentId],
    queryFn: () => fetchRosterSummary(currentMonth, departmentId),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });


  const summaryByDate = useMemo(() => {
    if (!dailyRosterSummary) return {};
    const acc: { [key: string]: RosterSummary } = {};
    dailyRosterSummary.forEach((summary) => {
      const dateKey = summary.calendar_date;
      acc[dateKey] = summary;
    });
    return acc;
  }, [dailyRosterSummary]);

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
          </div>
        </div>
      );
    }

    if (!summary && !isOutside) {
      const rosterPct = 0;
      const urgency = getUrgency(rosterPct, date);
      
      return (
        <div className="relative flex h-full w-full flex-col items-start p-2 text-left rounded-lg bg-muted/30 border border-dashed">
          <div className={`self-end font-bold text-sm mb-1 ${isToday ? "text-primary" : "text-foreground/70"}`}>
            {format(date, "d")}
          </div>
          <div className="flex-1 w-full space-y-1 text-xs text-muted-foreground">
            <div className="text-center">No data</div>
          </div>
        </div>
      );
    }

    const rosterPct = summary && summary.target_staff_count > 0 ? summary.rostered_staff_count / summary.target_staff_count : 1; // Treat 0 target as 100%
    const urgency = getUrgency(rosterPct, date);
    
    const canClick = onDayClick && summary && urgency.level !== 'past';

    return (
      <div
        className={`relative flex h-full w-full flex-col items-start p-2 text-left transition-all duration-200 ${
          canClick
            ? "cursor-pointer border-2 border-border/50 hover:border-primary hover:shadow-lg hover:scale-[1.02] rounded-lg bg-gradient-to-br from-card to-card/90"
            : "border-2 border-transparent rounded-lg"
        } ${isToday && !isOutside ? "ring-2 ring-primary/50 ring-offset-background" : ""}`}
        onClick={() => canClick && onDayClick(date, summary)}
      >
        <div className={`self-end font-bold text-sm mb-1 ${ isOutside ? "text-muted-foreground/30" : isToday ? "text-primary" : "text-foreground/70" }`}>
          {format(date, "d")}
        </div>
        {summary && !isOutside && summary.target_staff_count > 0 && (
          <div className="flex-1 w-full space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span>Roster:</span>
              <span className="font-bold">{(rosterPct * 100).toFixed(0)}%</span>
            </div>
            <div className={`text-center p-1 rounded-md font-semibold ${urgency.color}`}>
              {urgency.label}
            </div>
          </div>
        )}
        {summary && !isOutside && summary.target_staff_count === 0 && (
          <div className="flex-1 w-full space-y-1 text-xs text-muted-foreground">
            <div className="text-center">Park Closed</div>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="p-6 text-center">
          <div className="text-destructive font-semibold">Error loading calendar data</div>
          <div className="text-sm text-muted-foreground mt-2">
            {(error as Error)?.message || 'Failed to fetch roster data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm border-2 shadow-xl">
      <CardContent className="p-4 sm:p-6">
        <DayPicker
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          showOutsideDays
          fixedWeeks
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
            cell: "h-28 sm:h-32 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20", 
            day: "h-full w-full", 
            day_today: "", 
            day_outside: "opacity-30",
          }}
          components={{ Day: CustomDay }}
        />
      </CardContent>
    </Card>
  );
};

export default RosterCalendar;