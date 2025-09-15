import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import components from '@/lib/component-data.json';

export default function ComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl mb-4">Component Marketplace</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Discover a collection of professionally designed UI components to accelerate your projects. Click on a card to see the code and live preview.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {components.map(component => (
          <Link href={`/components/${component.slug}`} key={component.slug} className="group">
            <Card className="overflow-hidden h-full flex flex-col transition-all border-border hover:border-primary group-hover:shadow-lg">
              <div className="overflow-hidden">
                <Image src={component.image} alt={component.name} width={600} height={400} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint={component.imageHint} />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="mb-2 font-headline">{component.name}</CardTitle>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
