import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTutorial from "@/components/PageTutorial";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  CheckCircle2, 
  Clock,
  Building2,
  ExternalLink
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { services, companies } from "@/data/mockData";
import { toast } from "sonner";

export default function VendorTrainingDetail() {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const { trainingProgress, updateTrainingProgress, completeTraining, currentVendorId } = useDemo();

  // Find training and related data
  const training = trainingProgress.find(tp => tp.id === trainingId);
  const service = training ? services.find(s => s.id === training.serviceId) : null;
  const company = service ? companies.find(c => c.id === service.companyId) : null;

  if (!training || !service) {
    return (
      <DashboardLayout role="vendor" userName="Carlos Mendoza">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Capacitación no encontrada</h2>
          <p className="text-muted-foreground mb-4">
            La capacitación que buscas no existe o no tienes acceso
          </p>
          <Button onClick={() => navigate('/vendor/gigs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a servicios
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleMarkInProgress = () => {
    updateTrainingProgress(training.id, { 
      status: 'in_progress',
      lastAccessedAt: new Date().toISOString().split('T')[0]
    });
    toast.success("Capacitación marcada como en progreso");
  };

  const handleComplete = () => {
    completeTraining(currentVendorId, service.id);
    toast.success("¡Capacitación completada! Servicio activado.", {
      description: "Ahora puedes vender este gig y acceder a los materiales.",
      duration: 5000
    });
    
    setTimeout(() => {
      navigate(`/vendor/gigs/${service.id}`);
    }, 1500);
  };

  const isCompleted = training.status === 'declared_completed';
  const isInProgress = training.status === 'in_progress';

  return (
    <DashboardLayout role="vendor" userName="Carlos Mendoza">
      <div className="space-y-6">
        <PageTutorial
          pageId="vendor-training"
          title="Capacitación del servicio"
          description="Revisa el material de capacitación y cuando termines, declárala completada para activar el gig."
          steps={[
            "Revisa el contenido (video o PDF) completo",
            "Cuando te sientas listo, haz clic en 'Declarar completada'",
            "El gig se activará y podrás empezar a vender"
          ]}
        />
        <Button 
          variant="ghost" 
          onClick={() => navigate('/vendor/gigs')}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a servicios
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {isCompleted ? "Completada" : isInProgress ? "En progreso" : "No iniciada"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {service.trainingType === 'video' ? (
                  <>
                    <Play className="w-3 h-3" />
                    Video
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3" />
                    PDF
                  </>
                )}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{service.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{company?.name}</span>
              <span>•</span>
              <span>{service.category}</span>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-success">Servicio activo</p>
                <p className="text-xs text-muted-foreground">
                  Completada el {training.completedAt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de la capacitación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={isCompleted ? "default" : isInProgress ? "secondary" : "outline"} className="text-base px-4 py-2">
                  {isCompleted ? "Completada (declarada)" : isInProgress ? "En progreso" : "No iniciada"}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ~15 minutos estimados
                </span>
              </div>
              
              {!isCompleted && (
                <div className="flex flex-wrap gap-3 pt-4">
                  {training.status === 'not_started' && (
                    <Button 
                      variant="outline"
                      onClick={handleMarkInProgress}
                    >
                      Marcar en progreso
                    </Button>
                  )}
                  <Button 
                    onClick={handleComplete}
                    className="hover:opacity-90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Declarar completada
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contenido de la capacitación</CardTitle>
            <CardDescription>
              {service.trainingType === 'video' 
                ? 'Mira el video completo para aprender sobre este servicio'
                : 'Lee el documento PDF con toda la información del servicio'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {service.trainingType === 'video' ? (
              <div className="space-y-4">
                {/* Mock video player */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Play className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-lg font-medium">Video de capacitación</p>
                    <p className="text-muted-foreground">{service.name}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir video en nueva pestaña
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mock PDF viewer */}
                <div className="aspect-[3/4] max-h-[500px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-lg font-medium">Documento PDF</p>
                    <p className="text-muted-foreground">{service.name}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir PDF en nueva pestaña
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sobre el servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Precio</p>
                <p className="text-lg font-bold text-primary">
                  $ {service.priceCOP.toLocaleString('es-CO')} COP
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Tu comisión</p>
                <p className="text-lg font-bold text-green-600">{service.vendorCommissionPct}%</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="text-lg font-semibold capitalize">{service.type}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Categoría</p>
                <p className="text-lg font-semibold">{service.category}</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Descripción</p>
              <p>{service.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        {isCompleted && (
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate('/vendor/materials')}
              className="hover:opacity-90"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver materiales de venta
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/vendor/gigs/${service.id}`)}
            >
              Ver detalle del servicio
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
