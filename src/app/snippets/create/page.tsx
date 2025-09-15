import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CreateSnippetForm from './create-snippet-form';

export default async function CreateSnippetPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a new Snippet</CardTitle>
          <CardDescription>
            Share your code with the community. Write it manually or let our AI generate it for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSnippetForm />
        </CardContent>
      </Card>
    </div>
  );
}
