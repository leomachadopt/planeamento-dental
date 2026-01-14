import ReactMarkdown from 'react-markdown'
import { Card, CardContent } from '@/components/ui/card'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3 text-slate-800 dark:text-slate-200" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-300" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4 text-slate-700 dark:text-slate-300" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-teal-500 pl-4 italic my-4 text-slate-600 dark:text-slate-400"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code
                className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-900 dark:text-slate-100"
                {...props}
              />
            ) : (
              <code
                className="block bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-slate-900 dark:text-slate-100"
                {...props}
              />
            ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-800 dark:text-slate-200" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-teal-600 dark:text-teal-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}


