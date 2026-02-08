import { useEffect, useRef } from 'react';
import { getSubjectTheme, Subject } from '@/utils/subjectColors';

/**
 * Hook that applies subject-specific CSS custom properties to the document root.
 * This enables dynamic theming across the entire application based on the selected subject.
 * 
 * IMPORTANT: Only call this hook when the profile is complete to avoid
 * CSS variable changes interfering with Radix UI components during mounting.
 */
export const useSubjectTheme = (subject: Subject | string | null | undefined) => {
  const lastSubject = useRef<string | null>(null);

  useEffect(() => {
    // Skip if subject is null/undefined (profile not ready)
    if (!subject) {
      return;
    }

    // Skip if subject hasn't changed (prevents unnecessary CSS updates)
    if (lastSubject.current === subject) {
      return;
    }
    lastSubject.current = subject;

    const theme = getSubjectTheme(subject);
    const root = document.documentElement;

    // Parse HSL values from the theme
    const parseHSL = (hslString: string): string => {
      // Extract h, s%, l% from "hsl(h, s%, l%)"
      const match = hslString.match(/hsl\((\d+),?\s*(\d+)%?,?\s*(\d+)%?\)/);
      if (match) {
        return `${match[1]} ${match[2]}% ${match[3]}%`;
      }
      return '174 84% 32%'; // fallback
    };

    const primaryHSL = parseHSL(theme.primary);
    const secondaryHSL = parseHSL(theme.secondary);
    const accentHSL = parseHSL(theme.accent);

    // Use requestAnimationFrame to batch CSS updates and avoid layout thrashing
    requestAnimationFrame(() => {
      root.style.setProperty('--subject-primary', primaryHSL);
      root.style.setProperty('--subject-secondary', secondaryHSL);
      root.style.setProperty('--subject-accent', accentHSL);
      root.style.setProperty('--subject-gradient', theme.gradient);
      root.style.setProperty('--ring', primaryHSL);
      document.body.dataset.subject = theme.id;
    });

    return () => {
      // Cleanup on unmount
      root.style.removeProperty('--subject-primary');
      root.style.removeProperty('--subject-secondary');
      root.style.removeProperty('--subject-accent');
      root.style.removeProperty('--subject-gradient');
      delete document.body.dataset.subject;
      lastSubject.current = null;
    };
  }, [subject]);
};

export default useSubjectTheme;
