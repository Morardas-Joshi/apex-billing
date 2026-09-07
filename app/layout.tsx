import type { Metadata } from 'next';
import './globals.css';
import './apex.css';

export const metadata: Metadata = {
  title: 'Apex Billing — Simple Serverless Billing & Invoicing',
  description: 'Enterprise serverless billing and invoicing web app powered by Next.js and Neon Postgres',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
