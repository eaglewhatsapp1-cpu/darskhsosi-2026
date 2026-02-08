import { useEffect } from 'react';
import { getSubjectTheme, Subject } from '@/utils/subjectColors';

/**
 * Hook that applies subject-specific CSS custom properties to the document root.
 * This enables dynamic theming across the entire application based on the selected subject.
 */
export const useSubjectTheme = (subject: Subject | string | null | undefined) => {
  useEffect(() => {
    const theme = getSubjectTheme(subject || 'general');
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

    // Set subject-specific CSS custom properties
    root.style.setProperty('--subject-primary', primaryHSL);
    root.style.setProperty('--subject-secondary', secondaryHSL);
    root.style.setProperty('--subject-accent', accentHSL);
    root.style.setProperty('--subject-gradient', theme.gradient);

    // Update ring color to match subject
    root.style.setProperty('--ring', primaryHSL);

    // Add subject class to body for additional styling hooks
    document.body.dataset.subject = theme.id;

    return () => {
      // Cleanup on unmount
      root.style.removeProperty('--subject-primary');
      root.style.removeProperty('--subject-secondary');
      root.style.removeProperty('--subject-accent');
      root.style.removeProperty('--subject-gradient');
      delete document.body.dataset.subject;
    };
  }, [subject]);
};

export default useSubjectTheme;
