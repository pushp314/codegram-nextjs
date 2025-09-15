
'use client';

import Link from 'next/link';
import { Code, FileText, Home, Menu, Settings, User, Compass, Bookmark, Bug, Bot, ShoppingCart, GitFork, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import React from 'react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/components', icon: ShoppingCart, label: 'Marketplace' },
  { href: '/docs', icon: FileText, label: 'Docs' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/bugs', icon: Bug, label: 'Bugs' },
  { href: '/playground', icon: Code, label: 'Playground' },
  { href: '/convert', icon: GitFork, label: 'Convert' },
  { href: '/saved', icon: Bookmark, label: 'Saved' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
             onClick={() => setIsOpen(false)}
          >
            <Code className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">CodeGram</span>
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                (pathname === item.href || (item.href.length > 1 && pathname.startsWith(item.href))) && 'text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
