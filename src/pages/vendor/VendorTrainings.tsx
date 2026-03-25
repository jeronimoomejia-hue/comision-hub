import { useNavigate } from "react-router-dom";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge, ProgressBar, EmptyState } from "@/components/dashboard/DashboardComponents";
import { 
  BookOpen, Play, CheckCircle2, Clock, FileText, ChevronRight, Video, Eye
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDemo } from "@/contexts/DemoContext";
import { services, companies } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

export default function VendorTrainings() {
  const navigate = useNavigate();
  const { trainingProgress, startTraining, currentVendorId, currentCompanyId } = useDemo();

  const company = companies.find(c => c.id === currentCompanyId);

  const vendorTrainings = trainingProgress.filter(tp => tp.vendorId === currentVendorId);
  
  // Only show services from vendor's company
  const companyServices = services.filter(s => s.companyId === currentCompanyId);
  
  const trainingsWithDetails = vendorTrainings
    .filter(tp => companyServices.some(s => s.id === tp.serviceId))
    .map(tp => {
      const service = companyServices.find(s => s.id === tp.serviceId);
      return {
        ...tp,
        service,
        serviceName: service?.name || 'Servicio desconocido',
        companyName: company?.name || 'Empresa',
        trainingType: service?.trainingType || 'pdf',
        estimatedDuration: service?.trainingType === 'video' ? '15 min' : '10 min'
      };
    });

  const servicesWithTraining = companyServices.filter(s => s.requiresTraining && s.status === 'activo');
  const startedServiceIds = vendorTrainings.map(tp => tp.serviceId);
  const availableServices = servicesWithTraining.filter(s => !startedServiceIds.includes(s.id));

  const completedTrainings = trainingsWithDetails.filter(t => t.status === 'declared_completed');
  const inProgressTrainings = trainingsWithDetails.filter(t => t.status === 'in_progress');
  const pendingTrainings = trainingsWithDetails.filter(t => t.status === 'not_started');

  const handleStartNewTraining = (service: typeof companyServices[0]) => {
    startTraining(currentVendorId, service.id);
    setTimeout(() => {
      const newTraining = trainingProgress.find(tp => tp.vendorId === currentVendorId && tp.serviceId === service.id);
      if (newTraining) {
        navigate(`/vendor/trainings/${newTraining.id}`);
      }
    }, 100);
  };

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Capacitaciones</h1>
          <p className="text-muted-foreground mt-1">
            Completa las capacitaciones de {company?.name} para activar servicios
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card-premium p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTrainings.length}</p>
              <p className="text-sm text-muted-foreground">Completadas</p>
            </div>
          </div>
          <div className="card-premium p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressTrainings.length}</p>
              <p className="text-sm text-muted-foreground">En progreso</p>
            </div>
          </div>
          <div className="card-premium p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingTrainings.length + availableServices.length}</p>
              <p className="text-sm text-muted-foreground">Disponibles</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="in-progress" className="w-full">
          <TabsList>
            <TabsTrigger value="in-progress">En progreso ({inProgressTrainings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completadas ({completedTrainings.length})</TabsTrigger>
            <TabsTrigger value="available">Disponibles ({pendingTrainings.length + availableServices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="mt-6">
            {inProgressTrainings.length > 0 ? (
              <div className="space-y-4">
                {inProgressTrainings.map((training) => (
                  <div key={training.id} className="card-premium p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          {training.trainingType === 'video' ? <Video className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{training.serviceName}</h3>
                          <p className="text-sm text-muted-foreground">{training.companyName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{training.trainingType === 'video' ? 'Video' : 'PDF'}</Badge>
                            <span className="text-xs text-muted-foreground">~{training.estimatedDuration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">En progreso</Badge>
                        <Button onClick={() => navigate(`/vendor/trainings/${training.id}`)}>
                          Continuar <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Play} title="Sin capacitaciones en progreso" description="Inicia una capacitación para empezar a vender" />
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedTrainings.length > 0 ? (
              <div className="space-y-4">
                {completedTrainings.map((training) => (
                  <div key={training.id} className="card-premium p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{training.serviceName}</h3>
                          <p className="text-sm text-muted-foreground">{training.companyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status="completed" label="Completada" />
                        <Button variant="outline" size="sm" onClick={() => navigate(`/vendor/trainings/${training.id}`)}>
                          <Eye className="mr-2 w-4 h-4" /> Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={CheckCircle2} title="Sin capacitaciones completadas" description="Completa tu primera capacitación" />
            )}
          </TabsContent>

          <TabsContent value="available" className="mt-6">
            {(pendingTrainings.length > 0 || availableServices.length > 0) ? (
              <div className="grid md:grid-cols-2 gap-4">
                {availableServices.map((service) => (
                  <div key={service.id} className="card-premium p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        {service.trainingType === 'video' ? <Video className="w-6 h-6 text-muted-foreground" /> : <FileText className="w-6 h-6 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{company?.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">{service.trainingType === 'video' ? 'Video' : 'PDF'}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <span className="text-muted-foreground">Comisión:</span>
                      <span className="font-semibold text-emerald-600">{service.vendorCommissionPct}%</span>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => handleStartNewTraining(service)}>
                      <Play className="mr-2 w-4 h-4" /> Empezar capacitación
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={BookOpen} title="Sin capacitaciones pendientes" description="Has completado todas las capacitaciones disponibles" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </VendorTabLayout>
  );
}
