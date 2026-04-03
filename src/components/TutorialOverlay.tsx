import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";

export interface TutorialStep {
  title: string;
  description: string;
  highlight?: string; // CSS selector hint (informational only)
}

interface TutorialOverlayProps {
  pageId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
}

export default function TutorialOverlay({ pageId, steps, onComplete }: TutorialOverlayProps) {
  const storageKey = `tutorial_completed_${pageId}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === "true");
  const [current, setCurrent] = useState(0);

  if (dismissed || steps.length === 0) return null;

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const isFirst = current === 0;
  const progress = ((current + 1) / steps.length) * 100;

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
    onComplete?.();
  };

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/20 bg-card overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                      Paso {current + 1} de {steps.length}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              onClick={handleComplete}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <button
              onClick={handleComplete}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Saltar tutorial
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1 px-2"
                  onClick={() => setCurrent(current - 1)}
                >
                  <ChevronLeft className="w-3 h-3" />
                  Anterior
                </Button>
              )}
              <Button
                size="sm"
                className="h-7 text-xs gap-1 px-3"
                onClick={() => {
                  if (isLast) handleComplete();
                  else setCurrent(current + 1);
                }}
              >
                {isLast ? "Finalizar" : "Siguiente"}
                {!isLast && <ChevronRight className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
