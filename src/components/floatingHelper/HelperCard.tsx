import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HelpStep, SpotlightPosition } from './types';

interface HelperCardProps {
  language: 'ar' | 'en';
  steps: HelpStep[];
  currentStep: number;
  targetPosition: SpotlightPosition | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAction: () => void;
}

const HelperCard: React.FC<HelperCardProps> = ({
  language,
  steps,
  currentStep,
  targetPosition,
  onClose,
  onNext,
  onPrev,
  onAction
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const step = steps[currentStep];

  // GSAP entrance animation
  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { 
          opacity: 0, 
          scale: 0.8, 
          y: 20 
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.4, 
          ease: 'back.out(1.7)' 
        }
      );
    });

    return () => ctx.revert();
  }, [currentStep]);

  // Calculate card position based on target element and preferred position
  const getCardStyle = (): React.CSSProperties => {
    if (!targetPosition || step.position === 'center') {
      // Center in viewport
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50
      };
    }

    const cardWidth = 320;
    const cardHeight = 220;
    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = Math.max(padding, targetPosition.top - cardHeight - padding);
        left = targetPosition.left + (targetPosition.width - cardWidth) / 2;
        break;
      case 'bottom':
        top = Math.min(viewportHeight - cardHeight - padding, targetPosition.top + targetPosition.height + padding);
        left = targetPosition.left + (targetPosition.width - cardWidth) / 2;
        break;
      case 'left':
        top = targetPosition.top + (targetPosition.height - cardHeight) / 2;
        left = Math.max(padding, targetPosition.left - cardWidth - padding);
        break;
      case 'right':
        top = targetPosition.top + (targetPosition.height - cardHeight) / 2;
        left = Math.min(viewportWidth - cardWidth - padding, targetPosition.left + targetPosition.width + padding);
        break;
      default:
        top = targetPosition.top + targetPosition.height + padding;
        left = targetPosition.left;
    }

    // Ensure card stays within viewport
    left = Math.max(padding, Math.min(viewportWidth - cardWidth - padding, left));
    top = Math.max(padding, Math.min(viewportHeight - cardHeight - padding, top));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 50,
      transition: 'all 0.3s ease-in-out'
    };
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "w-80 shadow-2xl gsap-theme-animate",
        "bg-card/95 backdrop-blur-lg border-primary/20"
      )}
      style={getCardStyle()}
      dir={dir}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step.icon}
            <CardTitle className="text-base">
              {step.title[language]}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description[language]}
        </p>

        {/* Action Button */}
        {step.action && (
          <Button 
            onClick={onAction}
            className="w-full bg-primary hover:bg-primary/90"
            size="sm"
          >
            {step.action[language]}
          </Button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            {language === 'ar' ? (
              <>
                <ChevronRight className="w-4 h-4" />
                السابق
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                Previous
              </>
            )}
          </Button>
          
          {/* Step Indicators */}
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            className="gap-1"
          >
            {currentStep === steps.length - 1 ? (
              language === 'ar' ? 'إنهاء' : 'Finish'
            ) : language === 'ar' ? (
              <>
                التالي
                <ChevronLeft className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelperCard;
