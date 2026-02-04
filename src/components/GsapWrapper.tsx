import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface GsapWrapperProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideRight' | 'slideLeft' | 'scaleIn' | 'bounce';
  delay?: number;
  duration?: number;
}

const GsapWrapper: React.FC<GsapWrapperProps> = ({
  children,
  className,
  animation = 'fadeIn',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationClass = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-fade-in',
    slideRight: 'animate-fade-in',
    slideLeft: 'animate-fade-in',
    scaleIn: 'animate-scale-in',
    bounce: 'animate-scale-in'
  }[animation];

  return (
    <div 
      className={cn(
        'gsap-theme-animate transition-all duration-500',
        isVisible ? animationClass : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GsapWrapper;
