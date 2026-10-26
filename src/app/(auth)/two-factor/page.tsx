'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if ((authClient as any).twoFactor && (authClient as any).twoFactor.verifyTOTP) {
        const res = await (authClient as any).twoFactor.verifyTOTP({
          code,
        });

        if (res.error) {
          setError(res.error.message || 'Invalid 2FA code');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Two-Factor Verification</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator application
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Authenticator Code
            </label>
            <Input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              maxLength={6}
              required
              className="text-center text-lg tracking-widest font-mono"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || code.length < 6} className="w-full mt-4">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Verify Code
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 pt-4">
        <Link href="/sign-in" className="text-xs text-muted-foreground hover:text-foreground">
          Sign in with another account
        </Link>
      </CardFooter>
    </Card>
  );
}
