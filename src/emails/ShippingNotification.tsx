import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Button,
} from 'react-email';

interface ShippingNotificationProps {
  orderId: string;
  trackingNumber: string;
  carrier: string;
}

export function ShippingNotificationEmail({
  orderId = 'ORD-12345',
  trackingNumber = 'TRK-987654321',
  carrier = 'FedEx Express',
}: ShippingNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Your Order Has Shipped! 📦
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Great news! Order <strong>#{orderId}</strong> has been handed over to {carrier}.
          </Text>
          <Text style={{ fontSize: '16px', color: '#111827' }}>
            Tracking Number: <strong>{trackingNumber}</strong>
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Button
            href={`https://ai-electrostore.vercel.app/account/orders/${orderId}`}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Track Your Package
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

export default ShippingNotificationEmail;
