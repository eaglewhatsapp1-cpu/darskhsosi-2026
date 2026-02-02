import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import gsap from 'gsap';

export const useGsapTheme = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isAnimating = useRef(false);
  const previousTheme = useRef<string | undefined>(undefined);

  // Animate theme transition
  const animateThemeTransition = useCallback((newTheme: 'light' | 'dark') => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const root = document.documentElement;
    const body = document.body;

    // Create overlay for smooth transition
    const overlay = document.createElement('div');
    overlay.id = 'theme-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 99999;
      background: ${newTheme === 'dark' ? 'radial-gradient(circle at center, hsl(27 95% 60% / 0.3), transparent)' : 'radial-gradient(circle at center, hsl(45 100% 90% / 0.5), transparent)'};
      opacity: 0;
    `;
    body.appendChild(overlay);

    // Create particles for magical effect
    const particles: HTMLDivElement[] = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'theme-particle';
      particle.style.cssText = `
        position: fixed;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 100000;
        background: ${newTheme === 'dark' ? 'hsl(27 95% 60%)' : 'hsl(45 100% 60%)'};
        box-shadow: 0 0 ${Math.random() * 10 + 5}px ${newTheme === 'dark' ? 'hsl(27 95% 60% / 0.5)' : 'hsl(45 100% 60% / 0.5)'};
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        opacity: 0;
      `;
      body.appendChild(particle);
      particles.push(particle);
    }

    // Timeline for coordinated animation
    const tl = gsap.timeline({
      onComplete: () => {
        overlay.remove();
        particles.forEach(p => p.remove());
        isAnimating.current = false;
      }
    });

    // Animate overlay
    tl.to(overlay, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.inOut'
    });

    // Animate particles scatter
    tl.to(particles, {
      opacity: 1,
      scale: 1.5,
      duration: 0.2,
      stagger: 0.02,
      ease: 'power2.out'
    }, '-=0.2');

    // Apply theme change
    tl.call(() => {
      setTheme(newTheme);
    });

    // Fade out overlay
    tl.to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    }, '+=0.1');

    // Animate particles out
    tl.to(particles, {
      opacity: 0,
      y: newTheme === 'dark' ? -50 : 50,
      scale: 0,
      duration: 0.5,
      stagger: 0.02,
      ease: 'power2.in'
    }, '-=0.4');

    // Animate main content elements
    const animatableElements = document.querySelectorAll('.gsap-theme-animate');
    if (animatableElements.length > 0) {
      tl.fromTo(animatableElements, 
        { opacity: 0.8, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.02, ease: 'power2.out' },
        '-=0.3'
      );
    }
  }, [setTheme]);

  // Toggle theme with animation
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    animateThemeTransition(newTheme);
  }, [resolvedTheme, animateThemeTransition]);

  // Watch for theme changes and animate elements
  useEffect(() => {
    if (previousTheme.current && previousTheme.current !== resolvedTheme && !isAnimating.current) {
      // Theme changed externally, animate elements
      gsap.fromTo('.gsap-theme-animate',
        { opacity: 0.9 },
        { opacity: 1, duration: 0.3, stagger: 0.01 }
      );
    }
    previousTheme.current = resolvedTheme;
  }, [resolvedTheme]);

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    isAnimating: isAnimating.current
  };
};
