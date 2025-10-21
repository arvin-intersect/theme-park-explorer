import { useNavigate } from "react-router-dom";
import { Zone } from "@/data/zones";

interface ZoneHotspotProps {
  zone: Zone;
}

const ZoneHotspot = ({ zone }: ZoneHotspotProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/zone/${zone.id}`)}
      className="absolute group cursor-pointer"
      style={{
        top: zone.position.top,
        left: zone.position.left,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Pulsing background glow */}
      <div
        className={`absolute inset-0 ${zone.color} rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300 animate-pulse-glow`}
        style={{ width: "120px", height: "120px", left: "-10px", top: "-10px" }}
      />

      {/* Main hotspot button */}
      <div
        className={`relative ${zone.color} text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 border-4 border-white/50 backdrop-blur-sm`}
        style={{
          animation: "float 3s ease-in-out infinite",
        }}
      >
        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
          {zone.icon}
        </span>
        <span className="text-xs font-bold text-center px-2 leading-tight drop-shadow-lg">
          {zone.name}
        </span>
      </div>

      {/* Hover label */}
      <div className="absolute -bottom-28 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="bg-card/95 backdrop-blur-md text-foreground p-3 rounded-xl shadow-xl border-2 border-primary/50 whitespace-nowrap animate-slide-in w-56 text-left">
          <p className="font-bold text-base">{zone.name}</p>
          <p className="text-xs text-muted-foreground mb-2">Click to open CRM</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-semibold">${zone.stats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Employees:</span>
              <span className="font-semibold">{zone.stats.employees}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Visitors:</span>
              <span className="font-semibold">{zone.stats.visitors}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ZoneHotspot;