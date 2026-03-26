import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Package, Key, DollarSign, BookOpen,
  RefreshCw, Zap, Check, Upload,
  Lightbulb, FileText, Plus, Trash2, Link2, UserCheck, StickyNote,
  Play, Video, FileUp, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { formatCOP, CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";

type Step = 'basics' | 'pricing' | 'content' | 'training' | 'codes' | 'notes';
type CodeType = 'codes' | 'links' | 'credentials';

export default function CompanyNewService() {
  const navigate = useNavigate();
  const { currentCompanyPlan, addService } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [step, setStep] = useState<Step>('basics');

  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: 'seguros',
    type: 'suscripción' as 'suscripción' | 'puntual',
    priceCOP: 150000,
    vendorCommissionPct: 20,
    requiresTraining: true,
    trainingType: 'video' as 'pdf' | 'video',
    refundWindowDays: 14 as 7 | 14 | 30,
    autoRefund: false,
    // Codes
    codeType: 'codes' as CodeType,
    initialCodes: '',
    initialCredentials: [{ username: '', password: '' }],
    // Content / gig details
    pitchOneLine: '',
    pitchThreeLines: '',
    targetAudience: '',
    problemSolved: '',
    promisedResult: '',
    features: ['', '', ''],
    objections: [{ objection: '', response: '' }],
    idealClient: '',
    // Training
    trainingVideoUrl: '',
    trainingPdfName: '',
    trainingChapters: [
      { title: 'Introducción al producto', type: 'video' as 'video' | 'quiz' | 'reading', duration: '5 min' },
      { title: 'Cómo venderlo', type: 'video' as 'video' | 'quiz' | 'reading', duration: '10 min' },
      { title: 'Evaluación', type: 'quiz' as 'video' | 'quiz' | 'reading', duration: '5 min' },
    ],
    trainingQuizQuestions: [{ question: '', options: ['', '', ''], correctIndex: 0 }],
    // Notes
    additionalNotes: '',
    internalNotes: '',
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const steps: { id: Step; label: string; icon: React.ElementType }[] = [
    { id: 'basics', label: 'Producto', icon: Package },
    { id: 'pricing', label: 'Precio', icon: DollarSign },
    { id: 'content', label: 'Contenido', icon: Lightbulb },
    { id: 'training', label: 'Entrenamiento', icon: BookOpen },
    { id: 'codes', label: 'Códigos', icon: Key },
    { id: 'notes', label: 'Notas', icon: StickyNote },
  ];

  const currentIdx = steps.findIndex(s => s.id === step);
  const isLast = currentIdx === steps.length - 1;

  const handleNext = () => {
    if (step === 'basics' && !form.name.trim()) { toast.error("Ingresa un nombre"); return; }
    if (!isLast) setStep(steps[currentIdx + 1].id);
  };

  const handleBack = () => {
    if (currentIdx > 0) setStep(steps[currentIdx - 1].id);
    else navigate('/company/services');
  };

  const mensualistaPct = currentCompanyPlan === 'freemium' ? 15 : 8;
  const estimatedCommission = Math.round(form.priceCOP * form.vendorCommissionPct / 100);
  const platformFee = Math.round(form.priceCOP * mensualistaPct / 100);
  const netAmount = form.priceCOP - estimatedCommission - platformFee;

  const getCodeCount = () => {
    if (form.codeType === 'credentials') return form.initialCredentials.filter(c => c.username.trim()).length;
    return form.initialCodes.split('\n').filter(c => c.trim()).length;
  };

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Ingresa un nombre"); return; }
    const codeCount = getCodeCount();
    if (codeCount < 20 && currentCompanyPlan !== 'enterprise') {
      toast.error("Debes ingresar mínimo 20 códigos/links/credenciales");
      return;
    }

    let codeLines: string[] = [];
    if (form.codeType === 'credentials') {
      codeLines = form.initialCredentials.filter(c => c.username.trim()).map(c => `${c.username}|${c.password}`);
    } else {
      codeLines = form.initialCodes.split('\n').map(c => c.trim()).filter(Boolean);
    }

    addService({
      companyId: CURRENT_COMPANY_ID,
      name: form.name, description: form.description || form.shortDescription, category: form.category,
      priceCOP: form.priceCOP, type: form.type, vendorCommissionPct: form.vendorCommissionPct,
      mensualistaPct, status: 'activo',
      refundPolicy: { autoRefund: form.autoRefund, refundWindowDays: form.refundWindowDays },
      requiresTraining: form.requiresTraining, trainingType: form.trainingType,
      materials: [],
      activationCodes: codeLines.map((code, i) => ({ id: `ac-new-${Date.now()}-${i}`, code, status: 'available' as const })),
    });
    toast.success(`Producto creado con ${codeLines.length} ${form.codeType === 'codes' ? 'códigos' : form.codeType === 'links' ? 'links' : 'credenciales'}`);
    navigate('/company/services');
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        <button onClick={() => navigate('/company/services')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Mis Productos
        </button>

        <h1 className="text-xl font-bold text-foreground">Nuevo producto</h1>

        {/* Step indicators */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                step === s.id
                  ? 'bg-primary text-primary-foreground'
                  : i < currentIdx
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {i < currentIdx ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">

          {/* ═══ BASICS ═══ */}
          {step === 'basics' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nombre del producto</Label>
                <Input className="h-10 text-sm" placeholder="Ej: Seguro de vida Plus" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Descripción corta</Label>
                <Input className="h-10 text-sm" placeholder="Frase corta que describe el producto" value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Descripción completa</Label>
                <Textarea className="text-sm" rows={3} placeholder="Detalle completo del producto..." value={form.description} onChange={e => update('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Categoría</Label>
                  <Select value={form.category} onValueChange={v => update('category', v)}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['seguros', 'legal', 'marketing', 'ventas', 'rrhh', 'contabilidad', 'tecnología', 'salud'].map(c => (
                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tipo de cobro</Label>
                  <Select value={form.type} onValueChange={v => update('type', v)}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suscripción">
                        <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Suscripción mensual</span>
                      </SelectItem>
                      <SelectItem value="puntual">
                        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Pago único</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* ═══ PRICING ═══ */}
          {step === 'pricing' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Precio (COP)</Label>
                  <Input type="number" className="h-10 text-sm" value={form.priceCOP} onChange={e => update('priceCOP', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Comisión vendedor (%)</Label>
                  <Input type="number" className="h-10 text-sm" min={5} max={50} value={form.vendorCommissionPct} onChange={e => update('vendorCommissionPct', Number(e.target.value))} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Desglose por venta</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Precio</span><span className="font-medium">{formatCOP(form.priceCOP)}{form.type === 'suscripción' ? '/mes' : ''}</span></div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Comisión vendedor ({form.vendorCommissionPct}%)</span><span className="font-medium text-amber-600">{formatCOP(estimatedCommission)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fee plataforma ({mensualistaPct}%)</span><span className="text-muted-foreground">{formatCOP(platformFee)}</span></div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between"><span className="text-foreground font-medium">Tu neto</span><span className="font-bold text-primary">{formatCOP(netAmount)}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Ventana de devolución</Label>
                  <Select value={String(form.refundWindowDays)} onValueChange={v => update('refundWindowDays', Number(v))}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="14">14 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={form.autoRefund} onCheckedChange={v => update('autoRefund', v)} />
                  <Label className="text-xs">Devolución automática</Label>
                </div>
              </div>
            </>
          )}

          {/* ═══ CONTENT ═══ */}
          {step === 'content' && (
            <>
              <p className="text-xs text-muted-foreground">Este contenido ayuda a los vendedores a entender y vender tu producto.</p>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Pitch en una frase</Label>
                <Input className="h-10 text-sm" placeholder="Ej: Protege tu familia con el mejor seguro del mercado" value={form.pitchOneLine} onChange={e => update('pitchOneLine', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Guión de venta</Label>
                <Textarea className="text-sm" rows={3} placeholder="Guión corto para que el vendedor use en su pitch..." value={form.pitchThreeLines} onChange={e => update('pitchThreeLines', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Audiencia objetivo</Label>
                  <Input className="h-10 text-sm" placeholder="Ej: Familias con hijos menores" value={form.targetAudience} onChange={e => update('targetAudience', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Cliente ideal</Label>
                  <Input className="h-10 text-sm" placeholder="Ej: Padres 30-45 años" value={form.idealClient} onChange={e => update('idealClient', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Problema que resuelve</Label>
                <Input className="h-10 text-sm" placeholder="Ej: Falta de protección financiera..." value={form.problemSolved} onChange={e => update('problemSolved', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Resultado prometido</Label>
                <Input className="h-10 text-sm" placeholder="Ej: Tranquilidad financiera total..." value={form.promisedResult} onChange={e => update('promisedResult', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Qué incluye</Label>
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    <Input className="h-8 text-sm" placeholder={`Beneficio ${i + 1}`} value={f}
                      onChange={e => { const nf = [...form.features]; nf[i] = e.target.value; update('features', nf); }} />
                    {form.features.length > 1 && (
                      <button onClick={() => update('features', form.features.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => update('features', [...form.features, ''])}>
                  <Plus className="w-3 h-3 mr-1" /> Agregar
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Objeciones y respuestas</Label>
                {form.objections.map((obj, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <Input className="h-8 text-sm" placeholder="Objeción..." value={obj.objection}
                      onChange={e => { const no = [...form.objections]; no[i] = { ...no[i], objection: e.target.value }; update('objections', no); }} />
                    <div className="flex items-center gap-2">
                      <Input className="h-8 text-sm" placeholder="Respuesta..." value={obj.response}
                        onChange={e => { const no = [...form.objections]; no[i] = { ...no[i], response: e.target.value }; update('objections', no); }} />
                      {form.objections.length > 1 && (
                        <button onClick={() => update('objections', form.objections.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => update('objections', [...form.objections, { objection: '', response: '' }])}>
                  <Plus className="w-3 h-3 mr-1" /> Agregar
                </Button>
              </div>
            </>
          )}

          {/* ═══ TRAINING ═══ */}
          {step === 'training' && (
            <>
              <div className="flex items-center gap-3">
                <Switch checked={form.requiresTraining} onCheckedChange={v => update('requiresTraining', v)} />
                <div>
                  <Label className="text-xs font-medium">Requiere entrenamiento</Label>
                  <p className="text-[10px] text-muted-foreground">Los vendedores deben completar la capacitación antes de vender</p>
                </div>
              </div>

              {form.requiresTraining && (
                <div className="space-y-4">
                  {/* Training type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Tipo de entrenamiento</Label>
                    <Select value={form.trainingType} onValueChange={v => update('trainingType', v)}>
                      <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <span className="flex items-center gap-1.5"><Video className="w-3 h-3" /> Video</span>
                        </SelectItem>
                        <SelectItem value="pdf">
                          <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> PDF / Documento</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upload content */}
                  {form.trainingType === 'video' ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">URL del video</Label>
                        <Input className="h-10 text-sm" placeholder="https://youtube.com/watch?v=... o URL de video" value={form.trainingVideoUrl} onChange={e => update('trainingVideoUrl', e.target.value)} />
                        <p className="text-[10px] text-muted-foreground">YouTube, Vimeo, o cualquier URL de video</p>
                      </div>
                      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toast.success("Selector de archivo abierto (demo)")}>
                        <Upload className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs font-medium text-foreground">Subir video</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">MP4, MOV hasta 500MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => { update('trainingPdfName', 'Capacitacion_producto.pdf'); toast.success("PDF subido (demo)"); }}>
                        <FileUp className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs font-medium text-foreground">Subir PDF</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">PDF hasta 50MB</p>
                      </div>
                      {form.trainingPdfName && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-xs text-foreground flex-1">{form.trainingPdfName}</span>
                          <button onClick={() => update('trainingPdfName', '')} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Training chapters */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Capítulos del entrenamiento</Label>
                    <p className="text-[10px] text-muted-foreground">El vendedor debe completar cada capítulo en orden para activar el producto</p>
                    {form.trainingChapters.map((ch, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <Input className="h-7 text-xs flex-1" value={ch.title}
                          onChange={e => { const nc = [...form.trainingChapters]; nc[i] = { ...nc[i], title: e.target.value }; update('trainingChapters', nc); }} />
                        <Select value={ch.type} onValueChange={v => { const nc = [...form.trainingChapters]; nc[i] = { ...nc[i], type: v as any }; update('trainingChapters', nc); }}>
                          <SelectTrigger className="w-24 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="reading">Lectura</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input className="w-16 h-7 text-[10px] text-center" value={ch.duration} placeholder="5 min"
                          onChange={e => { const nc = [...form.trainingChapters]; nc[i] = { ...nc[i], duration: e.target.value }; update('trainingChapters', nc); }} />
                        {form.trainingChapters.length > 1 && (
                          <button onClick={() => update('trainingChapters', form.trainingChapters.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                        )}
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => update('trainingChapters', [...form.trainingChapters, { title: '', type: 'video', duration: '5 min' }])}>
                      <Plus className="w-3 h-3 mr-1" /> Agregar capítulo
                    </Button>
                  </div>

                  {/* Quiz questions (if any chapter is quiz) */}
                  {form.trainingChapters.some(ch => ch.type === 'quiz') && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <Label className="text-xs font-medium">Preguntas del quiz</Label>
                      {form.trainingQuizQuestions.map((q, qi) => (
                        <div key={qi} className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground">P{qi + 1}</span>
                            <Input className="h-8 text-xs flex-1" placeholder="Pregunta..." value={q.question}
                              onChange={e => { const nq = [...form.trainingQuizQuestions]; nq[qi] = { ...nq[qi], question: e.target.value }; update('trainingQuizQuestions', nq); }} />
                            {form.trainingQuizQuestions.length > 1 && (
                              <button onClick={() => update('trainingQuizQuestions', form.trainingQuizQuestions.filter((_, j) => j !== qi))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                            )}
                          </div>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2 ml-6">
                              <button
                                onClick={() => { const nq = [...form.trainingQuizQuestions]; nq[qi] = { ...nq[qi], correctIndex: oi }; update('trainingQuizQuestions', nq); }}
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${q.correctIndex === oi ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}
                              >
                                {q.correctIndex === oi && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                              </button>
                              <Input className="h-7 text-[11px] flex-1" placeholder={`Opción ${oi + 1}`} value={opt}
                                onChange={e => { const nq = [...form.trainingQuizQuestions]; nq[qi] = { ...nq[qi], options: nq[qi].options.map((o, j) => j === oi ? e.target.value : o) }; update('trainingQuizQuestions', nq); }} />
                            </div>
                          ))}
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => update('trainingQuizQuestions', [...form.trainingQuizQuestions, { question: '', options: ['', '', ''], correctIndex: 0 }])}>
                        <Plus className="w-3 h-3 mr-1" /> Agregar pregunta
                      </Button>
                    </div>
                  )}

                  {/* Preview of what vendor will see */}
                  <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 space-y-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Vista previa del vendedor</p>
                    <p className="text-xs text-foreground">El vendedor verá {form.trainingChapters.length} capítulos que debe completar en orden.</p>
                    <p className="text-[10px] text-muted-foreground">Duración total estimada: {form.trainingChapters.reduce((a, ch) => a + (parseInt(ch.duration) || 0), 0)} min</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ CODES ═══ */}
          {step === 'codes' && (
            <>
              {currentCompanyPlan === 'enterprise' ? (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-center space-y-2">
                  <Zap className="w-6 h-6 text-primary mx-auto" />
                  <p className="text-xs font-medium text-foreground">Enterprise: Sincronización automática</p>
                  <p className="text-[10px] text-muted-foreground">Los códigos se sincronizan vía API.</p>
                </div>
              ) : (
                <>
                  {/* Code type selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Tipo de activación</Label>
                    <p className="text-[10px] text-muted-foreground">Elige qué se le entrega al cliente tras la compra</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { type: 'codes' as CodeType, label: 'Códigos', desc: 'Códigos alfanuméricos', icon: Key },
                        { type: 'links' as CodeType, label: 'Links', desc: 'URLs de acceso', icon: Link2 },
                        { type: 'credentials' as CodeType, label: 'Credenciales', desc: 'Usuario y contraseña', icon: UserCheck },
                      ]).map(opt => (
                        <button
                          key={opt.type}
                          onClick={() => update('codeType', opt.type)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            form.codeType === opt.type
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/30'
                          }`}
                        >
                          <opt.icon className={`w-4 h-4 mb-1.5 ${form.codeType === opt.type ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="text-xs font-medium text-foreground">{opt.label}</p>
                          <p className="text-[9px] text-muted-foreground">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                    <Key className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Ingresa mínimo <span className="font-semibold text-foreground">20</span>. Se entregan automáticamente al comprador.
                    </p>
                  </div>

                  {form.codeType === 'codes' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Códigos de activación (uno por línea)</Label>
                      <Textarea className="text-sm font-mono" rows={8} placeholder={"CODIGO-001\nCODIGO-002\nCODIGO-003\n..."} value={form.initialCodes} onChange={e => update('initialCodes', e.target.value)} />
                      <p className="text-[10px] text-muted-foreground">{getCodeCount()}/20 códigos</p>
                    </div>
                  )}

                  {form.codeType === 'links' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Links de acceso (uno por línea)</Label>
                      <Textarea className="text-sm font-mono" rows={8} placeholder={"https://app.ejemplo.com/activar/abc123\nhttps://app.ejemplo.com/activar/def456\n..."} value={form.initialCodes} onChange={e => update('initialCodes', e.target.value)} />
                      <p className="text-[10px] text-muted-foreground">{getCodeCount()}/20 links</p>
                    </div>
                  )}

                  {form.codeType === 'credentials' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Credenciales de acceso</Label>
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <p className="text-[10px] text-muted-foreground font-medium">Usuario</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Contraseña</p>
                        <div className="w-6" />
                      </div>
                      {form.initialCredentials.map((cred, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                          <Input className="h-8 text-xs font-mono" placeholder="usuario@email.com" value={cred.username}
                            onChange={e => { const nc = [...form.initialCredentials]; nc[i] = { ...nc[i], username: e.target.value }; update('initialCredentials', nc); }} />
                          <Input className="h-8 text-xs font-mono" placeholder="contraseña123" value={cred.password}
                            onChange={e => { const nc = [...form.initialCredentials]; nc[i] = { ...nc[i], password: e.target.value }; update('initialCredentials', nc); }} />
                          {form.initialCredentials.length > 1 && (
                            <button onClick={() => update('initialCredentials', form.initialCredentials.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                          )}
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => update('initialCredentials', [...form.initialCredentials, { username: '', password: '' }])}>
                        <Plus className="w-3 h-3 mr-1" /> Agregar credencial
                      </Button>
                      <p className="text-[10px] text-muted-foreground">{getCodeCount()}/20 credenciales</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ═══ NOTES ═══ */}
          {step === 'notes' && (
            <>
              <p className="text-xs text-muted-foreground">Agrega notas adicionales sobre el producto.</p>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notas para vendedores</Label>
                <Textarea className="text-sm" rows={4} placeholder="Información adicional que los vendedores deben saber..." value={form.additionalNotes} onChange={e => update('additionalNotes', e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Visible para los vendedores en la información del producto</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notas internas</Label>
                <Textarea className="text-sm" rows={3} placeholder="Notas privadas, solo visibles para tu equipo..." value={form.internalNotes} onChange={e => update('internalNotes', e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Solo visible para tu empresa, no se muestra a los vendedores</p>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleBack}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            {currentIdx === 0 ? 'Cancelar' : 'Anterior'}
          </Button>
          {isLast ? (
            <Button size="sm" className="text-xs" onClick={handleCreate}>
              <Check className="w-3.5 h-3.5 mr-1.5" /> Crear producto
            </Button>
          ) : (
            <Button size="sm" className="text-xs" onClick={handleNext}>
              Siguiente <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
