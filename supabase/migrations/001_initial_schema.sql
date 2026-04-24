create extension if not exists pgcrypto;

do $$ begin
  create type source_bias_rating as enum ('left', 'lean_left', 'center', 'lean_right', 'right', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type source_factuality_rating as enum ('very_high', 'high', 'mostly_factual', 'mixed', 'low', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type claim_type as enum ('factual', 'opinion', 'prediction', 'allegation', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type evidence_status as enum ('supported', 'disputed', 'unclear', 'insufficient_evidence');
exception
  when duplicate_object then null;
end $$;

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null unique,
  country text,
  bias_rating source_bias_rating not null default 'unknown',
  factuality_rating source_factuality_rating not null default 'unknown',
  credibility_score numeric check (credibility_score is null or (credibility_score >= 0 and credibility_score <= 100)),
  rating_provider text,
  rating_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete restrict,
  title text not null,
  url text not null unique,
  image_url text,
  published_at timestamptz,
  author text,
  description text,
  content_snippet text,
  country text,
  language text,
  fetched_from text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists story_clusters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  neutral_summary text not null,
  slug text not null unique,
  category text not null default 'General',
  trend_score numeric not null default 0,
  evidence_confidence_score numeric not null default 0 check (evidence_confidence_score >= 0 and evidence_confidence_score <= 100),
  coverage_left_count integer not null default 0,
  coverage_center_count integer not null default 0,
  coverage_right_count integer not null default 0,
  coverage_unknown_count integer not null default 0,
  primary_sources jsonb not null default '[]'::jsonb,
  left_framing text,
  center_framing text,
  right_framing text,
  low_coverage boolean not null default false,
  summary_generation_method text not null default 'algorithmic' check (summary_generation_method in ('mock', 'algorithmic', 'ai')),
  score_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists story_articles (
  story_cluster_id uuid not null references story_clusters(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  primary key (story_cluster_id, article_id)
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  story_cluster_id uuid not null references story_clusters(id) on delete cascade,
  claim_text text not null,
  claimant text,
  claim_type claim_type not null default 'unknown',
  evidence_status evidence_status not null default 'insufficient_evidence',
  confidence_score numeric check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 100)),
  supporting_urls jsonb not null default '[]'::jsonb,
  fact_check_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on articles (published_at desc);
create index if not exists articles_source_id_idx on articles (source_id);
create index if not exists story_clusters_trend_score_idx on story_clusters (trend_score desc);
create index if not exists story_clusters_slug_idx on story_clusters (slug);
create index if not exists claims_story_cluster_id_idx on claims (story_cluster_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_sources_updated_at on sources;
create trigger set_sources_updated_at
before update on sources
for each row execute function set_updated_at();

drop trigger if exists set_story_clusters_updated_at on story_clusters;
create trigger set_story_clusters_updated_at
before update on story_clusters
for each row execute function set_updated_at();
