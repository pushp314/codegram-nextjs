
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { MessageCircle, ThumbsUp } from 'lucide-react';

type BugCardProps = {
  authorName: string;
  authorImage: string;
  authorImageHint: string;
  timestamp: string;
  content: string;
  upvotes: number;
  comments: number;
  tags: string[];
};

export default function BugCard({
  authorName,
  authorImage,
  authorImageHint,
  timestamp,
  content,
  upvotes,
  comments,
  tags,
}: BugCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row gap-4 items-start">
        <Avatar className="h-10 w-10">
          <AvatarImage src={authorImage} alt={authorName} data-ai-hint={authorImageHint} />
          <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold">{authorName}</p>
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          </div>
          <p className="text-sm text-muted-foreground">@{authorName.toLowerCase().replace(' ', '')}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{content}</p>
        <div className="flex justify-between items-center">
            <div className="flex gap-2">
                {tags.map(tag => (
                    <Badge key={tag} variant={tag === 'bug' ? 'destructive' : 'secondary'}>{tag}</Badge>
                ))}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs">{upvotes}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{comments}</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
