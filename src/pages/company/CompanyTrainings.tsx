import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  BookOpen, Play, FileText, Plus, Pencil, Clock, Users,
  ChevronRight, Check, Trash2, GripVertical, Eye
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { companies, CURRENT_COMPANY_ID, formatCOP } from "@/data/mockData";
import { trainingContents, type TrainingChapter, type TrainingContent } from "@/data/trainingContent";
import { toast } from "sonner";

export default function CompanyTrainings() {
  const { services, trainingProgress } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID && s.requiresTraining);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<TrainingChapter | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', duration: '', type: 'text' as 'video' | 'text' });
  const [previewService, setPreviewService] = useState<string | null>(null);
  const [previewChapter, setPreviewChapter] = useState(0);

  const getTrainingStats = (serviceId: string) => {
    const vendorTrainings = trainingProgress.filter(tp => tp.serviceId === serviceId);
    const completed = vendorTrainings.filter(tp => tp.status === 'declared_completed').length;
    const inProgress = vendorTrainings.filter(tp => tp.status === 'in_progress').length;
    return { total: vendorTrainings.length, completed, inProgress };
  };

  const handleEditChapter = (chapter: TrainingChapter) => {
    setEditingChapter(chapter);
    setEditForm({
      title: chapter.title,
      content: chapter.content,
      duration: chapter.duration,
      type: chapter.type as 'video' | 'text',
    });
  };

  const handleSaveChapter = () => {
    toast.success("Sección actualizada");
    setEditingChapter(null);
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Capacitaciones</h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
            Gestiona el contenido que los vendedores verán antes de poder vender tus servicios
          </p>
        </div>

        {/* Services with training */}
        <div className="space-y-3">
          {companyServices.map(service => {
            const content = trainingContents[service.id];
            const stats = getTrainingStats(service.id);
            const isExpanded = selectedService === service.id;

            return (
              <div key={service.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Service row */}
                <button
                  onClick={() => setSelectedService(isExpanded ? null : service.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      service.trainingType === 'video' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                    }`}>
                      {service.trainingType === 'video' 
                        ? <Play className="w-4 h-4 text-blue-600" />
                        : <FileText className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{content?.chapters.length || 0} secciones</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{content?.totalDuration}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Vendedores</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-emerald-600">{stats.completed}</span>
                          <span className="text-[9px] text-muted-foreground">completados</span>
                          {stats.inProgress > 0 && (
                            <>
                              <span className="text-[9px] text-muted-foreground">·</span>
                              <span className="text-xs font-medium text-amber-600">{stats.inProgress}</span>
                              <span className="text-[9px] text-muted-foreground">en curso</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ml-2 ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded: Chapter editor */}
                {isExpanded && content && (
                  <div className="border-t border-border">
                    {/* Overview */}
                    <div className="p-4 bg-muted/20 border-b border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Descripción general</p>
                          <p className="text-xs text-foreground leading-relaxed">{content.overview}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px] h-7 flex-shrink-0"
                          onClick={() => { setPreviewService(service.id); setPreviewChapter(0); }}>
                          <Eye className="w-3 h-3 mr-1" /> Vista previa
                        </Button>
                      </div>
                    </div>

                    {/* Chapters list */}
                    <div className="divide-y divide-border">
                      {content.chapters.map((chapter, i) => (
                        <div key={chapter.id} className="p-3 sm:p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-foreground">{chapter.title}</p>
                              <Badge variant="outline" className="text-[8px] gap-0.5">
                                {chapter.type === 'video' ? <Play className="w-2 h-2" /> : <FileText className="w-2 h-2" />}
                                {chapter.type === 'video' ? 'Video' : 'Texto'}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                              {chapter.content.substring(0, 120)}...
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {chapter.duration}
                              </span>
                              {chapter.keyPoints && (
                                <span className="text-[9px] text-muted-foreground">
                                  {chapter.keyPoints.length} puntos clave
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-[10px] h-7 flex-shrink-0"
                            onClick={() => handleEditChapter(chapter)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Sales tips & mistakes */}
                    <div className="p-4 bg-muted/10 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Tips de venta ({content.salesTips.length})</p>
                        {content.salesTips.slice(0, 3).map((tip, i) => (
                          <p key={i} className="text-[10px] text-foreground mb-1 flex items-start gap-1.5">
                            <Check className="w-2.5 h-2.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Errores comunes ({content.commonMistakes.length})</p>
                        {content.commonMistakes.slice(0, 3).map((m, i) => (
                          <p key={i} className="text-[10px] text-foreground mb-1 flex items-start gap-1.5">
                            <span className="text-destructive flex-shrink-0">!</span>
                            {m}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {companyServices.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Sin capacitaciones</p>
              <p className="text-xs text-muted-foreground">Crea un servicio con capacitación requerida para empezar</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit chapter dialog */}
      <Dialog open={!!editingChapter} onOpenChange={() => setEditingChapter(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Editar sección</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Título</Label>
              <Input className="h-8 text-sm mt-1" value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Duración</Label>
                <Input className="h-8 text-sm mt-1" value={editForm.duration}
                  onChange={e => setEditForm({ ...editForm, duration: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Tipo</Label>
                <div className="flex gap-2 mt-1">
                  {['text', 'video'].map(t => (
                    <button key={t}
                      onClick={() => setEditForm({ ...editForm, type: t as any })}
                      className={`flex-1 h-8 rounded-lg border text-xs font-medium transition-colors ${
                        editForm.type === t 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {t === 'video' ? 'Video' : 'Texto'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">Contenido</Label>
              <Textarea className="text-xs mt-1 font-mono" rows={12} value={editForm.content}
                onChange={e => setEditForm({ ...editForm, content: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingChapter(null)}>Cancelar</Button>
            <Button size="sm" onClick={handleSaveChapter}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewService} onOpenChange={() => setPreviewService(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vista previa del vendedor
            </DialogTitle>
          </DialogHeader>
          {previewService && trainingContents[previewService] && (
            <PreviewContent 
              content={trainingContents[previewService]} 
              activeChapter={previewChapter}
              onChapterChange={setPreviewChapter}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function PreviewContent({ content, activeChapter, onChapterChange }: { 
  content: TrainingContent; 
  activeChapter: number; 
  onChapterChange: (i: number) => void;
}) {
  const chapter = content.chapters[activeChapter];
  return (
    <div className="space-y-3">
      {/* Chapter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {content.chapters.map((ch, i) => (
          <button key={ch.id}
            onClick={() => onChapterChange(i)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
              i === activeChapter 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {i + 1}. {ch.title}
          </button>
        ))}
      </div>

      {/* Content */}
      {chapter.type === 'video' && (
        <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
          <Play className="w-10 h-10 text-muted-foreground" />
        </div>
      )}
      <div className="text-xs text-foreground leading-relaxed whitespace-pre-line">
        {chapter.content}
      </div>
      {chapter.keyPoints && (
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1.5">Puntos clave</p>
          {chapter.keyPoints.map((p, i) => (
            <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5 mb-1">
              <span className="text-primary">·</span> {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
