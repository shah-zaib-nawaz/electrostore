import React from 'react';
import Link from 'next/link';
import { Cpu } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
            <Cpu className="h-6 w-6" />
          </div>
          <span>
            ElectroStore<span className="text-primary font-black ml-0.5">AI</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {children}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        Protected by Next.js 16 Network Proxy & Better Auth 1.7 Passkeys
      </div>
    </div>
  );
}
