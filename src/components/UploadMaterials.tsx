import React, { useCallback, useState } from 'react';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Upload, FileText, Image, File, X, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

interface UploadMaterialsProps {
  language: 'ar' | 'en';
}

// MIME type validation for security
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_MATERIAL_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/x-markdown',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const validateFile = (file: File, allowedTypes: string[], language: 'ar' | 'en'): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: language === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)' : 'File too large (max 10MB)' 
    };
  }
  
  // Check MIME type
  if (file.type && !allowedTypes.includes(file.type)) {
    // For files without MIME type, check extension as fallback
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['txt', 'md', 'csv', 'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
    
    if (!ext || !validExtensions.includes(ext)) {
      return { 
        valid: false, 
        error: language === 'ar' ? 'نوع الملف غير مدعوم' : 'File type not supported' 
      };
    }
  }
  
  return { valid: true };
};

const UploadMaterials: React.FC<UploadMaterialsProps> = ({ language }) => {
  const { materials, loading, addMaterial, deleteMaterial, uploadFile, extractDocumentContent } = useUploadedMaterials();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'sidebar.upload': 'رفع المواد',
        'upload.description': 'ارفع ملفاتك التعليمية للحصول على تجربة تعلم مخصصة',
        'upload.dropHere': 'أفلت الملفات هنا',
        'upload.dragDrop': 'اسحب الملفات وأفلتها هنا',
        'upload.orClick': 'أو انقر لاختيار الملفات',
        'upload.supported': 'الملفات المدعومة: TXT, PDF, Word, Markdown, CSV, الصور',
        'upload.files': 'الملفات المرفوعة',
        'action.upload': 'رفع',
      },
      en: {
        'sidebar.upload': 'Upload Materials',
        'upload.description': 'Upload your learning materials for a personalized learning experience',
        'upload.dropHere': 'Drop files here',
        'upload.dragDrop': 'Drag and drop files here',
        'upload.orClick': 'or click to select files',
        'upload.supported': 'Supported files: TXT, PDF, Word, Markdown, CSV, Images',
        'upload.files': 'Uploaded Files',
        'action.upload': 'Upload',
      },
    };
    return translations[language][key] || key;
  };

  const acceptedTypes = ['.txt', '.pdf', '.doc', '.docx', '.md', '.csv', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

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
    let successCount = 0;
    let errorCount = 0;
    const documentsToExtract: { id: string; storagePath: string; fileType: string }[] = [];
    
    for (const file of files) {
      // Validate file before uploading
      const validation = validateFile(file, ALLOWED_MATERIAL_TYPES, language);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        errorCount++;
        continue;
      }
      
      const result = await uploadFile(file);
      
      if (!result) {
        toast.error(language === 'ar' ? `فشل رفع ${file.name}` : `Failed to upload ${file.name}`);
        errorCount++;
        continue;
      }
      
      // Use original filename for display, but sanitized filename was used for storage
      const { data, error } = await addMaterial({
        file_name: result.originalFilename || file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: result.storagePath,
        content: result.content,
      });
      
      if (error) {
        toast.error(language === 'ar' ? `فشل رفع ${file.name}` : `Failed to upload ${file.name}`);
        errorCount++;
      } else {
        successCount++;
        // Queue documents that need extraction (PDF, DOCX, etc.)
        if (result.needsExtraction && data?.id && result.storagePath) {
          documentsToExtract.push({ 
            id: data.id, 
            storagePath: result.storagePath,
            fileType: result.fileType
          });
        }
      }
    }
    
    if (successCount > 0) {
      toast.success(language === 'ar' 
        ? `تم رفع ${successCount} ملف بنجاح` 
        : `${successCount} file(s) uploaded successfully`
      );
    }
    
    setUploading(false);

    // Extract document content in background
    if (documentsToExtract.length > 0) {
      toast.info(language === 'ar' 
        ? 'جاري استخراج محتوى الملفات...'
        : 'Extracting document content...'
      );
      
      for (const doc of documentsToExtract) {
        const success = await extractDocumentContent(doc.id, doc.storagePath, doc.fileType);
        if (success) {
          toast.success(language === 'ar' 
            ? 'تم استخراج المحتوى بنجاح'
            : 'Document content extracted successfully'
          );
        } else {
          toast.error(language === 'ar'
            ? 'فشل استخراج المحتوى'
            : 'Failed to extract document content'
          );
        }
      }
    }
  };

  const [extractingId, setExtractingId] = useState<string | null>(null);

  const handleReExtract = async (material: { id: string; storage_path: string | null; file_type: string | null }) => {
    if (!material.storage_path) {
      toast.error(language === 'ar' ? 'لا يوجد مسار للملف' : 'No file path available');
      return;
    }
    
    setExtractingId(material.id);
    toast.info(language === 'ar' ? 'جاري استخراج المحتوى...' : 'Extracting content...');
    
    const success = await extractDocumentContent(material.id, material.storage_path, material.file_type || '');
    
    setExtractingId(null);
    
    if (success) {
      toast.success(language === 'ar' ? 'تم استخراج المحتوى بنجاح' : 'Content extracted successfully');
    } else {
      toast.error(language === 'ar' ? 'فشل استخراج المحتوى' : 'Failed to extract content');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteMaterial(id);
    if (error) {
      toast.error(language === 'ar' ? 'فشل حذف الملف' : 'Failed to delete file');
    } else {
      toast.success(language === 'ar' ? 'تم حذف الملف' : 'File deleted');
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return Image;
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) return FileText;
    return File;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <Upload className="w-5 h-5 text-accent-foreground" />
          </div>
          {t('sidebar.upload')}
        </h2>
        <p className="text-muted-foreground mt-2">{t('upload.description')}</p>
      </div>

      <div
        data-helper-target="upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex-1 border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center p-8 text-center',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        )}
      >
        <div className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-200',
          isDragging ? 'bg-primary/20 scale-110' : 'bg-secondary'
        )}>
          {uploading ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          ) : (
            <Upload className={cn('w-10 h-10 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
          )}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isDragging ? t('upload.dropHere') : t('upload.dragDrop')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t('upload.orClick')}</p>

        <input type="file" id="file-upload" multiple accept={acceptedTypes.join(',')} onChange={handleFileInput} className="hidden" />
        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer" asChild disabled={uploading}>
            <span><Upload className="w-4 h-4 me-2" />{t('action.upload')}</span>
          </Button>
        </label>

        <p className="text-xs text-muted-foreground mt-4">{t('upload.supported')}</p>
      </div>

      {materials.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            {t('upload.files')} ({materials.length})
          </h3>
          <div data-helper-target="uploaded-files" className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {materials.map((file) => {
              const Icon = getFileIcon(file.file_name);
              const canExtract = file.storage_path && ['pdf', 'docx', 'doc', 'pptx'].some(ext => 
                file.file_name.toLowerCase().endsWith(`.${ext}`)
              );
              
              return (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl animate-slide-up">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">{file.file_name}</span>
                  {file.content ? (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded" title={language === 'ar' ? 'تم استخراج المحتوى' : 'Content extracted'}>
                      ✓ {language === 'ar' ? 'جاهز' : 'Ready'}
                    </span>
                  ) : canExtract ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="shrink-0 h-8 text-xs"
                      onClick={() => handleReExtract(file)}
                      disabled={extractingId === file.id}
                    >
                      {extractingId === file.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 me-1" />
                          {language === 'ar' ? 'استخراج' : 'Extract'}
                        </>
                      )}
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => handleDelete(file.id)}>
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

// Export validation function for use in ProfilePage
export { validateFile, ALLOWED_AVATAR_TYPES, ALLOWED_MATERIAL_TYPES, MAX_FILE_SIZE };
