import type { Metadata } from 'next';
import './globals.css';
import './apex.css';
import './invoice.css';

export const metadata: Metadata = {
  title: 'EasyInvoice — Indian Bill & Sales Management',
  description: 'Enterprise serverless GST billing and invoicing web app powered by Next.js and Neon Postgres',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
