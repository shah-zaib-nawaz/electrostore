'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <Card className="border-border/80 shadow-lg text-center">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Email Verified</CardTitle>
        <CardDescription>
          Your email address has been successfully verified. You now have full access to your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button asChild className="w-full">
          <Link href="/sign-in">Proceed to Sign In</Link>
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 pt-4">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          Back to Storefront
        </Link>
      </CardFooter>
    </Card>
  );
}
