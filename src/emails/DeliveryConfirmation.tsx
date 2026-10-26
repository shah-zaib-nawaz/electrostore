import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
} from 'react-email';

export function DeliveryConfirmationEmail({
  orderId = 'ORD-12345',
}: {
  orderId?: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', color: '#10b981' }}>
            Package Delivered! 🎉
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Your order <strong>#{orderId}</strong> has been successfully delivered.
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Text style={{ fontSize: '14px', color: '#6b7280' }}>
            We hope you love your new gear! If you have any questions or need setup help, ElectroBot AI is available 24/7 on our site.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DeliveryConfirmationEmail;
