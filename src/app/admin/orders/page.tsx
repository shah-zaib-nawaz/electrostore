'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getOrdersAction, updateOrderStatusAction, refundOrderAction } from '@/actions/admin-operations';
import { ShoppingBag, RotateCcw, Truck, Check, Loader2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrdersAction();
      setOrders(res.orders);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      await updateOrderStatusAction(orderId, newStatus);
      loadOrders();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (confirm('Issue a full Stripe refund for this order? This action cannot be reversed.')) {
      setActionLoading(orderId);
      try {
        const res = await refundOrderAction(orderId);
        if (res.success) {
          alert('Stripe refund issued successfully.');
          loadOrders();
        } else {
          alert(`Refund failed: ${res.error}`);
        }
      } finally {
        setActionLoading(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Operations</h1>
        <p className="text-sm text-muted-foreground">
          Manage live customer orders, status notifications, and Stripe 1-click refunds
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Customer Orders ({orders.length})
          </CardTitle>
          <CardDescription>Real-time orders processed through ACID inventory transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No orders placed yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      #{o._id.toString().slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">{o.shippingAddress?.name || 'Guest'}</div>
                      <div className="text-[11px] text-muted-foreground">{o.user?.email || o.guestEmail}</div>
                    </TableCell>
                    <TableCell className="text-xs">{o.items.length} items</TableCell>
                    <TableCell className="font-semibold text-xs">${o.total?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          o.status === 'delivered'
                            ? 'success'
                            : o.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          o.paymentStatus === 'paid'
                            ? 'success'
                            : o.paymentStatus === 'refunded'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {o.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {o.status === 'processing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === o._id}
                          onClick={() => handleStatusChange(o._id, 'shipped')}
                          className="h-7 text-xs"
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Mark Shipped
                        </Button>
                      )}

                      {o.status === 'shipped' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === o._id}
                          onClick={() => handleStatusChange(o._id, 'delivered')}
                          className="h-7 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Delivered
                        </Button>
                      )}

                      {o.paymentStatus === 'paid' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === o._id}
                          onClick={() => handleRefund(o._id)}
                          className="h-7 text-xs"
                        >
                          {actionLoading === o._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Refund
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
