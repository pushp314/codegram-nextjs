
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type DocCardProps = {
  title: string;
  author: string | null;
  authorImage: string | null;
  authorImageHint: string;
  image: string;
  imageHint: string;
  tags: string[];
  link: string;
};

export function DocCard({
  title,
  author,
  authorImage,
  authorImageHint,
  image,
  imageHint,
  tags,
  link
}: DocCardProps) {
  return (
    <Link href={link} className="group block">
        <div className="relative rounded-2xl overflow-hidden">
            <Image
                src={image}
                alt={title}
                width={600}
                height={400}
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={imageHint}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-border transition-all group-hover:ring-2 group-hover:ring-primary group-hover:shadow-[0_0_20px_-5px_hsl(var(--primary))]"></div>

            <div className="absolute bottom-0 left-0 p-4">
                 <h3 className="font-headline text-lg text-white font-semibold">{title}</h3>
            </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
             <Avatar className="h-8 w-8">
                <AvatarImage src={authorImage ?? undefined} alt={author ?? undefined} data-ai-hint={authorImageHint}/>
                <AvatarFallback>{author?.charAt(0) ?? 'A'}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">{author}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
        </div>
    </Link>
  );
}
