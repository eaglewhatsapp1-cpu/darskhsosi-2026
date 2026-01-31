import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-foreground mt-4 mb-2 border-b border-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-foreground mt-3 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-foreground mt-2 mb-1">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-2 text-foreground">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">
              {children}
            </li>
          ),
          // Bold & Italic
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          ),
          // Code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">
                  {children}
                </code>
              );
            }
            return (
              <code className={cn('block bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto', className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted rounded-lg overflow-x-auto mb-3">
              {children}
            </pre>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-s-4 border-primary/50 ps-4 py-1 my-2 bg-primary/5 rounded-e-lg text-sm italic">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-border rounded-lg text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-start font-semibold border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-border">
              {children}
            </td>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-4 border-border" />
          ),
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
