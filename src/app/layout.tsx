import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MSP Ops Dashboard',
  description: 'IT Infrastructure Ops Tracking & Knowledge Base',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
