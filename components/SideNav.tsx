'use client';
import { useMemo, useState } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import {
  Menu,
  LayoutGrid,
  ListChecks,
  FileText,
  Users,
  Shield,
  Settings,
  FolderOpen,
  BookOpenText,
  ClipboardList,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import type { NavSection } from '@/lib/navigation';

type Mode = 'mobile' | 'min' | 'full';

type SideNavProps = {
  sections: NavSection[];
};

const iconMap = {
  'layout-grid': LayoutGrid,
  'list-checks': ListChecks,
  'file-text': FileText,
  users: Users,
  shield: Shield,
  settings: Settings,
  folder: FolderOpen,
  'folder-open': FolderOpen,
  'clipboard-list': ClipboardList,
  book: BookOpenText,
} as const;

function resolveIcon(name?: string | null) {
  if (!name) return LayoutGrid;
  const key = name.toLowerCase() as keyof typeof iconMap;
  return iconMap[key] ?? LayoutGrid;
}

export default function SideNav({ sections }: SideNavProps) {
  const [mode, setMode] = useState<Mode>('full');
  const [open, setOpen] = useState(false);

  // Safely use session hook - handle case where context might be null during logout
  const sessionData = useSession();
  const session = sessionData?.data || null;
  const status = sessionData?.status || 'unauthenticated';

  const navSections = useMemo(
    () => (sections && sections.length > 0 ? sections : []),
    [sections],
  );

  const NavRail = () => (
    <div className={`${mode === 'min' ? 'w-16' : 'w-60'} h-full flex flex-col`}>
      <div className='p-3 flex items-center gap-2'>
        <button
          className='p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors'
          onClick={() => setMode(mode === 'full' ? 'min' : 'full')}
          title='Toggle nav size'
        >
          <LayoutGrid size={18} />
        </button>
        {mode === 'full' && <span className='text-sm font-medium text-zinc-300'>S42</span>}
        <button
          className='ml-auto p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 md:hidden'
          onClick={() => setOpen(!open)}
        >
          <Menu size={18} />
        </button>
      </div>
      <nav className='mt-2 px-2 space-y-4 flex-1 overflow-y-auto'>
        {navSections.map((section) => {
          const sectionKey = section.id ?? 'uncategorised';
          return (
            <div key={sectionKey}>
              {mode === 'full' && section.title && (
                <p className='px-2 mb-1 text-xs uppercase tracking-wide text-zinc-500'>
                  {section.title}
                </p>
              )}
              <div className='space-y-1'>
                {section.items?.map((item) => {
                  const Icon = resolveIcon(item.icon);

                  if (item.isExternal) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors'
                      >
                        <Icon size={18} />
                        {mode === 'full' && <span>{item.label}</span>}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors'
                    >
                      <Icon size={18} />
                      {mode === 'full' && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        {(!sections || sections.length === 0) && (
          <div className='px-3 py-2 text-xs text-zinc-500'>
            No navigation items yet. Add pages in the management panel.
          </div>
        )}
      </nav>
      <div className='p-3 border-t border-zinc-800 space-y-2'>
        {status === 'authenticated' ? (
          <>
            {mode === 'full' && session?.user?.email && (
              <p className='px-1 text-xs text-zinc-500 truncate'>{session.user.email}</p>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='flex w-full items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors text-left'
            >
              <LogIn size={18} />
              {mode === 'full' && <span>Sign out</span>}
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className='flex w-full items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors text-left'
          >
            <LogIn size={18} />
            {mode === 'full' && <span>Login</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className='relative'>
      <div className='hidden md:block h-screen sticky top-0 bg-zinc-900 border-r border-zinc-800'>
        <NavRail />
      </div>
      <div className='md:hidden'>
        <button
          className='fixed top-3 left-3 z-50 p-2 bg-zinc-900 rounded-xl border border-zinc-800'
          onClick={() => setOpen(true)}
        >
          <Menu size={18} />
        </button>
        {open && (
          <div className='fixed inset-0 z-40 bg-black/40' onClick={() => setOpen(false)} />
        )}
        <div
          className={`fixed top-0 left-0 z-50 h-full bg-zinc-900 border-r border-zinc-800 transition-transform ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <NavRail />
        </div>
      </div>
    </div>
  );
}
