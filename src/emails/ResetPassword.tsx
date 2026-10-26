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

interface ResetPasswordProps {
  url: string;
  name?: string;
}

export function ResetPassword({
  url = 'https://ai-electrostore.vercel.app/reset-password?token=example-token',
  name = 'Shopper',
}: ResetPasswordProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Reset Your Password
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Hi {name}, we received a request to reset your ElectroStore AI password. Click the button below to set a new password:
          </Text>
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button
              href={url}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              Reset Password
            </Button>
          </div>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
            This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ResetPassword;
