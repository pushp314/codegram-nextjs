
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bookmark, MessageCircle, Send, Heart, Share2, MoreVertical, Flag, ShieldBan } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/code-block';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TracingBeam } from '@/components/ui/tracing-beam';


const markdownContent = `
React Hooks, introduced in React 16.8, are functions that let you “hook into” React state and lifecycle features from function components. Hooks don’t work inside classes — they let you use React without classes.

### Why Were Hooks Introduced?

Before Hooks, stateful logic and side effects in React components were primarily handled using class components. This led to several challenges:

- **Wrapper Hell:** Complex components became hard to follow due to a deep nesting of providers, consumers, higher-order components, and render props.
- **Huge Components:** Lifecycle methods often contained a mix of unrelated logic, making components difficult to test and maintain.
- **Confusing Classes:** JavaScript classes can be a barrier for developers, requiring an understanding of \`this\`, binding, and other concepts.

Hooks solve these problems by allowing you to extract stateful logic into reusable, isolated functions.

### The Most Common Hooks

Here’s a brief look at the two most essential Hooks: \`useState\` and \`useEffect\`.

#### 1. useState

The \`useState\` Hook lets you add state to function components. When you call \`useState\`, you declare a “state variable.”

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  // Declares a state variable named "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

In this example, \`useState(0)\` initializes \`count\` to \`0\`. \`setCount\` is the function that updates the state, triggering a re-render.

#### 2. useEffect

The \`useEffect\` Hook lets you perform side effects in function components. Data fetching, subscriptions, or manually changing the DOM are all examples of side effects.

\`useEffect\` runs after every render, including the first one.

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // This function runs after every render
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1);
    }, 1000);

    // This is the cleanup function
    return () => clearInterval(interval);
  }, []); // The empty array means this effect runs only once

  return <p>Timer: {seconds}s</p>;
}
\`\`\`

The empty dependency array \`[]\` tells React to run the effect only once (on mount) and clean it up on unmount.

### Rules of Hooks

There are two important rules to follow when using Hooks:

1.  **Only Call Hooks at the Top Level:** Don’t call Hooks inside loops, conditions, or nested functions.
2.  **Only Call Hooks from React Functions:** Call them from React function components or custom Hooks, not regular JavaScript functions.

By following these rules, you ensure that Hooks are called in the same order on every render, which is how React preserves their state.
`;

function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export default function DocDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    setIsScrolled(!inView);
  }, [inView]);


  const SocialButton = ({ icon: Icon, children, tooltip }: { icon: React.ElementType, children?: React.ReactNode, tooltip: string }) => (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size={isScrolled ? 'icon' : 'sm'} className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", isScrolled ? "h-5 w-5" : "h-4 w-4")} />
                    {!isScrolled && children}
                </Button>
            </TooltipTrigger>
            {isScrolled && <TooltipContent>{tooltip}</TooltipContent>}
        </Tooltip>
    </TooltipProvider>
  )

  return (
    <TracingBeam className="px-6">
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-12">

        <div className="lg:w-3/4">
            <div className="prose prose-lg dark:prose-invert max-w-none bg-transparent">
                <h1>Getting Started with React Hooks</h1>
                <p className="text-muted-foreground">Published on July 13, 2024 • 5 min read</p>
            </div>
            
            <div ref={ref} className="h-px" /> 

            <motion.div
                animate={{
                    y: 0,
                    opacity: 1
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn(
                    'z-40 bg-card/50 backdrop-blur-sm',
                    isScrolled
                    ? 'fixed top-20 right-4 sm:right-8 rounded-full border p-1'
                    : 'sticky top-[68px] border-y my-6 rounded-lg'
                )}
            >
                <div className={cn("flex items-center", isScrolled ? "gap-1" : "justify-between px-2 py-2")}>
                    <div className={cn("flex items-center", isScrolled ? "gap-1" : "gap-1")}>
                        <SocialButton icon={Heart} tooltip="Like (1.2k)">
                            {!isScrolled && <span>Like (1.2k)</span>}
                        </SocialButton>
                        <a href="#comments">
                            <SocialButton icon={MessageCircle} tooltip="Comment (3)">
                                {!isScrolled && <span>Comment (3)</span>}
                            </SocialButton>
                        </a>
                    </div>
                    <div className={cn("flex items-center", isScrolled ? "gap-1" : "gap-1")}>
                        <SocialButton icon={Bookmark} tooltip="Save" />
                        <SocialButton icon={Share2} tooltip="Share" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><Flag className="mr-2"/> Report</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive"><ShieldBan className="mr-2"/> Block user</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </motion.div>
            
            <aside className="my-6 lg:hidden">
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Table of Contents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#why-were-hooks-introduced" className="hover:text-primary transition-colors">Why Were Hooks Introduced?</a></li>
                            <li><a href="#the-most-common-hooks" className="hover:text-primary transition-colors">The Most Common Hooks</a></li>
                            <li className="pl-4"><a href="#1-usestate" className="hover:text-primary transition-colors">1. useState</a></li>
                            <li className="pl-4"><a href="#2-useeffect" className="hover:text-primary transition-colors">2. useEffect</a></li>
                            <li><a href="#rules-of-hooks" className="hover:text-primary transition-colors">Rules of Hooks</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </aside>

          <article className="prose prose-lg dark:prose-invert max-w-none pt-6 bg-transparent">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h3: ({node, ...props}) => {
                        const id = slugify(props.children?.toString() || '');
                        return <h3 id={id} {...props} />;
                    },
                    h4: ({node, ...props}) => {
                        const id = slugify(props.children?.toString() || '');
                        return <h4 id={id} {...props} />;
                    },
                    code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                            <div className="not-prose my-4">
                                <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]}/>
                            </div>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {markdownContent}
            </ReactMarkdown>
          </article>
          
           <Separator className="my-12" />

            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="https://picsum.photos/seed/doc1-author/96/96" data-ai-hint="woman developer" />
                            <AvatarFallback>AP</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="font-bold text-lg">Ada Lovelace</p>
                            <p className="text-sm text-muted-foreground">@adalovelace</p>
                            <p className="text-sm text-muted-foreground mt-4">A pioneering programmer and writer, passionate about making complex topics accessible to everyone.</p>
                            <button className="w-full sm:w-auto mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors rounded-lg h-9 text-sm font-semibold px-4">Follow</button>
                        </div>
                    </div>
                </CardContent>
            </Card>

          <Separator className="my-12" />

          <div id="comments">
            <h2 className="text-2xl font-bold mb-6">Comments (3)</h2>
            <div className="space-y-6">
                <div className="flex gap-4">
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/user/40/40" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <textarea placeholder="Add a comment..." className="w-full bg-card/50 backdrop-blur-sm rounded-lg p-3 text-sm focus:ring-primary focus:ring-2 focus:outline-none transition-shadow" rows={2}></textarea>
                        <div className="flex justify-end mt-2">
                            <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                                <Send className="h-4 w-4" />
                                Post
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="flex gap-4">
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/grace/40/40" />
                        <AvatarFallback>GH</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-sm">Grace Hopper</p>
                            <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                        <p className="text-sm">Great explanation! The cleanup function in useEffect is something a lot of beginners miss.</p>
                    </div>
                </div>
                 <div className="flex gap-4">
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/turing/40/40" />
                        <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-sm">Alan Turing</p>
                            <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                        <p className="text-sm">I'd add a note about custom hooks. They're the real superpower for code reuse.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block lg:w-1/4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li><a href="#why-were-hooks-introduced" className="hover:text-primary transition-colors">Why Were Hooks Introduced?</a></li>
                        <li><a href="#the-most-common-hooks" className="hover:text-primary transition-colors">The Most Common Hooks</a></li>
                        <li className="pl-4"><a href="#1-usestate" className="hover:text-primary transition-colors">1. useState</a></li>
                        <li className="pl-4"><a href="#2-useeffect" className="hover:text-primary transition-colors">2. useEffect</a></li>
                        <li><a href="#rules-of-hooks" className="hover:text-primary transition-colors">Rules of Hooks</a></li>
                    </ul>
                </CardContent>
            </Card>
        </aside>

      </div>
    </div>
    </TracingBeam>
  );
}
