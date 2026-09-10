import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Universal content renderer for lessons and blogs
 * Supports Markdown with GFM extensions.
 */
export function ContentRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Unescape double-escaped newlines to enable proper Markdown parsing
  const formattedContent = content.replace(/\\n/g, '\n');

  return (
    <div className="content-renderer w-full text-left">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-[28px] font-bold text-[#1A1916] mt-8 mb-4 block leading-tight font-plus-jakarta" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-[22px] font-bold text-[#1A1916] mt-6 mb-3 block leading-snug font-plus-jakarta" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-[18px] font-bold text-[#1A1916] mt-5 mb-2 block leading-normal font-plus-jakarta" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="text-[16px] text-[#555550] leading-[1.8] mb-4 block font-normal" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2 block text-[#555550]" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2 block text-[#555550]" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="text-[15px] leading-relaxed text-[#555550]" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-[#1A3C2E] bg-slate-50 pl-4 py-2 pr-2 italic my-4 text-[#555550] rounded-r-lg block" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className="my-6 border-slate-100" {...props} />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}
