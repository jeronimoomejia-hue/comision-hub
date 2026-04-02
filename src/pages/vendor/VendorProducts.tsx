import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Building2, Package, Lock,
  ChevronRight, Dumbbell, Sparkles, Scissors, Star, TrendingUp, Flame
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import {
  companies, services as allServices, vendorCompanyLinks,
  CURRENT_VENDOR_ID, CompanyPlan, formatCOP
} from "@/data/mockData";
import { industryCover, categoryCovers } from "@/data/coverImages";

const planConfig: Record<CompanyPlan, { label: string }> = {
  freemium: { label: "Free" },
  premium: { label: "Premium" },
  enterprise: { label: "Enterprise" },
};

interface CategoryGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  industries: string[];
}

const categoryGroups: CategoryGroup[] = [
  {
    id: "deporte",
    label: "Deporte & Bienestar",
    icon: Dumbbell,
    industries: ["Gimnasio", "Yoga & Bienestar", "Cancha de Playa"],
  },
  {
    id: "belleza",
    label: "Belleza & Estética",
    icon: Scissors,
    industries: ["Spa & Wellness", "Peluquería & Estética"],
  },
  {
    id: "ia",
    label: "Tecnología",
    icon: Sparkles,
    industries: ["IA para Seguros", "IA para Ventas", "IA para Atención"],
  },
];

export default function VendorProducts() {
  const { currentVendorId, sales, trainingProgress } = useDemo();
  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("todos");

  const linkedIds = useMemo(() =>
    new Set(vendorCompanyLinks.filter(l => l.vendorId === vendorId && l.status === 'active').map(l => l.companyId)),
    [vendorId]
  );

  // Featured products: highest commission services
  const featuredServices = useMemo(() => {
    return allServices
      .filter(s => s.status === 'activo')
      .sort((a, b) => b.vendorCommissionPct - a.vendorCommissionPct)
      .slice(0, 3);
  }, []);

  // New offers: most recently added services
  const newOffers = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 2);
    return allServices
      .filter(s => s.status === 'activo')
      .sort((a, b) => new Date(b.createdAt || '2026-03-01').getTime() - new Date(a.createdAt || '2026-01-01').getTime())
      .slice(0, 4);
  }, []);

  const filteredCompanies = useMemo(() => {
    let list = companies.filter(c => c.status === 'active');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "todos") {
      const group = categoryGroups.find(g => g.id === activeCategory);
      if (group) {
        list = list.filter(c => group.industries.includes(c.industry));
      }
    }

    return list;
  }, [searchQuery, activeCategory]);

  const groupedCompanies = useMemo(() => {
    if (activeCategory !== "todos") {
      return [{ label: categoryGroups.find(g => g.id === activeCategory)?.label || "", companies: filteredCompanies }];
    }
    return categoryGroups
      .map(group => ({
        label: group.label,
        companies: filteredCompanies.filter(c => group.industries.includes(c.industry)),
      }))
      .filter(g => g.companies.length > 0);
  }, [filteredCompanies, activeCategory]);

  const categories = [
    { id: "todos", label: "Todos" },
    ...categoryGroups.map(g => ({ id: g.id, label: g.label.split(" &")[0].split(" ")[0] })),
  ];

  const renderServiceMiniCard = (service: typeof allServices[0], badge?: { label: string; color: string }) => {
    const company = companies.find(c => c.id === service.companyId);
    const coverImg = categoryCovers[service.category];
    const earningsPerSale = Math.round(service.priceCOP * service.vendorCommissionPct / 100);

    return (
      <Link
        key={service.id}
        to={`/vendor/company/${service.companyId}/service/${service.id}`}
        className="rounded-2xl border border-border bg-card overflow-hidden group hover:shadow-md hover:border-primary/20 transition-all duration-300 active:scale-[0.98]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={coverImg} alt={service.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {badge && (
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full text-white ${badge.color}`}>
                {badge.label === 'Destacado' ? <Star className="w-2 h-2" /> : <Flame className="w-2 h-2" />}
                {badge.label}
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2">
            <p className="text-sm font-bold text-white drop-shadow-md">{formatCOP(earningsPerSale)}</p>
          </div>
        </div>
        <div className="p-3 space-y-1">
          <h3 className="font-semibold text-xs text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">{service.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground truncate">{company?.name}</p>
            <span className="text-[9px] text-primary font-medium flex-shrink-0">{service.vendorCommissionPct}%</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explora empresas y productos para vender
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas o categorías..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-card border-border rounded-xl text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Destacados */}
        {activeCategory === 'todos' && !searchQuery && featuredServices.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">Destacados</p>
              <Badge variant="outline" className="text-[8px] border-amber-300/50 text-amber-600">Top comision</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {featuredServices.map(s => renderServiceMiniCard(s, { label: 'Destacado', color: 'bg-amber-500/90' }))}
            </div>
          </div>
        )}

        {/* Ofertas nuevas */}
        {activeCategory === 'todos' && !searchQuery && newOffers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <p className="text-sm font-semibold text-foreground">Ofertas nuevas</p>
              <Badge variant="outline" className="text-[8px] border-orange-300/50 text-orange-600">Recientes</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {newOffers.map(s => renderServiceMiniCard(s, { label: 'Nuevo', color: 'bg-orange-500/90' }))}
            </div>
          </div>
        )}

        {/* Company groups */}
        {groupedCompanies.length > 0 ? (
          <div className="space-y-8">
            {groupedCompanies.map((group, gi) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
              >
                <p className="text-sm font-medium text-foreground mb-3">{group.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {group.companies.map((company, ci) => {
                    const isLinked = linkedIds.has(company.id);
                    const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
                    const cover = industryCover[company.industry];
                    const pc = planConfig[company.plan];
                    const bestCommission = companyServices.length > 0
                      ? Math.max(...companyServices.map(s => s.vendorCommissionPct))
                      : 0;

                    return (
                      <motion.div
                        key={company.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gi * 0.05 + ci * 0.03 }}
                      >
                        <Link
                          to={`/vendor/company/${company.id}`}
                          className={`block rounded-2xl border border-border bg-card overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 active:scale-[0.98] h-full ${
                            !isLinked ? "grayscale-[40%] hover:grayscale-0" : ""
                          }`}
                        >
                          <div className="relative h-36 overflow-hidden">
                            <img
                              src={cover}
                              alt={company.industry}
                              className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ${
                                !isLinked ? "opacity-60 group-hover:opacity-100" : ""
                              }`}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                            {!isLinked && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-full bg-black/50 text-white/80 backdrop-blur-sm border border-white/10">
                                  <Lock className="w-3 h-3" />
                                  Unirte
                                </span>
                              </div>
                            )}

                            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20"
                                style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                              >
                                <span className="text-white font-semibold text-sm">{company.name[0]}</span>
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-white font-semibold text-sm truncate">{company.name}</h3>
                                <p className="text-white/50 text-[10px] truncate">{company.industry}</p>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-3 flex flex-col justify-between h-[88px]">
                            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                              {company.description || company.industry}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-2">
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {companyServices.length}
                                </span>
                                {bestCommission > 0 && (
                                  <span className="text-primary font-medium">
                                    Hasta {bestCommission}%
                                  </span>
                                )}
                                <Badge variant="outline" className="text-[8px] px-1.5 py-0 font-medium">
                                  {pc.label}
                                </Badge>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Sin resultados</p>
            <p className="text-xs text-muted-foreground">Prueba con otra búsqueda o categoría</p>
          </div>
        )}
      </div>
    </VendorTabLayout>
  );
}
