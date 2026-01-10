import React from 'react';
import { useUploadedMaterials, UploadedMaterial } from '@/hooks/useUploadedMaterials';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image, File, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface MaterialSelectorProps {
  language: 'ar' | 'en';
  selectedMaterials: string[];
  onSelectionChange: (materialIds: string[]) => void;
  maxSelection?: number;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  language,
  selectedMaterials,
  onSelectionChange,
  maxSelection = 5
}) => {
  const { materials, loading } = useUploadedMaterials();
  const [isOpen, setIsOpen] = React.useState(false);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="w-4 h-4" />;
    if (fileType.includes('image')) return <Image className="w-4 h-4 text-green-500" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  const handleToggle = (materialId: string) => {
    if (selectedMaterials.includes(materialId)) {
      onSelectionChange(selectedMaterials.filter(id => id !== materialId));
    } else if (selectedMaterials.length < maxSelection) {
      onSelectionChange([...selectedMaterials, materialId]);
    }
  };

  const getSelectedMaterialNames = () => {
    return materials
      .filter(m => selectedMaterials.includes(m.id))
      .map(m => m.file_name)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          {t('لا توجد مواد مرفوعة. ارفع مواد تعليمية أولاً.', 'No materials uploaded. Upload learning materials first.')}
        </p>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 h-auto"
        >
          <div className="flex items-center gap-2 text-start">
            <FileText className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">
                {t('اختر المواد للربط', 'Select Materials to Link')}
                <span className="text-muted-foreground mx-2">
                  ({selectedMaterials.length}/{maxSelection})
                </span>
              </p>
              {selectedMaterials.length > 0 && (
                <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                  {getSelectedMaterialNames()}
                </p>
              )}
            </div>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ScrollArea className="max-h-[200px] p-2">
          <div className="space-y-1">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                onClick={() => handleToggle(material.id)}
              >
                <Checkbox
                  checked={selectedMaterials.includes(material.id)}
                  disabled={!selectedMaterials.includes(material.id) && selectedMaterials.length >= maxSelection}
                />
                {getFileIcon(material.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{material.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(material.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MaterialSelector;
