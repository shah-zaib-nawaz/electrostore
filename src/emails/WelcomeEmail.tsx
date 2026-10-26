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

export function WelcomeEmail({
  name = 'Shopper',
}: {
  name?: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Welcome to ElectroStore AI, {name}! ⚡
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Discover top-tier electronics curated with AI-driven precision, verified compatibility tools, and instant checkout.
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Button
            href="https://ai-electrostore.vercel.app/products"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Explore Catalog
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
