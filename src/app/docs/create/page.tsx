
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CreateDocForm from './create-doc-form';

export default async function CreateDocPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a new Document</CardTitle>
          <CardDescription>
            Share your knowledge with the community. Write your document using Markdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateDocForm />
        </CardContent>
      </Card>
    </div>
  );
}

