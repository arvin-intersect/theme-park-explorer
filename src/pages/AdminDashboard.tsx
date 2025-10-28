// FILE: src/pages/AdminDashboard.tsx
import { useState } from "react";
import WorkforceNav from "@/components/WorkforceNav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import RosterCalendar from "@/components/RosterCalendar";
import { AdminRosterBreakdownDialog } from "@/components/AdminRosterBreakdownDialog";
import { RosterSummary } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";
import { toast, Toaster } from "sonner";

const fetchDepartmentStats = async () => {
  const { data, error } = await supabase.rpc('get_department_stats');
  if (error) throw new Error(error.message);
  return data;
};

const AdminDashboard = () => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedDeptForAlert, setSelectedDeptForAlert] = useState<{ id: string, name: string } | null>(null);
  const [alertForDate, setAlertForDate] = useState<Date | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departmentStats"],
    queryFn: fetchDepartmentStats,
  });

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsBreakdownOpen(true);
  };

  const handleOpenAlertModal = (dept: { id: string, name: string }, date: Date | null = null) => {
    setSelectedDeptForAlert(dept);
    setAlertForDate(date);
    setIsAlertDialogOpen(true);
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) {
      toast.warning("Alert message cannot be empty.");
      return;
    }
    if (selectedDeptForAlert) {
      const finalMessage = alertForDate
        ? `[Alert for ${new Date(alertForDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}]: ${alertMessage}`
        : alertMessage;

      const { data, error } = await supabase
        .from('highlights')
        .upsert(
          {
            department_id: selectedDeptForAlert.id, 
            message: finalMessage,
            author: "Admin",
            is_active: true,
          },
          { onConflict: 'department_id' }
        )
        .select();

      console.log("Supabase upsert response:", { data, error });

      if (error) {
        toast.error(`DATABASE ERROR: ${error.message}`);
        console.error("Failed to send alert:", error);
      } else if (data && data.length > 0) {
        toast.success(`Alert sent to ${selectedDeptForAlert.name} department.`);
        setAlertMessage("");
        setIsAlertDialogOpen(false);
        setAlertForDate(null);
        queryClient.invalidateQueries({ queryKey: ['highlight', selectedDeptForAlert.id] });
      } else {
        toast.error("Operation sent, but no confirmation received. Check DB and console.");
        console.warn("Upsert might have succeeded but returned no data.", { data, error });
      }
    }
  };

  const getStatus = (efficiency: number) => {
    if (efficiency > 90) return { text: "optimal", color: "bg-success/10 text-success border-success/20" };
    if (efficiency > 80) return { text: "adequate", color: "bg-warning/10 text-warning border-warning/20" };
    return { text: "critical", color: "bg-destructive/10 text-destructive border-destructive/20" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-workspace-navy to-workspace-teal bg-clip-text text-transparent">
            Master Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Park-wide operational and rostering overview.</p>
        </div>

        <div className="my-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Park-Wide Roster Health</h2>
          <RosterCalendar onDayClick={handleDayClick} departmentId={null} />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-foreground">Department Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? ([...Array(5)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)) 
            : departments?.map((dept: any) => {
                const status = getStatus(dept.avg_efficiency);
                return (
                    <Card key={dept.id} className="p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                            <div className="text-4xl">{dept.icon}</div>
                            <div>
                                <h3 className="font-bold text-foreground">{dept.name}</h3>
                                <p className="text-sm text-muted-foreground">{dept.staff_count} team members</p>
                            </div>
                            </div>
                            <Badge className={`${status.color} border font-semibold`}>{status.text.toUpperCase()}</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Efficiency</span>
                            <span className="font-semibold text-foreground">{Math.round(dept.avg_efficiency)}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${dept.avg_efficiency}%`, backgroundColor: dept.color }}/>
                            </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => handleOpenAlertModal(dept)}>
                        <Megaphone className="w-4 h-4" />
                        Send Alert to Manager
                      </Button>
                    </Card>
                );
            })}
        </div>

        <AdminRosterBreakdownDialog 
            isOpen={isBreakdownOpen}
            onOpenChange={setIsBreakdownOpen}
            date={selectedDate}
            onAlertManager={(dept, date) => handleOpenAlertModal({id: dept.department_id, name: dept.department_name}, date)}
        />

        <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Alert to {selectedDeptForAlert?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="alert-message">Alert Message</Label>
                    <Textarea 
                        id="alert-message"
                        value={alertMessage}
                        onChange={(e) => setAlertMessage(e.target.value)}
                        placeholder="e.g., 'High traffic expected in this area. Please ensure all staff are on high alert.'"
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsAlertDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendAlert}>Send Alert</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </main>
    </div>
  );
};

export default AdminDashboard;