import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ai-electrostore.vercel.app'),
  title: 'ElectroStore AI | Next-Gen Electronics',
  description: 'AI-First Electronics E-Commerce Platform built with Next.js 16, Mongoose 9, Better Auth, and Vercel AI SDK v7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
