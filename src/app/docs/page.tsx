
import { DocCard } from '@/components/doc-card';
import { Input } from '@/components/ui/input';
import { FileText, Search } from 'lucide-react';
import { getDocumentsAction } from '../actions';

const placeholderDocs = [
  {
    title: 'Getting Started with React Hooks',
    description: 'A comprehensive guide to understanding and using React Hooks for state management and side effects.',
    tags: ['React', 'JavaScript', 'Frontend'],
    image: 'https://picsum.photos/seed/doc1/600/400',
    imageHint: 'abstract code lines',
    author: 'Ada Lovelace',
    authorImage: 'https://picsum.photos/seed/doc1-author/40/40',
    authorImageHint: 'woman developer',
    link: '/docs/getting-started-with-react-hooks'
  },
  {
    title: 'Advanced CSS Grid Techniques',
    description: 'Explore powerful features of CSS Grid to create complex, responsive layouts with maintainable code.',
    tags: ['CSS', 'Layout', 'Web Design'],
    image: 'https://picsum.photos/seed/doc2/600/400',
    imageHint: 'geometric pattern',
    author: 'Ben Carter',
    authorImage: 'https://picsum.photos/seed/ben/40/40',
    authorImageHint: 'man portrait',
    link: '#'
  },
    {
    title: 'Building a REST API with Node.js',
    description: 'Learn to build a robust REST API from scratch using Node.js, Express, and best practices.',
    tags: ['Node.js', 'API', 'Backend'],
    image: 'https://picsum.photos/seed/doc3/600/400',
    imageHint: 'server racks',
    author: 'Grace Hopper',
    authorImage: 'https://picsum.photos/seed/grace/40/40',
    authorImageHint: 'woman developer',
    link: '#'
  },
    {
    title: 'Mastering TypeScript for Large Apps',
    description: 'Best practices for using TypeScript to improve code quality and maintainability in complex projects.',
    tags: ['TypeScript', 'Best Practices', 'Architecture'],
    image: 'https://picsum.photos/seed/doc4/600/400',
    imageHint: 'network diagram',
    author: 'Alan Turing',
    authorImage: 'https://picsum.photos/seed/turing/40/40',
    authorImageHint: 'mathematician portrait',
    link: '#'
  },
    {
    title: 'An Introduction to Docker for Devs',
    description: 'Understand the fundamentals of Docker and how to containerize your web applications.',
    tags: ['Docker', 'DevOps', 'Deployment'],
    image: 'https://picsum.photos/seed/doc5/600/400',
    imageHint: 'shipping containers',
    author: 'Sophie Dubois',
    authorImage: 'https://picsum.photos/seed/sophie/40/40',
    authorImageHint: 'french woman artist',
    link: '#'
  },
    {
    title: 'State Management with Zustand',
    description: 'A minimalist state management solution for React. Learn how to manage your state with simplicity.',
    tags: ['React', 'State Management', 'JavaScript'],
    image: 'https://picsum.photos/seed/doc6/600/400',
    imageHint: 'cute bear',
    author: 'Kenji Tanaka',
    authorImage: 'https://picsum.photos/seed/kenji/40/40',
    authorImageHint: 'asian man developer',
    link: '#'
  },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export default async function DocsPage() {
  const documents = await getDocumentsAction();

  // For now, we merge fetched docs with placeholder docs for visual variety
  const allDocs = [
      ...documents.map((doc, index) => ({
        title: doc.title,
        description: doc.description,
        tags: doc.tags,
        image: `https://picsum.photos/seed/db-doc${index}/600/400`,
        imageHint: 'tech background',
        author: doc.author.name || 'Unknown',
        authorImage: doc.author.image || `https://picsum.photos/seed/db-author${index}/40/40`,
        authorImageHint: 'developer portrait',
        link: `/docs/${slugify(doc.title)}`
      })),
      ...placeholderDocs,
  ].slice(0, 7); // Limit for consistent layout


  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
       <div className="flex items-center gap-4 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl">Docs</h1>
      </div>

        <div className="mb-12 max-w-2xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for articles, tutorials, and more..." className="pl-10 h-12 text-base" />
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allDocs.map((doc, index) => (
          <DocCard 
            key={index}
            title={doc.title}
            tags={doc.tags}
            image={doc.image}
            imageHint={doc.imageHint}
            author={doc.author}
            authorImage={doc.authorImage}
            authorImageHint={doc.authorImageHint}
            link={doc.link}
          />
        ))}
      </div>
    </div>
  );
}
