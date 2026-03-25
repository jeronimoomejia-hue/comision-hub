import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, BookOpen, RefreshCw, Check, Play, Clock, Users, Target,
  Lightbulb, HelpCircle, AlertCircle, Globe, Shield, Download, FileText,
  MessageSquare, Package, Zap, Star, Lock, ArrowRight, ExternalLink, Phone
} from "lucide-react";
import { services, companies, formatCOP, trainingProgress, CURRENT_VENDOR_ID } from "@/data/mockData";
import { extendedServiceDetails } from "@/data/extendedServiceData";
import { useNavigate } from "react-router-dom";
import { categoryCovers } from "@/data/coverImages";

interface ServiceDetailsModalProps {
  serviceId: string;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'vendor' | 'company' | 'admin';
  onToggleStatus?: (serviceId: string) => void;
}

export const ServiceDetailsModal = ({ 
  serviceId, isOpen, onClose, userRole = 'vendor', onToggleStatus 
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
  const coverImg = categoryCovers[service.category];

  const handleStartTraining = () => {
    onClose();
    navigate(`/vendor/trainings/${serviceId}`);
  };

  const handleSell = () => {
    onClose();
    navigate(`/vendor/services/${serviceId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-hidden gap-0">
        {/* Hero Cover */}
        <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
          <img
            src={coverImg}
            alt={service.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge className={service.type === 'suscripción' ? 'bg-blue-500 hover:bg-blue-600 text-white border-0' : 'bg-purple-500 hover:bg-purple-600 text-white border-0'}>
              {service.type === 'suscripción' ? <><RefreshCw className="w-3 h-3 mr-1" /> Recurrente</> : <><Zap className="w-3 h-3 mr-1" /> Puntual</>}
            </Badge>
            {isTrainingComplete ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                <Check className="w-3 h-3 mr-1" /> Activado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                <Lock className="w-3 h-3 mr-1" /> Sin activar
              </Badge>
            )}
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: company?.primaryColor || 'hsl(var(--primary))' }}
              >
                {company.name[0]}
              </div>
              <span className="text-white/80 text-xs">{company.name} · {service.category}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{service.name}</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[calc(92vh-12rem)]">
          <div className="p-5 sm:p-6 space-y-8">

            {/* ── Pricing Cards ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Tu comisión</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{formatCOP(estimatedCommission)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{service.vendorCommissionPct}% por venta</p>
              </div>
              <div className="p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Precio cliente</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatCOP(service.priceCOP)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {service.type === 'suscripción' ? 'cobro mensual' : 'pago único'}
                </p>
              </div>
            </div>

            {/* ── Description ── */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">Descripción</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {details?.shortDescription || service.description}
              </p>
            </section>

            {/* ── Problem / Result / Audience ── */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border bg-muted/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Problema</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {details?.problemSolved || 'Procesos manuales lentos y propensos a errores.'}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-green-500/5 border-green-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-green-600">
                  <Target className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Resultado</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {details?.promisedResult || 'Ahorro de tiempo y aumento en productividad.'}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Audiencia</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {details?.targetAudience || 'Empresas y profesionales en Colombia.'}
                </p>
              </div>
            </div>

            {/* ── What's Included ── */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Qué incluye
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {(details?.features || [
                  'Acceso completo a la plataforma',
                  'Soporte técnico por WhatsApp',
                  'Actualizaciones automáticas',
                  'Panel de administración',
                  'Reportes básicos'
                ]).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-green-500/5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              {details?.notIncluded && details.notIncluded.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">No incluye:</p>
                  <div className="flex flex-wrap gap-2">
                    {details.notIncluded.map((item, i) => (
                      <span key={i} className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── Sales Pitch ── */}
            <section className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Cómo vender este producto
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Pitch en una frase</p>
                  <p className="text-sm font-medium text-foreground italic">
                    "{details?.pitchOneLine || `${service.name} te ayuda a automatizar y crecer tu negocio.`}"
                  </p>
                </div>
                <div className="border-t border-primary/10 pt-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Guión corto</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {details?.pitchThreeLines || `¿Sabías que las empresas pierden horas en tareas manuales? ${service.name} automatiza ese proceso con IA.`}
                  </p>
                </div>
              </div>
            </section>

            {/* ── Objections ── */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Objeciones y respuestas
              </h3>
              <div className="space-y-2">
                {(details?.objections || [
                  { objection: '¿Es muy caro?', response: 'El ROI se ve en el primer mes.' },
                  { objection: '¿Es difícil de usar?', response: 'La interfaz es súper intuitiva.' },
                ]).slice(0, 4).map((obj, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20">
                    <p className="text-xs font-medium text-foreground">❓ {obj.objection}</p>
                    <p className="text-xs text-muted-foreground mt-1">✅ {obj.response}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Ideal Client + Use Cases ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Cliente ideal
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {details?.idealClient || 'Empresas medianas y pequeñas en Colombia.'}
                </p>
              </div>
              <div className="p-4 rounded-xl border">
                <h4 className="text-xs font-semibold text-foreground mb-2">Casos de uso</h4>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  {(details?.useCases || ['Automatizar tareas', 'Mejorar atención al cliente']).map((uc, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Training Status ── */}
            <section className={`p-4 rounded-xl border ${isTrainingComplete ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {service.trainingType === 'video' ? (
                    <Play className={`w-6 h-6 ${isTrainingComplete ? 'text-green-500' : 'text-amber-500'}`} />
                  ) : (
                    <FileText className={`w-6 h-6 ${isTrainingComplete ? 'text-green-500' : 'text-amber-500'}`} />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold">
                      Entrenamiento {service.trainingType === 'video' ? 'en Video' : 'en PDF'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      ~{details?.trainingDurationMinutes || 15} min · {isTrainingComplete ? 'Completada' : 'Pendiente'}
                    </p>
                  </div>
                </div>
                {isTrainingComplete ? (
                  <Badge className="bg-green-500 text-white border-0">
                    <Check className="w-3 h-3 mr-1" /> Listo
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50" onClick={handleStartTraining}>
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    Capacitarme
                  </Button>
                )}
              </div>
            </section>

            {/* ── Materials ── */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Materiales de venta
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Brochure', icon: FileText },
                  { name: 'Guión de ventas', icon: MessageSquare },
                  { name: 'Lista de precios', icon: DollarSign },
                  { name: 'FAQ', icon: HelpCircle },
                ].map((m) => (
                  <div key={m.name} className="p-2.5 rounded-lg border flex items-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors">
                    <m.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.name}</span>
                    <Download className="w-3 h-3 text-primary ml-auto" />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Refund Policy ── */}
            <section className="p-4 rounded-xl border bg-muted/20">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Política de devoluciones
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Tipo</p>
                  <p className="text-sm font-medium">{service.refundPolicy.autoRefund ? 'Automática' : 'Aprobación manual'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ventana</p>
                  <p className="text-sm font-medium">{service.refundPolicy.refundWindowDays} días</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(details?.refundPolicy?.acceptedReasons || ['No cumple expectativas']).map((r, i) => (
                  <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{r}</span>
                ))}
              </div>
            </section>

            {/* ── Requirements ── */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Países
                </h4>
                <div className="flex gap-1.5">
                  {(details?.countries || ['CO']).map(c => (
                    <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl border">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Requisitos cliente
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {(details?.clientRequirements || ['Empresa constituida']).slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Company Info ── */}
            <section className="p-4 rounded-xl border bg-muted/20">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: company?.primaryColor || 'hsl(var(--primary))' }}
                >
                  {company.name[0]}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{company.name}</h4>
                  <p className="text-xs text-muted-foreground">{company.industry} · {company.country}</p>
                </div>
                {details?.websiteUrl && (
                  <a href={`https://${details.websiteUrl}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1">
                    Web <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><span className="font-medium text-foreground">Horario:</span> {details?.supportHours || 'Lun-Vie 8-18h'}</div>
                <div><span className="font-medium text-foreground">SLA:</span> {details?.slaSupport || '24h hábiles'}</div>
              </div>
            </section>

          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="p-4 border-t bg-card flex items-center justify-between gap-3 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
            Cerrar
          </Button>
          
          <div className="flex items-center gap-2">
            {userRole === 'vendor' && (
              isTrainingComplete ? (
                <Button size="sm" onClick={handleSell}>
                  Vender <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="border-amber-400 text-amber-700" onClick={handleStartTraining}>
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Capacitarme primero
                </Button>
              )
            )}
            {userRole === 'admin' && onToggleStatus && (
              <Button size="sm" variant={service.status === 'activo' ? 'outline' : 'default'} onClick={() => onToggleStatus(serviceId)}>
                {service.status === 'activo' ? 'Pausar' : 'Activar'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsModal;
