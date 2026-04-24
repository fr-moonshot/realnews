import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { ConfidenceMeter } from "@/components/confidence-meter";
import { CoverageBar } from "@/components/coverage-bar";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { biasLabel, evidenceStatusLabel, factualityLabel } from "@/lib/labels";
import { getStoryBySlug } from "@/lib/data";
import { formatDate, uniqueBy } from "@/lib/utils";

interface StoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug);

  return {
    title: story ? `${story.title} | Real News` : "Story | Real News"
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await getStoryBySlug(params.slug);

  if (!story) {
    notFound();
  }

  const sources = uniqueBy(
    story.articles.map((article) => article.source),
    (source) => source.domain
  );

  const evidenceLinks = [
    ...story.primary_sources,
    ...story.articles.map((article) => ({
      label: `${article.source.name}: ${article.title}`,
      url: article.url,
      type: "source" as const
    }))
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{story.category}</Badge>
        <Badge variant={story.low_coverage ? "caution" : "evidence"}>
          {story.low_coverage ? "Low coverage" : `${story.articles.length} articles found`}
        </Badge>
        <Badge variant="muted">
          {story.summary_generation_method === "ai"
            ? "AI-generated summary"
            : story.summary_generation_method === "mock"
              ? "Demo summary"
              : "Algorithmic summary"}
        </Badge>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-normal sm:text-5xl">
            {story.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {story.neutral_summary}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evidence confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfidenceMeter value={story.evidence_confidence_score} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coverage balance</CardTitle>
          </CardHeader>
          <CardContent>
            <CoverageBar
              left={story.coverage_left_count}
              center={story.coverage_center_count}
              right={story.coverage_right_count}
              unknown={story.coverage_unknown_count}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBreakdown breakdown={story.score_breakdown} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <Framing title="What the left is saying" text={story.left_framing} />
        <Framing title="What the centre is saying" text={story.center_framing} />
        <Framing title="What the right is saying" text={story.right_framing} />
      </section>

      <section className="mt-8 grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Claims table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Claim</th>
                    <th className="py-3 pr-4 font-medium">Claimant</th>
                    <th className="py-3 pr-4 font-medium">Evidence status</th>
                    <th className="py-3 pr-4 font-medium">Confidence</th>
                    <th className="py-3 font-medium">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {story.claims.map((claim) => (
                    <tr key={claim.id} className="align-top">
                      <td className="py-4 pr-4 leading-6">{claim.claim_text}</td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {claim.claimant ?? "Not attributed"}
                      </td>
                      <td className="py-4 pr-4">{evidenceStatusLabel(claim.evidence_status)}</td>
                      <td className="py-4 pr-4">
                        {claim.confidence_score === null ? "Unknown" : `${Math.round(claim.confidence_score)}%`}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {[...claim.supporting_urls, ...claim.fact_check_urls].slice(0, 4).map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs hover:bg-accent"
                            >
                              Link
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source credibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Source</th>
                    <th className="py-3 pr-4 font-medium">Bias rating</th>
                    <th className="py-3 pr-4 font-medium">Factuality</th>
                    <th className="py-3 pr-4 font-medium">Credibility</th>
                    <th className="py-3 font-medium">Rating provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sources.map((source) => (
                    <tr key={source.id}>
                      <td className="py-4 pr-4">
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground">{source.domain}</div>
                      </td>
                      <td className="py-4 pr-4">{biasLabel(source.bias_rating)}</td>
                      <td className="py-4 pr-4">{factualityLabel(source.factuality_rating)}</td>
                      <td className="py-4 pr-4">
                        {source.credibility_score === null
                          ? "Unknown"
                          : `${Math.round(source.credibility_score)}/100`}
                      </td>
                      <td className="py-4">
                        {source.rating_url ? (
                          <a
                            href={source.rating_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            {source.rating_provider ?? "Source"}
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : (
                          "Unknown"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence and source links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {evidenceLinks.map((link) => (
                <a
                  key={`${link.type}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={link.type === "primary" ? "evidence" : "muted"}>
                      {link.type === "primary" ? "Primary evidence" : "Article"}
                    </Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6">{link.label}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <p className="mt-8 text-sm leading-6 text-muted-foreground">
        Last updated {formatDate(story.updated_at)}. This page shows evidence confidence based on available metadata, source ratings, coverage spread, primary evidence and claim-review links. It does not make an absolute truth claim.
      </p>
    </main>
  );
}

function Framing({ title, text }: { title: string; text: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          {text || "No framing summary is available yet."}
        </p>
      </CardContent>
    </Card>
  );
}
