import { computeEvidenceConfidence, countCoverageByBucket } from "@/lib/scoring";
import { seedSourceRatings } from "@/lib/source-ratings";
import type {
  ArticleWithSource,
  Claim,
  PrimarySourceLink,
  Source,
  StoryClusterWithArticles
} from "@/lib/types";

const createdAt = "2026-04-25T09:00:00.000Z";
const sourcesById = new Map(seedSourceRatings.map((source) => [source.id, source]));

function source(id: string): Source {
  const match = sourcesById.get(id);

  if (!match) {
    throw new Error(`Missing mock source ${id}`);
  }

  return match;
}

function article(
  id: string,
  sourceId: string,
  title: string,
  url: string,
  description: string,
  published_at: string,
  country: string
): ArticleWithSource {
  const matchedSource = source(sourceId);

  return {
    id,
    source_id: matchedSource.id,
    source: matchedSource,
    title,
    url,
    image_url: null,
    published_at,
    author: null,
    description,
    content_snippet: description,
    country,
    language: "en",
    fetched_from: "mock",
    raw_payload: null,
    created_at: createdAt
  };
}

function claim(
  id: string,
  storyClusterId: string,
  claim_text: string,
  evidence_status: Claim["evidence_status"],
  supporting_urls: string[],
  fact_check_urls: string[] = [],
  claimant: string | null = null
): Claim {
  return {
    id,
    story_cluster_id: storyClusterId,
    claim_text,
    claimant,
    claim_type: "factual",
    evidence_status,
    confidence_score: evidence_status === "supported" ? 78 : evidence_status === "disputed" ? 52 : 44,
    supporting_urls,
    fact_check_urls,
    created_at: createdAt
  };
}

function cluster(input: {
  id: string;
  slug: string;
  category: string;
  title: string;
  neutral_summary: string;
  trend_score: number;
  articles: ArticleWithSource[];
  primary_sources: PrimarySourceLink[];
  left_framing: string;
  center_framing: string;
  right_framing: string;
  claims: Claim[];
}): StoryClusterWithArticles {
  const coverage = countCoverageByBucket(input.articles);
  const scoreBreakdown = computeEvidenceConfidence(
    input.articles,
    input.claims,
    input.primary_sources
  );

  return {
    id: input.id,
    title: input.title,
    neutral_summary: input.neutral_summary,
    slug: input.slug,
    category: input.category,
    trend_score: input.trend_score,
    evidence_confidence_score: scoreBreakdown.total,
    coverage_left_count: coverage.left,
    coverage_center_count: coverage.center,
    coverage_right_count: coverage.right,
    coverage_unknown_count: coverage.unknown,
    primary_sources: input.primary_sources,
    left_framing: input.left_framing,
    center_framing: input.center_framing,
    right_framing: input.right_framing,
    low_coverage: input.articles.length < 2,
    summary_generation_method: "mock",
    score_breakdown: scoreBreakdown,
    created_at: createdAt,
    updated_at: createdAt,
    articles: input.articles,
    claims: input.claims
  };
}

const ukraineArticles = [
  article(
    "mock-article-ukraine-reuters",
    "seed-reuters",
    "European leaders discuss new Ukraine security guarantees",
    "https://www.reuters.com/world/europe/",
    "European officials are weighing how to structure long-term military and financial support for Ukraine.",
    "2026-04-25T07:45:00.000Z",
    "GB"
  ),
  article(
    "mock-article-ukraine-bbc",
    "seed-bbc",
    "Ukraine talks focus on security assurances from Western allies",
    "https://www.bbc.co.uk/news/world-europe",
    "Western governments are discussing assurances intended to deter future attacks and support Ukraine's defence capacity.",
    "2026-04-25T07:12:00.000Z",
    "GB"
  ),
  article(
    "mock-article-ukraine-fox",
    "seed-fox",
    "Western allies face questions over Ukraine aid commitments",
    "https://www.foxnews.com/world",
    "US and European officials are under pressure to explain the cost, duration, and strategic aims of Ukraine support.",
    "2026-04-25T06:30:00.000Z",
    "US"
  )
];

const ratesArticles = [
  article(
    "mock-article-rates-ap",
    "seed-associated-press",
    "Central banks signal caution as inflation cools unevenly",
    "https://apnews.com/hub/business",
    "Major central banks are balancing softer inflation figures with concerns that price pressures remain uneven.",
    "2026-04-25T08:10:00.000Z",
    "US"
  ),
  article(
    "mock-article-rates-wsj",
    "seed-wsj",
    "Markets watch central bank language for rate-cut timing",
    "https://www.wsj.com/news/economy",
    "Investors are tracking policy statements for clues about when borrowing costs may begin to fall.",
    "2026-04-25T07:50:00.000Z",
    "US"
  ),
  article(
    "mock-article-rates-reuters",
    "seed-reuters",
    "Policy makers weigh inflation data before next rate decisions",
    "https://www.reuters.com/markets/",
    "Officials say incoming inflation and labour-market data will guide the pace of any policy shift.",
    "2026-04-25T07:20:00.000Z",
    "GB"
  )
];

const aiArticles = [
  article(
    "mock-article-ai-guardian",
    "seed-guardian",
    "Lawmakers push for tougher checks on high-risk AI systems",
    "https://www.theguardian.com/technology/artificialintelligenceai",
    "Civil-society groups and some lawmakers are calling for stronger transparency requirements on powerful AI systems.",
    "2026-04-25T08:25:00.000Z",
    "GB"
  ),
  article(
    "mock-article-ai-nyt",
    "seed-nyt",
    "AI safety debate intensifies as regulators consider new rules",
    "https://www.nytimes.com/section/technology",
    "Regulators are weighing disclosure, testing, and incident-reporting requirements for advanced AI products.",
    "2026-04-25T07:55:00.000Z",
    "US"
  ),
  article(
    "mock-article-ai-wsj",
    "seed-wsj",
    "Tech companies warn AI rules could slow deployment",
    "https://www.wsj.com/news/technology",
    "Industry groups say new rules should protect safety without blocking useful AI tools from reaching customers.",
    "2026-04-25T06:45:00.000Z",
    "US"
  )
];

const climateArticles = [
  article(
    "mock-article-climate-cbc",
    "seed-cbc",
    "Cities seek more funding for flood and heat adaptation",
    "https://www.cbc.ca/news/climate",
    "Municipal leaders say climate adaptation spending is lagging behind rising costs from floods and heat waves.",
    "2026-04-25T08:05:00.000Z",
    "CA"
  ),
  article(
    "mock-article-climate-abc",
    "seed-abc-au",
    "Local governments ask for clearer climate resilience funding",
    "https://www.abc.net.au/news/environment",
    "Councils are asking national governments to clarify support for infrastructure that can withstand extreme weather.",
    "2026-04-25T07:10:00.000Z",
    "AU"
  ),
  article(
    "mock-article-climate-reuters",
    "seed-reuters",
    "Western governments review climate resilience budgets",
    "https://www.reuters.com/sustainability/",
    "Budget officials are reviewing how adaptation projects should be prioritised as insurance and repair costs rise.",
    "2026-04-25T06:20:00.000Z",
    "GB"
  )
];

const migrationArticles = [
  article(
    "mock-article-migration-sky",
    "seed-sky",
    "Government faces scrutiny over new migration enforcement plan",
    "https://news.sky.com/topic/immigration-5993",
    "Officials say the plan is intended to speed up enforcement while critics question legal safeguards.",
    "2026-04-25T08:30:00.000Z",
    "GB"
  ),
  article(
    "mock-article-migration-bbc",
    "seed-bbc",
    "Migration policy debate centres on costs, courts and border capacity",
    "https://www.bbc.co.uk/news/politics",
    "The debate is focused on whether new measures can reduce pressure without breaching legal obligations.",
    "2026-04-25T07:40:00.000Z",
    "GB"
  ),
  article(
    "mock-article-migration-guardian",
    "seed-guardian",
    "Rights groups challenge migration enforcement proposals",
    "https://www.theguardian.com/uk/immigration",
    "Advocacy groups say the proposals need stronger protections for vulnerable people and asylum applicants.",
    "2026-04-25T06:55:00.000Z",
    "GB"
  )
];

export const mockStoryClusters: StoryClusterWithArticles[] = [
  cluster({
    id: "mock-cluster-ukraine-security",
    slug: "ukraine-security-guarantees-western-allies",
    category: "World",
    title: "Western allies discuss security guarantees for Ukraine",
    neutral_summary:
      "Demo summary: Western governments are discussing longer-term support and security assurances for Ukraine, with debate over scope, cost, and deterrence.",
    trend_score: 96,
    articles: ukraineArticles,
    primary_sources: [
      {
        label: "NATO official statements",
        url: "https://www.nato.int/cps/en/natohq/news.htm",
        type: "primary"
      },
      {
        label: "Ukraine government updates",
        url: "https://www.president.gov.ua/en/news/all",
        type: "primary"
      }
    ],
    left_framing:
      "Coverage emphasises continued support for Ukraine, humanitarian stakes, and the need for durable European commitments.",
    center_framing:
      "Coverage focuses on what officials have confirmed, the structure of guarantees, and the diplomatic constraints.",
    right_framing:
      "Coverage highlights cost, accountability, and questions about the strategic endpoint of additional commitments.",
    claims: [
      claim(
        "mock-claim-ukraine-1",
        "mock-cluster-ukraine-security",
        "Western officials are discussing long-term security assurances for Ukraine.",
        "supported",
        ukraineArticles.map((item) => item.url)
      ),
      claim(
        "mock-claim-ukraine-2",
        "mock-cluster-ukraine-security",
        "The final cost and duration of any new package are not yet confirmed.",
        "insufficient_evidence",
        [ukraineArticles[2].url]
      )
    ]
  }),
  cluster({
    id: "mock-cluster-central-banks",
    slug: "central-banks-cautious-rate-path",
    category: "Economy",
    title: "Central banks weigh rate cuts as inflation eases unevenly",
    neutral_summary:
      "Demo summary: Central banks are signalling caution on interest-rate cuts as inflation cools in some areas while wage and services prices remain watched.",
    trend_score: 90,
    articles: ratesArticles,
    primary_sources: [
      {
        label: "Federal Reserve monetary policy releases",
        url: "https://www.federalreserve.gov/monetarypolicy.htm",
        type: "primary"
      },
      {
        label: "Bank of England monetary policy",
        url: "https://www.bankofengland.co.uk/monetary-policy",
        type: "primary"
      }
    ],
    left_framing:
      "Coverage tends to stress the household impact of borrowing costs and the risk of cutting public support too quickly.",
    center_framing:
      "Coverage tracks data, market expectations, and the wording of central-bank statements.",
    right_framing:
      "Coverage focuses on inflation discipline, fiscal pressure, and the risk of declaring victory too soon.",
    claims: [
      claim(
        "mock-claim-rates-1",
        "mock-cluster-central-banks",
        "Central bankers say future rate decisions will depend on incoming inflation data.",
        "supported",
        ratesArticles.map((item) => item.url)
      ),
      claim(
        "mock-claim-rates-2",
        "mock-cluster-central-banks",
        "Markets are pricing in future rate cuts, but timing remains uncertain.",
        "unclear",
        [ratesArticles[1].url]
      )
    ]
  }),
  cluster({
    id: "mock-cluster-ai-safety",
    slug: "ai-safety-rules-transparency-debate",
    category: "Technology",
    title: "Regulators debate transparency rules for high-risk AI",
    neutral_summary:
      "Demo summary: Lawmakers, companies, and civil-society groups are debating how to regulate high-risk AI systems without blocking useful deployment.",
    trend_score: 87,
    articles: aiArticles,
    primary_sources: [
      {
        label: "US AI executive actions and guidance",
        url: "https://www.whitehouse.gov/ostp/ai/",
        type: "primary"
      }
    ],
    left_framing:
      "Coverage stresses safety testing, labour impacts, civil rights, and public transparency.",
    center_framing:
      "Coverage compares proposed rule details and identifies what is confirmed versus still under consultation.",
    right_framing:
      "Coverage highlights innovation risks, compliance costs, and global competitiveness.",
    claims: [
      claim(
        "mock-claim-ai-1",
        "mock-cluster-ai-safety",
        "Regulators are considering disclosure or testing requirements for high-risk AI systems.",
        "supported",
        aiArticles.map((item) => item.url)
      ),
      claim(
        "mock-claim-ai-2",
        "mock-cluster-ai-safety",
        "The economic impact of proposed AI rules is not yet settled.",
        "insufficient_evidence",
        [aiArticles[2].url]
      )
    ]
  }),
  cluster({
    id: "mock-cluster-climate-resilience",
    slug: "cities-climate-resilience-funding",
    category: "Climate",
    title: "Cities press for climate resilience funding",
    neutral_summary:
      "Demo summary: Local governments are asking for clearer adaptation funding as extreme-weather costs put pressure on infrastructure budgets.",
    trend_score: 82,
    articles: climateArticles,
    primary_sources: [
      {
        label: "IPCC reports and resources",
        url: "https://www.ipcc.ch/reports/",
        type: "primary"
      }
    ],
    left_framing:
      "Coverage emphasises public investment, vulnerable communities, and the cost of delayed adaptation.",
    center_framing:
      "Coverage focuses on budgets, infrastructure needs, and what governments have formally proposed.",
    right_framing:
      "Coverage raises questions about spending priorities, local delivery, and accountability for project outcomes.",
    claims: [
      claim(
        "mock-claim-climate-1",
        "mock-cluster-climate-resilience",
        "Local governments are requesting more predictable climate adaptation funding.",
        "supported",
        climateArticles.map((item) => item.url)
      ),
      claim(
        "mock-claim-climate-2",
        "mock-cluster-climate-resilience",
        "The exact fiscal gap varies by region and is not established by these articles alone.",
        "insufficient_evidence",
        [climateArticles[0].url, climateArticles[1].url]
      )
    ]
  }),
  cluster({
    id: "mock-cluster-migration-plan",
    slug: "migration-enforcement-policy-scrutiny",
    category: "Politics",
    title: "Migration enforcement plan draws legal and cost scrutiny",
    neutral_summary:
      "Demo summary: A migration enforcement proposal is drawing debate over border capacity, legal safeguards, costs, and practical delivery.",
    trend_score: 78,
    articles: migrationArticles,
    primary_sources: [
      {
        label: "UK Home Office policy papers",
        url: "https://www.gov.uk/government/organisations/home-office",
        type: "primary"
      }
    ],
    left_framing:
      "Coverage emphasises legal safeguards, asylum protections, and the effect on vulnerable people.",
    center_framing:
      "Coverage separates confirmed policy details from criticism and unresolved implementation questions.",
    right_framing:
      "Coverage focuses on enforcement capacity, border pressure, and whether the plan can deter irregular routes.",
    claims: [
      claim(
        "mock-claim-migration-1",
        "mock-cluster-migration-plan",
        "Officials say the proposal is intended to speed up migration enforcement.",
        "supported",
        [migrationArticles[0].url, migrationArticles[1].url]
      ),
      claim(
        "mock-claim-migration-2",
        "mock-cluster-migration-plan",
        "The legality and practical effect of the proposal remain contested.",
        "disputed",
        migrationArticles.map((item) => item.url)
      )
    ]
  })
];
