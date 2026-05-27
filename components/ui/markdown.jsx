'use client';
// Lightweight markdown renderer (no external deps).
import { useMemo } from 'react';

function escape(s){return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}

export default function ReactMarkdown({ children }) {
  const html = useMemo(()=>{
    if (!children) return '';
    let text = escape(String(children));
    // code blocks
    text = text.replace(/```([\s\S]*?)```/g, (_,c)=>`<pre class="my-2 rounded-lg bg-muted p-3 text-xs overflow-x-auto"><code>${c}</code></pre>`);
    // headings
    text = text.replace(/^###\s+(.*)$/gm,'<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>');
    text = text.replace(/^##\s+(.*)$/gm,'<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>');
    text = text.replace(/^#\s+(.*)$/gm,'<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>');
    // bold/italic/inline code
    text = text.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g,'<em>$1</em>');
    text = text.replace(/`([^`]+)`/g,'<code class="px-1 py-0.5 rounded bg-muted text-[12px]">$1</code>');
    // lists
    text = text.replace(/^(?:-|\*)\s+(.*)$/gm,'<li class="ml-4 list-disc">$1</li>');
    text = text.replace(/(<li[\s\S]*?<\/li>)(?!\s*<li)/g,'<ul class="my-1 space-y-0.5">$1</ul>');
    // links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" class="text-primary underline" target="_blank">$1</a>');
    // paragraphs
    text = text.split(/\n\n+/).map(p => p.match(/^<(h1|h2|h3|ul|pre)/) ? p : `<p>${p.replace(/\n/g,'<br/>')}</p>`).join('');
    return text;
  }, [children]);
  return <div className="prose prose-sm max-w-none [&_p]:my-1" dangerouslySetInnerHTML={{ __html: html }} />;
}
