import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Image, Download, Loader2, FileJson, FileType } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { exportToWord, exportToPDF } from '@/utils/exportUtils';

interface ExportButtonsProps {
  language: 'ar' | 'en';
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  content?: string; // Fallback for single message export
  title?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  language,
  messages,
  content,
  title = 'Export'
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  // Prepare messages array if not provided
  const exportMessages = messages || (content ? [{ role: 'assistant' as const, content }] : []);

  const exportAsTxt = () => {
    try {
      const text = exportMessages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
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

  const handleExportWord = async () => {
    setIsExporting('word');
    try {
      await exportToWord({ title, language, messages: exportMessages });
      toast.success(t('تم التصدير كـ Word', 'Exported as Word'));
    } catch (error) {
      console.error('Word export error:', error);
      toast.error(t('فشل تصدير Word', 'Word export failed'));
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      await exportToPDF({ title, language, messages: exportMessages });
      toast.success(t('تم التصدير كـ PDF', 'Exported as PDF'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('فشل تصدير PDF', 'PDF export failed'));
    } finally {
      setIsExporting(null);
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
    .message {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      margin-bottom: 20px;
    }
    .role {
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 5px;
      display: block;
    }
    .assistant {
      border-right: 4px solid #10b981;
    }
    .user {
      border-right: 4px solid #6366f1;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${exportMessages.map(m => `
    <div class="message ${m.role}">
      <span class="role">${m.role === 'user' ? (language === 'ar' ? 'أنت' : 'You') : (language === 'ar' ? 'المعلم الذكي' : 'Assistant')}</span>
      <div>${m.content.replace(/\n/g, '<br>')}</div>
    </div>
  `).join('')}
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
      const text = exportMessages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n');
      await navigator.clipboard.writeText(text);
      toast.success(t('تم النسخ للحافظة', 'Copied to clipboard'));
    } catch (error) {
      console.error('Copy error:', error);
      toast.error(t('حدث خطأ في النسخ', 'Copy error occurred'));
    }
  };

  if (exportMessages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all">
          <Download className="w-4 h-4" />
          {t('تصدير المحادثة', 'Export Chat')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting !== null}>
          {isExporting === 'pdf' ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <FileType className="w-4 h-4 me-2 text-red-500" />}
          {t('تصدير كـ PDF', 'Export as PDF')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportWord} disabled={isExporting !== null}>
          {isExporting === 'word' ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <FileText className="w-4 h-4 me-2 text-blue-500" />}
          {t('تصدير كـ Word', 'Export as Word')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsTxt} disabled={isExporting !== null}>
          <FileJson className="w-4 h-4 me-2 text-gray-500" />
          {t('نص عادي (.txt)', 'Plain Text (.txt)')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsHTML} disabled={isExporting !== null}>
          <div className="w-4 h-4 me-2 flex items-center justify-center font-bold text-[10px] bg-orange-500 text-white rounded-sm">H</div>
          {t('صفحة ويب (.html)', 'Web Page (.html)')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          <Image className="w-4 h-4 me-2 text-purple-500" />
          {t('نسخ للحافظة', 'Copy to Clipboard')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButtons;

