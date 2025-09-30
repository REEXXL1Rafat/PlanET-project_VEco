import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<Index />} />
          {/* Placeholder routes - will be implemented in later phases */}
          <Route path={ROUTES.SCAN} element={<div>Scanner - Coming Soon</div>} />
          <Route path={ROUTES.PRODUCT} element={<div>Product Detail - Coming Soon</div>} />
          <Route path={ROUTES.COMPANY} element={<div>Company Profile - Coming Soon</div>} />
          <Route path={ROUTES.SEARCH} element={<div>Search - Coming Soon</div>} />
          <Route path={ROUTES.HISTORY} element={<div>History - Coming Soon</div>} />
          <Route path={ROUTES.ALTERNATIVES} element={<div>Alternatives - Coming Soon</div>} />
          <Route path={ROUTES.EDUCATION} element={<div>Education - Coming Soon</div>} />
          <Route path={ROUTES.PROFILE} element={<div>Profile - Coming Soon</div>} />
          <Route path={ROUTES.SETTINGS} element={<div>Settings - Coming Soon</div>} />
          <Route path={ROUTES.LOGIN} element={<div>Login - Coming Soon</div>} />
          <Route path={ROUTES.REGISTER} element={<div>Register - Coming Soon</div>} />
          <Route path={ROUTES.ONBOARDING} element={<div>Onboarding - Coming Soon</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
