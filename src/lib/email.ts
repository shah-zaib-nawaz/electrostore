import { Resend } from 'resend';
import { env } from '@/lib/env';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation';

export const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = 'ElectroStore AI <onboarding@resend.dev>';

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  try {
    if (!env.RESEND_API_KEY || env.RESEND_API_KEY.includes('mock')) {
      console.log(`[Email Mock] Skipping welcome email to ${to}`);
      return { success: true, mocked: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to ElectroStore AI ⚡',
      react: WelcomeEmail({ name }),
    });

    if (error) {
      console.error('[Email] Welcome email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Email] Failed to send welcome email:', err);
    return { success: false, error: err.message };
  }
}

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  customerName,
  items,
  total,
}: {
  to: string;
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}) {
  try {
    if (!env.RESEND_API_KEY || env.RESEND_API_KEY.includes('mock')) {
      console.log(`[Email Mock] Skipping order confirmation email to ${to}`);
      return { success: true, mocked: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmation #${orderId.slice(-8).toUpperCase()} — ElectroStore AI`,
      react: OrderConfirmationEmail({
        orderId: orderId.slice(-8).toUpperCase(),
        customerName,
        items,
        total,
      }),
    });

    if (error) {
      console.error('[Email] Order confirmation email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Email] Failed to send order confirmation email:', err);
    return { success: false, error: err.message };
  }
}
