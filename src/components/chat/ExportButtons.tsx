import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Image, Download, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportButtonsProps {
  language: 'ar' | 'en';
  content: string;
  title?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  language,
  content,
  title = 'Export'
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const exportAsTxt = () => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('تم التصدير بنجاح', 'Exported successfully'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('حدث خطأ في التصدير', 'Export error occurred'));
    }
  };

  const exportAsHTML = async () => {
    setIsExporting('html');
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: ${language === 'ar' ? "'Segoe UI', Tahoma, 'Arial'" : "'Segoe UI', Tahoma, Geneva"}, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.8;
      background: #fafafa;
      color: #333;
    }
    h1 {
      color: #6366f1;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 10px;
    }
    pre {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>${title}</h1>
    <div>${content.replace(/\n/g, '<br>')}</div>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('تم التصدير كـ HTML', 'Exported as HTML'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('حدث خطأ في التصدير', 'Export error occurred'));
    } finally {
      setIsExporting(null);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(t('تم النسخ للحافظة', 'Copied to clipboard'));
    } catch (error) {
      console.error('Copy error:', error);
      toast.error(t('حدث خطأ في النسخ', 'Copy error occurred'));
    }
  };

  if (!content) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          {t('تصدير', 'Export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsTxt}>
          <FileText className="w-4 h-4 me-2" />
          {t('نص عادي (.txt)', 'Plain Text (.txt)')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsHTML} disabled={isExporting === 'html'}>
          {isExporting === 'html' ? (
            <Loader2 className="w-4 h-4 me-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 me-2" />
          )}
          {t('صفحة ويب (.html)', 'Web Page (.html)')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          <Image className="w-4 h-4 me-2" />
          {t('نسخ للحافظة', 'Copy to Clipboard')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButtons;
