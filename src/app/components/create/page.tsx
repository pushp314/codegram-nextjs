
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CreateComponentForm from './create-component-form';

export default async function CreateComponentPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Submit a new Component</CardTitle>
          <CardDescription>
            Share your UI component with the community. Please provide the code in TSX format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateComponentForm />
        </CardContent>
      </Card>
    </div>
  );
}
