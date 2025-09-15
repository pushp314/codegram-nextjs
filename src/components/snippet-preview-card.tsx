
'use client';

import { motion } from 'framer-motion';
import type { Snippet } from '@/lib/types';
import CodeBlock from './code-block';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

type SnippetPreviewCardProps = {
  snippet: Snippet;
};

export default function SnippetPreviewCard({ snippet }: SnippetPreviewCardProps) {
  const { author, title, code, language } = snippet;

  const authorName = author?.name ?? 'Anonymous';
  const authorUsername = author?.email?.split('@')[0] ?? 'anonymous';
  const authorImage = author?.image ?? undefined;

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between cursor-pointer group">
      <div className="flex-grow overflow-hidden relative">
        <div className="absolute inset-0 max-h-full overflow-hidden">
             <CodeBlock code={code} language={language} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent group-hover:from-card/90 transition-all duration-300" />
      </div>

      <motion.div
        className="relative pt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="font-headline text-lg font-semibold text-foreground truncate">{title}</h3>
        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={authorImage} alt={authorName} data-ai-hint="developer portrait" />
                    <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{authorUsername}</span>
            </div>
            <Badge variant="secondary">{language}</Badge>
        </div>
      </motion.div>
    </div>
  );
}
