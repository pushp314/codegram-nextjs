
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CreateDocForm from '../../create/create-doc-form';
import { getDocumentBySlugAction } from '@/app/actions';
import { notFound } from 'next/navigation';

export default async function EditDocPage({ params }: { params: { slug: string }}) {
  const session = await auth();
  const doc = await getDocumentBySlugAction(params.slug);

  if (!doc) {
    notFound();
  }

  if (session?.user?.id !== doc.author.id) {
    // Or show an unauthorized page
    redirect('/docs');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Edit Document</CardTitle>
          <CardDescription>
            Make changes to your document and save them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateDocForm doc={doc} />
        </CardContent>
      </Card>
    </div>
  );
}
