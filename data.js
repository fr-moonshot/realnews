window.REALNEWS_STORIES = [
  {
    slug: "ukraine-security-guarantees-western-allies",
    category: "World",
    title: "Western allies discuss security guarantees for Ukraine",
    summary: "Western governments are discussing longer-term support and security assurances for Ukraine, with debate over scope, cost, and deterrence.",
    read: "The clearest supported reading is that allies are seriously discussing longer-term security guarantees for Ukraine, but the cost, legal shape and final commitments are still unsettled.",
    confidence: 78,
    trend: 96,
    coverage: { left: 1, centre: 2, right: 1, unknown: 0 },
    primaryEvidence: true,
    primarySources: [
      { label: "NATO official statements", url: "https://www.nato.int/cps/en/natohq/news.htm" },
      { label: "Ukraine government updates", url: "https://www.president.gov.ua/en/news/all" }
    ],
    framing: {
      left: "Coverage emphasises continued support for Ukraine, humanitarian stakes, and durable European commitments.",
      centre: "Coverage focuses on what officials have confirmed, the structure of guarantees, and diplomatic constraints.",
      right: "Coverage highlights cost, accountability, and questions about the strategic endpoint of additional commitments."
    },
    articles: [
      { source: "Reuters", domain: "reuters.com", bias: "Centre", factuality: "Very high", credibility: 92, title: "European leaders discuss new Ukraine security guarantees", url: "https://www.reuters.com/world/europe/" },
      { source: "BBC News", domain: "bbc.co.uk", bias: "Centre", factuality: "High", credibility: 86, title: "Ukraine talks focus on security assurances from Western allies", url: "https://www.bbc.co.uk/news/world-europe" },
      { source: "The Guardian", domain: "theguardian.com", bias: "Lean Left", factuality: "High", credibility: 80, title: "European leaders press for long-term Ukraine commitments", url: "https://www.theguardian.com/world/ukraine" },
      { source: "Fox News", domain: "foxnews.com", bias: "Right", factuality: "Mixed", credibility: 58, title: "Western allies face questions over Ukraine aid commitments", url: "https://www.foxnews.com/world" }
    ],
    claims: [
      { text: "Western officials are discussing long-term security assurances for Ukraine.", claimant: "Multiple outlets", status: "Supported by cited coverage", confidence: 76, links: ["https://www.nato.int/cps/en/natohq/news.htm"] },
      { text: "The final cost and duration of any new package are not yet confirmed.", claimant: "Real News synthesis", status: "Insufficient evidence", confidence: 45, links: ["https://www.reuters.com/world/europe/"] }
    ],
    scoring: [
      { label: "Source reliability average", weight: 25, points: 20, note: "Most articles come from sources with known ratings." },
      { label: "Cross-spectrum corroboration", weight: 20, points: 18, note: "Coverage appears across left, centre and right buckets." },
      { label: "Primary-source availability", weight: 20, points: 18, note: "Official NATO and Ukraine government pages are available." },
      { label: "Fact-check and claim-review support", weight: 15, points: 5, note: "No specific claim-review link is attached yet." },
      { label: "Transparency signals", weight: 10, points: 8, note: "Articles provide source names, dates and summaries." },
      { label: "Correction and factuality history", weight: 10, points: 9, note: "Known factuality ratings are mostly high." }
    ],
    limitations: ["No cited claim-review link is attached yet.", "Final policy terms may change as negotiations continue."]
  },
  {
    slug: "central-banks-cautious-rate-path",
    category: "Economy",
    title: "Central banks weigh rate cuts as inflation eases unevenly",
    summary: "Central banks are signalling caution on interest-rate cuts as inflation cools in some areas while wage and services prices remain watched.",
    read: "The best-supported view is that rate cuts are becoming more plausible, but central banks are not treating the inflation fight as finished and are waiting for more data before moving quickly.",
    confidence: 77,
    trend: 90,
    coverage: { left: 0, centre: 2, right: 1, unknown: 0 },
    primaryEvidence: true,
    primarySources: [
      { label: "Federal Reserve monetary policy releases", url: "https://www.federalreserve.gov/monetarypolicy.htm" },
      { label: "Bank of England monetary policy", url: "https://www.bankofengland.co.uk/monetary-policy" }
    ],
    framing: {
      left: "Limited left-bucket coverage is identified in this demo cluster.",
      centre: "Coverage tracks inflation data, policy language, and what officials have formally said.",
      right: "Coverage focuses on inflation discipline, fiscal pressure, and the risk of cutting too early."
    },
    articles: [
      { source: "Associated Press", domain: "apnews.com", bias: "Centre", factuality: "Very high", credibility: 91, title: "Central banks signal caution as inflation cools unevenly", url: "https://apnews.com/hub/business" },
      { source: "Reuters", domain: "reuters.com", bias: "Centre", factuality: "Very high", credibility: 92, title: "Policy makers weigh inflation data before next rate decisions", url: "https://www.reuters.com/markets/" },
      { source: "The Wall Street Journal", domain: "wsj.com", bias: "Lean Right", factuality: "High", credibility: 84, title: "Markets watch central bank language for rate-cut timing", url: "https://www.wsj.com/news/economy" }
    ],
    claims: [
      { text: "Central bankers say future rate decisions will depend on incoming inflation data.", claimant: "Multiple outlets", status: "Supported by cited coverage", confidence: 80, links: ["https://www.federalreserve.gov/monetarypolicy.htm"] },
      { text: "Markets expect future rate cuts, but timing remains uncertain.", claimant: "Market coverage", status: "Unclear", confidence: 56, links: ["https://www.wsj.com/news/economy"] }
    ],
    scoring: [
      { label: "Source reliability average", weight: 25, points: 22, note: "Known sources have high credibility ratings." },
      { label: "Cross-spectrum corroboration", weight: 20, points: 14, note: "Centre and right buckets are represented; left-bucket coverage is missing." },
      { label: "Primary-source availability", weight: 20, points: 18, note: "Central-bank policy pages are directly available." },
      { label: "Fact-check and claim-review support", weight: 15, points: 5, note: "No independent claim-review link is attached yet." },
      { label: "Transparency signals", weight: 10, points: 8, note: "Articles include source, date and summary metadata." },
      { label: "Correction and factuality history", weight: 10, points: 10, note: "Factuality history is high across listed sources." }
    ],
    limitations: ["The cluster reflects policy language, not a final rate decision.", "No cited claim-review link is attached yet."]
  },
  {
    slug: "ai-safety-rules-transparency-debate",
    category: "Technology",
    title: "Regulators debate transparency rules for high-risk AI",
    summary: "Lawmakers, companies, and civil-society groups are debating how to regulate high-risk AI systems without blocking useful deployment.",
    read: "The strongest common thread is that tougher transparency rules for high-risk AI are likely, while the unresolved question is how strict they can be without slowing useful products.",
    confidence: 69,
    trend: 87,
    coverage: { left: 2, centre: 0, right: 1, unknown: 0 },
    primaryEvidence: true,
    primarySources: [
      { label: "US AI policy resources", url: "https://www.whitehouse.gov/ostp/ai/" }
    ],
    framing: {
      left: "Coverage stresses safety testing, labour impacts, civil rights, and public transparency.",
      centre: "No centre-bucket coverage is identified in this demo cluster.",
      right: "Coverage highlights innovation risks, compliance costs, and global competitiveness."
    },
    articles: [
      { source: "The Guardian", domain: "theguardian.com", bias: "Lean Left", factuality: "High", credibility: 80, title: "Lawmakers push for tougher checks on high-risk AI systems", url: "https://www.theguardian.com/technology/artificialintelligenceai" },
      { source: "The New York Times", domain: "nytimes.com", bias: "Lean Left", factuality: "High", credibility: 84, title: "AI safety debate intensifies as regulators consider new rules", url: "https://www.nytimes.com/section/technology" },
      { source: "The Wall Street Journal", domain: "wsj.com", bias: "Lean Right", factuality: "High", credibility: 84, title: "Tech companies warn AI rules could slow deployment", url: "https://www.wsj.com/news/technology" }
    ],
    claims: [
      { text: "Regulators are considering disclosure or testing requirements for high-risk AI systems.", claimant: "Multiple outlets", status: "Supported by cited coverage", confidence: 72, links: ["https://www.whitehouse.gov/ostp/ai/"] },
      { text: "The economic impact of proposed AI rules is not yet settled.", claimant: "Real News synthesis", status: "Insufficient evidence", confidence: 42, links: ["https://www.wsj.com/news/technology"] }
    ],
    scoring: [
      { label: "Source reliability average", weight: 25, points: 21, note: "Sources have known ratings and generally high factuality." },
      { label: "Cross-spectrum corroboration", weight: 20, points: 14, note: "Left and right buckets are represented; centre coverage is missing." },
      { label: "Primary-source availability", weight: 20, points: 15, note: "Relevant official policy pages are available." },
      { label: "Fact-check and claim-review support", weight: 15, points: 5, note: "No cited fact-check link is attached yet." },
      { label: "Transparency signals", weight: 10, points: 7, note: "Metadata is present but author data is incomplete." },
      { label: "Correction and factuality history", weight: 10, points: 7, note: "Factuality history is generally high." }
    ],
    limitations: ["No centre-bucket coverage is included in this demo cluster.", "No claim-review link is attached yet."]
  },
  {
    slug: "cities-climate-resilience-funding",
    category: "Climate",
    title: "Cities press for climate resilience funding",
    summary: "Local governments are asking for clearer adaptation funding as extreme-weather costs put pressure on infrastructure budgets.",
    read: "The most reliable reading is that local governments are facing rising adaptation costs and want clearer funding, but the exact budget gap depends heavily on local risk and infrastructure needs.",
    confidence: 73,
    trend: 82,
    coverage: { left: 0, centre: 3, right: 0, unknown: 0 },
    primaryEvidence: true,
    primarySources: [
      { label: "IPCC reports and resources", url: "https://www.ipcc.ch/reports/" }
    ],
    framing: {
      left: "No clear left-bucket coverage is identified in this demo cluster.",
      centre: "Coverage focuses on budgets, infrastructure needs, and what governments have formally proposed.",
      right: "No clear right-bucket coverage is identified in this demo cluster."
    },
    articles: [
      { source: "CBC News", domain: "cbc.ca", bias: "Centre", factuality: "High", credibility: 82, title: "Cities seek more funding for flood and heat adaptation", url: "https://www.cbc.ca/news/climate" },
      { source: "ABC News Australia", domain: "abc.net.au", bias: "Centre", factuality: "High", credibility: 83, title: "Local governments ask for clearer climate resilience funding", url: "https://www.abc.net.au/news/environment" },
      { source: "Reuters", domain: "reuters.com", bias: "Centre", factuality: "Very high", credibility: 92, title: "Western governments review climate resilience budgets", url: "https://www.reuters.com/sustainability/" }
    ],
    claims: [
      { text: "Local governments are requesting more predictable climate adaptation funding.", claimant: "Multiple outlets", status: "Supported by cited coverage", confidence: 75, links: ["https://www.cbc.ca/news/climate"] },
      { text: "The exact fiscal gap varies by region and is not established by these articles alone.", claimant: "Real News synthesis", status: "Insufficient evidence", confidence: 44, links: ["https://www.abc.net.au/news/environment"] }
    ],
    scoring: [
      { label: "Source reliability average", weight: 25, points: 21, note: "Known sources have high credibility ratings." },
      { label: "Cross-spectrum corroboration", weight: 20, points: 9, note: "Coverage is clustered in the centre bucket." },
      { label: "Primary-source availability", weight: 20, points: 15, note: "Relevant primary climate reports are available." },
      { label: "Fact-check and claim-review support", weight: 15, points: 5, note: "No specific claim-review link is attached yet." },
      { label: "Transparency signals", weight: 10, points: 9, note: "Source and summary metadata is clear." },
      { label: "Correction and factuality history", weight: 10, points: 9, note: "Factuality history is high across listed sources." }
    ],
    limitations: ["Perspective spread is limited in this demo cluster.", "Regional funding numbers need primary budget documents."]
  },
  {
    slug: "migration-enforcement-policy-scrutiny",
    category: "Politics",
    title: "Migration enforcement plan draws legal and cost scrutiny",
    summary: "A migration enforcement proposal is drawing debate over border capacity, legal safeguards, costs, and practical delivery.",
    read: "The cleanest reading is that officials want faster enforcement, but legal safeguards, delivery capacity and real-world cost remain the main open questions.",
    confidence: 66,
    trend: 78,
    coverage: { left: 1, centre: 2, right: 0, unknown: 0 },
    primaryEvidence: true,
    primarySources: [
      { label: "UK Home Office policy papers", url: "https://www.gov.uk/government/organisations/home-office" }
    ],
    framing: {
      left: "Coverage emphasises legal safeguards, asylum protections, and the effect on vulnerable people.",
      centre: "Coverage separates confirmed policy details from criticism and unresolved implementation questions.",
      right: "No clear right-bucket coverage is identified in this demo cluster."
    },
    articles: [
      { source: "Sky News", domain: "news.sky.com", bias: "Centre", factuality: "High", credibility: 80, title: "Government faces scrutiny over new migration enforcement plan", url: "https://news.sky.com/topic/immigration-5993" },
      { source: "BBC News", domain: "bbc.co.uk", bias: "Centre", factuality: "High", credibility: 86, title: "Migration policy debate centres on costs, courts and border capacity", url: "https://www.bbc.co.uk/news/politics" },
      { source: "The Guardian", domain: "theguardian.com", bias: "Lean Left", factuality: "High", credibility: 80, title: "Rights groups challenge migration enforcement proposals", url: "https://www.theguardian.com/uk/immigration" }
    ],
    claims: [
      { text: "Officials say the proposal is intended to speed up migration enforcement.", claimant: "Government officials", status: "Supported by cited coverage", confidence: 70, links: ["https://www.gov.uk/government/organisations/home-office"] },
      { text: "The legality and practical effect of the proposal remain contested.", claimant: "Multiple outlets", status: "Disputed", confidence: 52, links: ["https://www.bbc.co.uk/news/politics"] }
    ],
    scoring: [
      { label: "Source reliability average", weight: 25, points: 20, note: "Known sources have mostly high ratings." },
      { label: "Cross-spectrum corroboration", weight: 20, points: 12, note: "Left and centre buckets are represented; right-bucket coverage is missing." },
      { label: "Primary-source availability", weight: 20, points: 15, note: "Relevant government policy pages are available." },
      { label: "Fact-check and claim-review support", weight: 15, points: 5, note: "No independent claim-review link is attached yet." },
      { label: "Transparency signals", weight: 10, points: 7, note: "Article metadata is available." },
      { label: "Correction and factuality history", weight: 10, points: 7, note: "Known factuality ratings are high." }
    ],
    limitations: ["Right-bucket coverage is not represented in this demo cluster.", "Legal outcomes may depend on court or policy documents not included here."]
  }
];
