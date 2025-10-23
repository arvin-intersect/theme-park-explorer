import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import WorkforceNav from "@/components/WorkforceNav";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/sonner";
import { Department } from "@/types/database.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const fetchDepartments = async (): Promise<Department[]> => {
    const { data, error } = await supabase.from("departments").select("*").order('name');
    if (error) throw new Error(error.message);
    return data || [];
}

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: departments, isLoading } = useQuery({ 
      queryKey: ['departments'], 
      queryFn: fetchDepartments,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptIcon, setNewDeptIcon] = useState("");
  const [newDeptColor, setNewDeptColor] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddDepartment = async () => {
    if (!newDeptName) {
      toast.warning("Department name is required.");
      return;
    }
    const { error } = await supabase.from("departments").insert({ 
        name: newDeptName, 
        icon: newDeptIcon, 
        color: newDeptColor 
    }).select();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Department added successfully!");
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departmentStats'] }); // Invalidate admin dashboard data
      setNewDeptName("");
      setNewDeptIcon("");
      setNewDeptColor("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <WorkforceNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Admin Settings</h1>
        
        <Tabs defaultValue="departments" className="w-full">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="zones" disabled>Zones (TODO)</TabsTrigger>
            <TabsTrigger value="attractions" disabled>Attractions (TODO)</TabsTrigger>
          </TabsList>
          <TabsContent value="departments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Departments</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">Icon</Label>
                        <Input id="icon" value={newDeptIcon} onChange={(e) => setNewDeptIcon(e.target.value)} className="col-span-3" placeholder="e.g., 🎢" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">Color</Label>
                        <Input id="color" value={newDeptColor} onChange={(e) => setNewDeptColor(e.target.value)} className="col-span-3" placeholder="e.g., hsl(186, 75%, 40%)" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddDepartment}>Save Department</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-40 w-full" /> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Icon</TableHead><TableHead>Name</TableHead><TableHead>Color</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {departments?.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell className="text-2xl">{dept.icon}</TableCell>
                          <TableCell className="font-medium">{dept.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }}></div>
                              <span>{dept.color}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;