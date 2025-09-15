
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import FollowButton from "./follow-button";
import Link from "next/link";

type UserCardProps = {
  user: User;
  isFollowing: boolean;
  followersCount: number;
  isLoggedIn: boolean;
  currentUserId?: string;
};

export default function UserCard({ user, isFollowing, followersCount, isLoggedIn, currentUserId }: UserCardProps) {
  const isCurrentUser = user.id === currentUserId;

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <Link href={`/profile/${user.id}`}>
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} data-ai-hint="developer portrait" />
            <AvatarFallback className="text-3xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/profile/${user.id}`}>
            <CardTitle className="font-headline hover:text-primary transition-colors">{user.name}</CardTitle>
        </Link>
        <CardDescription>@{user.email?.split('@')[0]}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4 min-h-[40px] line-clamp-2">{user.bio}</p>
        <div className="flex justify-center gap-4 text-sm mb-4">
            <div>
                <span className="font-bold">{followersCount}</span>
                <span className="text-muted-foreground"> Followers</span>
            </div>
        </div>
        {!isCurrentUser && (
            <FollowButton
                authorId={user.id}
                isFollowed={isFollowing}
                isLoggedIn={isLoggedIn}
            />
        )}
      </CardContent>
    </Card>
  );
}
