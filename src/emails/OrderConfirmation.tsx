import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Button,
} from 'react-email';

interface OrderConfirmationProps {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export function OrderConfirmationEmail({
  orderId = 'ORD-12345',
  customerName = 'Valued Customer',
  items = [
    { name: 'NVIDIA GeForce RTX 5080 16GB', quantity: 1, price: 999 },
  ],
  total = 999,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Thank you for your order!
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Hi {customerName}, we’ve received your order <strong>#{orderId}</strong> and are preparing it for shipment.
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Section>
            <Heading as="h3" style={{ fontSize: '18px', color: '#111827' }}>
              Order Summary
            </Heading>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <Text style={{ margin: 0, color: '#374151' }}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </div>
            ))}
          </Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              Total Paid:
            </Text>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
              ${total.toFixed(2)}
            </Text>
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              href="https://ai-electrostore.vercel.app/account/orders"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              View Order in Dashboard
            </Button>
          </div>
          <Text style={{ fontSize: '14px', color: '#9ca3af', marginTop: '30px', textAlign: 'center' }}>
            ElectroStore AI • Next-Generation Electronics
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmationEmail;
