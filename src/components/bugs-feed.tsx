
'use server';

import BugCard from './bug-card';
import { getBugsAction } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';

export default async function BugsFeed() {
    const bugs = await getBugsAction();

    return (
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
    );
}
