import { computeEvidenceConfidence, countCoverageByBucket } from "@/lib/scoring";
import {
  createUnknownSource,
  findSeedSourceRating
} from "@/lib/source-ratings";
import type {
  ArticleWithSource,
  Claim,
  PrimarySourceLink,
  StoryClusterWithArticles
} from "@/lib/types";
import { normalizeDomain, slugify, uniqueBy } from "@/lib/utils";

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "for",
  "from",
  "with",
  "over",
  "after",
  "before",
  "into",
  "about",
  "amid",
  "new",
  "says",
  "say",
  "report",
  "reports",
  "latest",
  "live",
  "news",
  "update",
  "updates",
  "as",
  "to",
  "in",
  "on",
  "of",
  "by",
  "at"
]);

export function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function jaccardSimilarity(left: string, right: string) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return intersection / union;
}

export async function groupRelatedArticles(articles: ArticleWithSource[]) {
  const embeddings = await getEmbeddingsIfConfigured(articles.map((article) => article.title));
  const groups: ArticleWithSource[][] = [];

  articles.forEach((article, articleIndex) => {
    let bestGroupIndex = -1;
    let bestScore = 0;

    groups.forEach((group, groupIndex) => {
      const representative = group[0];
      const representativeIndex = articles.findIndex((item) => item.id === representative.id);
      const score = embeddings
        ? cosineSimilarity(embeddings[articleIndex], embeddings[representativeIndex])
        : jaccardSimilarity(article.title, representative.title);

      if (score > bestScore) {
        bestScore = score;
        bestGroupIndex = groupIndex;
      }
    });

    const threshold = embeddings ? 0.78 : 0.24;

    if (bestGroupIndex >= 0 && bestScore >= threshold) {
      groups[bestGroupIndex].push(article);
    } else {
      groups.push([article]);
    }
  });

  return groups.sort((left, right) => right.length - left.length);
}

export async function buildStoryClustersFromArticles(
  articles: ArticleWithSource[],
  limit = 5
) {
  const uniqueArticles = uniqueBy(articles, (article) => article.url);
  const groups = await groupRelatedArticles(uniqueArticles);

  return groups
    .map((group, index) => buildClusterFromGroup(group, index))
    .sort((left, right) => right.trend_score - left.trend_score)
    .slice(0, limit);
}

export function normalizeApiArticle(input: {
  title: string;
  url: string;
  sourceName?: string | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  author?: string | null;
  description?: string | null;
  contentSnippet?: string | null;
  country?: string | null;
  language?: string | null;
  fetchedFrom: string;
  rawPayload?: Record<string, unknown> | null;
}): ArticleWithSource {
  const sourceUrl = input.sourceUrl || input.url;
  const seedSource = findSeedSourceRating(sourceUrl);
  const source =
    seedSource ?? createUnknownSource(input.sourceName || normalizeDomain(sourceUrl), sourceUrl);

  return {
    id: makeStableId("article", input.url),
    source_id: source.id,
    source,
    title: input.title,
    url: input.url,
    image_url: input.imageUrl ?? null,
    published_at: input.publishedAt ?? null,
    author: input.author ?? null,
    description: input.description ?? null,
    content_snippet: input.contentSnippet ?? input.description ?? null,
    country: input.country ?? null,
    language: input.language ?? "en",
    fetched_from: input.fetchedFrom,
    raw_payload: input.rawPayload ?? null,
    created_at: new Date().toISOString()
  };
}

function buildClusterFromGroup(
  articles: ArticleWithSource[],
  index: number
): StoryClusterWithArticles {
  const representative = chooseRepresentativeArticle(articles);
  const slug = slugify(representative.title) || `story-${index + 1}`;
  const id = makeStableId("cluster", slug);
  const primarySources = inferPrimarySources(articles);
  const claims = extractClaims(id, articles);
  const coverage = countCoverageByBucket(articles);
  const scoreBreakdown = computeEvidenceConfidence(articles, claims, primarySources);
  const now = new Date().toISOString();

  return {
    id,
    title: neutralizeTitle(representative.title),
    neutral_summary: buildNeutralSummary(articles),
    slug,
    category: inferCategory(articles),
    trend_score: computeTrendScore(articles),
    evidence_confidence_score: scoreBreakdown.total,
    coverage_left_count: coverage.left,
    coverage_center_count: coverage.center,
    coverage_right_count: coverage.right,
    coverage_unknown_count: coverage.unknown,
    primary_sources: primarySources,
    left_framing: buildFramingSummary(articles, "left"),
    center_framing: buildFramingSummary(articles, "center"),
    right_framing: buildFramingSummary(articles, "right"),
    low_coverage: articles.length < 2,
    summary_generation_method: "algorithmic",
    score_breakdown: scoreBreakdown,
    created_at: now,
    updated_at: now,
    articles,
    claims
  };
}

function chooseRepresentativeArticle(articles: ArticleWithSource[]) {
  return [...articles].sort((left, right) => {
    const leftScore = (left.description?.length ?? 0) + (left.source.credibility_score ?? 40);
    const rightScore = (right.description?.length ?? 0) + (right.source.credibility_score ?? 40);
    return rightScore - leftScore;
  })[0];
}

function neutralizeTitle(title: string) {
  return title
    .replace(/\s*[-|]\s*.*$/, "")
    .replace(/\bslams\b/gi, "criticises")
    .replace(/\bblasts\b/gi, "criticises")
    .replace(/\bchaos\b/gi, "dispute")
    .trim();
}

function buildNeutralSummary(articles: ArticleWithSource[]) {
  const representative = chooseRepresentativeArticle(articles);
  const description = representative.description || representative.content_snippet;
  const prefix = "Algorithmic summary";

  if (description) {
    return `${prefix}: ${description}`;
  }

  return `${prefix}: ${articles.length} article${articles.length === 1 ? "" : "s"} are covering this developing story. More context is needed before drawing firm conclusions.`;
}

function buildFramingSummary(articles: ArticleWithSource[], bucket: "left" | "center" | "right") {
  const matched = articles.filter((article) => {
    const bias = article.source.bias_rating;
    if (bucket === "left") {
      return bias === "left" || bias === "lean_left";
    }

    if (bucket === "right") {
      return bias === "right" || bias === "lean_right";
    }

    return bias === "center";
  });

  if (matched.length === 0) {
    return "No clear coverage from this perspective has been identified yet.";
  }

  const commonTerms = topTerms(matched.map((article) => `${article.title} ${article.description ?? ""}`));
  return `Coverage from this bucket focuses on ${commonTerms.slice(0, 4).join(", ") || "the confirmed facts available so far"}.`;
}

function extractClaims(storyClusterId: string, articles: ArticleWithSource[]): Claim[] {
  const representative = chooseRepresentativeArticle(articles);
  const supportUrls = articles.map((article) => article.url);
  const now = new Date().toISOString();

  return [
    {
      id: makeStableId("claim", `${storyClusterId}-main`),
      story_cluster_id: storyClusterId,
      claim_text: representative.description || representative.title,
      claimant: representative.source.name,
      claim_type: "factual",
      evidence_status: articles.length > 1 ? "unclear" : "insufficient_evidence",
      confidence_score: articles.length > 1 ? 55 : 35,
      supporting_urls: supportUrls,
      fact_check_urls: [],
      created_at: now
    },
    {
      id: makeStableId("claim", `${storyClusterId}-coverage`),
      story_cluster_id: storyClusterId,
      claim_text:
        articles.length > 1
          ? `${articles.length} sources are covering related versions of this story.`
          : "Only one article has been found for this story so far.",
      claimant: null,
      claim_type: "factual",
      evidence_status: articles.length > 1 ? "supported" : "insufficient_evidence",
      confidence_score: articles.length > 1 ? 72 : 30,
      supporting_urls: supportUrls,
      fact_check_urls: [],
      created_at: now
    }
  ];
}

function inferPrimarySources(articles: ArticleWithSource[]): PrimarySourceLink[] {
  const text = articles.map((article) => `${article.title} ${article.description ?? ""}`).join(" ").toLowerCase();
  const links: PrimarySourceLink[] = [];

  if (text.includes("ukraine") || text.includes("nato")) {
    links.push({
      label: "NATO official statements",
      url: "https://www.nato.int/cps/en/natohq/news.htm",
      type: "primary"
    });
  }

  if (text.includes("rate") || text.includes("inflation") || text.includes("central bank")) {
    links.push({
      label: "Federal Reserve monetary policy releases",
      url: "https://www.federalreserve.gov/monetarypolicy.htm",
      type: "primary"
    });
  }

  if (text.includes("ai") || text.includes("artificial intelligence")) {
    links.push({
      label: "US AI policy resources",
      url: "https://www.whitehouse.gov/ostp/ai/",
      type: "primary"
    });
  }

  if (text.includes("climate") || text.includes("flood") || text.includes("heat")) {
    links.push({
      label: "IPCC reports and resources",
      url: "https://www.ipcc.ch/reports/",
      type: "primary"
    });
  }

  if (text.includes("migration") || text.includes("immigration") || text.includes("asylum")) {
    links.push({
      label: "UK Home Office policy papers",
      url: "https://www.gov.uk/government/organisations/home-office",
      type: "primary"
    });
  }

  return uniqueBy(links, (link) => link.url);
}

function inferCategory(articles: ArticleWithSource[]) {
  const text = articles.map((article) => article.title).join(" ").toLowerCase();

  if (text.includes("ai") || text.includes("tech")) {
    return "Technology";
  }

  if (text.includes("rate") || text.includes("inflation") || text.includes("market")) {
    return "Economy";
  }

  if (text.includes("climate") || text.includes("flood") || text.includes("heat")) {
    return "Climate";
  }

  if (text.includes("migration") || text.includes("election") || text.includes("government")) {
    return "Politics";
  }

  if (text.includes("ukraine") || text.includes("war") || text.includes("nato")) {
    return "World";
  }

  return "General";
}

function computeTrendScore(articles: ArticleWithSource[]) {
  const sourceCount = new Set(articles.map((article) => article.source.domain)).size;
  const recencyScore = Math.max(
    0,
    ...articles.map((article) => {
      if (!article.published_at) {
        return 0;
      }

      const ageHours =
        (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60);
      return Math.max(0, 24 - ageHours);
    })
  );

  return Math.round(sourceCount * 18 + articles.length * 8 + recencyScore);
}

function topTerms(values: string[]) {
  const counts = new Map<string, number>();

  values.flatMap(tokenize).forEach((token) => {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([term]) => term);
}

async function getEmbeddingsIfConfigured(texts: string[]) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: texts
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };

    const embeddings = payload.data?.map((item) => item.embedding ?? []) ?? [];
    return embeddings.length === texts.length ? embeddings : null;
  } catch {
    return null;
  }
}

function cosineSimilarity(left: number[], right: number[]) {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  left.forEach((value, index) => {
    dot += value * right[index];
    leftMagnitude += value * value;
    rightMagnitude += right[index] * right[index];
  });

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function makeStableId(prefix: string, value: string) {
  const hash = Array.from(value).reduce((acc, character) => {
    return (acc * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);

  return `${prefix}-${hash.toString(16)}`;
}
