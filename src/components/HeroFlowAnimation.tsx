import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Check, Building2, User, Zap, CreditCard, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Service data that alternates
const services = [
  { name: "Poliza.ai", category: "IA Seguros", price: "$ 179.000", commission: "20%", initial: "P", commissionValue: "$ 35.800" },
  { name: "LexIA", category: "IA Legal", price: "$ 249.000", commission: "18%", initial: "L", commissionValue: "$ 44.820" },
];

// Count-up hook
const useCountUp = (start: number, end: number, duration: number = 1500, trigger: boolean) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!trigger) {
      setCount(start);
      return;
    }
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(start + (end - start) * eased));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [start, end, duration, trigger]);

  return count;
};

const formatCOP = (value: number) => {
  return `$ ${value.toLocaleString('es-CO')}`;
};

// Step indicator component
const StepIndicator = ({ step, label, isActive, isComplete }: { step: number; label: string; isActive: boolean; isComplete: boolean }) => (
  <div className={`flex items-center gap-2 transition-all duration-300 ${isActive || isComplete ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`
      w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
      ${isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
    `}>
      {isComplete ? <Check className="w-4 h-4" /> : step}
    </div>
    <span className={`text-xs font-medium ${isActive || isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </div>
);

export const HeroFlowAnimation = () => {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [salesCount, setSalesCount] = useState(0);

  const currentService = services[serviceIndex];
  const commissionCount = useCountUp(1280000, 1350000, 1500, phase >= 4);

  // Manual navigation
  const goToStep = useCallback((step: number) => {
    setIsManual(true);
    setIsPaused(true);
    
    if (step === 1) {
      setPhase(1);
      setSalesCount(0);
    } else if (step === 2) {
      setPhase(2);
      setSalesCount(0);
    } else if (step === 3) {
      setPhase(3);
      setSalesCount(1);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (phase < 1) goToStep(1);
    else if (phase < 2) goToStep(2);
    else if (phase < 3) goToStep(3);
    else {
      // Reset to beginning with next service
      setServiceIndex(prev => (prev + 1) % services.length);
      goToStep(1);
    }
  }, [phase, goToStep]);

  const prevStep = useCallback(() => {
    if (phase >= 3) goToStep(2);
    else if (phase >= 2) goToStep(1);
    else {
      // Go to last step of previous service
      setServiceIndex(prev => (prev - 1 + services.length) % services.length);
      goToStep(3);
    }
  }, [phase, goToStep]);

  // Resume auto-play after 10s of inactivity
  useEffect(() => {
    if (!isManual) return;
    
    const resumeTimer = setTimeout(() => {
      setIsManual(false);
      setIsPaused(false);
    }, 10000);

    return () => clearTimeout(resumeTimer);
  }, [isManual, phase]);

  // Animation timeline
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const timeline = [
      { time: 0, phase: 0 },
      { time: 500, phase: 1 },    // Step 1: Company publishes service
      { time: 3500, phase: 2 },   // Step 2: Vendor activates (3s duration)
      { time: 7000, phase: 3 },   // Step 3: Sale happens (3.5s duration)
      { time: 10000, phase: 4 },  // Commission earned (3s duration)
      { time: 12500, phase: 5 },  // Reset transition (2.5s duration)
    ];

    let timers: NodeJS.Timeout[] = [];

    const runTimeline = () => {
      setSalesCount(0);
      timers = timeline.map(({ time, phase: p }) =>
        setTimeout(() => {
          setPhase(p);
          if (p === 3) setSalesCount(1);
          if (p === 4) setSalesCount(2);
        }, time)
      );

      // Switch service and restart
      timers.push(setTimeout(() => {
        setServiceIndex(prev => (prev + 1) % services.length);
        setPhase(0);
      }, 14000));
    };

    runTimeline();

    const loopTimer = setInterval(() => {
      timers.forEach(clearTimeout);
      runTimeline();
    }, 14000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loopTimer);
    };
  }, [prefersReducedMotion, isPaused, serviceIndex]);

  // Static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator step={1} label="Empresa publica" isActive={false} isComplete={true} />
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <StepIndicator step={2} label="Vendedor activa" isActive={false} isComplete={true} />
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <StepIndicator step={3} label="Venta y comisión" isActive={true} isComplete={false} />
          </div>
          
          <div className="p-6 rounded-2xl bg-background border border-border shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-lg">
                {currentService.initial}
              </div>
              <div>
                <p className="font-semibold text-lg">{currentService.name}</p>
                <p className="text-sm text-muted-foreground">{currentService.category}</p>
              </div>
              <div className="ml-8 text-right">
                <p className="text-xs text-muted-foreground">Tu comisión</p>
                <p className="text-2xl font-bold text-green-500">{currentService.commissionValue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Step Progress Indicator with Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 sm:gap-3 mb-8"
      >
        {/* Previous Button */}
        <button
          onClick={prevStep}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors border border-border"
          aria-label="Paso anterior"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          <button onClick={() => goToStep(1)}>
            <StepIndicator step={1} label="Elige el servicio" isActive={phase === 1} isComplete={phase > 1} />
          </button>
          <motion.div 
            animate={{ opacity: phase >= 1 ? 1 : 0.3 }}
            className="hidden sm:block"
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </motion.div>
          <button onClick={() => goToStep(2)}>
            <StepIndicator step={2} label="Actívalo" isActive={phase === 2} isComplete={phase > 2} />
          </button>
          <motion.div 
            animate={{ opacity: phase >= 2 ? 1 : 0.3 }}
            className="hidden sm:block"
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </motion.div>
          <button onClick={() => goToStep(3)}>
            <StepIndicator step={3} label="¡Vende y Comisióna!" isActive={phase >= 3} isComplete={phase > 4} />
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={nextStep}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors border border-border"
          aria-label="Siguiente paso"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </motion.div>

      {/* Main Animation Container */}
      <div className="relative h-64 sm:h-72 flex items-center justify-center">
        
        {/* Phase 1 & 2: Service Card with Actors */}
        <AnimatePresence mode="wait">
          {phase >= 1 && phase < 3 && (
            <motion.div
              key="service-phase"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="flex items-center gap-4 sm:gap-8"
            >
              {/* Company */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border shadow-lg">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Empresa</span>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.div>

              {/* Service Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative p-5 sm:p-6 rounded-2xl bg-background border border-border shadow-xl min-w-[200px] sm:min-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {currentService.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-base sm:text-lg">{currentService.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{currentService.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-border/50 pt-3">
                  <span className="text-muted-foreground">{currentService.price}</span>
                  <span className="font-bold text-primary">{currentService.commission} comisión</span>
                </div>

                {/* Training badge */}
                <AnimatePresence>
                  {phase >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg whitespace-nowrap"
                    >
                      <Check className="w-3 h-3" />
                      Capacitación ✓
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0, scaleX: phase >= 2 ? 1 : 0 }}
                transition={{ delay: 0.2 }}
              >
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.div>

              {/* Vendor */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: phase >= 2 ? 1 : 0.3, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
                  phase >= 2 ? 'bg-primary/10 border-primary/50' : 'bg-muted border-border'
                }`}>
                  <User className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${phase >= 2 ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Vendedor</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3 & 4: SALE ANIMATION - Big and Clear */}
        <AnimatePresence mode="wait">
          {phase >= 3 && phase < 5 && (
            <motion.div
              key="sale-phase"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            >
              {/* Big Sale Notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-green-500/20"
                />
                
                <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <ShoppingCart className="w-7 h-7" />
                    </motion.div>
                    <div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl font-bold"
                      >
                        ¡VENTA CONFIRMADA!
                      </motion.p>
                      <p className="text-white/80 text-sm">{currentService.name} - {currentService.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div>
                      <p className="text-white/70 text-xs">Precio del servicio</p>
                      <p className="font-semibold">{currentService.price} COP</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="text-right"
                    >
                      <p className="text-white/70 text-xs">TU COMISIÓN</p>
                      <p className="text-2xl sm:text-3xl font-bold">{currentService.commissionValue}</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Commission Status */}
              <AnimatePresence>
                {phase >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                    >
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Pago automático programado</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted"
                    >
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Comisiones del mes:</span>
                      <span className="font-bold text-green-500">{formatCOP(commissionCount)}</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sales counter badge */}
        <AnimatePresence>
          {salesCount > 0 && phase < 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-0 right-4 sm:right-8"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg">
                <ShoppingCart className="w-4 h-4" />
                {salesCount} venta{salesCount > 1 ? 's' : ''} hoy
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroFlowAnimation;
