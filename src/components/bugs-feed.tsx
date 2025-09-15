
import { PlaceHolderImages } from '@/lib/placeholder-images';
import BugCard from './bug-card';

const sampleBugs = [
  {
    authorName: 'Ada Lovelace',
    authorImage: PlaceHolderImages[0].imageUrl,
    authorImageHint: PlaceHolderImages[0].imageHint,
    timestamp: '2h ago',
    content: 'Anyone else getting a hydration error with the new React 19 beta? Seems to only happen with nested server components.',
    upvotes: 12,
    comments: 5,
    tags: ['bug', 'react19', 'nextjs']
  },
  {
    authorName: 'Grace Hopper',
    authorImage: PlaceHolderImages[1].imageUrl,
    authorImageHint: PlaceHolderImages[1].imageHint,
    timestamp: '5h ago',
    content: 'What\'s the best way to handle rate limiting in a Next.js API route? Looking for a simple library that works well with serverless environments. Any recommendations for a middleware solution?',
    upvotes: 25,
    comments: 12,
    tags: ['question', 'nextjs', 'api-routes']
  },
    {
    authorName: 'Charles Babbage',
    authorImage: 'https://picsum.photos/seed/charles/64/64',
    authorImageHint: 'man portrait',
    timestamp: '8h ago',
    content: 'My CSS grid is breaking on mobile, but only on Safari. The columns stack vertically instead of maintaining the grid structure. Flexbox works fine. Any ideas what could be causing this weird rendering issue?',
    upvotes: 5,
    comments: 2,
    tags: ['bug', 'css', 'safari']
  },
  {
    authorName: 'Alan Turing',
    authorImage: 'https://picsum.photos/seed/turing/64/64',
    authorImageHint: 'mathematician portrait',
    timestamp: '1d ago',
    content: 'Just shipped a new feature using Genkit flows. The developer experience was surprisingly smooth. The typed schemas for prompts and outputs caught a few potential errors before I even ran the code. Highly recommend trying it out.',
    upvotes: 42,
    comments: 8,
    tags: ['discussion', 'genkit', 'ai']
  },
];

export default function BugsFeed() {
    return (
        <div className="space-y-6">
            {sampleBugs.map((bug, index) => (
                <BugCard key={index} {...bug} />
            ))}
        </div>
    );
}
