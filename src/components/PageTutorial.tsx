import { useState } from "react";
import { X, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageTutorialProps {
  pageId: string;
  title: string;
  description: string;
  steps?: string[];
}

export default function PageTutorial({ pageId, title, description, steps }: PageTutorialProps) {
  const storageKey = `tutorial_seen_${pageId}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true');
  const [showAgain, setShowAgain] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  const handleShowAgain = () => {
    setShowAgain(false);
    setDismissed(false);
    localStorage.removeItem(storageKey);
  };

  if (dismissed && !showAgain) {
    return (
      <button
        onClick={handleShowAgain}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <RotateCcw className="w-3 h-3" />
        Ver tutorial
      </button>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border border-primary/20 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {steps && steps.length > 0 && (
            <ul className="space-y-1 mt-2">
              {steps.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          )}
          <Button size="sm" variant="outline" onClick={handleDismiss} className="mt-2">
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
