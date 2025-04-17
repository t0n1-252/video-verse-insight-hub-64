
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react'; // Added explicit React import
import Index from "./pages/Index";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import MainNavigationMenu from "./components/MainNavigationMenu";

// Create the query client as a constant outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Convert App to a proper React functional component
const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-900">
              <header className="border-b border-gray-800">
                <MainNavigationMenu />
              </header>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/mock-dashboard" element={<Dashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
