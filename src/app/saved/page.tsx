import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
       <div className="flex items-center gap-4 mb-8">
        <Bookmark className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl">Saved</h1>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed">
        <CardHeader>
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
            <Bookmark className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>No Saved Items</CardTitle>
          <CardDescription className="text-muted-foreground">You haven't saved any snippets or docs yet. Start exploring to build your collection.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
