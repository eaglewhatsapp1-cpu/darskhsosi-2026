import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface GsapWrapperProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideRight' | 'slideLeft' | 'scaleIn' | 'bounce';
  delay?: number;
  duration?: number;
  stagger?: boolean;
  triggerOnScroll?: boolean;
}

const GsapWrapper: React.FC<GsapWrapperProps> = ({
  children,
  className,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.5,
  stagger = false,
  triggerOnScroll = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const getAnimationConfig = () => {
    const configs: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      slideUp: {
        from: { opacity: 0, y: 40 },
        to: { opacity: 1, y: 0 }
      },
      slideRight: {
        from: { opacity: 0, x: -40 },
        to: { opacity: 1, x: 0 }
      },
      slideLeft: {
        from: { opacity: 0, x: 40 },
        to: { opacity: 1, x: 0 }
      },
      scaleIn: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      },
      bounce: {
        from: { opacity: 0, y: -20, scale: 0.9 },
        to: { opacity: 1, y: 0, scale: 1 }
      }
    };
    return configs[animation] || configs.fadeIn;
  };

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const config = getAnimationConfig();
    const targets = stagger ? ref.current.children : ref.current;

    const animate = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      gsap.fromTo(
        targets,
        config.from,
        {
          ...config.to,
          duration,
          delay,
          stagger: stagger ? 0.1 : 0,
          ease: animation === 'bounce' ? 'elastic.out(1, 0.5)' : 'power3.out'
        }
      );
    };

    if (triggerOnScroll) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            animate();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    } else {
      animate();
    }

    return () => {
      gsap.killTweensOf(targets);
    };
  }, [animation, delay, duration, stagger, triggerOnScroll]);

  return (
    <div ref={ref} className={cn('gsap-theme-animate', className)}>
      {children}
    </div>
  );
};

export default GsapWrapper;
