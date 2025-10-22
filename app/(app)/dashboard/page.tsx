export default function DashboardPage() {
  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-3xl font-semibold'>Dashboard</h1>
        <p className='mt-2 text-sm text-zinc-400'>
          Main dashboard overview and quick access to key features.
        </p>
      </header>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
          <h3 className='text-lg font-medium text-zinc-100'>Projects</h3>
          <p className='mt-2 text-sm text-zinc-400'>
            View and manage active projects.
          </p>
        </div>

        <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
          <h3 className='text-lg font-medium text-zinc-100'>Tasks</h3>
          <p className='mt-2 text-sm text-zinc-400'>
            Track tasks and progress.
          </p>
        </div>

        <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
          <h3 className='text-lg font-medium text-zinc-100'>Users</h3>
          <p className='mt-2 text-sm text-zinc-400'>
            Manage team members and permissions.
          </p>
        </div>
      </div>
    </div>
  );
}