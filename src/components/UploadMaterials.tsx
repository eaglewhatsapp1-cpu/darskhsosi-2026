import React, { useCallback, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearner } from '@/contexts/LearnerContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const UploadMaterials: React.FC = () => {
  const { t } = useLanguage();
  const { uploadedMaterials, addUploadedMaterial } = useLearner();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const acceptedTypes = [
    '.txt', '.pdf', '.doc', '.docx', '.md', '.csv',
    '.png', '.jpg', '.jpeg', '.gif', '.webp'
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    
    // Simulate upload delay
    for (const file of files) {
      await new Promise(resolve => setTimeout(resolve, 500));
      addUploadedMaterial(file.name);
    }
    
    setUploading(false);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
      return Image;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) {
      return FileText;
    }
    return File;
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <Upload className="w-5 h-5 text-accent-foreground" />
          </div>
          {t('sidebar.upload')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('chat.uploadFirst')}
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex-1 border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center p-8 text-center',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        )}
      >
        <div className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-200',
          isDragging ? 'bg-primary/20 scale-110' : 'bg-secondary'
        )}>
          {uploading ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          ) : (
            <Upload className={cn(
              'w-10 h-10 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          )}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isDragging ? 'أفلت الملفات هنا' : 'اسحب الملفات وأفلتها هنا'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          أو انقر لاختيار الملفات
        </p>

        <input
          type="file"
          id="file-upload"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>
              <Upload className="w-4 h-4 me-2" />
              {t('action.upload')}
            </span>
          </Button>
        </label>

        <p className="text-xs text-muted-foreground mt-4">
          الملفات المدعومة: TXT, PDF, Word, Markdown, CSV, الصور
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedMaterials.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            الملفات المرفوعة ({uploadedMaterials.length})
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {uploadedMaterials.map((file, index) => {
              const Icon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl animate-slide-up"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">
                    {file}
                  </span>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadMaterials;
