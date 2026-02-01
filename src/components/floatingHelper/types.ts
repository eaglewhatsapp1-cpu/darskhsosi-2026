import React from 'react';

export interface HelpStep {
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: React.ReactNode;
  action?: { ar: string; en: string };
  targetFeature?: string;
  targetSelector?: string; // CSS selector to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface FloatingHelperProps {
  language: 'ar' | 'en';
  currentFeature: string;
  onNavigate?: (feature: string) => void;
}

export interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}
