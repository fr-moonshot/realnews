import {
  biasToCoverageBucket,
  type ArticleWithSource,
  type Claim,
  type CoverageBucket,
  type FactualityRating,
  type PrimarySourceLink,
  type ScoreBreakdown,
  type ScoreComponent
} from "@/lib/types";

const WEIGHTS = {
  source_reliability: 25,
  cross_spectrum: 20,
  primary_sources: 20,
  fact_checks: 15,
  transparency: 10,
  correction_history: 10
} as const;

export function countCoverageByBucket(articles: ArticleWithSource[]) {
  return articles.reduce<Record<CoverageBucket, number>>(
    (counts, article) => {
      counts[biasToCoverageBucket(article.source.bias_rating)] += 1;
      return counts;
    },
    { left: 0, center: 0, right: 0, unknown: 0 }
  );
}

export function computeEvidenceConfidence(
  articles: ArticleWithSource[],
  claims: Claim[],
  primarySources: PrimarySourceLink[]
): ScoreBreakdown {
  const sourceReliability = scoreSourceReliability(articles);
  const crossSpectrum = scoreCrossSpectrum(articles);
  const primaryEvidence = scorePrimarySources(primarySources);
  const factChecks = scoreFactChecks(claims);
  const transparency = scoreTransparency(articles);
  const correctionHistory = scoreCorrectionHistory(articles);

  const components: ScoreComponent[] = [
    component(
      "source_reliability",
      "Source reliability average",
      sourceReliability,
      "Average available credibility score across linked sources. Unknown sources are treated conservatively."
    ),
    component(
      "cross_spectrum",
      "Cross-spectrum corroboration",
      crossSpectrum,
      "Rewards coverage from more than one editorial perspective without treating balance as truth."
    ),
    component(
      "primary_sources",
      "Primary-source availability",
      primaryEvidence,
      "Looks for direct documents, official statements, filings, data releases, or other first-party evidence."
    ),
    component(
      "fact_checks",
      "Fact-check and claim-review support",
      factChecks,
      "Credits cited fact-check or claim-review links when available. Missing reviews reduce confidence."
    ),
    component(
      "transparency",
      "Transparency signals",
      transparency,
      "Checks whether articles include dates, authors, descriptions, source attribution, and snippets."
    ),
    component(
      "correction_history",
      "Correction and factuality history",
      correctionHistory,
      "Uses available factuality ratings as a cautious proxy for correction and sourcing history."
    )
  ];

  const total = Math.round(
    components.reduce((sum, item) => sum + item.points, 0)
  );

  return {
    total,
    components,
    limitations: buildLimitations(articles, claims, primarySources)
  };
}

function component(
  key: ScoreComponent["key"],
  label: string,
  score: number,
  explanation: string
): ScoreComponent {
  const weight = WEIGHTS[key];

  return {
    key,
    label,
    weight,
    score: Math.round(score),
    points: Math.round((score * weight) / 100),
    explanation
  };
}

function scoreSourceReliability(articles: ArticleWithSource[]) {
  if (articles.length === 0) {
    return 0;
  }

  const total = articles.reduce((sum, article) => {
    return sum + (article.source.credibility_score ?? 40);
  }, 0);

  return total / articles.length;
}

function scoreCrossSpectrum(articles: ArticleWithSource[]) {
  if (articles.length < 2) {
    return 25;
  }

  const coverage = countCoverageByBucket(articles);
  const knownPerspectiveCount = [
    coverage.left > 0,
    coverage.center > 0,
    coverage.right > 0
  ].filter(Boolean).length;

  const base =
    knownPerspectiveCount >= 3 ? 95 : knownPerspectiveCount === 2 ? 72 : 45;

  const unknownShare = coverage.unknown / articles.length;
  return Math.max(20, base - unknownShare * 30);
}

function scorePrimarySources(primarySources: PrimarySourceLink[]) {
  const primaryCount = primarySources.filter((link) => link.type === "primary").length;

  if (primaryCount >= 2) {
    return 90;
  }

  if (primaryCount === 1) {
    return 74;
  }

  if (primarySources.length > 0) {
    return 48;
  }

  return 30;
}

function scoreFactChecks(claims: Claim[]) {
  const checkedClaims = claims.filter((claim) => claim.fact_check_urls.length > 0);

  if (checkedClaims.length === 0) {
    return 35;
  }

  const statusScore = checkedClaims.reduce((sum, claim) => {
    if (claim.evidence_status === "supported") {
      return sum + 88;
    }

    if (claim.evidence_status === "disputed") {
      return sum + 58;
    }

    if (claim.evidence_status === "unclear") {
      return sum + 48;
    }

    return sum + 35;
  }, 0);

  const coverageBonus = Math.min(12, checkedClaims.length * 4);
  return Math.min(100, statusScore / checkedClaims.length + coverageBonus);
}

function scoreTransparency(articles: ArticleWithSource[]) {
  if (articles.length === 0) {
    return 0;
  }

  const articleScores = articles.map((article) => {
    const signals = [
      Boolean(article.source.name),
      Boolean(article.url),
      Boolean(article.published_at),
      Boolean(article.author),
      Boolean(article.description || article.content_snippet)
    ].filter(Boolean).length;

    return (signals / 5) * 100;
  });

  return articleScores.reduce((sum, score) => sum + score, 0) / articles.length;
}

function scoreCorrectionHistory(articles: ArticleWithSource[]) {
  if (articles.length === 0) {
    return 0;
  }

  const score = articles.reduce((sum, article) => {
    return sum + factualityToScore(article.source.factuality_rating);
  }, 0);

  return score / articles.length;
}

function factualityToScore(rating: FactualityRating) {
  switch (rating) {
    case "very_high":
      return 92;
    case "high":
      return 84;
    case "mostly_factual":
      return 72;
    case "mixed":
      return 52;
    case "low":
      return 28;
    case "unknown":
    default:
      return 40;
  }
}

function buildLimitations(
  articles: ArticleWithSource[],
  claims: Claim[],
  primarySources: PrimarySourceLink[]
) {
  const limitations: string[] = [];
  const unknownSourceCount = articles.filter(
    (article) => article.source.bias_rating === "unknown" || article.source.credibility_score === null
  ).length;

  if (articles.length < 2) {
    limitations.push("Low coverage: this cluster has fewer than two articles.");
  }

  if (unknownSourceCount > 0) {
    limitations.push(`${unknownSourceCount} source rating${unknownSourceCount === 1 ? " is" : "s are"} unknown.`);
  }

  if (!primarySources.some((link) => link.type === "primary")) {
    limitations.push("No primary-source link has been identified yet.");
  }

  if (!claims.some((claim) => claim.fact_check_urls.length > 0)) {
    limitations.push("No cited fact-check or claim-review link is attached to the extracted claims yet.");
  }

  return limitations;
}
