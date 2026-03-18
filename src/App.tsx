import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorServices from "./pages/vendor/VendorServices";
import VendorServiceDetail from "./pages/vendor/VendorServiceDetail";
import VendorTrainings from "./pages/vendor/VendorTrainings";
import VendorTrainingDetail from "./pages/vendor/VendorTrainingDetail";
import VendorSales from "./pages/vendor/VendorSales";
import VendorPayments from "./pages/vendor/VendorPayments";
import VendorMaterials from "./pages/vendor/VendorMaterials";
import VendorSupport from "./pages/vendor/VendorSupport";
import VendorProfile from "./pages/vendor/VendorProfile";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyServices from "./pages/company/CompanyServices";
import CompanySales from "./pages/company/CompanySales";
import CompanyVendors from "./pages/company/CompanyVendors";
import CompanyPayments from "./pages/company/CompanyPayments";
import CompanySettings from "./pages/company/CompanySettings";
import CompanyProfile from "./pages/company/CompanyProfile";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DemoProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/vendor/services" element={<VendorServices />} />
            <Route path="/vendor/services/:serviceId" element={<VendorServiceDetail />} />
            <Route path="/vendor/trainings" element={<VendorTrainings />} />
            <Route path="/vendor/trainings/:trainingId" element={<VendorTrainingDetail />} />
            <Route path="/vendor/sales" element={<VendorSales />} />
            <Route path="/vendor/payments" element={<VendorSales />} />
            <Route path="/vendor/refunds" element={<VendorSales />} />
            <Route path="/vendor/materials" element={<VendorMaterials />} />
            <Route path="/vendor/support" element={<VendorSupport />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            
            {/* Company Routes */}
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/services" element={<CompanyServices />} />
            <Route path="/company/sales" element={<CompanySales />} />
            <Route path="/company/vendors" element={<CompanyVendors />} />
            <Route path="/company/payments" element={<CompanyPayments />} />
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DemoProvider>
  </QueryClientProvider>
);

export default App;
