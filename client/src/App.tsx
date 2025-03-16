import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Positions from "@/pages/positions";
import Candidates from "@/pages/candidates";
import Referrals from "@/pages/referrals";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import Login from "@/pages/login";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import Header from "@/components/layout/header";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/positions" component={Positions} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/candidates" component={Candidates} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex overflow-hidden">
        <Sidebar currentPath={location} />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)}
          currentPath={location}
        />
        <div className="flex-1 overflow-auto bg-gray-50">
          <Header onMenuClick={toggleMobileSidebar} />
          <main className="py-6 px-4 sm:p-6 md:py-10 md:px-8 mt-16 md:mt-0">
            <Router />
          </main>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
