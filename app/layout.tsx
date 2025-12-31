import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jewelry Store Admin Panel',
  description: 'Comprehensive admin panel for jewelry store transaction management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
