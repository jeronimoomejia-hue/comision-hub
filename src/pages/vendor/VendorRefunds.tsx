import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatusBadge, StatCard, EmptyState } from "@/components/dashboard/DashboardComponents";
import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Search
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate } from "@/data/mockData";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VendorRefunds() {
  const { refundRequests, sales, services, currentVendorId } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  // Filter refunds for this vendor
  const vendorRefunds = refundRequests.filter(r => r.vendorId === currentVendorId);

  // KPIs
  const pendingCount = vendorRefunds.filter(r => r.status === 'pendiente').length;
  const approvedCount = vendorRefunds.filter(r => r.status === 'aprobado').length;
  const rejectedCount = vendorRefunds.filter(r => r.status === 'rechazado').length;
  const autoCount = vendorRefunds.filter(r => r.status === 'automático').length;

  // Get unique services for filter
  const vendorServices = [...new Set(vendorRefunds.map(r => r.serviceId))].map(
    id => services.find(s => s.id === id)
  ).filter(Boolean);

  // Filter refunds
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'aprobado': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rechazado': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'automático': return <Zap className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout role="vendor" userName="Carlos Mendoza">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Devoluciones</h1>
          <p className="text-muted-foreground mt-1">
            Historial y estado de tus solicitudes de devolución
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pendientes"
            value={pendingCount}
            icon={Clock}
            variant={pendingCount > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Aprobadas"
            value={approvedCount}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Rechazadas"
            value={rejectedCount}
            icon={XCircle}
          />
          <StatCard
            title="Automáticas"
            value={autoCount}
            icon={Zap}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente o servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="aprobado">Aprobado</SelectItem>
              <SelectItem value="rechazado">Rechazado</SelectItem>
              <SelectItem value="automático">Automático</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los servicios</SelectItem>
              {vendorServices.map(service => (
                <SelectItem key={service!.id} value={service!.id}>
                  {service!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refunds Table */}
        {filteredRefunds.length > 0 ? (
          <div className="card-premium">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Gig</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Decisión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => {
                  const sale = sales.find(s => s.id === refund.saleId);
                  const service = services.find(s => s.id === refund.serviceId);
                  
                  return (
                    <TableRow key={refund.id}>
                      <TableCell className="font-medium">
                        {formatDate(refund.createdAt)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{service?.name || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <p>{sale?.clientName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{sale?.clientEmail}</p>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {sale ? formatCOP(sale.amountCOP) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(refund.status)}
                          <StatusBadge 
                            status={refund.status} 
                            label={refund.status}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium capitalize">
                            {refund.decisionBy === 'sistema' ? 'Sistema (Auto)' : 
                             refund.decisionBy === 'empresa' ? 'Empresa' : 
                             'Pendiente'}
                          </p>
                          {refund.decidedAt && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(refund.decidedAt)}
                            </p>
                          )}
                          {refund.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              {refund.rejectionReason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
    </DashboardLayout>
  );
}
