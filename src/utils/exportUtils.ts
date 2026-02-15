import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { ChatMessage } from '@/hooks/useChatMessages';

interface ExportOptions {
    title: string;
    language: 'ar' | 'en';
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const exportToWord = async ({ title, language, messages }: ExportOptions) => {
    const isAr = language === 'ar';

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 720,
                        right: 720,
                        bottom: 720,
                        left: 720,
                    },
                },
            },
            children: [
                new Paragraph({
                    text: title,
                    heading: HeadingLevel.HEADING_1,
                    alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    spacing: { after: 400 },
                }),
                ...messages.flatMap((m) => [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: m.role === 'user' ? (isAr ? 'أنت:' : 'You:') : (isAr ? 'المعلم الذكي:' : 'AI Teacher:'),
                                bold: true,
                                color: m.role === 'user' ? '6366f1' : '10b981',
                            }),
                        ],
                        alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        spacing: { before: 200 },
                    }),
                    ...m.content.split('\n').map(line =>
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line,
                                }),
                            ],
                            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        })
                    ),
                    new Paragraph({
                        children: [],
                        spacing: { after: 200 },
                    })
                ]),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/\s+/g, '_')}_${Date.now()}.docx`);
};

export const exportToPDF = async ({ title, language, messages }: ExportOptions) => {
    const doc = new jsPDF();
    const isAr = language === 'ar';

    // Basic PDF export (Note: Arabic support in jsPDF requires custom fonts)
    // For now, we'll provide a clean text layout. 
    // If Arabic isn't working well, Word is the recommended bilingual format.

    let y = 20;
    doc.setFontSize(20);
    doc.text(title, 20, y);
    y += 15;

    doc.setFontSize(12);

    messages.forEach((m) => {
        const roleText = m.role === 'user' ? (isAr ? 'User:' : 'You:') : (isAr ? 'AI:' : 'AI Teacher:');

        // Check for page break
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(roleText, 20, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(m.content, 170);

        // Check for page break again after splitting text
        if (y + (splitText.length * 7) > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(splitText, 20, y);
        y += (splitText.length * 7) + 5;
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
