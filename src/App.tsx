// FILE: src/App.tsx
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
import AIChatSheet from "./components/AIChatSheet"; // NEW IMPORT
import { Button } from "./components/ui/button"; // NEW IMPORT
import { BotMessageSquare } from "lucide-react"; // NEW IMPORT

const queryClient = new QueryClient();

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false); // NEW STATE

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
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Floating Chat Button */}
            <Button
              className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 animate-pulse-glow"
              size="icon"
              onClick={() => setIsChatOpen(true)}
              aria-label="Open AI Chat"
            >
              <BotMessageSquare className="h-7 w-7" />
            </Button>

            {/* AI Chat Sheet Component */}
            <AIChatSheet isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;