import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/server/models/Order';
import { Product } from '@/server/models/Product';
import { Cart } from '@/server/models/Cart';
import { after } from 'next/server';
import mongoose from 'mongoose';
import { sendOrderConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  await connectToDatabase();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.status = 'processing';
          order.paymentStatus = 'paid';
          order.stripePaymentIntentId = session.payment_intent as string;
          await order.save();

          // Clear user's cart if registered
          if (order.user) {
            await Cart.findOneAndDelete({ userId: order.user });
          }

          // Dispatch confirmation email via Next.js after()
          after(async () => {
            try {
              const recipientEmail = session.customer_details?.email || order.guestEmail;
              if (recipientEmail) {
                await sendOrderConfirmationEmail({
                  to: recipientEmail,
                  orderId: String(order._id),
                  customerName: session.customer_details?.name || 'Customer',
                  items: order.items.map((i: any) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                  total: order.total,
                });
                console.log(`[Email] Dispatched order confirmation email to ${recipientEmail} for order ${orderId}`);
              }
            } catch (emailErr) {
              console.error('Failed to send order confirmation email:', emailErr);
            }
          });
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const mongoSession = await mongoose.startSession();
        try {
          await mongoSession.withTransaction(async () => {
            const order = await Order.findById(orderId).session(mongoSession);
            if (order && order.paymentStatus === 'pending') {
              order.status = 'cancelled';
              order.paymentStatus = 'failed';
              await order.save({ session: mongoSession });

              // Atomically restore product stock
              for (const item of order.items) {
                await Product.findByIdAndUpdate(
                  item.productId,
                  { $inc: { stock: item.quantity } },
                  { session: mongoSession }
                );
              }
              console.log(`[Stripe Webhook] Session expired. Restored stock for order ${orderId}`);
            }
          });
        } finally {
          await mongoSession.endSession();
        }
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (paymentIntentId) {
        await Order.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntentId },
          { paymentStatus: 'refunded', status: 'cancelled' }
        );
        console.log(`[Stripe Webhook] Order marked refunded for paymentIntent ${paymentIntentId}`);
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
