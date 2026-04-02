import { useDemo } from "@/contexts/DemoContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { User, Building2, Shield, ChevronUp, Zap, Crown } from "lucide-react";
import type { CompanyPlan } from "@/data/mockData";

const roles = [
  { key: "vendor" as const, label: "Vendedor", icon: User, path: "/vendor" },
  { key: "company-freemium" as const, label: "Empresa Free", icon: Zap, path: "/company" },
  { key: "company-premium" as const, label: "Empresa Premium", icon: Crown, path: "/company" },
  { key: "company-enterprise" as const, label: "Empresa Enterprise", icon: Building2, path: "/company" },
  { key: "admin" as const, label: "Admin", icon: Shield, path: "/admin" },
];

export default function DemoRoleToggle() {
  const { currentRole, setCurrentRole, setCurrentCompanyPlan } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Don't show on public pages
  const isPublic = ["/", "/vendedores", "/auth"].includes(location.pathname) || location.pathname.startsWith("/vendor/onboarding");
  if (isPublic) return null;

  const handleSelect = (key: string) => {
    if (key === "vendor") {
      setCurrentRole("vendor");
      navigate("/vendor");
    } else if (key.startsWith("company")) {
      setCurrentRole("company");
      const plan = key.split("-")[1] as CompanyPlan;
      setCurrentCompanyPlan(plan);
      navigate("/company");
    } else if (key === "admin") {
      setCurrentRole("admin");
      navigate("/admin");
    }
    setOpen(false);
  };

  const currentLabel = currentRole === "admin" ? "Admin" : currentRole === "vendor" ? "Vendedor" : "Empresa";

  return (
    <div className="fixed bottom-4 left-4 z-[100]">
      {open && (
        <div className="mb-2 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-lg p-1 space-y-0.5 min-w-[180px]">
          {roles.map(r => (
            <button
              key={r.key}
              onClick={() => handleSelect(r.key)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              <r.icon className="w-3.5 h-3.5 text-muted-foreground" />
              {r.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/80 text-background text-[10px] font-medium backdrop-blur-sm hover:bg-foreground/90 transition-all shadow-lg"
      >
        <span className="opacity-60">Demo:</span>
        <span>{currentLabel}</span>
        <ChevronUp className={`w-3 h-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
