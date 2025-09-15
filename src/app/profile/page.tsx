
'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// This page now only serves to redirect to the logged-in user's profile.
// The actual profile content is in /profile/[userId]/page.tsx.
export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  } else {
    redirect(`/profile/${session.user.id}`);
  }
}
