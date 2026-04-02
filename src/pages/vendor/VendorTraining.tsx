import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, BookOpen, Play, FileText, Check, Lock,
  ChevronRight, Clock, CheckCircle2, AlertCircle, Package
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { CURRENT_VENDOR_ID } from "@/data/mockData";
import { trainingContents } from "@/data/trainingContent";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Quiz questions per service (mock)
const quizQuestions: Record<string, QuizQuestion[]> = {};

function getQuizForService(serviceId: string): QuizQuestion[] {
  if (quizQuestions[serviceId]) return quizQuestions[serviceId];
  // Generate default quiz
  return [
    {
      question: "¿Cuál es el primer paso al presentar este producto a un prospecto?",
      options: ["Mostrar el precio", "Identificar el dolor del cliente", "Enviar el brochure", "Pedir datos de contacto"],
      correctIndex: 1
    },
    {
      question: "¿Qué debes hacer si el cliente dice 'es muy caro'?",
      options: ["Ofrecer descuento", "Comparar con el costo de no tener el producto (ROI)", "Insistir en el precio", "Terminar la conversación"],
      correctIndex: 1
    },
    {
      question: "¿Cuándo debes mencionar la garantía de devolución?",
      options: ["Nunca", "Solo si preguntan", "Al inicio de la conversación", "Después de firmar"],
      correctIndex: 2
    },
    {
      question: "¿Cuál es la mejor forma de hacer una demo?",
      options: ["Enviar un PDF genérico", "Usar un caso real del prospecto en vivo", "Mostrar screenshots", "Leer las características"],
      correctIndex: 1
    },
    {
      question: "¿Qué hacer después de una demo si no cierra la venta?",
      options: ["Olvidar al prospecto", "Seguimiento a las 48 horas", "Llamar cada día", "Bajar el precio"],
      correctIndex: 1
    },
  ];
}

export default function VendorTraining() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { trainingProgress, completeTraining, services, currentVendorId } = useDemo();

  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const service = services.find(s => s.id === serviceId);
  const content = serviceId ? trainingContents[serviceId] : null;
  const progress = trainingProgress.find(tp => tp.vendorId === vendorId && tp.serviceId === serviceId);

  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  if (!service || !content) {
    return (
      <VendorTabLayout backTo="/vendor" backLabel="Volver">
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Entrenamiento no encontrado</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver
          </Button>
        </div>
      </VendorTabLayout>
    );
  }

  const isAlreadyComplete = progress?.status === 'declared_completed';
  const chapters = content.chapters;
  const chapter = chapters[currentChapter];
  const allChaptersCompleted = completedChapters.size >= chapters.length;
  const quiz = getQuizForService(serviceId!);
  const passingScore = Math.ceil(quiz.length * 0.85);

  const markChapterComplete = () => {
    const next = new Set(completedChapters);
    next.add(currentChapter);
    setCompletedChapters(next);

    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
    toast.success(`Sección ${currentChapter + 1} completada`);
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);

    if (correct >= passingScore) {
      // Mark training as complete
      if (serviceId) {
        completeTraining(vendorId, serviceId);
      }
      toast.success("Aprobaste el quiz. Producto desbloqueado para venta.");
    } else {
      toast.error(`Necesitas ${passingScore}/${quiz.length} para aprobar. Obtuviste ${correct}/${quiz.length}.`);
    }
  };

  const retryQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const progressPct = isAlreadyComplete ? 100 : Math.round((completedChapters.size / chapters.length) * 100);

  return (
    <VendorTabLayout backTo={`/vendor/services/${serviceId}`} backLabel={service.name}>
      <div className="space-y-5">
        {/* Header */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-bold text-foreground">{content.title}</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">{content.totalDuration} · {chapters.length} secciones</p>
            </div>
            {isAlreadyComplete && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completada
              </Badge>
            )}
          </div>
          <Progress value={progressPct} className="h-1.5" />
          <p className="text-[9px] text-muted-foreground mt-1">{progressPct}% completado</p>
        </div>

        {!showQuiz ? (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
            {/* Chapter navigation */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Contenido</p>
              </div>
              <div className="divide-y divide-border">
                {chapters.map((ch, i) => {
                  const isActive = i === currentChapter;
                  const isDone = completedChapters.has(i) || isAlreadyComplete;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setCurrentChapter(i)}
                      className={`w-full text-left p-3 flex items-start gap-2 transition-colors ${
                        isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isDone ? <Check className="w-2.5 h-2.5" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-medium leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {ch.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-2 h-2 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground">{ch.duration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {/* Quiz entry */}
                <button
                  onClick={() => allChaptersCompleted || isAlreadyComplete ? setShowQuiz(true) : null}
                  className={`w-full text-left p-3 flex items-start gap-2 transition-colors ${
                    !allChaptersCompleted && !isAlreadyComplete ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/50'
                  } border-l-2 border-l-transparent`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isAlreadyComplete ? 'bg-emerald-500 text-white' : 'bg-amber-500/20 text-amber-600'
                  }`}>
                    {isAlreadyComplete ? <Check className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground">Evaluación final</p>
                    <p className="text-[9px] text-muted-foreground">85% para aprobar</p>
                  </div>
                  {!allChaptersCompleted && !isAlreadyComplete && <Lock className="w-3 h-3 text-muted-foreground ml-auto mt-1" />}
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Sección {currentChapter + 1} de {chapters.length}
                </p>
                <h2 className="text-sm font-semibold text-foreground mt-0.5">{chapter.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-[9px]">
                    <Clock className="w-2.5 h-2.5 mr-0.5" /> {chapter.duration}
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">
                    {chapter.type === 'video' ? <Play className="w-2.5 h-2.5 mr-0.5" /> : <FileText className="w-2.5 h-2.5 mr-0.5" />}
                    {chapter.type === 'video' ? 'Video' : 'Lectura'}
                  </Badge>
                </div>
              </div>

              {chapter.type === 'video' && (
                <div className="aspect-video bg-muted/50 flex items-center justify-center border-b border-border">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Play className="w-7 h-7 text-primary ml-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">Video de entrenamiento</p>
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="prose prose-sm max-w-none">
                  {chapter.content.split('\n\n').map((para, i) => (
                    <p key={i} className="text-xs text-foreground leading-relaxed mb-3 last:mb-0">
                      {para.split('\n').map((line, j) => (
                        <span key={j}>{line}{j < para.split('\n').length - 1 && <br />}</span>
                      ))}
                    </p>
                  ))}
                </div>

                {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                  <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Puntos clave</p>
                    <ul className="space-y-1">
                      {chapter.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground">
                          <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Mark complete button */}
              {!completedChapters.has(currentChapter) && !isAlreadyComplete && (
                <div className="p-4 border-t border-border">
                  <Button className="w-full h-10 text-xs font-semibold rounded-xl" onClick={markChapterComplete}>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Marcar como completada
                    {currentChapter < chapters.length - 1 && " y siguiente"}
                  </Button>
                </div>
              )}
              {completedChapters.has(currentChapter) && !isAlreadyComplete && (
                <div className="p-4 border-t border-border text-center">
                  <p className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sección completada
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Quiz */
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Evaluación final</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Necesitas {passingScore} de {quiz.length} respuestas correctas (85%) para desbloquear este producto.
              </p>
            </div>

            <div className="p-4 space-y-5">
              {quiz.map((q, qi) => (
                <div key={qi} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi;
                      const isCorrect = q.correctIndex === oi;
                      let cls = 'border-border hover:border-primary/30 hover:bg-primary/5';
                      if (quizSubmitted) {
                        if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/5';
                        else if (selected && !isCorrect) cls = 'border-destructive/50 bg-destructive/5';
                      } else if (selected) {
                        cls = 'border-primary bg-primary/5';
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                          disabled={quizSubmitted}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${cls}`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + oi)}.</span> {opt}
                          {quizSubmitted && isCorrect && <Check className="w-3 h-3 text-emerald-600 inline ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!quizSubmitted ? (
                <Button
                  className="w-full h-10 text-xs font-semibold rounded-xl"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < quiz.length}
                >
                  Enviar respuestas
                </Button>
              ) : (
                <div className="rounded-xl border p-4 text-center space-y-3">
                  <p className={`text-lg font-bold ${quizScore >= passingScore ? 'text-emerald-600' : 'text-destructive'}`}>
                    {quizScore}/{quiz.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {quizScore >= passingScore
                      ? 'Aprobaste. Ya puedes vender este producto.'
                      : `No alcanzaste el mínimo de ${passingScore}. Repasa el contenido e intenta de nuevo.`}
                  </p>
                  {quizScore >= passingScore ? (
                    <Button size="sm" className="rounded-xl" onClick={() => navigate(`/vendor/services/${serviceId}`)}>
                      Ir al producto
                    </Button>
                  ) : (
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setShowQuiz(false); setCurrentChapter(0); }}>
                        Repasar contenido
                      </Button>
                      <Button size="sm" className="rounded-xl" onClick={retryQuiz}>
                        Reintentar quiz
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips section */}
        {!showQuiz && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.salesTips.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Tips de venta</p>
                <ul className="space-y-1.5">
                  {content.salesTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground">
                      <ChevronRight className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {content.commonMistakes.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Errores comunes</p>
                <ul className="space-y-1.5">
                  {content.commonMistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground">
                      <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Final CTA */}
        {allChaptersCompleted && !showQuiz && !isAlreadyComplete && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-center space-y-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mx-auto" />
            <p className="text-sm font-semibold">Contenido completado</p>
            <p className="text-xs text-muted-foreground">Realiza la evaluación final para desbloquear este producto.</p>
            <Button className="rounded-xl" onClick={() => setShowQuiz(true)}>
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Iniciar evaluación
            </Button>
          </div>
        )}
      </div>
    </VendorTabLayout>
  );
}
