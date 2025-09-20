
'use client';

import { Bot } from 'lucide-react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import * as ShadcnComponents from '@/components/ui';
import { themes } from 'prism-react-renderer';

const initialCode = `function Component() {
  return (
    <div className="flex justify-center items-center h-full">
      <Button className="bg-blue-500 hover:bg-blue-600">Click me</Button>
    </div>
  )
}`;

export default function PlaygroundPage() {
  const scope = { ...ShadcnComponents };

  return (
    <LiveProvider code={initialCode} scope={scope} theme={themes.vsDark}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-10rem)] w-full bg-transparent rounded-lg overflow-hidden border">
        {/* Left side: Code Editor */}
        <div className="w-full md:w-1/2 p-4 font-mono text-sm text-[#d4d4d8] overflow-auto flex flex-col h-[50vh] md:h-auto">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400">Live Editor</span>
              </div>
          </div>
          <div className="relative flex-1 rounded-lg bg-background/80">
            <LiveEditor className="!bg-transparent p-4 rounded-lg !font-mono" />
            <LiveError className="absolute bottom-0 left-0 w-full p-2 bg-destructive text-destructive-foreground text-xs font-mono" />
          </div>
        </div>

        {/* Right side: Preview */}
        <div className="w-full md:w-1/2 bg-transparent flex flex-col items-center justify-center p-4 text-white h-[50vh] md:h-auto">
          <LivePreview className="w-full h-full flex items-center justify-center" />
        </div>
      </div>
    </LiveProvider>
  );
}
