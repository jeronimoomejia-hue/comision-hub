import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  DollarSign, 
  Package, 
  MessageSquare, 
  BookOpen, 
  RefreshCw, 
  FileText, 
  Phone,
  Check,
  ExternalLink,
  Download,
  Play,
  Clock,
  Users,
  Target,
  Lightbulb,
  HelpCircle,
  AlertCircle,
  Globe,
  Shield
} from "lucide-react";
import { services, companies, formatCOP, trainingProgress, CURRENT_VENDOR_ID } from "@/data/mockData";
import { extendedServiceDetails } from "@/data/extendedServiceData";
import { useNavigate } from "react-router-dom";

interface ServiceDetailsModalProps {
  serviceId: string;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'vendor' | 'company' | 'admin';
  onToggleStatus?: (serviceId: string) => void;
}

export const ServiceDetailsModal = ({ 
  serviceId, 
  isOpen, 
  onClose, 
  userRole = 'vendor',
  onToggleStatus 
}: ServiceDetailsModalProps) => {
  const navigate = useNavigate();
  const service = services.find(s => s.id === serviceId);
  const company = service ? companies.find(c => c.id === service.companyId) : null;
  const details = extendedServiceDetails[serviceId];
  const vendorTraining = trainingProgress.find(
    tp => tp.vendorId === CURRENT_VENDOR_ID && tp.serviceId === serviceId
  );

  if (!service || !company) return null;

  const estimatedCommission = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
  const isTrainingComplete = vendorTraining?.status === 'declared_completed';

  const handleStartTraining = () => {
    onClose();
    navigate(`/vendor/trainings/${serviceId}`);
  };

  const handleViewMaterials = () => {
    onClose();
    navigate('/vendor/materials');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-xl">
                {service.name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{service.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{company.name} • {service.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={service.type === 'suscripción' ? 'default' : 'secondary'}>
                {service.type}
              </Badge>
              {(userRole === 'admin' || userRole === 'company') && (
                <Badge variant={service.status === 'activo' ? 'default' : 'outline'} 
                       className={service.status === 'activo' ? 'bg-green-500' : ''}>
                  {service.status}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="resumen" className="flex-1">
          <div className="px-6 border-b">
            <TabsList className="h-auto p-0 bg-transparent gap-0 flex-wrap">
              <TabsTrigger value="resumen" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <Building2 className="w-4 h-4 mr-1.5 hidden sm:inline" />Resumen
              </TabsTrigger>
              <TabsTrigger value="precio" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <DollarSign className="w-4 h-4 mr-1.5 hidden sm:inline" />Precio
              </TabsTrigger>
              <TabsTrigger value="incluye" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <Package className="w-4 h-4 mr-1.5 hidden sm:inline" />Incluye
              </TabsTrigger>
              <TabsTrigger value="venta" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <MessageSquare className="w-4 h-4 mr-1.5 hidden sm:inline" />Venta
              </TabsTrigger>
              <TabsTrigger value="capacitacion" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <BookOpen className="w-4 h-4 mr-1.5 hidden sm:inline" />Capacitación
              </TabsTrigger>
              <TabsTrigger value="devoluciones" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <RefreshCw className="w-4 h-4 mr-1.5 hidden sm:inline" />Devoluciones
              </TabsTrigger>
              <TabsTrigger value="requisitos" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <FileText className="w-4 h-4 mr-1.5 hidden sm:inline" />Requisitos
              </TabsTrigger>
              <TabsTrigger value="contacto" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-xs sm:text-sm">
                <Phone className="w-4 h-4 mr-1.5 hidden sm:inline" />Contacto
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(90vh-220px)]">
            <div className="p-6">
              {/* TAB 1 - RESUMEN */}
              <TabsContent value="resumen" className="mt-0 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h4>
                      <p className="text-sm">{details?.shortDescription || service.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Users className="w-4 h-4" />¿Para quién es?
                      </h4>
                      <p className="text-sm">{details?.targetAudience || 'Empresas y profesionales en Colombia'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />Problema que resuelve
                      </h4>
                      <p className="text-sm">{details?.problemSolved || 'Automatiza procesos manuales y reduce tiempos de respuesta.'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Target className="w-4 h-4" />Resultado prometido
                      </h4>
                      <p className="text-sm">{details?.promisedResult || 'Ahorro de tiempo y aumento en productividad.'}</p>
                    </div>
                  </div>
                </div>

                {service.activeSubscriptions && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{service.activeSubscriptions} suscripciones activas</span>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* TAB 2 - PRECIO Y COMISIONES */}
              <TabsContent value="precio" className="mt-0 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl border bg-muted/30 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Precio del servicio
                    </h4>
                    <div>
                      <p className="text-3xl font-bold text-primary">{formatCOP(service.priceCOP)}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.type === 'suscripción' ? 'por mes (cobro recurrente)' : 'pago único'}
                      </p>
                    </div>
                    {service.type === 'suscripción' && (
                      <div className="text-sm text-muted-foreground">
                        <p>• Frecuencia: Mensual</p>
                        <p>• Primer cobro: Inmediato al activar</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 rounded-xl border bg-green-500/10 border-green-500/20 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                      <DollarSign className="w-5 h-5" />
                      Tu comisión
                    </h4>
                    <div>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {service.vendorCommissionPct}%
                      </p>
                      <p className="text-sm text-muted-foreground">del precio por cada venta</p>
                    </div>
                    <div className="pt-2 border-t border-green-500/20">
                      <p className="text-sm text-muted-foreground">Estimado por venta:</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCOP(estimatedCommission)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium">Pago automático</h5>
                      <p className="text-sm text-muted-foreground">
                        Las comisiones se depositan automáticamente cada semana. 
                        No necesitas hacer nada, el dinero llega a tu cuenta.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  * La comisión se calcula automáticamente cuando el pago del cliente se confirma.
                </p>
              </TabsContent>

              {/* TAB 3 - QUÉ INCLUYE */}
              <TabsContent value="incluye" className="mt-0 space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Qué incluye el servicio
                  </h4>
                  <ul className="space-y-2">
                    {(details?.features || [
                      'Acceso completo a la plataforma',
                      'Soporte técnico por WhatsApp',
                      'Actualizaciones automáticas',
                      'Panel de administración',
                      'Reportes básicos'
                    ]).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {details?.notIncluded && details.notIncluded.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      Qué NO incluye
                    </h4>
                    <ul className="space-y-2">
                      {details.notIncluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-muted-foreground">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <h5 className="text-sm font-medium text-muted-foreground mb-1">Tiempo de activación</h5>
                    <p className="font-medium">{details?.activationTime || '24-48 horas'}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h5 className="text-sm font-medium text-muted-foreground mb-1">Garantía</h5>
                    <p className="font-medium">{details?.guarantee || 'Satisfacción garantizada'}</p>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4 - CÓMO SE VENDE */}
              <TabsContent value="venta" className="mt-0 space-y-6">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Pitch en 1 frase
                  </h4>
                  <p className="text-lg font-medium">
                    "{details?.pitchOneLine || `${service.name} te ayuda a automatizar y crecer tu negocio.`}"
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Pitch en 3 frases (guion corto)</h4>
                  <p className="text-sm bg-muted/50 p-4 rounded-lg">
                    {details?.pitchThreeLines || 
                      `¿Sabías que las empresas pierden horas en tareas manuales? ${service.name} automatiza ese proceso con IA. 
                      Nuestros clientes reportan un ahorro del 60% en tiempo. ¿Te gustaría probarlo?`}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Objecciones típicas y respuestas
                  </h4>
                  <div className="space-y-3">
                    {(details?.objections || [
                      { objection: '¿Es muy caro?', response: 'El ROI se ve en el primer mes con el ahorro de tiempo.' },
                      { objection: '¿Es difícil de usar?', response: 'No, la interfaz es súper intuitiva y hay soporte 24/7.' },
                      { objection: '¿Funciona para mi negocio?', response: 'Tenemos clientes en tu mismo sector con excelentes resultados.' },
                      { objection: '¿Puedo cancelar?', response: 'Sí, sin penalidades. Pero nadie cancela porque funciona.' },
                      { objection: '¿Hay periodo de prueba?', response: 'Ofrecemos garantía de satisfacción de 14 días.' }
                    ]).map((obj, i) => (
                      <div key={i} className="p-3 rounded-lg border">
                        <p className="text-sm font-medium text-destructive">❓ {obj.objection}</p>
                        <p className="text-sm text-muted-foreground mt-1">✅ {obj.response}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Cliente ideal (ICP)
                    </h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {details?.idealClient || 'Empresas medianas y pequeñas en Colombia que buscan automatizar procesos y ahorrar tiempo.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Casos de uso</h4>
                    <ul className="text-sm space-y-1">
                      {(details?.useCases || [
                        'Automatizar cotizaciones',
                        'Atender clientes 24/7',
                        'Generar reportes automáticos'
                      ]).map((useCase, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Preguntas de calificación</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    {(details?.qualificationQuestions || [
                      '¿Cuántas horas a la semana dedicas a esta tarea manualmente?',
                      '¿Cuántos clientes atiendes por mes?',
                      '¿Tienes algún sistema actual para esto?',
                      '¿Cuál es tu presupuesto mensual para herramientas?',
                      '¿Quién toma la decisión de compra en tu empresa?'
                    ]).map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
              </TabsContent>

              {/* TAB 5 - CAPACITACIÓN Y MATERIALES */}
              <TabsContent value="capacitacion" className="mt-0 space-y-6">
                <div className="p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {service.trainingType === 'video' ? (
                        <Play className="w-8 h-8 text-primary" />
                      ) : (
                        <FileText className="w-8 h-8 text-primary" />
                      )}
                      <div>
                        <h4 className="font-semibold">
                          Capacitación {service.trainingType === 'video' ? 'en Video' : 'en PDF'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Duración: ~{details?.trainingDurationMinutes || 15} minutos
                        </p>
                      </div>
                    </div>
                    {isTrainingComplete ? (
                      <Badge className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Completada
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </div>

                  {userRole === 'vendor' && (
                    <Button 
                      onClick={isTrainingComplete ? handleViewMaterials : handleStartTraining}
                      className={isTrainingComplete ? '' : 'bg-primary'}
                      variant={isTrainingComplete ? 'outline' : 'default'}
                    >
                      {isTrainingComplete ? (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Ver materiales
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Hacer capacitación
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Materiales del servicio
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Brochure', icon: FileText, available: true },
                      { name: 'Guión de ventas', icon: MessageSquare, available: true },
                      { name: 'Lista de precios', icon: DollarSign, available: true },
                      { name: 'FAQ para clientes', icon: HelpCircle, available: true },
                      { name: 'Comparativo', icon: Package, available: false }
                    ].map((material) => (
                      <div 
                        key={material.name}
                        className={`p-3 rounded-lg border flex items-center gap-3 ${
                          material.available ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-50'
                        }`}
                      >
                        <material.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm flex-1">{material.name}</span>
                        {material.available ? (
                          <Download className="w-4 h-4 text-primary" />
                        ) : (
                          <span className="text-xs text-muted-foreground">Próximamente</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {!isTrainingComplete && userRole === 'vendor' && (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ Completa la capacitación para desbloquear todos los materiales y poder vender este servicio.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* TAB 6 - DEVOLUCIONES */}
              <TabsContent value="devoluciones" className="mt-0 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Tipo de devolución</h4>
                    <p className="font-semibold text-lg">
                      {service.refundPolicy.autoRefund ? 'Automática' : 'Requiere aprobación'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.refundPolicy.autoRefund 
                        ? 'El sistema procesa la devolución automáticamente' 
                        : 'La empresa debe aprobar la solicitud'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Ventana de devolución</h4>
                    <p className="font-semibold text-lg">{service.refundPolicy.refundWindowDays} días</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Desde la fecha de compra
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Motivos aceptados para devolución</h4>
                  <ul className="space-y-1.5">
                    {(details?.refundPolicy?.acceptedReasons || [
                      'No cumple expectativas',
                      'Dificultad técnica',
                      'Cambio de necesidades'
                    ]).map((reason, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-muted-foreground" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h5 className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                    ¿Qué pasa con tu comisión si hay devolución?
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Si se aprueba una devolución, la comisión se revierte automáticamente. 
                    El monto se descuenta de tu próximo pago programado.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <h5 className="font-medium mb-2">Flujo de devolución</h5>
                  <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                    <li>El vendedor solicita la devolución desde la venta</li>
                    <li>
                      {service.refundPolicy.autoRefund 
                        ? 'El sistema la procesa automáticamente si está dentro de la ventana'
                        : 'La empresa revisa y aprueba/rechaza la solicitud'}
                    </li>
                    <li>Si se aprueba, el cliente recibe su dinero y la comisión se revierte</li>
                  </ol>
                </div>
              </TabsContent>

              {/* TAB 7 - REQUISITOS Y CONDICIONES */}
              <TabsContent value="requisitos" className="mt-0 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      Países donde aplica
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(details?.countries || ['CO']).map(country => (
                        <Badge key={country} variant="secondary">{country}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      SLA / Soporte
                    </h4>
                    <p className="text-sm">{details?.slaSupport || 'Respuesta en máximo 24 horas hábiles'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requisitos del cliente</h4>
                  <ul className="space-y-1.5">
                    {(details?.clientRequirements || [
                      'Tener RUT activo',
                      'Empresa constituida legalmente',
                      'Acceso a internet estable'
                    ]).map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {details?.restrictions && (
                  <div>
                    <h4 className="font-semibold mb-2">Restricciones</h4>
                    <p className="text-sm text-muted-foreground">{details.restrictions}</p>
                  </div>
                )}

                <div className="p-4 rounded-lg border bg-muted/30">
                  <h5 className="font-medium mb-2">Términos importantes</h5>
                  <p className="text-sm text-muted-foreground">
                    {details?.termsHighlights || 
                      'Al adquirir el servicio, el cliente acepta los términos de uso de la plataforma. ' +
                      'El servicio se presta bajo las condiciones vigentes al momento de la compra.'}
                  </p>
                </div>
              </TabsContent>

              {/* TAB 8 - EMPRESA / CONTACTO */}
              <TabsContent value="contacto" className="mt-0 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{company.name}</h4>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{company.country}</Badge>
                  </div>
                  {(details?.websiteUrl || details?.demoUrl) && (
                    <div className="flex gap-2">
                      {details?.websiteUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://${details.websiteUrl}`} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-1.5" />
                            Web
                          </a>
                        </Button>
                      )}
                      {details?.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://${details.demoUrl}`} target="_blank" rel="noopener noreferrer">
                            <Play className="w-4 h-4 mr-1.5" />
                            Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border space-y-2">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Información de la empresa</h5>
                    <div className="space-y-1.5">
                      <p className="text-sm"><span className="text-muted-foreground">Industria:</span> {company.industry}</p>
                      <p className="text-sm"><span className="text-muted-foreground">País:</span> {company.country}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Horario:</span> {details?.supportHours || 'Lun-Vie 8:00-18:00'}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border space-y-2">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">SLA de soporte</h5>
                    <p className="text-sm">{details?.slaSupport || 'Respuesta en máximo 24 horas hábiles'}</p>
                    {details?.websiteUrl && (
                      <a 
                        href={`https://${details.websiteUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        {details.websiteUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-amber-700 dark:text-amber-400">Privacidad protegida</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        No tienes contacto directo con las empresas. Si necesitas ayuda con este servicio, 
                        usa el <span className="font-medium text-primary">sistema de soporte</span> de Mensualista y nosotros coordinamos por ti.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          
          <div className="flex items-center gap-2">
            {details?.websiteUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={`https://${details.websiteUrl}`} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Ir al servicio
                </a>
              </Button>
            )}
            
            {userRole === 'vendor' && (
              <>
                {isTrainingComplete ? (
                  <Button variant="outline" onClick={handleViewMaterials}>
                    <Download className="w-4 h-4 mr-2" />
                    Ver materiales
                  </Button>
                ) : (
                  <Button onClick={handleStartTraining}>
                    <Play className="w-4 h-4 mr-2" />
                    Hacer capacitación
                  </Button>
                )}
              </>
            )}
            
            {userRole === 'admin' && onToggleStatus && (
              <Button 
                variant={service.status === 'activo' ? 'outline' : 'default'}
                onClick={() => onToggleStatus(serviceId)}
              >
                {service.status === 'activo' ? 'Pausar servicio' : 'Activar servicio'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsModal;
