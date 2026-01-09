import React from 'react';
import { useUploadedMaterials, UploadedMaterial } from '@/hooks/useUploadedMaterials';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, FileText } from 'lucide-react';

interface MaterialSourceSelectorProps {
  language: 'ar' | 'en';
  selectedMaterial: string;
  setSelectedMaterial: (id: string) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  placeholder?: string;
}

const MaterialSourceSelector: React.FC<MaterialSourceSelectorProps> = ({
  language,
  selectedMaterial,
  setSelectedMaterial,
  textInput,
  setTextInput,
  placeholder,
}) => {
  const { materials } = useUploadedMaterials();
  const materialsWithContent = materials.filter((m: UploadedMaterial) => m.content);
  
  const sourceType = selectedMaterial ? 'materials' : textInput ? 'text' : '';

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'source.title': { ar: 'مصدر المحتوى', en: 'Content Source' },
      'source.materials': { ar: 'من موادي المرفوعة', en: 'From my uploaded materials' },
      'source.text': { ar: 'إدخال نص يدوي', en: 'Enter text manually' },
      'source.select': { ar: 'اختر المادة', en: 'Select material' },
      'source.noMaterials': { ar: 'لا توجد مواد مرفوعة', en: 'No uploaded materials' },
    };
    return translations[key]?.[language] || key;
  };

  const handleSourceChange = (value: string) => {
    if (value === 'materials') {
      setTextInput('');
    } else {
      setSelectedMaterial('');
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{t('source.title')}</Label>
      
      <RadioGroup
        value={sourceType || 'text'}
        onValueChange={handleSourceChange}
        className="grid grid-cols-2 gap-4"
      >
        <div className={`flex items-center space-x-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          sourceType === 'materials' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}>
          <RadioGroupItem value="materials" id="source-materials" />
          <Label htmlFor="source-materials" className="flex items-center gap-2 cursor-pointer flex-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm">{t('source.materials')}</span>
          </Label>
        </div>
        
        <div className={`flex items-center space-x-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          sourceType === 'text' || !sourceType ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}>
          <RadioGroupItem value="text" id="source-text" />
          <Label htmlFor="source-text" className="flex items-center gap-2 cursor-pointer flex-1">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm">{t('source.text')}</span>
          </Label>
        </div>
      </RadioGroup>

      {sourceType === 'materials' && (
        <div className="animate-fade-in">
          {materialsWithContent.length > 0 ? (
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('source.select')} />
              </SelectTrigger>
              <SelectContent>
                {materialsWithContent.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {material.file_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('source.noMaterials')}
            </p>
          )}
        </div>
      )}

      {(sourceType === 'text' || !sourceType) && (
        <div className="animate-fade-in">
          <Textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setSelectedMaterial('');
            }}
            placeholder={placeholder || (language === 'ar' ? 'اكتب أو الصق النص هنا...' : 'Type or paste text here...')}
            className="min-h-[120px] resize-none"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>
      )}
    </div>
  );
};

export default MaterialSourceSelector;
