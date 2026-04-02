import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import DemoRoleToggle from "@/components/DemoRoleToggle";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorServiceDetail from "./pages/vendor/VendorServiceDetail";
import VendorTraining from "./pages/vendor/VendorTraining";
import VendorPayments from "./pages/vendor/VendorPayments";
import VendorSupport from "./pages/vendor/VendorSupport";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorCompanyDetail from "./pages/vendor/VendorCompanyDetail";
import VendorCRM from "./pages/vendor/VendorCRM";
import VendorOnboarding from "./pages/vendor/VendorOnboarding";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyServices from "./pages/company/CompanyServices";
import CompanyServiceDetail from "./pages/company/CompanyServiceDetail";
import CompanyNewService from "./pages/company/CompanyNewService";
import CompanyVendors from "./pages/company/CompanyVendors";
import CompanyVendorDetail from "./pages/company/CompanyVendorDetail";
import CompanyPayments from "./pages/company/CompanyPayments";
import CompanySettings from "./pages/company/CompanySettings";
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyChat from "./pages/company/CompanyChat";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminServices from "./pages/admin/AdminServices";
import AdminTrainings from "./pages/admin/AdminTrainings";
import AdminSales from "./pages/admin/AdminSales";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSupport from "./pages/admin/AdminSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <DemoProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DemoRoleToggle />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/vendor/company/:companyId" element={<VendorCompanyDetail />} />
            <Route path="/vendor/company/:companyId/service/:serviceId" element={<VendorServiceDetail />} />
            <Route path="/vendor/products" element={<VendorProducts />} />
            <Route path="/vendor/services/:serviceId" element={<VendorServiceDetail />} />
            <Route path="/vendor/payments" element={<VendorPayments />} />
            <Route path="/vendor/support" element={<VendorSupport />} />
            <Route path="/vendor/crm" element={<VendorCRM />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            
            {/* Company Routes */}
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/services" element={<CompanyServices />} />
            <Route path="/company/services/new" element={<CompanyNewService />} />
            <Route path="/company/services/:serviceId" element={<CompanyServiceDetail />} />
            <Route path="/company/payments" element={<CompanyPayments />} />
            <Route path="/company/vendors" element={<CompanyVendors />} />
            <Route path="/company/chat" element={<CompanyChat />} />
            <Route path="/company/settings" element={<CompanySettings />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/trainings" element={<AdminTrainings />} />
            <Route path="/admin/sales" element={<AdminSales />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DemoProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
