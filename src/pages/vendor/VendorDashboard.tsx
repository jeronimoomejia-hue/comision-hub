import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  DollarSign, Building2, 
  ChevronRight, Plus, Search, TrendingUp,
  Crown, Zap, Clock, CheckCircle, Package, Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { 
  vendors, companies, services as allServices, vendorCompanyLinks,
  CURRENT_VENDOR_ID, formatCOP, CompanyPlan
} from "@/data/mockData";

// Company cover images
import insuranceCover from "@/assets/company-covers/insurance-ai.jpg";
import legalCover from "@/assets/company-covers/legal-ai.jpg";
import marketingCover from "@/assets/company-covers/marketing-ai.jpg";
import salesCover from "@/assets/company-covers/sales-ai.jpg";
import supportCover from "@/assets/company-covers/support-ai.jpg";
import accountingCover from "@/assets/company-covers/accounting-ai.jpg";
import hrCover from "@/assets/company-covers/hr-ai.jpg";
import securityCover from "@/assets/company-covers/security-ai.jpg";

const industryCover: Record<string, string> = {
  'IA para Seguros': insuranceCover,
  'IA Legal': legalCover,
  'IA para Marketing': marketingCover,
  'IA para Ventas': salesCover,
  'IA para Atención': supportCover,
  'IA para Contabilidad': accountingCover,
  'IA para RRHH': hrCover,
  'IA para Ciberseguridad': securityCover,
};

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType; cls: string }> = {
  freemium: { label: "Free", icon: Zap, cls: "bg-muted text-muted-foreground" },
  premium: { label: "Premium", icon: Crown, cls: "bg-amber-500/10 text-amber-600" },
  enterprise: { label: "Enterprise", icon: Building2, cls: "bg-primary/10 text-primary" },
};

export default function VendorDashboard() {
  const { sales, commissions, currentVendorId } = useDemo();
  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const vendor = vendors.find(v => v.id === vendorId);
  const firstName = vendor?.name.split(' ')[0] || 'Vendedor';

  const vendorSales = sales.filter(s => s.vendorId === vendorId);
  const vendorCommissions = commissions.filter(c => c.vendorId === vendorId);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const commissionsThisMonth = vendorCommissions
    .filter(c => c.createdAt.startsWith(thisMonth) && c.status !== 'REFUNDED')
    .reduce((a, c) => a + c.amountCOP, 0);

  const heldCommissions = vendorCommissions.filter(c => c.status === 'HELD').reduce((a, c) => a + c.amountCOP, 0);
  const releasedCommissions = vendorCommissions.filter(c => c.status === 'RELEASED').reduce((a, c) => a + c.amountCOP, 0);

  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === vendorId && l.status === 'active')
    .map(l => l.companyId);
  
  const linkedCompanies = companies.filter(c => linkedCompanyIds.includes(c.id));
  const otherCompanies = companies.filter(c => !linkedCompanyIds.includes(c.id)).slice(0, 4);

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        {/* Hero Greeting + Balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary/5 p-5 sm:p-6 border border-border"
        >
          <p className="text-sm text-muted-foreground">Hola, {firstName} 👋</p>
          <p className="text-[10px] text-muted-foreground mt-1">Comisiones del mes</p>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight mt-1 text-primary">
            {formatCOP(commissionsThisMonth)}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              {formatCOP(heldCommissions)} retenidas
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {formatCOP(releasedCommissions)} liberadas
            </span>
          </div>
        </motion.div>

        {/* My Companies — Gig Cards */}
        <div>
          <h2 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Mis empresas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {linkedCompanies.map((company, i) => {
              const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
              const companySalesCount = vendorSales.filter(s => s.companyId === company.id && s.status !== 'REFUNDED').length;
              const companyComm = vendorCommissions.filter(c => {
                const sale = vendorSales.find(s => s.id === c.saleId);
                return sale?.companyId === company.id && c.status !== 'REFUNDED';
              }).reduce((a, c) => a + c.amountCOP, 0);
              const pc = planConfig[company.plan];
              const cover = industryCover[company.industry];

              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    to={`/vendor/company/${company.id}`}
                    className="block rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Cover Image */}
                    <div className="relative h-36 sm:h-40 overflow-hidden">
                      <img 
                        src={cover} 
                        alt={company.industry} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={800}
                        height={512}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Plan badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${pc.cls} backdrop-blur-sm`}>
                          <pc.icon className="w-3 h-3" />
                          {pc.label}
                        </span>
                      </div>

                      {/* Company identity overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-lg"
                          style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                        >
                          <span className="text-white font-bold text-lg">{company.name[0]}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold text-sm leading-tight truncate drop-shadow-md">
                            {company.name}
                          </h3>
                          <p className="text-white/70 text-[11px] truncate">{company.industry}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Footer */}
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {companyServices.length} servicios
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {companySalesCount} ventas
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-primary">{formatCOP(companyComm)}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Discover companies */}
        {otherCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Empresas recomendadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {otherCompanies.map((company, i) => {
                const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
                const cover = industryCover[company.industry];
                const pc = planConfig[company.plan];

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + 0.05 * i }}
                  >
                    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300 opacity-80 hover:opacity-100">
                      <div className="relative h-28 overflow-hidden">
                        <img 
                          src={cover} 
                          alt={company.industry}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={800}
                          height={512}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${pc.cls} backdrop-blur-sm`}>
                            <pc.icon className="w-2.5 h-2.5" />
                            {pc.label}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2">
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 border border-white/30"
                            style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                          >
                            <span className="text-white font-bold text-sm">{company.name[0]}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold text-xs truncate">{company.name}</h3>
                            <p className="text-white/60 text-[10px]">{companyServices.length} servicios</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">{company.industry}</p>
                        <Badge variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-primary/5">
                          <Plus className="w-3 h-3" /> Unirte
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </VendorTabLayout>
  );
}
