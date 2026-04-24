import { buildStoryClustersFromArticles, normalizeApiArticle } from "@/lib/clustering";
import { mockStoryClusters } from "@/lib/mock-data";
import { computeEvidenceConfidence, countCoverageByBucket } from "@/lib/scoring";
import { createSupabaseServiceClient, hasSupabaseConfig } from "@/lib/supabase";
import type {
  ArticleWithSource,
  Claim,
  IngestionResult,
  StoryClusterWithArticles
} from "@/lib/types";

const WESTERN_COUNTRIES = ["gb", "us", "ca", "au", "nz", "ie"];

interface GNewsArticle {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: {
    name?: string;
    url?: string;
  };
}

export async function runIngestion(options: { persist?: boolean } = {}): Promise<IngestionResult> {
  const persist = options.persist ?? true;
  const warnings: string[] = [];
  let mode: IngestionResult["mode"] = "live";
  let clusters: StoryClusterWithArticles[];

  if (!process.env.GNEWS_API_KEY) {
    mode = "mock";
    warnings.push("GNEWS_API_KEY is missing, so mock data was used.");
    clusters = mockStoryClusters;
  } else {
    const articles = await fetchGNewsArticles(warnings);

    if (articles.length === 0) {
      mode = "mock";
      warnings.push("No live articles were returned, so mock data was used.");
      clusters = mockStoryClusters;
    } else {
      clusters = await buildStoryClustersFromArticles(articles, 5);
      clusters = await attachFactCheckLinks(clusters, warnings);
    }
  }

  if (process.env.GDELT_ENABLED === "true") {
    warnings.push("GDELT_ENABLED is set, but the MVP ingestion currently uses GNews only.");
  }

  const saved = persist && hasSupabaseConfig() ? await persistClusters(clusters, warnings) : false;

  if (persist && !hasSupabaseConfig()) {
    warnings.push("Supabase service config is missing, so clusters were not persisted.");
  }

  return {
    mode,
    saved,
    articleCount: clusters.reduce((sum, cluster) => sum + cluster.articles.length, 0),
    clusterCount: clusters.length,
    warnings,
    clusters
  };
}

async function fetchGNewsArticles(warnings: string[]) {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return [];
  }

  const perCountry = 12;
  const requests = WESTERN_COUNTRIES.map(async (country) => {
    const url = new URL("https://gnews.io/api/v4/top-headlines");
    url.searchParams.set("category", "general");
    url.searchParams.set("lang", "en");
    url.searchParams.set("country", country);
    url.searchParams.set("max", String(perCountry));
    url.searchParams.set("apikey", apiKey);

    try {
      const response = await fetch(url, { next: { revalidate: 0 } });

      if (!response.ok) {
        warnings.push(`GNews request failed for ${country.toUpperCase()}: ${response.status}`);
        return [];
      }

      const payload = (await response.json()) as { articles?: GNewsArticle[] };
      return (payload.articles ?? [])
        .filter((article) => article.title && article.url)
        .map((article) =>
          normalizeApiArticle({
            title: article.title ?? "Untitled article",
            url: article.url ?? "",
            sourceName: article.source?.name,
            sourceUrl: article.source?.url,
            imageUrl: article.image,
            publishedAt: article.publishedAt,
            description: article.description,
            contentSnippet: article.content,
            country: country.toUpperCase(),
            language: "en",
            fetchedFrom: "gnews",
            rawPayload: article as Record<string, unknown>
          })
        );
    } catch (error) {
      warnings.push(`GNews request failed for ${country.toUpperCase()}: ${(error as Error).message}`);
      return [];
    }
  });

  const results = await Promise.all(requests);
  return results.flat().slice(0, 100);
}

async function attachFactCheckLinks(
  clusters: StoryClusterWithArticles[],
  warnings: string[]
) {
  if (!process.env.GOOGLE_FACT_CHECK_API_KEY) {
    warnings.push("GOOGLE_FACT_CHECK_API_KEY is missing, so claim-review links were not fetched.");
    return clusters;
  }

  const enriched = await Promise.all(
    clusters.map(async (cluster) => {
      const claims = await Promise.all(
        cluster.claims.map(async (claim) => {
          const urls = await lookupFactChecks(claim.claim_text);
          return urls.length > 0
            ? {
                ...claim,
                evidence_status: claim.evidence_status === "insufficient_evidence" ? "unclear" : claim.evidence_status,
                fact_check_urls: urls
              }
            : claim;
        })
      );

      const scoreBreakdown = computeEvidenceConfidence(
        cluster.articles,
        claims,
        cluster.primary_sources
      );

      return {
        ...cluster,
        claims,
        evidence_confidence_score: scoreBreakdown.total,
        score_breakdown: scoreBreakdown
      };
    })
  );

  return enriched;
}

async function lookupFactChecks(query: string) {
  const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;

  if (!apiKey) {
    return [];
  }

  const url = new URL("https://factchecktools.googleapis.com/v1alpha1/claims:search");
  url.searchParams.set("query", query.slice(0, 500));
  url.searchParams.set("languageCode", "en");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      claims?: Array<{
        claimReview?: Array<{ url?: string }>;
      }>;
    };

    return [
      ...new Set(
        (payload.claims ?? [])
          .flatMap((claim) => claim.claimReview ?? [])
          .map((review) => review.url)
          .filter((url): url is string => Boolean(url))
      )
    ].slice(0, 3);
  } catch {
    return [];
  }
}

async function persistClusters(
  clusters: StoryClusterWithArticles[],
  warnings: string[]
) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return false;
  }

  try {
    for (const cluster of clusters) {
      const sourceIdByDomain = new Map<string, string>();
      const articleIdByUrl = new Map<string, string>();

      for (const article of cluster.articles) {
        const { data: sourceRow, error: sourceError } = await supabase
          .from("sources")
          .upsert(
            {
              name: article.source.name,
              domain: article.source.domain,
              country: article.source.country,
              bias_rating: article.source.bias_rating,
              factuality_rating: article.source.factuality_rating,
              credibility_score: article.source.credibility_score,
              rating_provider: article.source.rating_provider,
              rating_url: article.source.rating_url
            },
            { onConflict: "domain" }
          )
          .select("id")
          .single();

        if (sourceError || !sourceRow) {
          throw sourceError ?? new Error("Failed to persist source.");
        }

        sourceIdByDomain.set(article.source.domain, sourceRow.id as string);
      }

      for (const article of cluster.articles) {
        const sourceId = sourceIdByDomain.get(article.source.domain);

        if (!sourceId) {
          throw new Error(`Missing persisted source for ${article.source.domain}`);
        }

        const { data: articleRow, error: articleError } = await supabase
          .from("articles")
          .upsert(
            {
              source_id: sourceId,
              title: article.title,
              url: article.url,
              image_url: article.image_url,
              published_at: article.published_at,
              author: article.author,
              description: article.description,
              content_snippet: article.content_snippet,
              country: article.country,
              language: article.language,
              fetched_from: article.fetched_from,
              raw_payload: article.raw_payload
            },
            { onConflict: "url" }
          )
          .select("id")
          .single();

        if (articleError || !articleRow) {
          throw articleError ?? new Error("Failed to persist article.");
        }

        articleIdByUrl.set(article.url, articleRow.id as string);
      }

      const coverage = countCoverageByBucket(cluster.articles);
      const { data: storyRow, error: storyError } = await supabase
        .from("story_clusters")
        .upsert(
          {
            title: cluster.title,
            neutral_summary: cluster.neutral_summary,
            slug: cluster.slug,
            category: cluster.category,
            trend_score: cluster.trend_score,
            evidence_confidence_score: cluster.evidence_confidence_score,
            coverage_left_count: coverage.left,
            coverage_center_count: coverage.center,
            coverage_right_count: coverage.right,
            coverage_unknown_count: coverage.unknown,
            primary_sources: cluster.primary_sources,
            left_framing: cluster.left_framing,
            center_framing: cluster.center_framing,
            right_framing: cluster.right_framing,
            low_coverage: cluster.low_coverage,
            summary_generation_method: cluster.summary_generation_method,
            score_breakdown: cluster.score_breakdown
          },
          { onConflict: "slug" }
        )
        .select("id")
        .single();

      if (storyError || !storyRow) {
        throw storyError ?? new Error("Failed to persist story cluster.");
      }

      const storyClusterId = storyRow.id as string;
      const links = cluster.articles
        .map((article) => articleIdByUrl.get(article.url))
        .filter((articleId): articleId is string => Boolean(articleId))
        .map((articleId) => ({
          story_cluster_id: storyClusterId,
          article_id: articleId
        }));

      if (links.length > 0) {
        const { error: linkError } = await supabase
          .from("story_articles")
          .upsert(links, { onConflict: "story_cluster_id,article_id" });

        if (linkError) {
          throw linkError;
        }
      }

      await supabase.from("claims").delete().eq("story_cluster_id", storyClusterId);
      await persistClaims(storyClusterId, cluster.claims);
    }

    return true;
  } catch (error) {
    warnings.push(`Supabase persistence failed: ${(error as Error).message}`);
    return false;
  }
}

async function persistClaims(storyClusterId: string, claims: Claim[]) {
  const supabase = createSupabaseServiceClient();

  if (!supabase || claims.length === 0) {
    return;
  }

  const { error } = await supabase.from("claims").insert(
    claims.map((claim) => ({
      story_cluster_id: storyClusterId,
      claim_text: claim.claim_text,
      claimant: claim.claimant,
      claim_type: claim.claim_type,
      evidence_status: claim.evidence_status,
      confidence_score: claim.confidence_score,
      supporting_urls: claim.supporting_urls,
      fact_check_urls: claim.fact_check_urls
    }))
  );

  if (error) {
    throw error;
  }
}
