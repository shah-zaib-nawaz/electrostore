import { NextResponse } from 'next/server';
import React from 'react';
import { renderToStream, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/server/models/Order';
import { requireAuth } from '@/server/auth-guard';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  section: { marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', fontWeight: 'bold', borderBottomWidth: 1, paddingBottom: 4, marginTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 6, marginTop: 10, fontWeight: 'bold' },
});

function InvoiceDocument({ order }: { order: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ElectroStore AI — Official Tax Invoice</Text>
          <Text>Invoice #: INV-{order._id.toString().slice(-8).toUpperCase()}</Text>
          <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
          {order.stripePaymentIntentId && (
            <Text>Stripe Reference: {order.stripePaymentIntentId}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Billed To:</Text>
          <Text>{order.shippingAddress?.name}</Text>
          <Text>{order.shippingAddress?.street}</Text>
          <Text>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ width: '50%' }}>Description</Text>
          <Text style={{ width: '20%' }}>SKU</Text>
          <Text style={{ width: '10%' }}>Qty</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Amount</Text>
        </View>

        {order.items.map((item: any, i: number) => (
          <View key={i} style={styles.row}>
            <Text style={{ width: '50%' }}>{item.name}</Text>
            <Text style={{ width: '20%' }}>{item.sku}</Text>
            <Text style={{ width: '10%' }}>{item.quantity}</Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text>Subtotal:</Text>
          <Text>${order.subtotal?.toFixed(2)}</Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.row}>
            <Text>Discount ({order.couponCode || 'Coupon'}):</Text>
            <Text>-${order.discount?.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text>Estimated Tax (8%):</Text>
          <Text>${order.tax?.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Shipping:</Text>
          <Text>${order.shipping?.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, { fontSize: 14 }]}>
          <Text style={{ fontWeight: 'bold' }}>Total Paid:</Text>
          <Text style={{ fontWeight: 'bold' }}>${order.total?.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireAuth();

  await connectToDatabase();
  const order = await Order.findById(id);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Authorize: customer must own the order or be an admin
  if (session.user.role === 'customer' && order.user?.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const stream = await renderToStream(<InvoiceDocument order={order} />);

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${order._id}.pdf"`,
    },
  });
}
