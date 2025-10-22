export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-100 mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}