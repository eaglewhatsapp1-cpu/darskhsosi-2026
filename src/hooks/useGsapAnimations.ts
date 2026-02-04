import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Stagger reveal animation for lists and grids
export const useStaggerReveal = (
  selector: string,
  delay: number = 0.1,
  duration: number = 0.5,
  stagger: number = 0.08
) => {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    hasAnimated.current = true;

    const tween = gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 30,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        stagger,
        delay,
        ease: 'power3.out'
      }
    );

    return () => {
      tween.kill();
    };
  }, [selector, delay, duration, stagger]);
};

// Magnetic hover effect
export const useMagneticHover = (ref: React.RefObject<HTMLElement | null>, strength: number = 0.3) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(element);
    };
  }, [strength]);
};

// Page transition animation
export const usePageTransition = (ref: React.RefObject<HTMLElement | null>) => {
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    hasAnimated.current = true;

    const tween = gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 20,
        scale: 0.98
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out'
      }
    );

    return () => {
      tween.kill();
    };
  }, []);
};

// Floating animation for decorative elements
export const useFloatingAnimation = (
  ref: React.RefObject<HTMLElement | null>,
  yAmount: number = 10,
  duration: number = 2,
  delay: number = 0
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tween = gsap.to(element, {
      y: yAmount,
      duration,
      delay,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    return () => {
      tween.kill();
    };
  }, [yAmount, duration, delay]);
};

// Glow pulse animation
export const useGlowPulse = (ref: React.RefObject<HTMLElement | null>, color: string = 'hsl(27 95% 60%)') => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tween = gsap.to(element, {
      boxShadow: `0 0 30px ${color.replace(')', ' / 0.5)')}`,
      duration: 1.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    return () => {
      tween.kill();
    };
  }, [color]);
};

// Text reveal animation
export const useTextReveal = (ref: React.RefObject<HTMLElement | null>) => {
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    hasAnimated.current = true;
    const text = element.textContent || '';
    element.innerHTML = '';
    
    const chars = text.split('').map((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      element.appendChild(span);
      return span;
    });

    const tween = gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.05,
      stagger: 0.03,
      ease: 'power2.out',
      delay: 0.2
    });

    return () => {
      tween.kill();
    };
  }, []);
};

// Scroll-triggered animation
export const useScrollAnimation = (
  ref: React.RefObject<HTMLElement | null>,
  threshold: number = 0.1
) => {
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            gsap.fromTo(
              element,
              {
                opacity: 0,
                y: 50
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out'
              }
            );
            observer.unobserve(element);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(element);
    };
  }, [threshold]);
};

// Button press animation
export const animateButtonPress = (element: HTMLElement) => {
  gsap.timeline()
    .to(element, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in'
    })
    .to(element, {
      scale: 1,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)'
    });
};

// Ripple effect
export const createRipple = (e: React.MouseEvent<HTMLElement>, color: string = 'hsl(var(--primary) / 0.3)') => {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    transform: scale(0);
    pointer-events: none;
    left: ${e.clientX - rect.left - size / 2}px;
    top: ${e.clientY - rect.top - size / 2}px;
  `;
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  gsap.to(ripple, {
    scale: 2,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => ripple.remove()
  });
};
