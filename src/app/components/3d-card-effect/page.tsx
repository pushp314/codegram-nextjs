import CodeBlock from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, Heart, Share2, Code, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import components from '@/lib/component-data.json';

const componentData = components.find(c => c.slug === '3d-card-effect');

if (!componentData) {
    return <div>Component not found</div>;
}

const { name, description, author, stats, code, image, imageHint } = componentData;

export default function ComponentDetailPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Preview</TabsTrigger>
              <TabsTrigger value="code"><Code className="mr-2 h-4 w-4" />Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <Card className="mt-2 border-dashed p-8 md:p-12 flex items-center justify-center bg-background min-h-[400px]">
                {/* Live Preview of the component */}
                <div className="[perspective:1000px]">
                  <Card className="w-full max-w-sm h-auto transform transition-transform duration-500 [transform-style:preserve-3d] hover:[transform:rotateY(15deg)_rotateX(-5deg)]">
                    <CardHeader>
                      <Image
                        src={image}
                        alt={name}
                        width={600}
                        height={400}
                        className="rounded-lg"
                        data-ai-hint={imageHint}
                      />
                    </CardHeader>
                    <CardContent>
                      <CardTitle>{name}</CardTitle>
                      <CardDescription>
                        {description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="code">
                <CodeBlock code={code} language="tsx" />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={author.avatar} data-ai-hint={author.avatarHint}/>
                    <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{author.name}</p>
                    <p className="text-sm text-muted-foreground">@{author.username}</p>
                  </div>
                </div>
                <div className="flex justify-around items-center border-t pt-4">
                    <Button variant="ghost" size="sm" className="flex flex-col h-auto text-muted-foreground">
                        <Heart className="h-5 w-5" />
                        <span>{stats.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col h-auto text-muted-foreground">
                        <Bookmark className="h-5 w-5" />
                        <span>Save</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col h-auto text-muted-foreground">
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                    </Button>
                </div>
            </CardContent>
          </Card>
           <Card>
                <CardHeader>
                    <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center">No comments yet. Be the first to share your thoughts!</p>
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
