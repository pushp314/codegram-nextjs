
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper } from 'lucide-react';
import { useTransition } from 'react';
import { createComponentAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(5, 'Component name must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  code: z.string().min(50, 'Code must be at least 50 characters.'),
});

export default function CreateComponentForm() {
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      code: '',
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    startSubmitting(async () => {
        try {
            const result = await createComponentAction(values);
            toast({
              title: "Component Published!",
              description: "Your component is now live in the marketplace.",
              action: (
                <div className="bg-green-500 text-white p-2 rounded-full">
                    <PartyPopper />
                </div>
              )
            });
            router.push(`/components/${result.slug}`);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Failed to Publish',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Component Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Animated Gradient Button" {...field} />
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
                  placeholder="A short summary of what your component does and how to use it."
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Component Code (TSX)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste your TSX code here. Make sure it uses Tailwind CSS and shadcn/ui components where possible."
                  className="resize-y min-h-[300px] font-code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
            Publish Component
        </Button>
      </form>
    </Form>
  );
}
