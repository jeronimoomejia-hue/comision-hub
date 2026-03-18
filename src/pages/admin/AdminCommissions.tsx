import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard, DataTable } from "@/components/dashboard/DashboardComponents";
import { DollarSign, Clock, CheckCircle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { commissions, vendors, sales, services, formatCOP, formatDate } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

export default function AdminCommissions() {
  const pending = commissions.filter(c => c.status === 'HELD');
  const paid = commissions.filter(c => c.status === 'RELEASED');
  const reverted = commissions.filter(c => c.status === 'REFUNDED');
  
  const totalPending = pending.reduce((acc, c) => acc + c.amountCOP, 0);
  const totalPaid = paid.reduce((acc, c) => acc + c.amountCOP, 0);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'HELD': "bg-yellow-500/10 text-yellow-500",
      'RELEASED': "bg-green-500/10 text-green-500",
      'REFUNDED': "bg-red-500/10 text-red-500"
    };
    const labels: Record<string, string> = {
      'HELD': 'En retención',
      'RELEASED': 'Liberada',
      'REFUNDED': 'Revertida'
    };
    return <Badge className={colors[status] || "bg-gray-500/10 text-gray-500"}>{labels[status] || status}</Badge>;
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Comisiones</h1>
            <p className="text-muted-foreground">Las comisiones se liberan automáticamente al finalizar la retención</p>
          </div>
          <Button variant="outline">Exportar</Button>
        </div>

        <div className="card-premium p-4 bg-muted/30 border-l-4 border-primary">
          <p className="text-sm">
            <strong>Sistema automático:</strong> Las comisiones se calculan y liberan automáticamente. 
            No se requiere aprobación manual.
          </p>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <StatCard title="En retención" value={formatCOP(totalPending)} icon={Clock} tooltip="Comisiones HELD" />
          <StatCard title="Liberadas" value={formatCOP(totalPaid)} icon={CheckCircle} />
          <StatCard title="Revertidas" value={reverted.length} icon={DollarSign} />
          <StatCard title="Total transacciones" value={commissions.length} icon={ArrowRightLeft} />
        </div>

        <div className="card-premium">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Historial de comisiones</h3>
          </div>
          <DataTable headers={["Vendedor", "Venta", "Monto", "Estado", "Fecha"]}>
            {commissions.slice(0, 25).map(comm => {
              const vendor = vendors.find(v => v.id === comm.vendorId);
              const sale = sales.find(s => s.id === comm.saleId);
              const service = sale ? services.find(s => s.id === sale.serviceId) : null;
              return (
                <tr key={comm.id}>
                  <td>{vendor?.name}</td>
                  <td className="text-sm">{service?.name}</td>
                  <td className="font-semibold">{formatCOP(comm.amountCOP)}</td>
                  <td>{getStatusBadge(comm.status)}</td>
                  <td>{formatDate(comm.createdAt)}</td>
                </tr>
              );
            })}
          </DataTable>
        </div>
      </div>
    </DashboardLayout>
  );
}
