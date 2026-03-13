import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Calculator, Link2, Palette, Puzzle, RefreshCw, Sparkles } from 'lucide-react';

type GameMode = 'math' | 'letters' | 'coloring';
type PaletteTone = 'primary' | 'accent' | 'secondary' | 'muted' | 'destructive';

interface KidsLearningGamesProps {
  language: 'ar' | 'en';
}

interface MathPuzzle {
  left: number;
  right: number;
  operation: '+' | '-';
  answer: number;
  options: number[];
}

interface LetterPair {
  letter: string;
  word: string;
}

const shuffleArray = <T,>(items: T[]): T[] => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const generateMathPuzzle = (): MathPuzzle => {
  const operation: '+' | '-' = Math.random() > 0.45 ? '+' : '-';
  const left = Math.floor(Math.random() * 9) + 2;
  const rightSeed = Math.floor(Math.random() * 9) + 1;
  const right = operation === '-' ? Math.min(rightSeed, left) : rightSeed;
  const answer = operation === '+' ? left + right : left - right;

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const jitter = Math.floor(Math.random() * 7) - 3;
    const candidate = Math.max(0, answer + jitter);
    if (candidate !== answer) distractors.add(candidate);
  }

  return {
    left,
    right,
    operation,
    answer,
    options: shuffleArray([answer, ...Array.from(distractors)]),
  };
};

const toneClassMap: Record<PaletteTone, string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  secondary: 'bg-secondary',
  muted: 'bg-muted',
  destructive: 'bg-destructive',
};

const KidsLearningGames: React.FC<KidsLearningGamesProps> = ({ language }) => {
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const [activeGame, setActiveGame] = useState<GameMode>('math');

  // Math puzzle state
  const [mathPuzzle, setMathPuzzle] = useState<MathPuzzle>(() => generateMathPuzzle());
  const [mathFeedback, setMathFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [mathScore, setMathScore] = useState(0);
  const [mathRounds, setMathRounds] = useState(0);

  // Letter connect state
  const letterPairs = useMemo<LetterPair[]>(() => {
    return language === 'ar'
      ? [
          { letter: 'أ', word: 'أسد' },
          { letter: 'ب', word: 'بيت' },
          { letter: 'ت', word: 'تفاح' },
          { letter: 'س', word: 'سمك' },
        ]
      : [
          { letter: 'A', word: 'Apple' },
          { letter: 'B', word: 'Ball' },
          { letter: 'C', word: 'Cat' },
          { letter: 'D', word: 'Duck' },
        ];
  }, [language]);

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [letterConnections, setLetterConnections] = useState<Record<string, string>>({});
  const [wordChoices, setWordChoices] = useState<string[]>([]);

  // Coloring state
  const [selectedTone, setSelectedTone] = useState<PaletteTone>('primary');
  const [paintGrid, setPaintGrid] = useState<Array<PaletteTone | null>>(() => Array(48).fill(null));
  const [paintGoal, setPaintGoal] = useState(() => Math.floor(Math.random() * 9) + 8);

  useEffect(() => {
    setWordChoices(shuffleArray(letterPairs.map((pair) => pair.word)));
    setLetterConnections({});
    setSelectedLetter(null);
  }, [letterPairs]);

  const handleMathAnswer = (value: number) => {
    const isCorrect = value === mathPuzzle.answer;
    setMathRounds((prev) => prev + 1);

    if (isCorrect) {
      setMathScore((prev) => prev + 1);
      setMathFeedback('correct');
    } else {
      setMathFeedback('wrong');
    }
  };

  const nextMathPuzzle = () => {
    setMathPuzzle(generateMathPuzzle());
    setMathFeedback(null);
  };

  const handleWordPick = (word: string) => {
    if (!selectedLetter || letterConnections[selectedLetter]) return;

    const selectedPair = letterPairs.find((pair) => pair.letter === selectedLetter);
    if (!selectedPair) return;

    if (selectedPair.word === word) {
      setLetterConnections((prev) => ({ ...prev, [selectedLetter]: word }));
    }

    setSelectedLetter(null);
  };

  const resetLetterGame = () => {
    setLetterConnections({});
    setSelectedLetter(null);
    setWordChoices(shuffleArray(letterPairs.map((pair) => pair.word)));
  };

  const handlePaintCell = (index: number) => {
    setPaintGrid((prev) => {
      const next = [...prev];
      next[index] = selectedTone;
      return next;
    });
  };

  const resetPaintGame = () => {
    setPaintGrid(Array(48).fill(null));
    setPaintGoal(Math.floor(Math.random() * 9) + 8);
  };

  const solvedLetters = Object.keys(letterConnections).length;
  const paintCount = paintGrid.filter(Boolean).length;
  const paintProgress = Math.min(100, (paintCount / paintGoal) * 100);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      <Card className="border-primary/20 shadow-elegant">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Puzzle className="w-5 h-5 text-primary" />
            {t('التعلم بالألعاب للأطفال', 'Kids Game Learning')}
          </CardTitle>
          <CardDescription>
            {t(
              'أنشطة تفاعلية للحساب والحروف والتلوين لتشجيع الأطفال على التعلم باللعب.',
              'Interactive math, letter and coloring activities to help kids learn through play.'
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          variant={activeGame === 'math' ? 'default' : 'outline'}
          onClick={() => setActiveGame('math')}
          className="justify-start gap-2"
        >
          <Calculator className="w-4 h-4" />
          {t('بازل الجمع والطرح', 'Math Puzzle')}
        </Button>
        <Button
          variant={activeGame === 'letters' ? 'default' : 'outline'}
          onClick={() => setActiveGame('letters')}
          className="justify-start gap-2"
        >
          <Link2 className="w-4 h-4" />
          {t('توصيل الحروف', 'Letter Connect')}
        </Button>
        <Button
          variant={activeGame === 'coloring' ? 'default' : 'outline'}
          onClick={() => setActiveGame('coloring')}
          className="justify-start gap-2"
        >
          <Palette className="w-4 h-4" />
          {t('لوّن والعب', 'Color & Play')}
        </Button>
      </div>

      {activeGame === 'math' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t('حل المسألة', 'Solve the Puzzle')}
            </CardTitle>
            <CardDescription>
              {t('اختر القطعة الصحيحة لإكمال العملية.', 'Pick the correct puzzle piece to complete the equation.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <p className="text-3xl font-bold tracking-wide text-foreground">
                {mathPuzzle.left} {mathPuzzle.operation} {mathPuzzle.right} = ?
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mathPuzzle.options.map((option) => (
                <Button
                  key={option}
                  variant="secondary"
                  className="h-12 text-lg"
                  disabled={mathFeedback !== null}
                  onClick={() => handleMathAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {mathFeedback === 'correct' && <Badge>{t('إجابة صحيحة 🎉', 'Correct answer 🎉')}</Badge>}
              {mathFeedback === 'wrong' && <Badge variant="destructive">{t('حاول مرة أخرى', 'Try again')}</Badge>}
              <Badge variant="secondary">{t('النقاط', 'Score')}: {mathScore}/{mathRounds || 1}</Badge>
            </div>

            <Button onClick={nextMathPuzzle} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {t('مسألة جديدة', 'Next Puzzle')}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeGame === 'letters' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('وصّل الحرف بالكلمة', 'Match Letter to Word')}</CardTitle>
            <CardDescription>
              {t('اختر حرفاً ثم اختر الكلمة الصحيحة التي تبدأ به.', 'Select a letter, then choose the word that starts with it.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(solvedLetters / letterPairs.length) * 100} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('الحروف', 'Letters')}</p>
                {letterPairs.map((pair) => (
                  <Button
                    key={pair.letter}
                    variant={selectedLetter === pair.letter ? 'default' : 'outline'}
                    className="w-full justify-start"
                    disabled={Boolean(letterConnections[pair.letter])}
                    onClick={() => setSelectedLetter(pair.letter)}
                  >
                    {pair.letter}
                    {letterConnections[pair.letter] && <span className="ms-auto text-xs">✓</span>}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('الكلمات', 'Words')}</p>
                {wordChoices.map((word) => {
                  const alreadyUsed = Object.values(letterConnections).includes(word);
                  return (
                    <Button
                      key={word}
                      variant="secondary"
                      className="w-full justify-start"
                      disabled={!selectedLetter || alreadyUsed}
                      onClick={() => handleWordPick(word)}
                    >
                      {word}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{t('المطابقات', 'Matches')}: {solvedLetters}/{letterPairs.length}</Badge>
              <Button variant="outline" size="sm" onClick={resetLetterGame} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {t('إعادة اللعب', 'Reset Game')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeGame === 'coloring' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('لوّن المربعات', 'Color the Squares')}</CardTitle>
            <CardDescription>
              {t('الهدف: لوّن', 'Goal: color')} {paintGoal} {t('مربعات أو أكثر.', 'squares or more.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={paintProgress} />

            <div className="flex items-center gap-2 flex-wrap">
              {(Object.keys(toneClassMap) as PaletteTone[]).map((tone) => (
                <Button
                  key={tone}
                  variant={selectedTone === tone ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTone(tone)}
                  className="gap-2"
                >
                  <span className={cn('w-3 h-3 rounded-full border border-border', toneClassMap[tone])} />
                  {t(tone === 'primary' ? 'رئيسي' : tone === 'accent' ? 'بارز' : tone === 'secondary' ? 'ثانوي' : tone === 'muted' ? 'هادئ' : 'قوي',
                    tone === 'primary' ? 'Primary' : tone === 'accent' ? 'Accent' : tone === 'secondary' ? 'Secondary' : tone === 'muted' ? 'Muted' : 'Strong')}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-8 gap-1 rounded-xl border border-border p-3 bg-muted/20">
              {paintGrid.map((tone, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    'aspect-square rounded-md border border-border transition-transform duration-150 hover:scale-105',
                    tone ? toneClassMap[tone] : 'bg-card hover:bg-muted/70'
                  )}
                  onClick={() => handlePaintCell(index)}
                  aria-label={`${t('تلوين مربع', 'Color cell')} ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{t('المربعات الملوّنة', 'Painted')}: {paintCount}</Badge>
              {paintCount >= paintGoal && <Badge>{t('ممتاز! أكملت التحدي 🎨', 'Great! Challenge completed 🎨')}</Badge>}
              <Button variant="outline" size="sm" onClick={resetPaintGame} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {t('لوحة جديدة', 'New Board')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KidsLearningGames;
