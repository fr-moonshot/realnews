import { AlertCircle } from "lucide-react";

import { StoryCard } from "@/components/story-card";
import { Badge } from "@/components/ui/badge";
import { getTopStoryClusters } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stories = await getTopStoryClusters(5);
  const mockMode = stories.every((story) =>
    story.articles.every((article) => article.fetched_from === "mock")
  );

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Non-partisan news context</Badge>
            {mockMode ? <Badge variant="caution">Mock fallback active</Badge> : null}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
              The day's biggest stories, checked from every side.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              We compare coverage across the political spectrum and show how much evidence is actually available.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <p className="font-medium">Credibility, not certainty</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Scores are confidence estimates based on available signals. They do not claim a story is absolutely true or false.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Trending clusters
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Top 5 stories</h2>
          </div>
        </div>

        {stories.length > 0 ? (
          <div className="grid gap-5">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-lg font-medium">No story clusters yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add API keys or run the mock ingestion fallback from the admin route.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
