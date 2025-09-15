
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { generateSnippetAction } from '@/app/actions';
import { Wand2 } from 'lucide-react';
import CodeBlock from './code-block';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const formSchema = z.object({
  description: z.string().min(10, 'Please provide a more detailed description (at least 10 characters).'),
});

export default function SnippetGenerator() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedCode('');
    try {
      const result = await generateSnippetAction(values);
      setGeneratedCode(result.codeSnippet);
      toast({
        title: 'Snippet Generated!',
        description: 'Your code is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (status === 'unauthenticated') {
    return (
        <Card className="text-center p-8">
            <p className="mb-4 text-muted-foreground">You need to be signed in to use the AI Snippet Generator.</p>
            <Button asChild>
                <Link href="/login">Sign In</Link>
            </Button>
        </Card>
    )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Snippet Description</FormLabel>                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'A React hook to fetch data with loading and error states'"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || status === 'loading'}>
              <Wand2 className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Code'}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isLoading || generatedCode) && (
        <div className="p-4 border-t">
          {isLoading && <Skeleton className="h-40 w-full" />}
          {generatedCode && <CodeBlock code={generatedCode} language="javascript" />}
        </div>
      )}
    </Card>
  );
}
