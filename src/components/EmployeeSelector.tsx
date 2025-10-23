import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabaseClient";

interface EmployeeSelectorProps {
  shiftStartTime: Date;
  shiftEndTime: Date;
  onSelectEmployee: (employee: { id: string; fullName: string }) => void;
  requiredSkillIds?: string[];
}

type AvailableEmployee = {
  id: string;
  full_name: string;
  role: string;
};

// You need to create this function in your Supabase SQL Editor
/*
CREATE OR REPLACE FUNCTION get_available_employees(
    shift_start_time timestamptz,
    shift_end_time timestamptz,
    search_query text
)
RETURNS TABLE (id uuid, full_name text, role text) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.full_name,
        p.role
    FROM
        public.profiles p
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.shifts s
        WHERE
            s.employee_id = p.id
            AND (s.start_time, s.end_time) OVERLAPS (shift_start_time, shift_end_time)
    )
    AND p.full_name ILIKE '%' || search_query || '%'
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
*/

export function EmployeeSelector({
  shiftStartTime,
  shiftEndTime,
  onSelectEmployee,
}: EmployeeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  const { data: employees, isLoading } = useQuery({
    queryKey: ["available-employees", debouncedSearchQuery, shiftStartTime, shiftEndTime],
    queryFn: async () => {
       const { data, error } = await supabase.rpc("get_available_employees", {
        shift_start_time: shiftStartTime.toISOString(),
        shift_end_time: shiftEndTime.toISOString(),
        search_query: debouncedSearchQuery,
      });

      if (error) {
        console.error("Error fetching available employees:", error);
        throw new Error(error.message);
      }
      return data as AvailableEmployee[];
    },
    enabled: open,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          Select Employee...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search employee..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && <div className="p-4 text-sm text-center">Fetching...</div>}
            <CommandEmpty>No available employees found.</CommandEmpty>
            {employees?.map((employee) => (
              <CommandItem
                key={employee.id}
                value={employee.full_name}
                onSelect={() => {
                  onSelectEmployee({ id: employee.id, fullName: employee.full_name });
                  setOpen(false);
                }}
              >
                <Check className="mr-2 h-4 w-4 opacity-0" />
                <div>
                  <p>{employee.full_name}</p>
                  <p className="text-xs text-muted-foreground">{employee.role}</p>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}