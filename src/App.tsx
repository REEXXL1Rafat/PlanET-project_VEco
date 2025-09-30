import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScannerProvider } from "@/contexts/ScannerContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { ROUTES } from "@/constants/routes";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import ProductDetail from "./pages/ProductDetail";
import Search from "./pages/Search";
import History from "./pages/History";
import Profile from "./pages/Profile";
import CompanyProfile from "./pages/CompanyProfile";
import Settings from "./pages/Settings";
import Education from "./pages/Education";
import Alternatives from "./pages/Alternatives";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ScannerProvider>
      <ProductProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.HOME} element={<Index />} />
              <Route path={ROUTES.SCAN} element={<Scanner />} />
              <Route path={ROUTES.PRODUCT} element={<ProductDetail />} />
              <Route path={ROUTES.COMPANY} element={<CompanyProfile />} />
              <Route path={ROUTES.SEARCH} element={<Search />} />
              <Route path={ROUTES.HISTORY} element={<History />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
              <Route path={ROUTES.SETTINGS} element={<Settings />} />
              <Route path={ROUTES.EDUCATION} element={<Education />} />
              <Route path={ROUTES.ALTERNATIVES} element={<Alternatives />} />
              <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
              {/* Placeholder routes - will be implemented in later phases */}
              <Route path={ROUTES.LOGIN} element={<div>Login - Coming Soon</div>} />
              <Route path={ROUTES.REGISTER} element={<div>Register - Coming Soon</div>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProductProvider>
    </ScannerProvider>
  </QueryClientProvider>
);

export default App;
