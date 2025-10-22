import Link from 'next/link';

export default function OverviewPage() {
  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-3xl font-semibold'>Overview</h1>
        <p className='mt-2 text-sm text-zinc-400'>
          Welcome to the S42 workspace. Use the navigation to explore projects, user management, and
          your custom pages.
        </p>
      </header>
      <section className='grid gap-3 md:grid-cols-2'>
        <Link
          href='/projects'
          className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-colors'
        >
          <h2 className='text-lg font-medium text-zinc-100'>Projects</h2>
          <p className='mt-1 text-sm text-zinc-400'>
            Spin up initiatives from templates, populate checklists, and monitor execution.
          </p>
        </Link>
        <Link
          href='/pages'
          className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-colors'
        >
          <h2 className='text-lg font-medium text-zinc-100'>Pages Directory</h2>
          <p className='mt-1 text-sm text-zinc-400'>
            Browse dynamic pages available to you based on group membership.
          </p>
        </Link>
      </section>
    </div>
  );
}
