import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { connection } from "next/server";
async function UserMenu() {
    await connection();
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-sm leading-tight">
        <p className="font-medium">{session.user.name}</p>
        <p className="text-xs text-muted-foreground">{session.user.role}</p>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r p-4 md:block">
        <p className="mb-6 px-3 text-lg font-semibold tracking-tight">WashDesk</p>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b px-6">
          <Suspense fallback={<div className="h-8 w-40 animate-pulse rounded-md bg-muted" />}>
            <UserMenu />
          </Suspense>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}