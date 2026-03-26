import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft, Package, Key, DollarSign, Users, BookOpen,
  Shield, Tag, RefreshCw, Zap, Check, AlertTriangle, Upload,
  Lightbulb, HelpCircle, Target, FileText, Globe, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { formatCOP, CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";

type Step = 'basics' | 'pricing' | 'training' | 'content' | 'codes';

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
    initialCodes: '',
    // Content / gig details
    pitchOneLine: '',
    pitchThreeLines: '',
    targetAudience: '',
    problemSolved: '',
    promisedResult: '',
    features: ['', '', ''],
    objections: [{ objection: '', response: '' }],
    idealClient: '',
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const steps: { id: Step; label: string; icon: React.ElementType }[] = [
    { id: 'basics', label: 'Producto', icon: Package },
    { id: 'pricing', label: 'Precio', icon: DollarSign },
    { id: 'content', label: 'Contenido', icon: Lightbulb },
    { id: 'training', label: 'Entrenamiento', icon: BookOpen },
    { id: 'codes', label: 'Códigos', icon: Key },
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

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Ingresa un nombre"); return; }
    const codeLines = form.initialCodes.split('\n').map(c => c.trim()).filter(Boolean);
    if (codeLines.length < 20 && currentCompanyPlan !== 'enterprise') {
      toast.error("Debes ingresar mínimo 20 códigos de activación");
      return;
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
    toast.success("Producto creado con " + codeLines.length + " códigos");
    navigate('/company/services');
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        {/* Back */}
        <button onClick={() => navigate('/company/services')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Mis Productos
        </button>

        <h1 className="text-xl font-bold text-foreground">Nuevo producto</h1>

        {/* Step indicators */}
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
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

              {/* Live preview */}
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

              {/* Features */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Qué incluye</Label>
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    <Input
                      className="h-8 text-sm"
                      placeholder={`Beneficio ${i + 1}`}
                      value={f}
                      onChange={e => {
                        const newFeatures = [...form.features];
                        newFeatures[i] = e.target.value;
                        update('features', newFeatures);
                      }}
                    />
                    {form.features.length > 1 && (
                      <button onClick={() => update('features', form.features.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => update('features', [...form.features, ''])}>
                  <Plus className="w-3 h-3 mr-1" /> Agregar beneficio
                </Button>
              </div>

              {/* Objections */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Objeciones comunes y respuestas</Label>
                {form.objections.map((obj, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <Input className="h-8 text-sm" placeholder="Objeción..." value={obj.objection}
                      onChange={e => {
                        const newObj = [...form.objections];
                        newObj[i] = { ...newObj[i], objection: e.target.value };
                        update('objections', newObj);
                      }} />
                    <div className="flex items-center gap-2">
                      <Input className="h-8 text-sm" placeholder="Respuesta..." value={obj.response}
                        onChange={e => {
                          const newObj = [...form.objections];
                          newObj[i] = { ...newObj[i], response: e.target.value };
                          update('objections', newObj);
                        }} />
                      {form.objections.length > 1 && (
                        <button onClick={() => update('objections', form.objections.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => update('objections', [...form.objections, { objection: '', response: '' }])}>
                  <Plus className="w-3 h-3 mr-1" /> Agregar objeción
                </Button>
              </div>
            </>
          )}

          {step === 'training' && (
            <>
              <div className="flex items-center gap-3">
                <Switch checked={form.requiresTraining} onCheckedChange={v => update('requiresTraining', v)} />
                <div>
                  <Label className="text-xs font-medium">Requiere entrenamiento</Label>
                  <p className="text-[10px] text-muted-foreground">Los vendedores deben completar el entrenamiento antes de vender</p>
                </div>
              </div>

              {form.requiresTraining && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tipo de entrenamiento</Label>
                  <Select value={form.trainingType} onValueChange={v => update('trainingType', v)}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Video</span>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> PDF / Documento</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">Puedes subir el contenido después de crear el producto</p>
                </div>
              )}
            </>
          )}

          {step === 'codes' && (
            <>
              {currentCompanyPlan === 'enterprise' ? (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-center space-y-2">
                  <Zap className="w-6 h-6 text-primary mx-auto" />
                  <p className="text-xs font-medium text-foreground">Enterprise: Sincronización automática</p>
                  <p className="text-[10px] text-muted-foreground">Los códigos se sincronizan vía API. No necesitas cargarlos manualmente.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                    <Key className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Ingresa mínimo <span className="font-semibold text-foreground">20 códigos</span>. Se entregan automáticamente al comprador tras la venta.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Códigos de activación (uno por línea)</Label>
                    <Textarea
                      className="text-sm font-mono"
                      rows={8}
                      placeholder={"CODIGO-001\nCODIGO-002\nCODIGO-003\n..."}
                      value={form.initialCodes}
                      onChange={e => update('initialCodes', e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {form.initialCodes.split('\n').filter(c => c.trim()).length}/20 códigos ingresados
                    </p>
                  </div>
                </>
              )}
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
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
