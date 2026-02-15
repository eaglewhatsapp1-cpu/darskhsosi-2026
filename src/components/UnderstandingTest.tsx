import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClipboardCheck, Loader2, Sparkles, BookOpen, CheckCircle, XCircle, Timer, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useUserProgress } from '@/hooks/useUserProgress';
import ExportButtons from './chat/ExportButtons';

interface UnderstandingTestProps {
  language: 'ar' | 'en';
}

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation: string;
  type: 'mcq' | 'text';
}

interface TestSettings {
  questionType: 'mcq' | 'text' | 'mixed';
  timedTest: boolean;
  duration: number;
  includeIntelligenceQuestions: boolean;
}

const UnderstandingTest: React.FC<UnderstandingTestProps> = ({ language }) => {
  const { profile } = useProfile();
  const { materials, uploadFile, addMaterial, extractDocumentContent, loading: materialsLoading } = useUploadedMaterials();
  const { progress, saveProgress, loading: progressLoading } = useUserProgress('test');

  const [input, setInput] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [settings, setSettings] = useState<TestSettings>({
    questionType: 'mcq',
    timedTest: false,
    duration: 10,
    includeIntelligenceQuestions: false,
  });

  // Load progress
  useEffect(() => {
    if (progress && !isLoading) {
      if (progress.questions) setQuestions(progress.questions);
      if (progress.answers) setAnswers(progress.answers);
      if (progress.showResults !== undefined) setShowResults(progress.showResults);
      if (progress.settings) setSettings(progress.settings);
      if (progress.timeLeft !== undefined) setTimeLeft(progress.timeLeft);
    }
  }, [progress]);

  // Auto-save progress when it changes
  useEffect(() => {
    if (questions.length > 0 || Object.keys(answers).length > 0) {
      const timer = setTimeout(() => {
        saveProgress({
          questions,
          answers,
          showResults,
          settings,
          timeLeft
        });
      }, 2000); // Debounce saves
      return () => clearTimeout(timer);
    }
  }, [questions, answers, showResults, settings, timeLeft]);

  const materialsWithContent = materials.filter((m: any) => m.content);
  const materialsWithoutContent = materials.filter((m: any) => !m.content && m.storage_path);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { ar: 'اختبار الفهم المطور', en: 'Enhanced Understanding Test' },
      subtitle: { ar: 'اختبر فهمك للمادة بذكاء من خلال نصوصك أو ملفاتك', en: 'Test your understanding intelligently from text or files' },
      placeholder: { ar: 'الصق النص الذي تريد إنشاء اختبار له...', en: 'Paste the text you want to create a test for...' },
      generate: { ar: 'بدء الاختبار', en: 'Start Test' },
      selectMaterial: { ar: 'اختر من موادك المرفوعة', en: 'Select from your uploaded materials' },
      uploadDocument: { ar: 'رفع مستند جديد', en: 'Upload New Document' },
      uploadPrompt: { ar: 'اسحب وأفلت الملف هنا للبدء فوراً', en: 'Drag & drop file here to start immediately' },
      settings: { ar: 'إعدادات الاختبار', en: 'Test Settings' },
      qType: { ar: 'نوع الأسئلة', en: 'Question Type' },
      mcq: { ar: 'اختيار من متعدد', en: 'Multiple Choice' },
      text: { ar: 'أسئلة نصية', en: 'Text Questions' },
      mixed: { ar: 'مختلط', en: 'Mixed' },
      timed: { ar: 'اختبار موقوت', en: 'Timed Test' },
      duration: { ar: 'المدة (بالدقائق)', en: 'Duration (minutes)' },
      intel: { ar: 'إضافة أسئلة ذكاء وقدرات', en: 'Include Intelligence Questions' },
      submit: { ar: 'إنهاء الاختبار', en: 'Finish Test' },
      tryAgain: { ar: 'اختبار جديد', en: 'New Test' },
      score: { ar: 'النتيجة', en: 'Score' },
      timeLeft: { ar: 'الوقت المتبقي', en: 'Time Left' },
      extracting: { ar: 'جاري استخراج المحتوى...', en: 'Extracting content...' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    let timer: any;
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      if (result) {
        const { data, error } = await addMaterial({
          file_name: result.originalFilename || file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: result.storagePath,
          content: result.content,
        });

        if (data?.id) {
          setSelectedMaterial(data.id);
          toast.success(language === 'ar' ? 'تم الرفع بنجاح، جاري معالجة الملف...' : 'Upload successful, processing file...');

          if (result.needsExtraction && result.storagePath) {
            const extractionResult = await extractDocumentContent(data.id, result.storagePath, result.fileType);
            if (extractionResult.success) {
              toast.success(language === 'ar' ? 'الملف جاهز الآن للاختبار' : 'File is now ready for testing');
            } else {
              toast.error(language === 'ar'
                ? `فشل استخراج محتوى الملف: ${extractionResult.error || ''}`
                : `Failed to extract file content: ${extractionResult.error || ''}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'ar' ? 'فشل رفع الملف' : 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    const material = materials.find((m: any) => m.id === selectedMaterial);
    const contentToTest = selectedMaterial ? material?.content : input;

    if (!contentToTest?.trim()) {
      if (selectedMaterial && !material?.content) {
        toast.info(t('extracting'));
        return;
      }
      toast.error(language === 'ar' ? 'يرجى إدخال نص أو اختيار ملف' : 'Please enters text or select a file');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intelligent-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `أنت "${language === 'ar' ? 'مُقيّم الفهم والذكاء' : 'Understanding Evaluator'}".
مهمتك هي إنشاء اختبار دقيق ومتنوع يقيس مدى استيعاب الطالب للمحتوى.
- التزم بنوع الأسئلة المطلوبة: ${settings.questionType}.
- اجعل الأسئلة متدرجة الصعوبة.
- أضف شرحاً تعليمياً (explanation) لكل سؤال يوضح لماذا هذه الإجابة هي الصحيحة.
- إذا طلبت "أسئلة ذكاء"، ركز على المنطق والاستدلال المرتبط بالموضوع.
- رد بصيغة JSON فقط كقائمة (Array).`
            },
            {
              role: 'user',
              content: `أنشئ اختباراً من نوع ${settings.questionType} بناءً على المحتوى التالي. ${settings.includeIntelligenceQuestions ? 'أضف سؤالين ذكاء ومنطق.' : ''}
 
المحتوى:
${contentToTest.substring(0, 15000)}`,
            },
          ],
          learnerProfile: profile,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullContent += content;
            } catch (e) {
              // Skip invalid JSON chunks
            }
          }
        }
      }

      console.log('Full AI response:', fullContent);

      // Extract JSON array using bracket matching for nested arrays
      let jsonStr = '';
      let bracketCount = 0;
      let startIdx = -1;

      for (let i = 0; i < fullContent.length; i++) {
        if (fullContent[i] === '[') {
          if (startIdx === -1) startIdx = i;
          bracketCount++;
        } else if (fullContent[i] === ']') {
          bracketCount--;
          if (bracketCount === 0 && startIdx !== -1) {
            jsonStr = fullContent.substring(startIdx, i + 1);
            break;
          }
        }
      }

      if (jsonStr) {
        try {
          const parsedQuestions = JSON.parse(jsonStr);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
            if (settings.timedTest) setTimeLeft(settings.duration * 60);
            toast.success(language === 'ar' ? 'تم إنشاء الاختبار بنجاح!' : 'Test generated successfully!');
          } else {
            throw new Error('Empty questions array');
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          toast.error(language === 'ar' ? 'فشل في تحليل الأسئلة. حاول مرة أخرى.' : 'Failed to parse questions. Try again.');
        }
      } else {
        console.error('No JSON found in response:', fullContent);
        toast.error(language === 'ar' ? 'لم يتم العثور على أسئلة. حاول مرة أخرى.' : 'No questions found. Try again.');
      }
    } catch (error) {
      console.error('Error generating test:', error);
      toast.error(language === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    setTimeLeft(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-auto gsap-theme-animate">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {questions.length > 0 && (
          <div className="shrink-0 absolute top-4 end-4">
            <ExportButtons
              language={language}
              messages={questions.map((q, i) => ([
                { role: 'assistant' as const, content: `Question ${i + 1}: ${q.question}` },
                answers[i] !== undefined ? { role: 'user' as const, content: `Answer ${i + 1}: ${q.type === 'mcq' ? (q.options ? q.options[answers[i]] : answers[i]) : answers[i]}` } : null
              ].filter(Boolean) as any)).flat()}
              title={t('title')}
            />
          </div>
        )}
      </div>


      {questions.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            <Card className="p-6 space-y-4 shadow-lg border-primary/10" data-helper-target="test-settings">
              <h3 className="font-semibold flex items-center gap-2 text-primary">
                <BookOpen className="w-5 h-5" /> {t('selectMaterial')}
              </h3>

              <div className="grid gap-4">
                {materials.length > 0 && (
                  <Select value={selectedMaterial} onValueChange={(v) => { setSelectedMaterial(v); setInput(''); }}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t('selectMaterial')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground italic">{t('placeholder')}</SelectItem>
                      {[...materialsWithContent, ...materialsWithoutContent].map((m: any) => (
                        <SelectItem key={m.id} value={m.id} disabled={!m.content && m.storage_path}>
                          <div className="flex items-center gap-2">
                            {m.file_name}
                            {!m.content && m.storage_path && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded animate-pulse">
                                {t('extracting')}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/20 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-8 h-8 text-primary mb-2 opacity-50" />
                          <p className="text-sm font-medium">{t('uploadDocument')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('uploadPrompt')}</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.docx,.doc,.txt,.md" />
                  </label>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{language === 'ar' ? 'أو' : 'OR'}</span></div>
              </div>

              <Textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); setSelectedMaterial(''); }}
                placeholder={t('placeholder')}
                className="min-h-[180px] resize-none bg-muted/30 focus:bg-background transition-colors"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-6 shadow-lg border-primary/10">
              <h3 className="font-semibold flex items-center gap-2 text-primary"><Settings2 className="w-5 h-5" /> {t('settings')}</h3>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">{t('qType')}</Label>
                  <Select value={settings.questionType} onValueChange={(v: any) => setSettings({ ...settings, questionType: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">{t('mcq')}</SelectItem>
                      <SelectItem value="text">{t('text')}</SelectItem>
                      <SelectItem value="mixed">{t('mixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <Label htmlFor="timed-switch" className="flex-1 cursor-pointer">{t('timed')}</Label>
                  <Switch id="timed-switch" checked={settings.timedTest} onCheckedChange={(v) => setSettings({ ...settings, timedTest: v })} />
                </div>

                {settings.timedTest && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-sm">{t('duration')}</Label>
                    <div className="flex items-center gap-3">
                      <Input type="number" min="1" max="120" value={settings.duration} onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })} className="h-11" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <Label htmlFor="intel-switch" className="flex-1 cursor-pointer">{t('intel')}</Label>
                  <Switch id="intel-switch" checked={settings.includeIntelligenceQuestions} onCheckedChange={(v) => setSettings({ ...settings, includeIntelligenceQuestions: v })} />
                </div>
              </div>

              <Button
                data-helper-target="start-test"
                onClick={handleGenerate}
                disabled={(!input.trim() && !selectedMaterial) || isLoading || isUploading}
                className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-xl transition-all gradient-primary"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin me-2" /> : <Sparkles className="w-5 h-5 me-2" />}
                {t('generate')}
              </Button>
            </Card>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {timeLeft !== null && (
            <Card className="p-4 sticky top-0 z-10 bg-background/80 backdrop-blur flex items-center justify-between border-primary">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Timer className="w-5 h-5" />
                {t('timeLeft')}: {formatTime(timeLeft)}
              </div>
            </Card>
          )}

          {questions.map((q, idx) => (
            <Card key={idx} className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{idx + 1}. {q.question}</h3>
              {q.type === 'mcq' && q.options && q.options.length > 0 ? (
                <RadioGroup
                  value={answers[idx] !== undefined ? answers[idx].toString() : ''}
                  onValueChange={(v) => setAnswers(prev => ({ ...prev, [idx]: parseInt(v) }))}
                  disabled={showResults}
                >
                  {q.options.map((opt, oIdx) => (
                    <div key={`q${idx}-opt${oIdx}`} className={`flex items-center space-x-2 rtl:space-x-reverse p-3 rounded-lg border ${showResults ? (oIdx === q.correctAnswer ? 'bg-green-100 border-green-500' : answers[idx] === oIdx ? 'bg-red-100 border-red-500' : '') : 'hover:bg-accent'
                      }`}>
                      <RadioGroupItem value={oIdx.toString()} id={`q${idx}-o${oIdx}`} />
                      <Label htmlFor={`q${idx}-o${oIdx}`} className="flex-1 cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  value={answers[idx] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                  disabled={showResults}
                  placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
                  className="min-h-[100px]"
                />
              )}
              {showResults && (
                <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
                  <p className="font-bold mb-1">{language === 'ar' ? 'التفسير:' : 'Explanation:'}</p>
                  {q.explanation}
                </div>
              )}
            </Card>
          ))}

          <Button onClick={showResults ? () => setQuestions([]) : handleSubmit} className="w-full h-12 gradient-primary">
            {showResults ? t('tryAgain') : t('submit')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnderstandingTest;
