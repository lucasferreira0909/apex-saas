import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ApexSidebar } from "./ApexSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
interface ApexLayoutProps {
  children: React.ReactNode;
}
function MobileHeader() {
  const {
    isMobile
  } = useSidebar();
  if (!isMobile) return null;
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-14 items-center">
        <SidebarTrigger className="mr-2">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        
      </div>
    </header>;
}
export function ApexLayout({
  children
}: ApexLayoutProps) {
  return <ProtectedRoute>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full bg-background">
          <ApexSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <MobileHeader />
            <div className="flex-1 p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>;
}