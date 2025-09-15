
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";


export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
            <h1 className="font-headline text-3xl mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account, theme, and preferences.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of CodeGram.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">Theme</h3>
                        <p className="text-sm text-muted-foreground">Toggle between light and dark mode.</p>
                    </div>
                    <ThemeToggle />
                </div>
            </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">Log Out</h3>
                        <p className="text-sm text-muted-foreground">End your current session.</p>
                    </div>
                     <Button variant="outline">Log Out</Button>
                </div>
                 <div className="flex items-center justify-between text-destructive">
                    <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm">Permanently delete your account and all of your data.</p>
                    </div>
                     <Button variant="destructive">Delete</Button>
                </div>
            </CardContent>
        </Card>

    </div>
  )
}
