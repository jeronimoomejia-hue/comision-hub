import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, companies, formatCOP, formatDate, services } from "@/data/mockData";

export default function AdminPayments() {
  const { vendorPayments, companyPayments } = useDemo();

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'programado': { cls: "text-amber-600 bg-amber-50", label: "Programado" },
      'enviado': { cls: "text-emerald-600 bg-emerald-50", label: "Enviado" },
      'falló': { cls: "text-red-600 bg-red-50", label: "Falló" },
    };
    const c = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Pagos</h1>

        <Tabs defaultValue="vendors">
          <TabsList className="h-8">
            <TabsTrigger value="vendors" className="text-xs">Vendedores ({vendorPayments.length})</TabsTrigger>
            <TabsTrigger value="companies" className="text-xs">Empresas ({companyPayments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors" className="mt-3">
            <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
              {vendorPayments.slice(0, 30).map(p => {
                const vendor = vendors.find(v => v.id === p.vendorId);
                const service = services.find(s => s.id === p.serviceId);
                return (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{vendor?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {p.clientName} · {formatDate(p.scheduledDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold">{formatCOP(p.amountCOP)}</span>
                      {getStatusBadge(p.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="companies" className="mt-3">
            <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
              {companyPayments.slice(0, 30).map(p => {
                const company = companies.find(c => c.id === p.companyId);
                const service = services.find(s => s.id === p.serviceId);
                return (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{company?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {formatDate(p.scheduledDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold">{formatCOP(p.amountCOP)}</span>
                      {getStatusBadge(p.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}