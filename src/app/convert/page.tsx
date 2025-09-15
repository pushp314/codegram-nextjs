
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GitFork, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { convertCodeAction } from '../actions';
import CodeBlock from '@/components/code-block';
import { Skeleton } from '@/components/ui/skeleton';

const languages = ['javascript', 'python', 'java', 'csharp', 'typescript', 'go', 'rust', 'ruby', 'php', 'swift'];

const formSchema = z.object({
  sourceCode: z.string().min(10, 'Source code must be at least 10 characters.'),
  sourceLanguage: z.string().min(1, 'Please select the source language.'),
  targetLanguage: z.string().min(1, 'Please select the target language.'),
});

export default function ConvertPage() {
  const [convertedCode, setConvertedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceCode: '',
      sourceLanguage: 'javascript',
      targetLanguage: 'python',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.sourceLanguage === values.targetLanguage) {
      toast({
        variant: 'destructive',
        title: 'Invalid Selection',
        description: 'Source and target languages cannot be the same.',
      });
      return;
    }

    setIsLoading(true);
    setConvertedCode('');
    try {
      const result = await convertCodeAction(values);
      setConvertedCode(result.convertedCode);
      toast({
        title: 'Conversion Successful!',
        description: `Your ${values.sourceLanguage} code has been converted to ${values.targetLanguage}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Conversion Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <GitFork className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl">AI Code Converter</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convert Code Between Languages</CardTitle>
          <CardDescription>
            Select the source and target languages, paste your code, and let AI handle the conversion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <FormField
                  control={form.control}
                  name="sourceLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={`source-${lang}`} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={`target-${lang}`} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="sourceCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Source Code</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Paste your source code here."
                            className="resize-y min-h-[300px] font-code"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <div className="space-y-2">
                    <FormLabel>Converted Code</FormLabel>
                    <div className="min-h-[300px] rounded-md border bg-muted/50 p-1">
                        {isLoading && (
                            <div className="p-4">
                                <Skeleton className="h-[280px] w-full" />
                            </div>
                        )}
                        {convertedCode && !isLoading && (
                            <CodeBlock code={convertedCode} language={form.getValues('targetLanguage')} />
                        )}
                         {!convertedCode && !isLoading && (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                                Your converted code will appear here.
                            </div>
                        )}
                    </div>
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Convert Code
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
