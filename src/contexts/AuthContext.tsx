import { createContext, useContext, useState, ReactNode, useMemo } from "react";

// For this demo, we'll hardcode the user IDs for each role.
// In a real app with login, you would get the user ID from the Supabase session.
const DEMO_USER_IDS = {
  admin: "00000000-0000-0000-0000-000000000000", // A placeholder, admins see all
  manager: "00000000-0000-0000-0000-000000000001", // A placeholder, managers see their department
  employee: null, // This will be replaced by the real ID below
};

type UserRole = "admin" | "manager" | "employee";

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("admin");

  const userId = useMemo(() => {
    if (role === 'employee') {
      // THIS IS THE LINE THAT HAS BEEN CHANGED:
      // We are now using a real ID from your mock data.
      return '0f85ff59-5ebe-4f03-ad7c-511c43616a2f'; 
    }
    return DEMO_USER_IDS[role];
  }, [role]);

  return (
    <AuthContext.Provider value={{ role, setRole, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};