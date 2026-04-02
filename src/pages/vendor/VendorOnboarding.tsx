import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, DollarSign, Sparkles } from "lucide-react";
import logoMensualista from "@/assets/logo.png";

const steps = [
  {
    icon: Sparkles,
    title: "Bienvenido a Mensualista",
    subtitle: "Vas a empezar a ganar comisiones vendiendo servicios de empresas reales. Te explicamos cómo en 3 pasos.",
    hasVideo: true,
  },
  {
    icon: BookOpen,
    title: "Explora servicios",
    subtitle: "Navega por nuestro catálogo de empresas y elige los servicios que quieras vender. Cada uno tiene su propia comisión.",
    hasVideo: false,
  },
  {
    icon: Play,
    title: "Capacítate y aprueba",
    subtitle: "Antes de vender, completa un entrenamiento y aprueba un quiz con mínimo 85%. Tienes 3 intentos por mes.",
    hasVideo: false,
  },
  {
    icon: DollarSign,
    title: "Vende y gana",
    subtitle: "Cuando consigas un cliente, registra la venta en la plataforma. Se genera un link de pago y ganas tu comisión automáticamente.",
    hasVideo: false,
  },
];

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const isLast = current === steps.length - 1;
  const step = steps[current];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Logo */}
            <div className="flex justify-center">
              <img src={logoMensualista} alt="Mensualista" className="w-12 h-12 object-contain" />
            </div>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{step.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{step.subtitle}</p>
            </div>

            {/* Video placeholder (step 1 only) */}
            {step.hasVideo && (
              <div className="rounded-2xl border border-border bg-muted/30 aspect-video flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary ml-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground">Cómo funciona Mensualista (2 min)</p>
                </div>
              </div>
            )}

            {/* Dots */}
            <div className="flex items-center justify-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? "w-6 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-sm font-semibold"
                onClick={() => {
                  if (isLast) navigate("/vendor/home");
                  else setCurrent(current + 1);
                }}
              >
                {isLast ? "Empezar a explorar" : "Siguiente"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {!isLast && (
                <button
                  onClick={() => navigate("/vendor/home")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Saltar
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
