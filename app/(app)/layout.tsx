import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import SideNav from '@/components/SideNav';
import { getNavigationSections } from '../../lib/navigation';
import { authOptions } from '../../lib/auth';

export const revalidate = 0;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  console.log('[layout] Loading navigation for user:', session.user?.email);
  try {
    const sections = await getNavigationSections(session);
    console.log('[layout] Navigation loaded:', sections?.length || 0, 'sections');
    return (
      <div className='flex h-screen bg-zinc-950 text-zinc-100'>
        <SideNav sections={sections} />
        <main className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 w-full p-6 overflow-auto'>{children}</div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('[layout] Error loading navigation:', error);
    return (
      <div className='flex h-screen bg-zinc-950 text-zinc-100'>
        <SideNav sections={[]} />
        <main className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 max-w-5xl mx-auto w-full p-6 overflow-auto'>
            <div className="text-red-400 p-4 border border-red-800 rounded">
              Error loading navigation: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
            {children}
          </div>
        </main>
      </div>
    );
  }
}
