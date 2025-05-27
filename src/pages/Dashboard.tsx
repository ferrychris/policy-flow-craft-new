
import { SidebarProvider } from "@/components/ui/sidebar";
import { PolicySidebar } from "@/components/PolicySidebar";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="policy-flow-theme">
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <PolicySidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header className="shrink-0" />
            <main className="flex-1 overflow-hidden">
              <ChatInterface />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Index;
