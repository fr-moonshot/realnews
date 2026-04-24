export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-5">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-56 animate-pulse rounded-lg border border-border bg-card" />
        ))}
      </div>
    </main>
  );
}
