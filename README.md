# Real News

Real News is a static GitHub Pages MVP for a non-partisan news credibility and context website.

It does not claim to know absolute truth. It shows evidence confidence based on visible signals such as source credibility, coverage balance, primary-source links, claim status, and missing context.

## Live Site

```text
https://fr-moonshot.github.io/realnews/
```

## Files

- `index.html` - homepage with the top 5 story clusters
- `story.html` - reusable story breakdown page
- `data.js` - static demo story data
- `site.js` - homepage rendering
- `story.js` - detail-page rendering
- `styles.css` - responsive visual design
- `.nojekyll` - tells GitHub Pages to serve the files directly

## What This Static MVP Includes

- 5 story cluster cards
- Evidence confidence percentages
- Coverage split: Left / Centre / Right / Unknown
- Top source links
- Primary evidence indicators
- Story breakdown pages
- Framing comparison
- Claims table
- Source credibility table
- Scoring explanation
- Known limitations and missing-context notes

## Limitations

This is a static website, so it does not yet run live ingestion, Supabase persistence, API routes, scheduled jobs, or AI summarisation. The story dataset is demo content in `data.js`.

The next production step would be to connect a server-side ingestion pipeline and publish generated static data to GitHub Pages, or deploy the server-backed version to a Next-compatible host.
