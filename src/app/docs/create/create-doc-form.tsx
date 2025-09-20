
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { createDocAction, updateDocumentAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import type { Document } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
  tags: z.string().optional(),
});

type CreateDocFormProps = {
  doc?: Document;
};

export default function CreateDocForm({ doc }: CreateDocFormProps) {
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const isEditMode = !!doc;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: doc?.title || '',
      description: doc?.description || '',
      content: doc?.content || '',
      tags: doc?.tags.join(', ') || '',
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    startSubmitting(async () => {
        try {
            if (isEditMode) {
                const result = await updateDocumentAction(doc.id, {
                    ...values,
                    tags: values.tags || '',
                });
                toast({
                    title: "Document Updated!",
                    description: "Your changes have been saved.",
                });
                router.push(`/docs/${result.slug}`);
            } else {
                const result = await createDocAction({
                    ...values,
                    tags: values.tags || '',
                });
                toast({
                  title: "Document Published!",
                  description: "Your document is now live for the community.",
                });
                router.push(`/docs/${result.slug}`);
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
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Getting Started with React Hooks" {...field} />
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
                  placeholder="A short summary of your document."
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your document here. Markdown is supported."
                  className="resize-y min-h-[300px] font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="e.g., react, javascript, webdev" {...field} />
              </FormControl>
               <p className="text-sm text-muted-foreground">
                Enter comma-separated tags.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
            {isEditMode ? 'Save Changes' : 'Publish Document'}
        </Button>
      </form>
    </Form>
  );
}
