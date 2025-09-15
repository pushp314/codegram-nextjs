
import { getDocumentBySlugAction } from '@/app/actions';
import DocClientPage from './doc-client-page';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';


export default async function DocDetailPage({ params }: { params: { slug: string }}) {
  const doc = await getDocumentBySlugAction(params.slug);

  if (!doc) {
    notFound();
  }
  
  return <DocClientPage doc={doc} />;
}
