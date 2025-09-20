
import { getUsersAction } from "@/app/actions";
import SearchBar from "./search-bar";
import UserCard from "@/components/user-card";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query || "";
  const users = await getUsersAction({ query });
  const session = await auth();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
            <h1 className="font-headline text-3xl mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Community
            </h1>
            <p className="text-muted-foreground">
            Browse and connect with other developers.
            </p>
        </div>
        <SearchBar placeholder="Search by name..." />
      </div>

      {users && users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isFollowing={user.isFollowing}
              followersCount={user.followersCount}
              isLoggedIn={!!session?.user}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed col-span-full">
            <CardHeader>
                <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
                    <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>No Users Found</CardTitle>
                <CardDescription className="text-muted-foreground">No users matched your search. Try a different query.</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
