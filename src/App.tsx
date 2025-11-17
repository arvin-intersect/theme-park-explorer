import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ParkZone from "./pages/ParkZone";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import NotFound from "./pages/NotFound";
import AdminSettings from "./pages/AdminSettings";
import AIChatPage from "./pages/AIChatPage"; // NEW IMPORT

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/zone/:zoneSlug" element={<ParkZone />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/ai-chat" element={<AIChatPage />} /> {/* NEW ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;