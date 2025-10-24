// FILE: src/pages/ParkZone.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import WorkforceNav from "@/components/WorkforceNav";
import RosterCalendar from "@/components/RosterCalendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, DollarSign, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";

// Type definitions for the data returned by our new SQL function
type ZoneDetails = {
  id: string;
  name: string;
  description: string;
  icon: string;
  department_id: string;
  department_name: string;
  projections: {
    visitors: number;
    revenue: number;
  };
  employees: {
    id: string;
    full_name: string;
    role: string;
    avg_performance_rating: number;
  }[];
};

// The new data fetching function
const fetchZoneData = async (zoneSlug: string | undefined): Promise<ZoneDetails | null> => {
  if (!zoneSlug) return null;

  const { data, error } = await supabase.rpc('get_zone_details', { p_zone_slug: zoneSlug });

  if (error) {
    console.error("Error fetching zone details:", error);
    throw new Error(error.message);
  }
  return data;
};

const ParkZone = () => {
  const { zoneSlug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['zoneData', zoneSlug],
    queryFn: () => fetchZoneData(zoneSlug),
    enabled: !!zoneSlug,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <WorkforceNav />
        <main className="container mx-auto px-4 py-8"><Skeleton className="w-full h-screen" /></main>
      </div>
    );
  }

  if (error || !data || !data.id) {
    return (
      <div className="min-h-screen bg-background">
        <WorkforceNav />
        <div className="flex flex-col items-center justify-center pt-24">
          <h1 className="text-4xl font-bold mb-4">Zone Not Found</h1>
          <p className="text-muted-foreground mb-6">Could not load the details for this park zone.</p>
          <Button onClick={() => navigate("/")}>Back to Park Map</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Park Map
        </Button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-4">
            <span className="text-5xl">{data.icon}</span>
            {data.name} Dashboard
          </h1>
          <p className="text-muted-foreground">{data.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Est. Daily Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.projections?.visitors?.toLocaleString() || 'N/A'}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Est. Daily Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.projections?.revenue?.toLocaleString() || 'N/A'}</div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{data.department_name} Roster Health</h2>
            <RosterCalendar departmentId={data.department_id} onDayClick={() => toast.info("Drill-down is available on the main Manager Dashboard.")} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Top Team Members</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.employees?.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.full_name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          {employee.avg_performance_rating.toFixed(1)} <Star className="w-4 h-4 text-amber-400" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParkZone;