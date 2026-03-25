import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Play, FileText, CheckCircle2, Clock, BookOpen, Users,
  Edit3, Save, X, Plus, Trash2, ChevronRight, Lightbulb,
  AlertTriangle, Check, Bookmark, GripVertical, Eye
} from "lucide-react";
import { vendors, formatDate } from "@/data/mockData";
import { trainingContents, type TrainingChapter, type TrainingContent } from "@/data/trainingContent";
import { toast } from "sonner";

export default function CapacitacionTab({ service, trainingProgress }: any) {
  const content = trainingContents[service.id];
  const serviceTrainings = trainingProgress.filter((tp: any) => tp.serviceId === service.id);
  const completed = serviceTrainings.filter((tp: any) => tp.status === 'declared_completed').length;
  const inProgress = serviceTrainings.filter((tp: any) => tp.status === 'in_progress').length;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<TrainingContent | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const startEditing = () => {
    setEditContent(JSON.parse(JSON.stringify(content)));
    setIsEditing(true);
    setActiveChapter(0);
  };

  const handleSave = () => {
    // In production this would persist
    setIsEditing(false);
    setEditContent(null);
    toast.success("Capacitación actualizada");
  };

  const currentContent = isEditing && editContent ? editContent : content;
  const currentChapter = currentContent?.chapters[activeChapter];

  const updateChapter = (index: number, updates: Partial<TrainingChapter>) => {
    if (!editContent) return;
    const chapters = [...editContent.chapters];
    chapters[index] = { ...chapters[index], ...updates };
    setEditContent({ ...editContent, chapters });
  };

  const addChapter = () => {
    if (!editContent) return;
    const newChapter: TrainingChapter = {
      id: `ch-new-${Date.now()}`,
      title: 'Nueva sección',
      duration: '5 min',
      type: 'text',
      content: '',
      keyPoints: [],
    };
    setEditContent({ ...editContent, chapters: [...editContent.chapters, newChapter] });
    setActiveChapter(editContent.chapters.length);
  };

  const deleteChapter = (index: number) => {
    if (!editContent || editContent.chapters.length <= 1) return;
    const chapters = editContent.chapters.filter((_, i) => i !== index);
    setEditContent({ ...editContent, chapters });
    if (activeChapter >= chapters.length) setActiveChapter(chapters.length - 1);
  };

  if (!content) {
    return (
      <div className="text-center py-12 rounded-xl border border-border bg-card">
        <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">Sin contenido de capacitación</p>
        <p className="text-xs text-muted-foreground mb-3">Crea el contenido que los vendedores verán antes de poder vender</p>
        <Button size="sm" onClick={startEditing}><Plus className="w-3.5 h-3.5 mr-1" /> Crear capacitación</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={service.requiresTraining} disabled />
          <span className="text-xs text-muted-foreground">Requiere capacitación para vender</span>
        </div>
        <div className="flex gap-1.5">
          {isEditing ? (
            <>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setPreviewMode(!previewMode); }}>
                <Eye className="w-3.5 h-3.5 mr-1" /> {previewMode ? 'Editor' : 'Vista previa'}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setIsEditing(false); setEditContent(null); setPreviewMode(false); }}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={handleSave}>
                <Save className="w-3.5 h-3.5 mr-1" /> Guardar
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={startEditing}>
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Editar contenido
            </Button>
          )}
        </div>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border text-center bg-emerald-500/5 border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          <p className="text-[10px] text-muted-foreground">Completaron</p>
        </div>
        <div className="p-3 rounded-xl border text-center bg-amber-500/5 border-amber-500/20">
          <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{inProgress}</p>
          <p className="text-[10px] text-muted-foreground">En progreso</p>
        </div>
        <div className="p-3 rounded-xl border text-center">
          <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-2xl font-bold">{serviceTrainings.length}</p>
          <p className="text-[10px] text-muted-foreground">Participaron</p>
        </div>
      </div>

      {/* NotebookLM-style split editor */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Left sidebar: Chapter navigation */}
        <div className="space-y-3">
          {/* Overview */}
          {isEditing && !previewMode ? (
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <Label className="text-xs">Título de la capacitación</Label>
              <Input className="h-8 text-xs" value={editContent?.title || ''} onChange={e => editContent && setEditContent({ ...editContent, title: e.target.value })} />
              <Label className="text-xs">Descripción general</Label>
              <Textarea className="text-xs" rows={3} value={editContent?.overview || ''} onChange={e => editContent && setEditContent({ ...editContent, overview: e.target.value })} />
              <Label className="text-xs">Duración total</Label>
              <Input className="h-8 text-xs" value={editContent?.totalDuration || ''} onChange={e => editContent && setEditContent({ ...editContent, totalDuration: e.target.value })} />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-semibold text-foreground">{currentContent.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{currentContent.overview}</p>
              <Badge variant="outline" className="text-[9px] mt-2">{currentContent.totalDuration}</Badge>
            </div>
          )}

          {/* Chapter list */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Contenido</p>
              {isEditing && !previewMode && (
                <Button size="sm" variant="ghost" className="h-6 text-[9px] px-2" onClick={addChapter}>
                  <Plus className="w-2.5 h-2.5 mr-0.5" /> Sección
                </Button>
              )}
            </div>
            <div className="divide-y divide-border">
              {currentContent.chapters.map((chapter, i) => {
                const isActive = i === activeChapter;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveChapter(i)}
                    className={`w-full text-left p-3 flex items-start gap-2.5 transition-colors ${
                      isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <span className="text-[9px] font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {chapter.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-muted-foreground">{chapter.duration}</span>
                        {chapter.type === 'video' && <Play className="w-2 h-2 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vendor progress */}
          {serviceTrainings.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Progreso vendedores</p>
              </div>
              <div className="divide-y divide-border max-h-48 overflow-y-auto">
                {serviceTrainings.map((tp: any) => {
                  const vendor = vendors.find(v => v.id === tp.vendorId);
                  const sc: Record<string, { label: string; cls: string }> = {
                    declared_completed: { label: 'Completada', cls: 'bg-emerald-500/10 text-emerald-600' },
                    in_progress: { label: 'En progreso', cls: 'bg-amber-500/10 text-amber-600' },
                    not_started: { label: 'No iniciada', cls: 'bg-muted text-muted-foreground' },
                  };
                  const s = sc[tp.status] || sc.not_started;
                  return (
                    <div key={tp.id} className="flex items-center justify-between p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-primary">{(vendor?.name || '?')[0]}</span>
                        </div>
                        <p className="text-[10px] font-medium">{vendor?.name || tp.vendorId}</p>
                      </div>
                      <Badge className={`text-[8px] border-0 ${s.cls}`}>{s.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Content area */}
        <div className="space-y-4">
          {currentChapter && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Chapter header */}
              <div className="p-4 border-b border-border">
                {isEditing && !previewMode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px]">Título de la sección</Label>
                        <Input className="h-8 text-sm font-medium" value={currentChapter.title}
                          onChange={e => updateChapter(activeChapter, { title: e.target.value })} />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-[10px]">Duración</Label>
                        <Input className="h-8 text-xs" value={currentChapter.duration}
                          onChange={e => updateChapter(activeChapter, { duration: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {(['text', 'video'] as const).map(t => (
                          <button key={t} onClick={() => updateChapter(activeChapter, { type: t })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                              currentChapter.type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                            {t === 'video' ? 'Video' : 'Texto'}
                          </button>
                        ))}
                      </div>
                      {currentContent.chapters.length > 1 && (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-destructive ml-auto" onClick={() => deleteChapter(activeChapter)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Eliminar sección
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Sección {activeChapter + 1} de {currentContent.chapters.length}
                      </p>
                      <h2 className="text-base font-semibold text-foreground mt-0.5">{currentChapter.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] gap-1">
                        <Clock className="w-2.5 h-2.5" /> {currentChapter.duration}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] gap-1">
                        {currentChapter.type === 'video' ? <Play className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
                        {currentChapter.type === 'video' ? 'Video' : 'Texto'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Video placeholder */}
              {currentChapter.type === 'video' && (
                <div className="aspect-video bg-muted/50 flex items-center justify-center border-b border-border">
                  {isEditing && !previewMode ? (
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Play className="w-7 h-7 text-primary ml-0.5" />
                      </div>
                      <Input className="h-8 text-xs w-72 mx-auto" placeholder="URL del video (YouTube, Vimeo, Loom...)"
                        value={currentChapter.videoUrl || ''} onChange={e => updateChapter(activeChapter, { videoUrl: e.target.value })} />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Play className="w-7 h-7 text-primary ml-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground">Video de capacitación</p>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {isEditing && !previewMode ? (
                  <Textarea className="text-xs font-mono leading-relaxed min-h-[250px]" rows={14}
                    value={currentChapter.content}
                    onChange={e => updateChapter(activeChapter, { content: e.target.value })}
                    placeholder="Escribe el contenido de esta sección..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {currentChapter.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-xs text-foreground leading-relaxed mb-3 last:mb-0">
                        {paragraph.split('\n').map((line, j) => (
                          <span key={j}>{line}{j < paragraph.split('\n').length - 1 && <br />}</span>
                        ))}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Key points */}
              <div className="px-4 pb-4">
                {isEditing && !previewMode ? (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-2">
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> Puntos clave
                    </p>
                    {(currentChapter.keyPoints || []).map((point, i) => (
                      <div key={i} className="flex gap-2">
                        <Input className="h-7 text-[11px] flex-1" value={point}
                          onChange={e => {
                            const kp = [...(currentChapter.keyPoints || [])];
                            kp[i] = e.target.value;
                            updateChapter(activeChapter, { keyPoints: kp });
                          }} />
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"
                          onClick={() => updateChapter(activeChapter, { keyPoints: (currentChapter.keyPoints || []).filter((_, j) => j !== i) })}>
                          <Trash2 className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" className="h-6 text-[9px] text-primary"
                      onClick={() => updateChapter(activeChapter, { keyPoints: [...(currentChapter.keyPoints || []), ''] })}>
                      <Plus className="w-2.5 h-2.5 mr-0.5" /> Agregar punto
                    </Button>
                  </div>
                ) : currentChapter.keyPoints && currentChapter.keyPoints.length > 0 ? (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> Puntos clave
                    </p>
                    <div className="space-y-1.5">
                      {currentChapter.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Chapter navigation */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-xs" disabled={activeChapter === 0}
                  onClick={() => setActiveChapter(activeChapter - 1)}>
                  Anterior
                </Button>
                <span className="text-[10px] text-muted-foreground">{activeChapter + 1} / {currentContent.chapters.length}</span>
                <Button variant="ghost" size="sm" className="text-xs" disabled={activeChapter >= currentContent.chapters.length - 1}
                  onClick={() => setActiveChapter(activeChapter + 1)}>
                  Siguiente <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Tips & Mistakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Tips de venta
                </p>
                {isEditing && !previewMode && (
                  <Button size="sm" variant="ghost" className="h-5 text-[8px] px-1"
                    onClick={() => editContent && setEditContent({ ...editContent, salesTips: [...editContent.salesTips, ''] })}>
                    <Plus className="w-2 h-2" />
                  </Button>
                )}
              </div>
              {isEditing && !previewMode ? (
                <div className="space-y-1.5">
                  {(editContent?.salesTips || []).map((tip, i) => (
                    <div key={i} className="flex gap-1">
                      <Input className="h-7 text-[10px] flex-1" value={tip}
                        onChange={e => {
                          if (!editContent) return;
                          const t = [...editContent.salesTips]; t[i] = e.target.value;
                          setEditContent({ ...editContent, salesTips: t });
                        }} />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"
                        onClick={() => editContent && setEditContent({ ...editContent, salesTips: editContent.salesTips.filter((_, j) => j !== i) })}>
                        <Trash2 className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {currentContent.salesTips.slice(0, 5).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Errores comunes
                </p>
                {isEditing && !previewMode && (
                  <Button size="sm" variant="ghost" className="h-5 text-[8px] px-1"
                    onClick={() => editContent && setEditContent({ ...editContent, commonMistakes: [...editContent.commonMistakes, ''] })}>
                    <Plus className="w-2 h-2" />
                  </Button>
                )}
              </div>
              {isEditing && !previewMode ? (
                <div className="space-y-1.5">
                  {(editContent?.commonMistakes || []).map((m, i) => (
                    <div key={i} className="flex gap-1">
                      <Input className="h-7 text-[10px] flex-1" value={m}
                        onChange={e => {
                          if (!editContent) return;
                          const ms = [...editContent.commonMistakes]; ms[i] = e.target.value;
                          setEditContent({ ...editContent, commonMistakes: ms });
                        }} />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"
                        onClick={() => editContent && setEditContent({ ...editContent, commonMistakes: editContent.commonMistakes.filter((_, j) => j !== i) })}>
                        <Trash2 className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {currentContent.commonMistakes.slice(0, 5).map((mistake, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full border border-destructive/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[7px] text-destructive font-bold">!</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{mistake}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
