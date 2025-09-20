
import CodeBlock from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, Heart, Share2, Code, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import components from '@/lib/component-data.json';

export default function ComponentDetailPage() {
  const componentData = components.find(c => c.slug === 'login-form');

  if (!componentData) {
      return <div>Component not found</div>;
  }

  const { name, description, author, stats, code } = componentData;

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
                 <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>
                        Enter your email below to login to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="email-preview">Email</Label>
                        <Input id="email-preview" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="password-preview">Password</Label>
                        <Input id="password-preview" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            Sign in
                        </Button>
                    </CardContent>
                </Card>
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
