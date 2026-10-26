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

export function PostPurchaseReviewRequestEmail({
  productName = 'NVIDIA GeForce RTX 5080',
  productSlug = 'rtx-5080',
}: {
  productName?: string;
  productSlug?: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            How are you liking your {productName}? ⭐
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Your honest review helps fellow tech enthusiasts find the right setup. Take 30 seconds to share your experience!
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Button
            href={`https://ai-electrostore.vercel.app/product/${productSlug}#reviews`}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Leave a Verified Review
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

export default PostPurchaseReviewRequestEmail;
