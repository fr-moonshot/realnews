# Real News

Real News is a non-partisan news credibility and context layer. It does not try to declare absolute truth. It compares coverage across sources and shows an evidence confidence breakdown based on available signals.

## MVP Features

- Next.js App Router with TypeScript and Tailwind CSS.
- Homepage with 5 story cluster cards.
- Story detail pages with:
  - neutral summary
  - left / centre / right framing comparison
  - evidence confidence module
  - coverage balance
  - claims table
  - source credibility table
  - source and evidence links
- Server-side ingestion route at `/api/admin/ingest`.
- Protected development page at `/admin/ingest`.
- Supabase/Postgres schema in `supabase/migrations/001_initial_schema.sql`.
- Mock data fallback when API keys or Supabase are not configured.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

This app needs a Node/Next runtime for API routes. GitHub Pages can host static files, but it cannot run the ingestion API route. Deploy to Vercel, Netlify, Render, Fly, or another platform that supports Next.js server routes.

## Environment Variables

```bash
GNEWS_API_KEY=
GDELT_ENABLED=false
GOOGLE_FACT_CHECK_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_INGEST_SECRET=change-me
```

Only `NEXT_PUBLIC_*` values are safe to expose to the browser. `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_INGEST_SECRET`, news API keys, fact-check keys, and OpenAI keys are used server-side only.

## Database

Run the migration in Supabase:

```sql
-- supabase/migrations/001_initial_schema.sql
```

The schema creates:

- `sources`
- `articles`
- `story_clusters`
- `story_articles`
- `claims`

It also defines enums for source bias, factuality ratings, claim type, and evidence status.

## Ingestion

Manual trigger:

```bash
curl -X POST http://localhost:3000/api/admin/ingest \
  -H "x-admin-ingest-secret: $ADMIN_INGEST_SECRET"
```

The ingestion job:

1. Pulls top GNews headlines for GB, US, CA, AU, NZ, and IE when `GNEWS_API_KEY` exists.
2. Fetches up to 100 raw article records.
3. Normalizes article metadata and snippets.
4. Groups related articles into story clusters.
5. Uses OpenAI embeddings for title clustering when `OPENAI_API_KEY` exists.
6. Falls back to token overlap / Jaccard similarity when embeddings are unavailable.
7. Fetches claim-review links when `GOOGLE_FACT_CHECK_API_KEY` exists.
8. Computes trend and evidence confidence scores.
9. Persists to Supabase when service credentials are configured.
10. Falls back to mock data if API keys are missing or live ingestion returns no articles.

`GDELT_ENABLED` is reserved for a later ingestion provider. The MVP currently warns if it is enabled.

## Scoring Formula

Evidence confidence is a 0-100 estimate, not a truth score.

| Component | Weight |
| --- | ---: |
| Source reliability average | 25% |
| Cross-spectrum corroboration | 20% |
| Primary-source availability | 20% |
| Fact-check / claim-review support | 15% |
| Transparency signals | 10% |
| Correction / factuality history | 10% |

Unknown source ratings reduce confidence. Missing primary-source links and missing claim-review links are shown as limitations instead of being guessed.

## Source Ratings

The app includes a small MVP seed ratings file for common sources so the UI can demonstrate the model. These are placeholders and should be replaced with a licensed or internally reviewed ratings provider before production use.

When no rating exists, the source is shown as `Unknown` and scored conservatively.

## Guardrails

- No story is labelled true or false unless backed by cited fact-check data.
- The UI says evidence confidence, not truth score.
- Source links and evidence links are always visible.
- AI summaries are labelled when OpenAI is used.
- Missing evidence is shown as missing context or insufficient evidence.
- The app stores article metadata, snippets, links, and API-provided content only.

## Not Included Yet

- Authentication
- Comments
- User accounts
- Browser extension
- Full article scraping
