
import UserAuthButtons from '@/components/user-auth-buttons';
import { Code } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
         <div className="mb-6 flex items-center justify-center gap-2">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tighter text-foreground">
                CodeGram
            </h1>
         </div>
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Welcome to CodeGram</h2>
        <p className="mt-2 text-muted-foreground">Connect with developers worldwide.</p>
        <div className="mt-8">
          <UserAuthButtons />
        </div>
      </div>
    </div>
  );
}
