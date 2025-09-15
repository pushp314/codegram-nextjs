
'use client';

import React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import * as ShadcnComponents from '@/components/ui';

interface LiveComponentProps {
  code: string;
  language: string;
}

const LiveComponent: React.FC<LiveComponentProps> = ({ code, language }) => {
  const scope = { ...ShadcnComponents, React };

  if (language === 'html') {
      const htmlWithTailwind = `
        <!DOCTYPE html>
        <html lang="en" class="dark">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
           <style>
             body { 
                padding: 1rem;
                background-color: transparent;
             }
           </style>
        </head>
        <body>
          ${code}
        </body>
        </html>
      `;

      return (
         <div className="bg-background border rounded-b-lg overflow-hidden h-full">
          <iframe
            srcDoc={htmlWithTailwind}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        </div>
      )
  }

  return (
    <LiveProvider code={code} scope={scope}>
      <div className="relative h-full">
        <LivePreview className="p-4 w-full h-full" />
        <LiveError className="absolute bottom-0 left-0 w-full p-2 bg-red-800 text-white text-xs font-mono" />
      </div>
    </LiveProvider>
  );
};

export default LiveComponent;
