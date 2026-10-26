import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth-guard';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Protect admin layout: Redirect if not authenticated or not admin
  if (process.env.NODE_ENV === 'production' && (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin'))) {
    redirect('/sign-in?callbackUrl=/admin');
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Mission Control</span>
            <span>/</span>
            <span>Admin Console</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-foreground">{session?.user?.name || 'Administrator'}</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                {session?.user?.role || 'admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
