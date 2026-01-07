import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClipboardCheck, Loader2, Sparkles, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface UnderstandingTestProps {
  language: 'ar' | 'en';
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const UnderstandingTest: React.FC<UnderstandingTestProps> = ({ language }) => {
  const { profile } = useProfile();
  const { materials } = useUploadedMaterials();
  const [input, setInput] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const materialsWithContent = materials.filter((m: any) => m.content);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { ar: 'اختبار الفهم', en: 'Understanding Test' },
      subtitle: { ar: 'اختبر فهمك للمادة', en: 'Test your understanding of the material' },
      placeholder: { ar: 'الصق النص الذي تريد إنشاء اختبار له...', en: 'Paste the text you want to create a test for...' },
      generate: { ar: 'أنشئ الاختبار', en: 'Generate Test' },
      selectMaterial: { ar: 'أو اختر من موادك المرفوعة', en: 'Or select from your uploaded materials' },
      orEnterText: { ar: 'أو أدخل نصاً', en: 'Or enter text' },
      submit: { ar: 'تحقق من الإجابات', en: 'Check Answers' },
      tryAgain: { ar: 'حاول مرة أخرى', en: 'Try Again' },
      correct: { ar: 'صحيح!', en: 'Correct!' },
      incorrect: { ar: 'خطأ', en: 'Incorrect' },
      score: { ar: 'النتيجة', en: 'Score' },
      question: { ar: 'سؤال', en: 'Question' },
    };
    return translations[key]?.[language] || key;
  };

  const handleGenerate = async () => {
    const contentToTest = selectedMaterial 
      ? materialsWithContent.find((m: any) => m.id === selectedMaterial)?.content 
      : input;

    if (!contentToTest?.trim() || isLoading) return;

    setIsLoading(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);

    try {
      const response = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Create a quiz with 5 multiple choice questions based on the following content. Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Content: ${contentToTest}`,
            },
          ],
          learnerProfile: profile ? {
            name: profile.name,
            educationLevel: profile.education_level,
            learningStyle: profile.learning_style,
            interests: profile.interests,
            preferredLanguage: profile.preferred_language,
          } : null,
        },
      });

      if (response.error) throw response.error;

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullContent += content;
            } catch {}
          }
        }
      }

      // Parse the JSON response
      const jsonMatch = fullContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setQuestions(parsed);
      }
    } catch (error) {
      console.error('Error generating test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const score = Object.entries(answers).filter(
    ([idx, ans]) => questions[parseInt(idx)]?.correctAnswer === ans
  ).length;

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {questions.length === 0 ? (
        <Card className="p-4">
          {materialsWithContent.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">{t('selectMaterial')}</label>
              <Select value={selectedMaterial} onValueChange={(value) => {
                setSelectedMaterial(value);
                setInput('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectMaterial')} />
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

          <label className="text-sm font-medium mb-2 block">{t('orEnterText')}</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSelectedMaterial('');
            }}
            placeholder={t('placeholder')}
            className="min-h-[150px] mb-4 resize-none"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          <Button
            onClick={handleGenerate}
            disabled={(!input.trim() && !selectedMaterial) || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin me-2" />
            ) : (
              <Sparkles className="w-4 h-4 me-2" />
            )}
            {t('generate')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {showResults && (
            <Card className="p-4 bg-primary/10">
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {t('score')}: {score} / {questions.length}
                </p>
              </div>
            </Card>
          )}

          {questions.map((q, idx) => (
            <Card key={idx} className="p-4">
              <h3 className="font-semibold mb-4">
                {t('question')} {idx + 1}: {q.question}
              </h3>
              <RadioGroup
                value={answers[idx]?.toString()}
                onValueChange={(value) => setAnswers(prev => ({ ...prev, [idx]: parseInt(value) }))}
                disabled={showResults}
              >
                {q.options.map((option, optIdx) => (
                  <div key={optIdx} className={`flex items-center space-x-2 p-2 rounded ${
                    showResults
                      ? optIdx === q.correctAnswer
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : answers[idx] === optIdx
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : ''
                      : ''
                  }`}>
                    <RadioGroupItem value={optIdx.toString()} id={`q${idx}-o${optIdx}`} />
                    <Label htmlFor={`q${idx}-o${optIdx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {showResults && optIdx === q.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {showResults && answers[idx] === optIdx && optIdx !== q.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              {showResults && (
                <p className="mt-3 text-sm text-muted-foreground bg-muted p-2 rounded">
                  {q.explanation}
                </p>
              )}
            </Card>
          ))}

          <div className="flex gap-4">
            {!showResults ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                className="flex-1"
              >
                {t('submit')}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setQuestions([]);
                  setAnswers({});
                  setShowResults(false);
                }}
                className="flex-1"
              >
                {t('tryAgain')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderstandingTest;
