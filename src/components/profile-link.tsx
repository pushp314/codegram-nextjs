
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import React from 'react';

type ProfileLinkProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function ProfileLink({ children, className, onClick }: ProfileLinkProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const href = userId ? `/profile/${userId}` : '/login';

  return (
    <Link href={href} className={cn(className)} onClick={onClick}>
      {children}
    </Link>
  );
}
