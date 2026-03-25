import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Play, FileText, CheckCircle2, Clock,
  BookOpen, ChevronRight, Lightbulb, AlertTriangle,
  Check, StickyNote, DollarSign, RefreshCw, Zap
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { services, companies, formatCOP } from "@/data/mockData";
import { trainingContents, type TrainingChapter } from "@/data/trainingContent";
import { toast } from "sonner";

export default function VendorTrainingDetail() {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const { trainingProgress, updateTrainingProgress, completeTraining, startTraining, currentVendorId } = useDemo();

  let training = trainingProgress.find(tp => tp.id === trainingId);
  const serviceFromId = services.find(s => s.id === trainingId);
  
  if (!training && serviceFromId) {
    training = trainingProgress.find(tp => tp.vendorId === currentVendorId && tp.serviceId === serviceFromId.id);
  }

  const service = training 
    ? services.find(s => s.id === training!.serviceId) 
    : serviceFromId;
  const company = service ? companies.find(c => c.id === service.companyId) : null;
  const content = service ? trainingContents[service.id] : null;

  const [activeChapter, setActiveChapter] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [showNotes, setShowNotes] = useState(false);

  if (!service || !content) {
    return (
      <VendorTabLayout backTo="/vendor" backLabel="Inicio">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium">Entrenamiento no encontrado</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">No se encontró el contenido de entrenamiento</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/vendor')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver
          </Button>
        </div>
      </VendorTabLayout>
    );
  }

  if (!training) {
    startTraining(currentVendorId, service.id);
    training = trainingProgress.find(tp => tp.vendorId === currentVendorId && tp.serviceId === service.id);
  }

  const isCompleted = training?.status === 'declared_completed';
  const currentChapter = content.chapters[activeChapter];
  const allChaptersCompleted = content.chapters.every(ch => completedChapters.has(ch.id));
  const isRecurring = service.type === 'suscripción';
  const estimatedCommission = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
  const mensualistaFee = Math.round(service.priceCOP * service.mensualistaPct / 100);
  const providerNet = service.priceCOP - estimatedCommission - mensualistaFee;

  const handleMarkChapterComplete = (chapterId: string) => {
    setCompletedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const handleNextChapter = () => {
    handleMarkChapterComplete(currentChapter.id);
    if (activeChapter < content.chapters.length - 1) {
      setActiveChapter(activeChapter + 1);
    }
  };

  const handleComplete = () => {
    completeTraining(currentVendorId, service.id);
    toast.success("Entrenamiento completado. Producto activado.", {
      description: `Ahora puedes vender ${service.name}`,
      duration: 4000
    });
    setTimeout(() => {
      navigate(`/vendor/company/${company?.id}/service/${service.id}`);
    }, 1500);
  };

  const backPath = company ? `/vendor/company/${company.id}` : '/vendor';

  // Step types for visual differentiation
  const getStepStyle = (chapter: TrainingChapter, index: number) => {
    if (chapter.type === 'video') return { color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Video' };
    if (chapter.type === 'quiz') return { color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Quiz' };
    // Alternate text styles
    const textStyles = [
      { color: 'text-foreground', bg: 'bg-muted', label: 'Lectura' },
      { color: 'text-purple-600', bg: 'bg-purple-500/10', label: 'Lectura' },
      { color: 'text-emerald-600', bg: 'bg-emerald-500/10', label: 'Lectura' },
    ];
    return textStyles[index % textStyles.length];
  };

  return (
    <VendorTabLayout backTo={backPath} backLabel={company?.name || 'Volver'}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[9px] gap-1">
              {service.trainingType === 'video' ? <Play className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
              {content.totalDuration}
            </Badge>
            {isCompleted && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px]">
                <Check className="w-2.5 h-2.5 mr-0.5" /> Completado
              </Badge>
            )}
          </div>
          <h1 className="text-lg font-semibold text-foreground">{content.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{company?.name} · {service.category}</p>
        </div>

        {/* Overview */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-foreground leading-relaxed">{content.overview}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{completedChapters.size} de {content.chapters.length} pasos</span>
            <span>{Math.round((completedChapters.size / content.chapters.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(completedChapters.size / content.chapters.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Price breakdown card */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Desglose por venta</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Precio del producto</span>
              <span className="font-medium text-foreground">{formatCOP(service.priceCOP)}{isRecurring ? '/mes' : ''}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tu comisión ({service.vendorCommissionPct}%)</span>
              <span className="font-semibold text-primary">{formatCOP(estimatedCommission)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Fee plataforma ({service.mensualistaPct}%)</span>
              <span className="text-muted-foreground">{formatCOP(mensualistaFee)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Neto empresa</span>
              <span className="text-muted-foreground">{formatCOP(providerNet)}</span>
            </div>
          </div>
          {isRecurring && (
            <div className="flex items-center gap-1.5 text-[10px] text-blue-600 bg-blue-500/5 px-2 py-1.5 rounded-lg">
              <RefreshCw className="w-3 h-3" />
              Cobro mensual recurrente. Ganas comisión cada mes.
            </div>
          )}
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          
          {/* Left sidebar: Chapter navigation */}
          <div className="space-y-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pasos del entrenamiento</p>
              </div>
              <div className="divide-y divide-border">
                {content.chapters.map((chapter, i) => {
                  const isDone = completedChapters.has(chapter.id);
                  const isActive = i === activeChapter;
                  const stepStyle = getStepStyle(chapter, i);
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setActiveChapter(i)}
                      className={`w-full text-left p-3 flex items-start gap-2.5 transition-colors ${
                        isActive 
                          ? 'bg-primary/5 border-l-2 border-l-primary' 
                          : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isDone 
                          ? 'bg-emerald-500 text-white' 
                          : isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : stepStyle.bg + ' ' + stepStyle.color
                      }`}>
                        {isDone ? <Check className="w-3 h-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {chapter.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-medium ${stepStyle.color}`}>{stepStyle.label}</span>
                          <span className="text-[9px] text-muted-foreground">{chapter.duration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile notes toggle */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="lg:hidden w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5" /> Mis notas
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showNotes ? 'rotate-90' : ''}`} />
            </button>

            {showNotes && (
              <div className="lg:hidden rounded-xl border border-border bg-card p-3">
                <Textarea
                  placeholder="Escribe tus notas sobre esta sección..."
                  value={notes[currentChapter?.id] || ''}
                  onChange={(e) => setNotes(prev => ({ ...prev, [currentChapter.id]: e.target.value }))}
                  rows={4}
                  className="text-xs resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                />
              </div>
            )}
          </div>

          {/* Right: Main content area */}
          <div className="space-y-4">
            {/* Chapter content card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Chapter header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${getStepStyle(currentChapter, activeChapter).bg} ${getStepStyle(currentChapter, activeChapter).color}`}>
                        Paso {activeChapter + 1} · {getStepStyle(currentChapter, activeChapter).label}
                      </span>
                      <Badge variant="outline" className="text-[9px] gap-1">
                        <Clock className="w-2.5 h-2.5" /> {currentChapter.duration}
                      </Badge>
                    </div>
                    <h2 className="text-base font-semibold text-foreground">{currentChapter.title}</h2>
                  </div>
                </div>
              </div>

              {/* Video placeholder */}
              {currentChapter.type === 'video' && (
                <div className="aspect-video bg-muted/50 flex items-center justify-center border-b border-border">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Play className="w-7 h-7 text-primary ml-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">Video de entrenamiento</p>
                  </div>
                </div>
              )}

              {/* Text content */}
              <div className="p-4">
                <div className="prose prose-sm max-w-none">
                  {currentChapter.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-xs text-foreground leading-relaxed mb-3 last:mb-0">
                      {paragraph.split('\n').map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < paragraph.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              {/* Key points */}
              {currentChapter.keyPoints && (
                <div className="px-4 pb-4">
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-2">Puntos clave</p>
                    <div className="space-y-1.5">
                      {currentChapter.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chapter navigation */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  disabled={activeChapter === 0}
                  onClick={() => setActiveChapter(activeChapter - 1)}
                >
                  <ArrowLeft className="w-3 h-3 mr-1" /> Anterior
                </Button>
                {activeChapter < content.chapters.length - 1 ? (
                  <Button size="sm" className="text-xs" onClick={handleNextChapter}>
                    Completar y siguiente <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs"
                    variant={completedChapters.has(currentChapter.id) ? "outline" : "default"}
                    onClick={() => handleMarkChapterComplete(currentChapter.id)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {completedChapters.has(currentChapter.id) ? 'Completado' : 'Marcar como leído'}
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop notes */}
            <div className="hidden lg:block rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2 flex items-center gap-1">
                <StickyNote className="w-3 h-3" /> Mis notas — {currentChapter.title}
              </p>
              <Textarea
                placeholder="Escribe tus notas sobre esta sección..."
                value={notes[currentChapter?.id] || ''}
                onChange={(e) => setNotes(prev => ({ ...prev, [currentChapter.id]: e.target.value }))}
                rows={3}
                className="text-xs resize-none border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>

            {/* Tips & Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Tips de venta
                </p>
                <div className="space-y-1.5">
                  {content.salesTips.slice(0, 4).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Errores comunes
                </p>
                <div className="space-y-1.5">
                  {content.commonMistakes.slice(0, 4).map((mistake, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full border border-destructive/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[7px] text-destructive font-bold">!</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{mistake}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Complete button - only if all chapters done */}
            {!isCompleted && allChaptersCompleted && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Entrenamiento completo</p>
                  <p className="text-[11px] text-muted-foreground">
                    Activa el producto para comenzar a vender
                  </p>
                </div>
                <Button size="sm" onClick={handleComplete}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Activar producto
                </Button>
              </div>
            )}

            {/* Not all chapters completed yet */}
            {!isCompleted && !allChaptersCompleted && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Completa los {content.chapters.length - completedChapters.size} paso{content.chapters.length - completedChapters.size !== 1 ? 's' : ''} restante{content.chapters.length - completedChapters.size !== 1 ? 's' : ''} para activar este producto
                </p>
              </div>
            )}

            {/* Already completed */}
            {isCompleted && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-medium text-emerald-700">Producto activo</p>
                    <p className="text-[10px] text-muted-foreground">Completado el {training?.completedAt}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs"
                  onClick={() => navigate(`/vendor/company/${company?.id}/service/${service.id}`)}>
                  Ir al producto <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorTabLayout>
  );
}
