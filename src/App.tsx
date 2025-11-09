
import { lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ApexLayout } from "@/components/layout/ApexLayout";
import { AuthProvider } from "@/hooks/useAuth";

// Apex Pages
import Dashboard from "./pages/apex/Dashboard";
import Support from "./pages/apex/Support";
import ApexSettings from "./pages/apex/ApexSettings";
import Funnels from "./pages/apex/Funnels";
import FunnelEditor from "./pages/apex/FunnelEditor";
import Tools from "./pages/apex/Tools";
import ROICalculator from "./pages/apex/ROICalculator";
import WhatsAppGenerator from "./pages/apex/WhatsAppGenerator";
import HashtagGenerator from "./pages/apex/HashtagGenerator";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ApexLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/settings" element={<ApexSettings />} />
                  <Route path="/funnels" element={<Funnels />} />
                  <Route path="/funnel-editor/:id" element={<FunnelEditor />} />
                  <Route path="/roi-calculator" element={<ROICalculator />} />
                  <Route path="/whatsapp-generator" element={<WhatsAppGenerator />} />
                  <Route path="/hashtag-generator" element={<HashtagGenerator />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ApexLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
