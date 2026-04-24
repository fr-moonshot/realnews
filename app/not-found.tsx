import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-normal">Story not found</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        This story cluster is not available in the current dataset.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to stories</Link>
      </Button>
    </main>
  );
}
