import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ApexSidebar } from "./ApexSidebar";
import { Menu } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

interface ApexLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = "apex-sidebar-state";

function MobileHeader() {
  const { isMobile } = useSidebar();
  
  if (!isMobile) return null;
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-14 items-center">
        <SidebarTrigger className="mr-2">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>
    </header>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { showEntryAnimation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className={`min-h-screen flex w-full bg-background ${showEntryAnimation ? 'animate-fade-in' : ''}`}>
        <ApexSidebar />
        <main className={`flex-1 flex flex-col overflow-hidden ${showEntryAnimation ? 'animate-slide-up' : ''}`}>
          <MobileHeader />
          <div className={`flex-1 p-4 md:p-6 ${showEntryAnimation ? 'animate-content-fade' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export function ApexLayout({ children }: ApexLayoutProps) {
  return (
    <ProtectedRoute>
      <LayoutContent>{children}</LayoutContent>
    </ProtectedRoute>
  );
}
