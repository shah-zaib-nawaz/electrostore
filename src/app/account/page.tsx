import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { getSession } from '@/server/auth-guard';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/server/models/Order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Heart,
  Shield,
  CreditCard,
  User,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const metadata = {
  title: 'My Account | ElectroStore AI',
  description: 'Manage your profile, active hardware orders, tracking numbers, and account security.',
};

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const user = session.user;
  let recentOrders: any[] = [];

  try {
    await connectToDatabase();
    recentOrders = await Order.find({ user: user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  } catch {
    // DB fallback
  }

  return (
    <StorefrontShell>
      <div className="py-4 space-y-8">
        {/* Welcome Header */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xl">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Welcome back, {user.name || 'Enthusiast'}!
                </h1>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild size="sm">
              <Link href="/account/orders" className="gap-2">
                <Package className="h-4 w-4" />
                <span>View All Orders</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Dashboard Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Package className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Hardware Orders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live tracking numbers and downloadable PDF invoices.
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <Heart className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Saved Wishlist</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review saved components and dream builds.
            </p>
          </Link>

          <Link
            href="/two-factor"
            className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Shield className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Security & Passkeys</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage FIDO2 WebAuthn keys and 2FA authentication.
            </p>
          </Link>
        </div>

        {/* Recent Orders Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>See full history</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center space-y-3">
              <Package className="h-8 w-8 text-muted-foreground mx-auto stroke-1" />
              <p className="text-sm font-semibold text-foreground">No recent orders placed</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Ready to upgrade your rig? Check out our flagship graphics cards and OLED displays.
              </p>
              <Button asChild size="sm">
                <Link href="/products">Shop Hardware</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div
                  key={String(ord._id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:border-border transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        #{String(ord._id).slice(-8).toUpperCase()}
                      </span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {ord.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ord.items?.length || 1} items • Total: ${ord.total?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button variant="outline" asChild size="sm" className="h-8 text-xs">
                      <Link href={`/api/orders/${String(ord._id)}/invoice`}>Invoice</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </StorefrontShell>
  );
}
