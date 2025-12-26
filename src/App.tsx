import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ApexLayout } from "@/components/layout/ApexLayout";
import { AuthProvider } from "@/hooks/useAuth";

// Apex Pages
import Support from "./pages/apex/Support";
import ApexSettings from "./pages/apex/ApexSettings";
import Dashboard from "./pages/apex/Dashboard";
import Funnels from "./pages/apex/Funnels";
import FunnelEditor from "./pages/apex/FunnelEditor";
import Boards from "./pages/apex/Boards";
import Tools from "./pages/apex/Tools";
import ROICalculator from "./pages/apex/ROICalculator";
import WhatsAppGenerator from "./pages/apex/WhatsAppGenerator";
import HashtagGenerator from "./pages/apex/HashtagGenerator";
import TestimonialGenerator from "./pages/apex/TestimonialGenerator";
import ImageGenerator from "./pages/apex/ImageGenerator";
import ProductCalculator from "./pages/apex/ProductCalculator";
import CopyGenerator from "./pages/apex/CopyGenerator";
import HeadlineGenerator from "./pages/apex/HeadlineGenerator";
import OfferGenerator from "./pages/apex/OfferGenerator";
import EmailGenerator from "./pages/apex/EmailGenerator";
import ScriptGenerator from "./pages/apex/ScriptGenerator";
import PersonaGenerator from "./pages/apex/PersonaGenerator";
import Upgrades from "./pages/apex/Upgrades";

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
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/settings" element={<ApexSettings />} />
                  <Route path="/upgrades" element={<Upgrades />} />
                  <Route path="/funnels" element={<Funnels />} />
                  <Route path="/funnel-editor/:id" element={<FunnelEditor />} />
                  <Route path="/tasks" element={<Boards />} />
                  <Route path="/roi-calculator" element={<ROICalculator />} />
                  <Route path="/whatsapp-generator" element={<WhatsAppGenerator />} />
                  <Route path="/hashtag-generator" element={<HashtagGenerator />} />
                  <Route path="/testimonial-generator" element={<TestimonialGenerator />} />
                  <Route path="/image-generator" element={<ImageGenerator />} />
                  <Route path="/product-calculator" element={<ProductCalculator />} />
                  <Route path="/copy-generator" element={<CopyGenerator />} />
                  <Route path="/headline-generator" element={<HeadlineGenerator />} />
                  <Route path="/offer-generator" element={<OfferGenerator />} />
                  <Route path="/email-generator" element={<EmailGenerator />} />
                  <Route path="/script-generator" element={<ScriptGenerator />} />
                  <Route path="/persona-generator" element={<PersonaGenerator />} />
                  
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
