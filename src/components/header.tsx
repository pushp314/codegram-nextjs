
'use client';

import { Plus, Code, FileText, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAuthNav from './user-auth-nav';
import MobileSidebar from './mobile-sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import NotificationBell from './notification-bell';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <MobileSidebar />
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline-block ml-2">Create</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/snippets/create">
                <Code className="mr-2" />
                New Snippet
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/docs/create">
                <FileText className="mr-2" />
                New Doc
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/bugs">
                    <Bug className="mr-2" />
                    Post a Bug
                </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <NotificationBell />
        <UserAuthNav />
      </div>
    </header>
  );
}
