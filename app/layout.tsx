import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: {
    default: 'S42',
    template: 'S42 - %s'
  },
  description: 'Dark boilerplate with tasks and RBAC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' data-theme='dark'>
      <body className='bg-zinc-950 text-zinc-100'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
