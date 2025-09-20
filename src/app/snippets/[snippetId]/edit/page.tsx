
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CreateSnippetForm from '../../create/create-snippet-form';
import { getSnippetById } from '@/app/actions';
import { notFound } from 'next/navigation';

export default async function EditSnippetPage({ params }: { params: { snippetId: string }}) {
  const session = await auth();
  const snippet = await getSnippetById(params.snippetId);

  if (!snippet) {
    notFound();
  }
  
  if (session?.user?.id !== snippet.authorId) {
    // Or show an unauthorized page
    redirect('/');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Edit Snippet</CardTitle>
          <CardDescription>
            Make changes to your snippet and save it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSnippetForm snippet={snippet} />
        </CardContent>
      </Card>
    </div>
  );
}
