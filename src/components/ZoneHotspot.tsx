import { useNavigate } from "react-router-dom";
import { Zone } from "@/types/database.types";
import { Skeleton } from "./ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface ZoneHotspotProps {
  zone: Zone;
}

// FIX: This function now looks at future predictions for the current day's pattern.
const fetchHotspotStats = async (zoneId: string) => {
  // Use the same pattern logic as our SQL functions to find the relevant data
  const pattern_start_date = new Date('2024-01-01');
  const today = new Date();
  const days_since_pattern_start = Math.floor((today.getTime() - pattern_start_date.getTime()) / (1000 * 3600 * 24));
  const pattern_date = new Date(pattern_start_date);
  pattern_date.setDate(pattern_start_date.getDate() + (days_since_pattern_start % 14));

  const { data, error } = await supabase
    .from("daily_visitor_predictions")
    .select("predicted_visitors, target_staff_count")
    .eq("date", format(pattern_date, 'yyyy-MM-dd'))
    .single();
  
  // Total employees are not tied to a date, so this can stay.
  const { count: employeeCount, error: shiftError } = await supabase
    .from("shifts")
    .select("id", { count: "exact", head: true })
    .eq("zone_id", zoneId);
    
  if (error || shiftError) {
    console.error("Hotspot fetch error:", error, shiftError);
    return { visitors: "N/A", revenue: 0, employees: 0 };
  }
  
  // Simulate revenue based on a fraction of the park's total predicted visitors
  const zoneVisitors = Math.floor((data?.predicted_visitors || 0) / 7); // Assume 7 zones
  const zoneRevenue = zoneVisitors * 55; // Arbitrary revenue per visitor

  return {
    visitors: zoneVisitors > 1000 ? `${(zoneVisitors / 1000).toFixed(1)}k` : zoneVisitors.toString(),
    revenue: zoneRevenue,
    employees: employeeCount || 0,
  };
};

const ZoneHotspot = ({ zone }: ZoneHotspotProps) => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["hotspotStats", zone.id],
    queryFn: () => fetchHotspotStats(zone.id),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <button
      onClick={() => navigate(`/zone/${zone.slug}`)}
      className="absolute group cursor-pointer"
      style={{
        top: zone.map_position.top,
        left: zone.map_position.left,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="relative bg-primary text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 border-4 border-white/50 backdrop-blur-sm"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{zone.icon}</span>
        <span className="text-xs font-bold text-center px-2 leading-tight drop-shadow-lg">{zone.name}</span>
      </div>

      <div className="absolute -bottom-28 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="bg-card/95 backdrop-blur-md text-foreground p-3 rounded-xl shadow-xl border-2 border-primary/50 whitespace-nowrap animate-slide-in w-56 text-left">
          <p className="font-bold text-base">{zone.name}</p>
          <p className="text-xs text-muted-foreground mb-2">Click to open CRM</p>
          {isLoading ? (
            <div className="space-y-2 mt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Revenue (Est.):</span>
                <span className="font-semibold">${stats?.revenue?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Team Members:</span>
                <span className="font-semibold">{stats?.employees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visitors (Est.):</span>
                <span className="font-semibold">{stats?.visitors}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ZoneHotspot;