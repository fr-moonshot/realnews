import Link from "next/link";
import { ArrowRight, ExternalLink, FileSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { CoverageBar } from "@/components/coverage-bar";
import type { StoryClusterWithArticles } from "@/lib/types";

interface StoryCardProps {
  story: StoryClusterWithArticles;
}

export function StoryCard({ story }: StoryCardProps) {
  const topArticles = story.articles.slice(0, 3);
  const hasPrimaryEvidence = story.primary_sources.some((link) => link.type === "primary");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{story.category}</Badge>
          <Badge variant={hasPrimaryEvidence ? "evidence" : "caution"}>
            <FileSearch className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {hasPrimaryEvidence ? "Primary evidence found" : "Primary evidence missing"}
          </Badge>
          {story.low_coverage ? <Badge variant="caution">Low coverage</Badge> : null}
        </div>
        <CardTitle className="text-xl sm:text-2xl">{story.title}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{story.neutral_summary}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <ConfidenceMeter value={story.evidence_confidence_score} />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted-foreground">Coverage split</span>
            <span className="text-sm text-muted-foreground">
              {story.articles.length} article{story.articles.length === 1 ? "" : "s"} found
            </span>
          </div>
          <CoverageBar
            left={story.coverage_left_count}
            center={story.coverage_center_count}
            right={story.coverage_right_count}
            unknown={story.coverage_unknown_count}
            compact
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Top source links</p>
          <div className="grid gap-2">
            {topArticles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <span className="min-w-0 truncate">
                  {article.source.name}
                  <span className="text-muted-foreground"> - {article.title}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/stories/${story.slug}`}>
            View breakdown
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
