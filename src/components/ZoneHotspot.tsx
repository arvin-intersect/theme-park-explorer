import { useNavigate } from "react-router-dom";
import { Zone } from "@/types/database.types";
import { Skeleton } from "./ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface ZoneHotspotProps {
  zone: Zone;
}

const fetchHotspotStats = async (zoneId: string) => {
  // Fetch stats for the most recent day available for this specific zone
  const { data, error } = await supabase
    .from("daily_operational_stats")
    .select("visitor_count, revenue")
    .eq("entity_id", zoneId)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  // Fetch total employees ever scheduled in this zone (can be optimized)
  const { count: employeeCount, error: shiftError } = await supabase
    .from("shifts")
    .select("id", { count: "exact", head: true })
    .eq("zone_id", zoneId);

  if (error || shiftError) {
    console.error("Hotspot fetch error:", error, shiftError);
    return { visitors: "N/A", revenue: 0, employees: 0 };
  }
  return {
    visitors: data?.visitor_count ? `${(data.visitor_count / 1000).toFixed(1)}k` : "0",
    revenue: data?.revenue || 0,
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
                <span className="text-muted-foreground">Revenue (Latest):</span>
                <span className="font-semibold">${stats?.revenue?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Team Members:</span>
                <span className="font-semibold">{stats?.employees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visitors (Latest):</span>
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