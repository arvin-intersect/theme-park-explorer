import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Employee } from "@/data/workforce";

const EmployeeSchedule = ({ employee }: { employee: Employee }) => {
  return (
    <div className="space-y-4 p-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Department</p>
          <p className="font-semibold">{employee.department}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="font-semibold">{employee.role}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Upcoming Shifts</h3>
        <div className="space-y-2">
          {employee.shifts.map((shift, idx) => (
            <Card key={idx} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{format(new Date(shift.date), "EEEE, MMM d")}</p>
                  <p className="text-sm text-muted-foreground">
                    {shift.time} • {shift.duration}
                  </p>
                </div>
                <Badge>{shift.zone}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Skills & Certifications</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {employee.skills.map((skill, idx) => (
                <Badge key={idx} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Certifications</p>
            <div className="flex flex-wrap gap-1">
              {employee.certifications.map((cert, idx) => (
                <Badge key={idx} variant="secondary">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSchedule;