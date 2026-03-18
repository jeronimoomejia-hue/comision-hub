import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { BookOpen, CheckCircle, Clock, Eye, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trainings, trainingProgress, services, companies, vendors } from "@/data/mockData";

export default function AdminTrainings() {
  const [selectedTraining, setSelectedTraining] = useState<any>(null);

  const activeTrainings = trainings.filter(t => t.status === 'active').length;
  const completedToday = trainingProgress.filter(tp => tp.completedAt === new Date().toISOString().split('T')[0]).length;
  const completedTotal = trainingProgress.filter(tp => tp.status === 'declared_completed').length;
  const avgCompletion = trainingProgress.length > 0 
    ? Math.round((completedTotal / trainingProgress.length) * 100)
    : 0;

  const getTrainingStats = (serviceId: string) => {
    const progress = trainingProgress.filter(tp => tp.serviceId === serviceId);
    const completed = progress.filter(tp => tp.status === 'declared_completed').length;
    const total = progress.length;
    const avgProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, avgProgress };
  };

  const getVendorProgress = (serviceId: string) => {
    return trainingProgress.filter(tp => tp.serviceId === serviceId).map(tp => ({
      ...tp,
      vendor: vendors.find(v => v.id === tp.vendorId)
    }));
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'declared_completed': "bg-green-500/10 text-green-500",
      'in_progress': "bg-blue-500/10 text-blue-500",
      'not_started': "bg-gray-500/10 text-gray-500"
    };
    const labels: Record<string, string> = {
      'declared_completed': 'Completada',
      'in_progress': 'En progreso',
      'not_started': 'No iniciada'
    };
    return <Badge className={colors[status] || "bg-gray-500/10 text-gray-500"}>{labels[status] || status}</Badge>;
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Capacitaciones</h1>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{activeTrainings}</p><p className="text-sm text-muted-foreground">Capacitaciones activas</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" /><p className="text-2xl font-bold">{avgCompletion}%</p><p className="text-sm text-muted-foreground">% promedio completado</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" /><p className="text-2xl font-bold">{completedToday}</p><p className="text-sm text-muted-foreground">Completadas hoy</p></CardContent></Card>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Servicio</TableHead><TableHead>Empresa</TableHead><TableHead>Tipo contenido</TableHead><TableHead>Duración</TableHead><TableHead>% Completado global</TableHead><TableHead className="text-right"># Completaron</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {trainings.map(training => {
                const service = services.find(s => s.id === training.serviceId);
                const company = companies.find(c => c.id === training.companyId);
                const stats = getTrainingStats(training.serviceId);
                return (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{service?.name}</TableCell>
                    <TableCell>{company?.name}</TableCell>
                    <TableCell><Badge variant={training.type === 'video' ? 'default' : 'secondary'}>{training.type.toUpperCase()}</Badge></TableCell>
                    <TableCell>{training.durationMinutes} min</TableCell>
                    <TableCell><span className="text-sm">{stats.avgProgress}%</span></TableCell>
                    <TableCell className="text-right">{stats.completed} / {stats.total}</TableCell>
                    <TableCell><Badge className={training.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>{training.status === 'active' ? 'Activa' : 'Pausada'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTraining(training)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Detail Modal */}
        <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Progreso de Vendedores</DialogTitle></DialogHeader>
            {selectedTraining && (
              <div className="space-y-4">
                <p className="text-muted-foreground">{services.find(s => s.id === selectedTraining.serviceId)?.name}</p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {getVendorProgress(selectedTraining.serviceId).map(vp => (
                    <div key={vp.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="font-medium">{vp.vendor?.name}</span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(vp.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
