import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const handleCopy = (event) => {
      event.preventDefault();
      if (event.clipboardData) {
        event.clipboardData.setData("text/plain", "this data belongs to cs castings pvt ltd");
      } else if (window.clipboardData) {
        window.clipboardData.setData("Text", "this data belongs to cs castings pvt ltd");
      }
    };
    document.addEventListener("copy", handleCopy);
    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  const isAuthed = () => {
    try {
      const raw = localStorage.getItem("oms_auth");
      return !!raw;
    } catch {
      return false;
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthed()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
