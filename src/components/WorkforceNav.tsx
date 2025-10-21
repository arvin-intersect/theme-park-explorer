import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Users, User, Map, ChevronDown } from "lucide-react";

const WorkforceNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, setRole } = useAuth();

  const roleConfig = {
    admin: { label: "Master Admin", icon: Shield, color: "text-workspace-navy" },
    manager: { label: "Manager", icon: Users, color: "text-workspace-teal" },
    employee: { label: "Employee", icon: User, color: "text-primary" },
  };

  const currentRole = roleConfig[role];
  const RoleIcon = currentRole.icon;

  const handleRoleChange = (newRole: "admin" | "manager" | "employee") => {
    setRole(newRole);
    if (newRole === "admin") navigate("/admin");
    else if (newRole === "manager") navigate("/manager");
    else navigate("/employee");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-card/95 border-b border-border shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="text-2xl">🎡</div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Peakville</h1>
                <p className="text-xs text-muted-foreground">Park CRM</p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className={location.pathname === "/" ? "bg-primary/10 text-primary" : ""}
            >
              <Map className="w-4 h-4 mr-2" />
              Park Map
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className={location.pathname === "/admin" ? "bg-primary/10 text-primary" : ""}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/manager")}
              className={location.pathname === "/manager" ? "bg-primary/10 text-primary" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              Manager
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/employee")}
              className={location.pathname === "/employee" ? "bg-primary/10 text-primary" : ""}
            >
              <User className="w-4 h-4 mr-2" />
              Employee
            </Button>
          </nav>

          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-2 hover:border-primary transition-colors"
              >
                <RoleIcon className={`w-4 h-4 ${currentRole.color}`} />
                <span className="font-semibold">{currentRole.label}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {Object.entries(roleConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleRoleChange(key as "admin" | "manager" | "employee")}
                    className="gap-2 cursor-pointer"
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span>{config.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default WorkforceNav;