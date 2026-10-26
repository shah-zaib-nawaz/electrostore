import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
} from 'react-email';

interface VerifyEmailProps {
  url: string;
  name?: string;
}

export function VerifyEmail({
  url = 'https://ai-electrostore.vercel.app/verify-email?token=example-token',
  name = 'Shopper',
}: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Verify Your Email Address
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Hi {name}, thank you for joining ElectroStore AI. Please click the button below to verify your email and activate your account:
          </Text>
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button
              href={url}
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
              Verify My Email
            </Button>
          </div>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
            If you did not sign up for ElectroStore AI, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default VerifyEmail;
