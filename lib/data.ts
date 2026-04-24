import { mockStoryClusters } from "@/lib/mock-data";
import { computeEvidenceConfidence } from "@/lib/scoring";
import { createSupabaseServiceClient } from "@/lib/supabase";
import type {
  Article,
  ArticleWithSource,
  Claim,
  PrimarySourceLink,
  ScoreBreakdown,
  Source,
  StoryCluster,
  StoryClusterWithArticles
} from "@/lib/types";

interface StoryClusterRow extends Omit<StoryCluster, "primary_sources" | "score_breakdown"> {
  primary_sources: unknown;
  score_breakdown: unknown;
  story_articles?: Array<{
    articles?: (Article & { sources?: Source | null }) | null;
  }>;
  claims?: Claim[];
}

export async function getTopStoryClusters(limit = 5) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return mockStoryClusters.slice(0, limit);
  }

  const { data, error } = await supabase
    .from("story_clusters")
    .select(
      `
        *,
        story_articles (
          articles (
            *,
            sources (*)
          )
        ),
        claims (*)
      `
    )
    .order("trend_score", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return mockStoryClusters.slice(0, limit);
  }

  return (data as StoryClusterRow[]).map(normalizeStoryRow);
}

export async function getStoryBySlug(slug: string) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return mockStoryClusters.find((story) => story.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("story_clusters")
    .select(
      `
        *,
        story_articles (
          articles (
            *,
            sources (*)
          )
        ),
        claims (*)
      `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return mockStoryClusters.find((story) => story.slug === slug) ?? null;
  }

  return normalizeStoryRow(data as StoryClusterRow);
}

function normalizeStoryRow(row: StoryClusterRow): StoryClusterWithArticles {
  const articles = (row.story_articles ?? [])
    .map((join) => {
      const article = join.articles;

      if (!article || !article.sources) {
        return null;
      }

      const { sources, ...articleFields } = article;
      return {
        ...articleFields,
        source: sources
      } satisfies ArticleWithSource;
    })
    .filter((article): article is ArticleWithSource => Boolean(article));

  const primarySources = Array.isArray(row.primary_sources)
    ? (row.primary_sources as PrimarySourceLink[])
    : [];
  const claims = row.claims ?? [];
  const scoreBreakdown = isScoreBreakdown(row.score_breakdown)
    ? row.score_breakdown
    : computeEvidenceConfidence(articles, claims, primarySources);

  return {
    ...row,
    primary_sources: primarySources,
    score_breakdown: scoreBreakdown,
    articles,
    claims
  };
}

function isScoreBreakdown(value: unknown): value is ScoreBreakdown {
  return Boolean(
    value &&
      typeof value === "object" &&
      "total" in value &&
      "components" in value &&
      Array.isArray((value as ScoreBreakdown).components)
  );
}
