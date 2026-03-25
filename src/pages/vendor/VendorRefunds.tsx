import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { StatCard, EmptyState } from "@/components/dashboard/DashboardComponents";
import { RotateCcw, Clock, CheckCircle, XCircle, Zap, Search } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate, services as allServices } from "@/data/mockData";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransactionCard from "@/components/TransactionCard";

export default function VendorRefunds() {
  const { refundRequests, sales, services, currentVendorId } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const vendorRefunds = refundRequests.filter(r => r.vendorId === currentVendorId);

  const pendingCount = vendorRefunds.filter(r => r.status === 'pendiente').length;
  const approvedCount = vendorRefunds.filter(r => r.status === 'aprobado').length;
  const rejectedCount = vendorRefunds.filter(r => r.status === 'rechazado').length;
  const autoCount = vendorRefunds.filter(r => r.status === 'automático').length;

  const vendorServices = [...new Set(vendorRefunds.map(r => r.serviceId))].map(
    id => services.find(s => s.id === id)
  ).filter(Boolean);

  const filteredRefunds = vendorRefunds.filter(refund => {
    const sale = sales.find(s => s.id === refund.saleId);
    const service = services.find(s => s.id === refund.serviceId);
    const matchesSearch = 
      sale?.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    const matchesService = serviceFilter === "all" || refund.serviceId === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Devoluciones</h1>
          <p className="text-muted-foreground mt-1">Historial y estado de tus solicitudes de devolución</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pendientes" value={pendingCount} icon={Clock} variant={pendingCount > 0 ? "warning" : "default"} />
          <StatCard title="Aprobadas" value={approvedCount} icon={CheckCircle} variant="success" />
          <StatCard title="Rechazadas" value={rejectedCount} icon={XCircle} />
          <StatCard title="Automáticas" value={autoCount} icon={Zap} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por cliente o producto..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="aprobado">Aprobado</SelectItem>
              <SelectItem value="rechazado">Rechazado</SelectItem>
              <SelectItem value="automático">Automático</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Producto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              {vendorServices.map(service => (
                <SelectItem key={service!.id} value={service!.id}>{service!.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredRefunds.length > 0 ? (
          <div className="space-y-2">
            {filteredRefunds.map((refund) => {
              const sale = sales.find(s => s.id === refund.saleId);
              const service = services.find(s => s.id === refund.serviceId);
              return (
                <TransactionCard
                  key={refund.id}
                  id={refund.id}
                  clientName={sale?.clientName || 'N/A'}
                  clientEmail={sale?.clientEmail}
                  serviceName={service?.name}
                  serviceCategory={service?.category}
                  amount={sale?.amountCOP || sale?.grossAmount || 0}
                  commission={sale?.sellerCommissionAmount}
                  status={refund.status}
                  statusType="refund"
                  date={refund.createdAt}
                  refundReason={refund.reason}
                  refundDecision={
                    refund.decisionBy === 'sistema' ? 'Sistema (Auto)' : 
                    refund.decisionBy === 'empresa' ? 'Empresa' : undefined
                  }
                  role="vendor"
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={RotateCcw}
            title="Sin devoluciones"
            description={
              searchQuery || statusFilter !== "all" || serviceFilter !== "all"
                ? "No se encontraron devoluciones con esos filtros"
                : "Aún no has solicitado ninguna devolución"
            }
          />
        )}
      </div>
    </VendorTabLayout>
  );
}
