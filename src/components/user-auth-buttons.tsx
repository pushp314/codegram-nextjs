
'use client';

import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { Github } from 'lucide-react';
import { cn } from '@/lib/utils';

const GoogleIconSvg = () => (
    <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.25-4.8 2.25-5.76 0-10.4-4.63-10.4-10.33 0-5.7 4.64-10.33 10.4-10.33 3.36 0 5.2 1.43 6.4 2.58l2.9-2.88C19.29 1.45 16.2.5 12.48.5 5.8 0 0 5.7 0 12.4s5.8 12.4 12.48 12.4c6.9 0 12.1-4.78 12.1-12.52 0-1.05-.1-1.85-.25-2.68z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
)

export default function UserAuthButtons() {
  const buttonClassName = "relative group w-full overflow-hidden rounded-2xl text-lg h-12 transition-all duration-300";
  const spanClassName = "absolute inset-0 z-10 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100";

  return (
    <div className="flex flex-col space-y-4">
      <Button 
        variant="outline" 
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className={cn(buttonClassName, "border-input bg-background text-foreground hover:bg-accent/5 hover:text-foreground")}
      >
        <span className={spanClassName} />
        <GoogleIconSvg />
        Continue with Google
      </Button>
      <Button 
        onClick={() => signIn('github', { callbackUrl: '/' })}
        className={cn(buttonClassName, "bg-[#161B22] text-white hover:bg-[#21262d] border border-[#30363d]")}
        >
         <span className={spanClassName} />
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}
