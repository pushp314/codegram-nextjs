
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useTransition } from 'react';
import { generateSnippetAction, createSnippetAction, updateSnippetAction } from '@/app/actions';
import { Wand2, Loader2, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Snippet } from '@prisma/client';

const languages = ['tsx', 'jsx', 'javascript', 'typescript', 'html', 'css', 'python', 'go', 'java', 'csharp'];

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  code: z.string().min(1, 'Code cannot be empty.'),
  language: z.string().min(1, 'Please select a language.'),
  aiDescription: z.string().optional(),
});

type CreateSnippetFormProps = {
  snippet?: Snippet;
};

export default function CreateSnippetForm({ snippet }: CreateSnippetFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const isEditMode = !!snippet;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: snippet?.title || '',
      description: snippet?.description || '',
      code: snippet?.code || '',
      language: snippet?.language || 'javascript',
      aiDescription: '',
    },
  });

  const handleGenerateCode = async () => {
    const aiDescription = form.getValues('aiDescription');
    if (!aiDescription || aiDescription.length < 10) {
      form.setError('aiDescription', {
        type: 'manual',
        message: 'Please provide a more detailed description for the AI (at least 10 characters).',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSnippetAction({ description: aiDescription });
      form.setValue('code', result.codeSnippet, { shouldValidate: true });
      toast({
        title: 'Code Generated!',
        description: 'The AI has generated the code for you.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    startSubmitting(async () => {
      try {
        if (isEditMode) {
            await updateSnippetAction(snippet.id, values);
            toast({
                title: 'Snippet Updated!',
                description: 'Your changes have been saved successfully.',
            });
            router.push('/');
        } else {
            await createSnippetAction(values);
            toast({
                title: 'Snippet Published!',
                description: 'Your snippet is now live for the community to see.',
                action: (
                  <div className="bg-green-500 text-white p-2 rounded-full">
                    <PartyPopper />
                  </div>
                )
            });
            router.push('/');
        }
      } catch (error) {
         console.error(error);
        toast({
            variant: 'destructive',
            title: isEditMode ? 'Update Failed' : 'Failed to Publish',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {!isEditMode && (
            <div className="p-6 border rounded-2xl bg-muted/20 space-y-4">
            <h3 className="font-headline text-lg">✨ AI Code Generation</h3>
            <FormField
                control={form.control}
                name="aiDescription"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Describe what you want to build</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="e.g., 'A React hook to fetch data with loading and error states'"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="button" onClick={handleGenerateCode} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Generate Code
            </Button>
            </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Custom React Hook for Fetching Data" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what your code snippet does, how to use it, etc."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your code snippet goes here."
                  className="resize-y min-h-[250px] font-code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin mr-2" />}
          {isEditMode ? 'Save Changes' : 'Publish Snippet'}
        </Button>
      </form>
    </Form>
  );
}
