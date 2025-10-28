import { format, startOfToday, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmployeeWithDetails } from "@/types/database.types";

const EmployeeSchedule = ({ employee }: { employee: EmployeeWithDetails }) => {
  // FIX: Replace space with 'T' to create a valid ISO string before parsing.
  const today = startOfToday();

  const upcomingShifts = employee.shifts
    ?.filter((shift) => parseISO(shift.end_time.replace(" ", "T")) >= today)
    .sort((a, b) => parseISO(a.start_time.replace(" ", "T")).getTime() - parseISO(b.start_time.replace(" ", "T")).getTime());

  return (
    <div className="space-y-4 p-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Department</p>
          <p className="font-semibold">{employee.departments?.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="font-semibold">{employee.role}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Upcoming Shifts</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {upcomingShifts && upcomingShifts.length > 0 ? (
            upcomingShifts.map((shift) => (
              <Card key={shift.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{format(parseISO(shift.start_time.replace(" ", "T")), "EEEE, MMM d")}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(shift.start_time.replace(" ", "T")), "p")} - {format(parseISO(shift.end_time.replace(" ", "T")), "p")}
                    </p>
                  </div>
                  <Badge>{shift.zones?.name}</Badge>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming shifts scheduled.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Skills & Certifications</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {employee.employee_skills?.map(({ skills }) => (
                <Badge key={skills.name} variant="outline">{skills.name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Certifications</p>
            <div className="flex flex-wrap gap-1">
              {employee.employee_certifications?.map(({ certifications }) => (
                <Badge key={certifications.name} variant="secondary">{certifications.name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSchedule;