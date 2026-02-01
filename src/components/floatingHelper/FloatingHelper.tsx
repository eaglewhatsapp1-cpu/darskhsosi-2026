import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FloatingHelperProps, SpotlightPosition, HelpStep } from './types';
import { gettingStartedSteps, getContextualTips } from './helpSteps';
import Spotlight from './Spotlight';
import HelperCard from './HelperCard';

const FloatingHelper: React.FC<FloatingHelperProps> = ({ 
  language, 
  currentFeature,
  onNavigate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenHelper, setHasSeenHelper] = useState(false);
  const [targetPosition, setTargetPosition] = useState<SpotlightPosition | null>(null);

  // Check if user has seen the helper before
  useEffect(() => {
    const seen = localStorage.getItem('floatingHelperSeen');
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
    setHasSeenHelper(true);
  }, []);

  // Get current steps based on whether user has seen helper
  const steps: HelpStep[] = hasSeenHelper ? getContextualTips(currentFeature) : gettingStartedSteps;

  // Reset step when feature changes
  useEffect(() => {
    setCurrentStep(0);
  }, [currentFeature]);

  // Find and highlight target element
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !steps[currentStep]?.targetSelector) {
      setTargetPosition(null);
      return;
    }

    const selector = steps[currentStep].targetSelector;
    const element = document.querySelector(selector as string);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    } else {
      setTargetPosition(null);
    }
  }, [isOpen, currentStep, steps]);

  // Update position on open/step change and scroll
  useEffect(() => {
    updateTargetPosition();
    
    window.addEventListener('scroll', updateTargetPosition, true);
    window.addEventListener('resize', updateTargetPosition);
    
    return () => {
      window.removeEventListener('scroll', updateTargetPosition, true);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [updateTargetPosition]);

  const handleClose = () => {
    setIsOpen(false);
    setTargetPosition(null);
    localStorage.setItem('floatingHelperSeen', 'true');
    setHasSeenHelper(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.targetFeature && onNavigate) {
      onNavigate(step.targetFeature);
      handleClose();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-110",
          language === 'ar' ? 'left-4 bottom-4' : 'right-4 bottom-4'
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <HelpCircle className="w-6 h-6 text-primary-foreground animate-pulse" />
        )}
      </Button>

      {/* Spotlight Overlay */}
      <Spotlight 
        position={targetPosition} 
        isVisible={isOpen && !!steps[currentStep]?.targetSelector} 
      />

      {/* Helper Card */}
      {isOpen && (
        <HelperCard
          language={language}
          steps={steps}
          currentStep={currentStep}
          targetPosition={targetPosition}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
          onAction={handleAction}
        />
      )}
    </>
  );
};

export default FloatingHelper;
