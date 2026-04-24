export type BiasRating =
  | "left"
  | "lean_left"
  | "center"
  | "lean_right"
  | "right"
  | "unknown";

export type FactualityRating =
  | "very_high"
  | "high"
  | "mostly_factual"
  | "mixed"
  | "low"
  | "unknown";

export type ClaimType =
  | "factual"
  | "opinion"
  | "prediction"
  | "allegation"
  | "unknown";

export type EvidenceStatus =
  | "supported"
  | "disputed"
  | "unclear"
  | "insufficient_evidence";

export type CoverageBucket = "left" | "center" | "right" | "unknown";

export interface Source {
  id: string;
  name: string;
  domain: string;
  country: string | null;
  bias_rating: BiasRating;
  factuality_rating: FactualityRating;
  credibility_score: number | null;
  rating_provider: string | null;
  rating_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  source_id: string;
  title: string;
  url: string;
  image_url: string | null;
  published_at: string | null;
  author: string | null;
  description: string | null;
  content_snippet: string | null;
  country: string | null;
  language: string | null;
  fetched_from: string;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface ArticleWithSource extends Article {
  source: Source;
}

export interface PrimarySourceLink {
  label: string;
  url: string;
  type: "primary" | "fact_check" | "source" | "context";
}

export interface ScoreComponent {
  key:
    | "source_reliability"
    | "cross_spectrum"
    | "primary_sources"
    | "fact_checks"
    | "transparency"
    | "correction_history";
  label: string;
  weight: number;
  score: number;
  points: number;
  explanation: string;
}

export interface ScoreBreakdown {
  total: number;
  components: ScoreComponent[];
  limitations: string[];
}

export interface StoryCluster {
  id: string;
  title: string;
  neutral_summary: string;
  slug: string;
  category: string;
  trend_score: number;
  evidence_confidence_score: number;
  coverage_left_count: number;
  coverage_center_count: number;
  coverage_right_count: number;
  coverage_unknown_count: number;
  primary_sources: PrimarySourceLink[];
  left_framing: string | null;
  center_framing: string | null;
  right_framing: string | null;
  low_coverage: boolean;
  summary_generation_method: "mock" | "algorithmic" | "ai";
  score_breakdown: ScoreBreakdown;
  created_at: string;
  updated_at: string;
}

export interface StoryClusterWithArticles extends StoryCluster {
  articles: ArticleWithSource[];
  claims: Claim[];
}

export interface Claim {
  id: string;
  story_cluster_id: string;
  claim_text: string;
  claimant: string | null;
  claim_type: ClaimType;
  evidence_status: EvidenceStatus;
  confidence_score: number | null;
  supporting_urls: string[];
  fact_check_urls: string[];
  created_at: string;
}

export interface IngestionResult {
  mode: "live" | "mock";
  saved: boolean;
  articleCount: number;
  clusterCount: number;
  warnings: string[];
  clusters: StoryClusterWithArticles[];
}

export function biasToCoverageBucket(bias: BiasRating): CoverageBucket {
  if (bias === "left" || bias === "lean_left") {
    return "left";
  }

  if (bias === "right" || bias === "lean_right") {
    return "right";
  }

  if (bias === "center") {
    return "center";
  }

  return "unknown";
}
