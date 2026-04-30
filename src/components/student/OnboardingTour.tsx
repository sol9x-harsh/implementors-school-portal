"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Sparkles, Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_STEPS = [
  {
    title: "Welcome to Sol9x Portal",
    description: "Your digital academic portfolio. Let's take a quick 3-step tour to help you get started.",
    icon: Sparkles,
  },
  {
    title: "Activities Hub",
    description: "Head to 'Activities' in the sidebar to discover opportunities, events, and extra-curriculars to join.",
    icon: Activity,
  },
  {
    title: "Pending Forms",
    description: "Keep an eye on the Dashboard for urgent forms and institutional requests that need your response.",
    icon: FileText,
  },
];

export function OnboardingTour() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenTour = localStorage.getItem("sol9x_tour_completed");
    if (!hasSeenTour) {
      // Delay slightly so it doesn't jarringly pop up immediately
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("sol9x_tour_completed", "true");
  };

  if (!mounted) return null;

  const currentStep = TOUR_STEPS[step];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 w-[320px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-purple-border/30 overflow-hidden"
        >
          {/* Accent Header */}
          <div className="h-1.5 w-full bg-purple-gradient" />
          
          <div className="p-6 relative">
            <button 
              onClick={handleComplete}
              className="absolute top-4 right-4 text-purple-muted-foreground/50 hover:text-purple-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-secondary/50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-purple-primary" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-sm font-heading font-black text-purple-foreground">
                  {currentStep.title}
                </h3>
                <p className="text-[13px] font-medium text-purple-muted-foreground leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-purple-border/10">
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-4 bg-purple-primary" : "w-1.5 bg-purple-secondary"}`}
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={handleNext}
                  className="h-8 rounded-xl bg-purple-primary text-white text-[11px] font-black uppercase tracking-widest gap-1.5 px-4"
                >
                  {step === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
