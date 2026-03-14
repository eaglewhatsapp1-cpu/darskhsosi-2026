import React from 'react';
import {
  Sparkles,
  Upload,
  MessageSquare,
  BookOpen,
  Brain,
  FileText,
  Lightbulb,
  GraduationCap,
  Video
} from 'lucide-react';
import { HelpStep } from './types';

// Getting started steps are now handled by OnboardingTour component

export const getContextualTips = (currentFeature: string): HelpStep[] => {
  const tips: Record<string, HelpStep[]> = {
    teacher: [
      {
        title: { ar: 'اختر موادك', en: 'Select Your Materials' },
        description: {
          ar: 'اختر مواد محددة من القائمة المنسدلة للحصول على إجابات أكثر دقة.',
          en: 'Select specific materials from the dropdown for more accurate answers.'
        },
        icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
        targetSelector: '[data-helper-target="material-selector"]',
        position: 'bottom'
      },
      {
        title: { ar: 'اكتب سؤالك', en: 'Type Your Question' },
        description: {
          ar: 'اكتب سؤالك هنا وسيجيبك المعلم الذكي بناءً على موادك.',
          en: 'Type your question here and the AI teacher will answer based on your materials.'
        },
        icon: <MessageSquare className="w-5 h-5 text-green-500" />,
        targetSelector: '[data-helper-target="chat-input"]',
        position: 'top'
      }
    ],
    upload: [
      {
        title: { ar: 'منطقة الرفع', en: 'Upload Area' },
        description: {
          ar: 'اسحب ملفاتك هنا أو انقر للاختيار. يدعم PDF، Word، PowerPoint، وصور.',
          en: 'Drag files here or click to select. Supports PDF, Word, PowerPoint, and images.'
        },
        icon: <FileText className="w-5 h-5 text-blue-500" />,
        targetSelector: '[data-helper-target="upload-zone"]',
        position: 'bottom'
      },
      {
        title: { ar: 'ملفاتك المرفوعة', en: 'Your Uploaded Files' },
        description: {
          ar: 'هنا تظهر ملفاتك. يمكنك استخدامها في جميع أدوات التعلم.',
          en: 'Your files appear here. You can use them across all learning tools.'
        },
        icon: <BookOpen className="w-5 h-5 text-purple-500" />,
        targetSelector: '[data-helper-target="uploaded-files"]',
        position: 'top'
      }
    ],
    test: [
      {
        title: { ar: 'إعدادات الاختبار', en: 'Test Settings' },
        description: {
          ar: 'اختر نوع الأسئلة وإعدادات الاختبار المناسبة لك.',
          en: 'Choose question types and test settings that suit you.'
        },
        icon: <Brain className="w-5 h-5 text-orange-500" />,
        targetSelector: '[data-helper-target="test-settings"]',
        position: 'bottom'
      },
      {
        title: { ar: 'ابدأ الاختبار', en: 'Start Test' },
        description: {
          ar: 'اختر مادة أو ألصق نصاً ثم اضغط لبدء الاختبار.',
          en: 'Select a material or paste text, then click to start the test.'
        },
        icon: <FileText className="w-5 h-5 text-green-500" />,
        targetSelector: '[data-helper-target="start-test"]',
        position: 'top'
      }
    ],
    mindmap: [
      {
        title: { ar: 'إنشاء خريطة', en: 'Create Map' },
        description: {
          ar: 'أدخل موضوعاً أو اختر مادة لإنشاء خريطة ذهنية تفاعلية.',
          en: 'Enter a topic or select material to create an interactive mind map.'
        },
        icon: <Brain className="w-5 h-5 text-purple-500" />,
        targetSelector: '[data-helper-target="mindmap-input"]',
        position: 'bottom'
      }
    ],
    simplify: [
      {
        title: { ar: 'النص المراد تبسيطه', en: 'Text to Simplify' },
        description: {
          ar: 'ألصق أي نص صعب هنا وسيتم تبسيطه بطريقة سهلة الفهم.',
          en: 'Paste any difficult text here and it will be simplified for easy understanding.'
        },
        icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
        targetSelector: '[data-helper-target="simplify-input"]',
        position: 'bottom'
      }
    ],
    summary: [
      {
        title: { ar: 'إنشاء ملخص', en: 'Create Summary' },
        description: {
          ar: 'اختر مادة أو ألصق نصاً للحصول على ملخص شامل ومنظم.',
          en: 'Select material or paste text to get a comprehensive, organized summary.'
        },
        icon: <FileText className="w-5 h-5 text-blue-500" />,
        targetSelector: '[data-helper-target="summary-input"]',
        position: 'bottom'
      }
    ],
    studyplan: [
      {
        title: { ar: 'إنشاء خطة', en: 'Create Plan' },
        description: {
          ar: 'حدد المادة ومدة الخطة وسيتم إنشاء جدول مفصل لك.',
          en: 'Specify the subject and duration, and a detailed schedule will be created for you.'
        },
        icon: <GraduationCap className="w-5 h-5 text-orange-500" />,
        targetSelector: '[data-helper-target="studyplan-form"]',
        position: 'bottom'
      }
    ],
    classroom: [
      {
        title: { ar: 'انضم للقاء', en: 'Join Session' },
        description: {
          ar: 'ألصق رابط الاجتماع هنا وانضم فوراً للقاء المباشر مع المعلم أو الزملاء.',
          en: 'Paste the meeting link here and join the live session with your teacher or peers immediately.'
        },
        icon: <Video className="w-5 h-5 text-primary" />,
        targetSelector: '#meeting-link',
        position: 'bottom'
      }
    ]
  };

  return tips[currentFeature] || tips.teacher;
};
