import type { Source } from "@/lib/types";
import { normalizeDomain } from "@/lib/utils";

const timestamp = "2026-04-25T00:00:00.000Z";

export const seedSourceRatings: Source[] = [
  {
    id: "seed-reuters",
    name: "Reuters",
    domain: "reuters.com",
    country: "GB",
    bias_rating: "center",
    factuality_rating: "very_high",
    credibility_score: 92,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.reuters.com/",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-associated-press",
    name: "Associated Press",
    domain: "apnews.com",
    country: "US",
    bias_rating: "center",
    factuality_rating: "very_high",
    credibility_score: 91,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://apnews.com/",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-bbc",
    name: "BBC News",
    domain: "bbc.co.uk",
    country: "GB",
    bias_rating: "center",
    factuality_rating: "high",
    credibility_score: 86,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.bbc.co.uk/news",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-guardian",
    name: "The Guardian",
    domain: "theguardian.com",
    country: "GB",
    bias_rating: "lean_left",
    factuality_rating: "high",
    credibility_score: 80,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.theguardian.com/",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-nyt",
    name: "The New York Times",
    domain: "nytimes.com",
    country: "US",
    bias_rating: "lean_left",
    factuality_rating: "high",
    credibility_score: 84,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.nytimes.com/",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-wsj",
    name: "The Wall Street Journal",
    domain: "wsj.com",
    country: "US",
    bias_rating: "lean_right",
    factuality_rating: "high",
    credibility_score: 84,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.wsj.com/",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-fox",
    name: "Fox News",
    domain: "foxnews.com",
    country: "US",
    bias_rating: "right",
    factuality_rating: "mixed",
    credibility_score: 58,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.foxnews.com/",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-cbc",
    name: "CBC News",
    domain: "cbc.ca",
    country: "CA",
    bias_rating: "center",
    factuality_rating: "high",
    credibility_score: 82,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.cbc.ca/news",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-sky",
    name: "Sky News",
    domain: "news.sky.com",
    country: "GB",
    bias_rating: "center",
    factuality_rating: "high",
    credibility_score: 80,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://news.sky.com/",
    created_at: timestamp,
    updated_at: timestamp
  },
  {
    id: "seed-abc-au",
    name: "ABC News Australia",
    domain: "abc.net.au",
    country: "AU",
    bias_rating: "center",
    factuality_rating: "high",
    credibility_score: 83,
    rating_provider: "MVP seed rating - replace with licensed provider",
    rating_url: "https://www.abc.net.au/news",
    created_at: timestamp,
    updated_at: timestamp
  }
];

export function findSeedSourceRating(domainOrUrl: string) {
  const domain = normalizeDomain(domainOrUrl);

  return seedSourceRatings.find((source) => {
    const sourceDomain = normalizeDomain(source.domain);
    return domain === sourceDomain || domain.endsWith(`.${sourceDomain}`);
  });
}

export function createUnknownSource(name: string, domainOrUrl: string): Source {
  const domain = normalizeDomain(domainOrUrl);

  return {
    id: `unknown-${domain.replace(/[^a-z0-9]+/g, "-")}`,
    name: name || domain,
    domain,
    country: null,
    bias_rating: "unknown",
    factuality_rating: "unknown",
    credibility_score: null,
    rating_provider: null,
    rating_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
