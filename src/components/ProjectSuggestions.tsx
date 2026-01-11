import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Loader2, Sparkles, Wrench, Clock, Target, Star, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Profile } from '@/hooks/useProfile';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { getSubjectTheme } from '@/utils/subjectColors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectSuggestionsProps {
  language: 'ar' | 'en';
  profile?: Profile;
}

interface Project {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  materials: string[];
  steps: string[];
  learningOutcomes: string[];
}

const ProjectSuggestions: React.FC<ProjectSuggestionsProps> = ({ language, profile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const { materials } = useUploadedMaterials();
  
  const materialsWithContent = materials.filter((m: any) => m.content);
  const subjectTheme = getSubjectTheme(profile?.subject || 'general');
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const generateProjects = async () => {
    setIsLoading(true);
    setProjects([]);

    try {
      const materialsSummary = materials.map(m => ({
        name: m.file_name,
        content: m.content?.substring(0, 1500) || ''
      }));

      const { data, error } = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [{
            role: 'user',
            content: `بناءً على المواد التعليمية المتاحة والمادة الدراسية، اقترح 3 مشاريع عملية تطبيقية يمكن للطالب تنفيذها في المنزل. 

أريد الإجابة بتنسيق JSON فقط بالشكل التالي:
{
  "projects": [
    {
      "title": "عنوان المشروع",
      "description": "وصف مختصر",
      "difficulty": "easy|medium|hard",
      "duration": "المدة المتوقعة",
      "materials": ["المواد المطلوبة"],
      "steps": ["الخطوات"],
      "learningOutcomes": ["المخرجات التعليمية"]
    }
  ]
}

المادة: ${profile?.subject || 'general'}
المستوى: ${profile?.education_level || 'high'}
اللغة: ${language === 'ar' ? 'العربية' : 'English'}`
          }],
          learnerProfile: {
            language,
            educationLevel: profile?.education_level,
            learningStyle: profile?.learning_style,
            subject: profile?.subject
          },
          uploadedMaterials: materialsSummary
        }
      });

      if (error) throw error;

      // Parse JSON from response
      const responseText = data?.content || data?.message || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setProjects(parsed.projects || []);
        toast.success(t('تم توليد المشاريع بنجاح!', 'Projects generated successfully!'));
      }
    } catch (error: any) {
      console.error('Error generating projects:', error);
      toast.error(t('حدث خطأ في توليد المشاريع', 'Error generating projects'));
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    const texts: Record<string, { ar: string; en: string }> = {
      easy: { ar: 'سهل', en: 'Easy' },
      medium: { ar: 'متوسط', en: 'Medium' },
      hard: { ar: 'متقدم', en: 'Hard' }
    };
    return texts[difficulty]?.[language] || difficulty;
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6" style={{ color: subjectTheme.primary }} />
            {t('اقتراح مشاريع عملية', 'Practical Project Suggestions')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t(
              'اكتشف مشاريع تطبيقية لربط النظرية بالواقع',
              'Discover practical projects to connect theory with reality'
            )}
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4 pt-4">
          {/* Material Selection */}
          {materialsWithContent.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('اختر مادة لبناء المشاريع عليها', 'Select material to base projects on')}
              </label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder={t('اختر من موادك المرفوعة', 'Select from your uploaded materials')} />
                </SelectTrigger>
                <SelectContent>
                  {materialsWithContent.map((material: any) => (
                    <SelectItem key={material.id} value={material.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {material.file_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateProjects} 
            disabled={isLoading}
            className="w-full md:w-auto"
            style={{ background: subjectTheme.gradient }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin me-2" />
            ) : (
              <Sparkles className="w-4 h-4 me-2" />
            )}
            {t('اقترح مشاريع', 'Suggest Projects')}
          </Button>

          {/* Projects List */}
          {projects.length > 0 && (
            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <Card key={index} className="border-s-4" style={{ borderColor: subjectTheme.primary }}>
                    <CardContent className="p-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <Star className="w-5 h-5" style={{ color: subjectTheme.primary }} />
                            {project.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-full ${getDifficultyColor(project.difficulty)}`}>
                            {getDifficultyText(project.difficulty)}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {project.duration}
                          </span>
                        </div>
                      </div>

                      {/* Materials */}
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Wrench className="w-4 h-4" />
                          {t('المواد المطلوبة', 'Required Materials')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.materials.map((material, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-2 py-1 rounded-full"
                              style={{ backgroundColor: subjectTheme.secondary }}
                            >
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          {t('خطوات التنفيذ', 'Implementation Steps')}
                        </h4>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          {project.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Learning Outcomes */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4" style={{ color: subjectTheme.primary }} />
                          {t('ماذا ستتعلم؟', 'What will you learn?')}
                        </h4>
                        <ul className="text-sm space-y-1">
                          {project.learningOutcomes.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span style={{ color: subjectTheme.primary }}>✓</span>
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Empty State */}
          {projects.length === 0 && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Lightbulb className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-center">
                {t(
                  'اضغط على "اقترح مشاريع" للحصول على أفكار مشاريع تطبيقية',
                  'Click "Suggest Projects" to get practical project ideas'
                )}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: subjectTheme.primary }} />
              <p className="text-muted-foreground">
                {t('جاري البحث عن أفكار مشاريع...', 'Searching for project ideas...')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSuggestions;
