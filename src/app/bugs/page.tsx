
import { Bug } from 'lucide-react';
import { getBugsAction } from '../actions';
import BugCard from '@/components/bug-card';
import { formatDistanceToNow } from 'date-fns';
import CreateBugForm from '@/components/create-bug-form';

export default async function BugsPage() {
  const bugs = await getBugsAction();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline text-3xl mb-2 flex items-center"><Bug className="mr-3 h-8 w-8 text-primary" /> Bug Feed</h1>
          <p className="text-muted-foreground">Report issues, and track bugs.</p>
        </div>
        <CreateBugForm />
      </div>

      <div className="space-y-6">
        {bugs.map((bug) => (
          <BugCard
            key={bug.id}
            authorName={bug.author.name || 'Anonymous'}
            authorImage={bug.author.image || ''}
            authorImageHint="developer portrait"
            timestamp={formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
            content={bug.content}
            upvotes={0} // Placeholder
            comments={0} // Placeholder
            tags={[bug.status.toLowerCase(), 'bug']}
          />
        ))}
      </div>
    </div>
  );
}
