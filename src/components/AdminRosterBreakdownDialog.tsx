// FILE: src/components/AdminRosterBreakdownDialog.tsx
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

type DepartmentHealth = {
  department_id: string;
  department_name: string;
  rostered_staff_count: number;
  target_staff_count: number;
  roster_percentage: number;
}

interface AdminRosterBreakdownDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  onAlertManager: (department: DepartmentHealth, date: Date | null) => void;
}

const fetchDepartmentHealth = async (date: Date): Promise<DepartmentHealth[]> => {
    const { data, error } = await supabase.rpc('get_daily_department_health', {
        target_date: format(date, 'yyyy-MM-dd')
    });
    if (error) throw new Error(error.message);
    return data || [];
}

const getStatus = (percentage: number) => {
    if (percentage < 70) return { label: 'Critical', color: 'destructive' as const, icon: <AlertTriangle className="h-4 w-4" /> };
    if (percentage < 90) return { label: 'High', color: 'secondary' as const, icon: <AlertTriangle className="h-4 w-4" /> };
    return { label: 'Optimal', color: 'default' as const, icon: <ShieldCheck className="h-4 w-4" /> };
}

export function AdminRosterBreakdownDialog({ isOpen, onOpenChange, date, onAlertManager }: AdminRosterBreakdownDialogProps) {
    
    const { data, isLoading } = useQuery({
        queryKey: ['departmentHealth', date],
        queryFn: () => fetchDepartmentHealth(date!),
        enabled: isOpen && !!date,
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Park-Wide Roster Health for {date ? format(date, "EEEE, MMMM d") : ''}</DialogTitle>
                    <DialogDescription>Breakdown of roster coverage by department for the selected day.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-center">Coverage</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.map(dept => {
                                    const status = getStatus(dept.roster_percentage);
                                    return (
                                        <TableRow key={dept.department_id}>
                                            <TableCell className="font-medium">{dept.department_name}</TableCell>
                                            <TableCell className="text-center">
                                                {dept.rostered_staff_count} / {dept.target_staff_count} 
                                                <span className="text-muted-foreground ml-2">({Math.round(dept.roster_percentage || 0)}%)</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={status.color} className="gap-1.5">
                                                    {status.icon} {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {status.label === 'Critical' && (
                                                    <Button variant="outline" size="sm" onClick={() => onAlertManager(dept, date)}>
                                                        Alert Manager
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}