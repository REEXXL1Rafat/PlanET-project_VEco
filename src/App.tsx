import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScannerProvider } from "@/contexts/ScannerContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Auth from "./pages/Auth";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ScannerProvider>
          <ProductProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path={ROUTES.LOGIN} element={<Auth />} />
                <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
                <Route path={ROUTES.HOME} element={<Index />} />
                <Route path={ROUTES.SCAN} element={<Scanner />} />
                <Route path={ROUTES.PRODUCT} element={<ProductDetail />} />
                <Route path={ROUTES.COMPANY} element={<CompanyProfile />} />
                <Route path={ROUTES.SEARCH} element={<Search />} />
                <Route path={ROUTES.HISTORY} element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.PROFILE} element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.SETTINGS} element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.REPORTS} element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.EDUCATION} element={<Education />} />
                <Route path={ROUTES.ALTERNATIVES} element={<Alternatives />} />
                {/* Placeholder routes - will be implemented in later phases */}
                <Route path={ROUTES.REGISTER} element={<Auth />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </ProductProvider>
        </ScannerProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
