import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-tight">Real News</span>
            <span className="block truncate text-xs text-muted-foreground">
              See the story. See the spin. See the evidence.
            </span>
          </span>
        </Link>

        <Button asChild variant="outline" size="sm">
          <Link href="/admin/ingest">Ingest</Link>
        </Button>
      </div>
    </header>
  );
}
