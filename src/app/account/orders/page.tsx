import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { getSession } from '@/server/auth-guard';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/server/models/Order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Download, Truck, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Order History | ElectroStore AI',
  description: 'View complete hardware purchase history, shipping tracking, and tax invoice downloads.',
};

export default async function AccountOrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const user = session.user;
  let orders: any[] = [];

  try {
    await connectToDatabase();
    orders = await Order.find({ user: user.id })
      .sort({ createdAt: -1 })
      .lean();
  } catch {
    // DB error fallback
  }

  return (
    <StorefrontShell>
      <div className="py-4 space-y-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/account" className="hover:text-foreground">My Account</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Orders</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Order History & Tracking
            </h1>
          </div>

          <Button variant="outline" asChild size="sm">
            <Link href="/account" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-12 text-center space-y-4">
            <Package className="h-10 w-10 text-muted-foreground stroke-1" />
            <h3 className="font-bold text-lg text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              You haven&apos;t placed any orders with this account yet. Ready to start your next build?
            </p>
            <Button asChild size="sm">
              <Link href="/products">Explore Hardware</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = order.status;
              const statusVariant: 'default' | 'secondary' | 'destructive' | 'outline' =
                status === 'delivered'
                  ? 'default'
                  : status === 'shipped' || status === 'processing'
                  ? 'secondary'
                  : status === 'cancelled'
                  ? 'destructive'
                  : 'outline';

              return (
                <div
                  key={String(order._id)}
                  className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 shadow-sm"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">
                          Order #{String(order._id).slice(-8).toUpperCase()}
                        </span>
                        <Badge variant={statusVariant} className="text-xs uppercase font-bold">
                          {status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-base text-foreground">
                        ${order.total?.toFixed(2)}
                      </span>
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
                        <a
                          href={`/api/orders/${String(order._id)}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>PDF Invoice</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Tracking Number if shipped */}
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
                      <Truck className="h-4 w-4 shrink-0" />
                      <span>
                        Tracking Number: <strong className="font-mono">{order.trackingNumber}</strong>
                      </span>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-3 pt-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 rounded-lg bg-muted overflow-hidden border border-border/40">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                Tech
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-foreground line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Qty: {item.quantity} × ${item.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold text-foreground">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Delivering to:</span>
                      <span>
                        {order.shippingAddress.name}, {order.shippingAddress.street},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                        {order.shippingAddress.postalCode}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
