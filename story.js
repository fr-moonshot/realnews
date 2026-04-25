(function () {
  const stories = window.REALNEWS_STORIES || [];
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const story = stories.find((item) => item.slug === slug) || stories[0];
  const root = document.querySelector("#story-root");

  if (!root) return;

  if (!story) {
    root.innerHTML = `
      <section class="empty-state">
        <h1>Story not found</h1>
        <p class="muted">The static story dataset did not load.</p>
        <a class="button primary" href="./index.html">Back to stories</a>
      </section>
    `;
    return;
  }

  document.title = `${story.title} | Real News`;
  root.innerHTML = renderStory(story);
})();

function renderStory(story) {
  return `
    <section class="story-layout">
      <div>
        <div class="badge-row">
          <span class="badge">${escapeHtml(story.category)}</span>
          <span class="badge evidence">${story.articles.length} articles found</span>
          <span class="badge">Demo summary</span>
        </div>
        <h1 class="story-title">${escapeHtml(story.title)}</h1>
        <p class="hero-text">${escapeHtml(story.summary)}</p>
      </div>
      <aside class="card">
        <div class="metric-row">
          <span>Evidence confidence</span>
          <strong>${story.confidence}%</strong>
        </div>
        <div class="meter" aria-hidden="true"><span style="width: ${story.confidence}%"></span></div>
        ${renderCoverage(story.coverage)}
      </aside>
    </section>

    <section class="panel-grid">
      <article class="card">
        <h3>What the left is saying</h3>
        <p class="summary">${escapeHtml(story.framing.left)}</p>
      </article>
      <article class="card">
        <h3>What the centre is saying</h3>
        <p class="summary">${escapeHtml(story.framing.centre)}</p>
      </article>
      <article class="card">
        <h3>What the right is saying</h3>
        <p class="summary">${escapeHtml(story.framing.right)}</p>
      </article>
    </section>

    <section class="stack section-reset">
      <article class="card">
        <div class="table-title">
          <h3>Claims table</h3>
          <span class="muted">Evidence status, not truth labels</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Claim</th>
                <th>Claimant</th>
                <th>Evidence status</th>
                <th>Confidence</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody>
              ${story.claims.map(renderClaim).join("")}
            </tbody>
          </table>
        </div>
      </article>

      <article class="card">
        <h3>Source credibility</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Bias rating</th>
                <th>Factuality</th>
                <th>Credibility</th>
              </tr>
            </thead>
            <tbody>
              ${story.articles.map(renderSource).join("")}
            </tbody>
          </table>
        </div>
      </article>

      <article class="card">
        <h3>Scoring explanation</h3>
        <div class="score-list">
          ${story.scoring.map(renderScore).join("")}
        </div>
        ${story.limitations.length ? `
          <div class="empty-state" style="margin-top: 1rem; box-shadow: none;">
            <strong>Known limitations</strong>
            <ul>
              ${story.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
      </article>

      <article class="card">
        <h3>Evidence and source links</h3>
        <div class="link-grid">
          ${story.primarySources.map((link) => renderLink(link, "Primary evidence")).join("")}
          ${story.articles.map((article) => renderLink({ label: `${article.source}: ${article.title}`, url: article.url }, "Article")).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderClaim(claim) {
  return `
    <tr>
      <td>${escapeHtml(claim.text)}</td>
      <td>${escapeHtml(claim.claimant)}</td>
      <td>${escapeHtml(claim.status)}</td>
      <td>${claim.confidence}%</td>
      <td>${claim.links.map((url) => `<a class="text-link" href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">Link</a>`).join(" · ")}</td>
    </tr>
  `;
}

function renderSource(article) {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(article.source)}</strong><br>
        <span class="muted">${escapeHtml(article.domain)}</span>
      </td>
      <td>${escapeHtml(article.bias)}</td>
      <td>${escapeHtml(article.factuality)}</td>
      <td>${article.credibility}/100</td>
    </tr>
  `;
}

function renderScore(score) {
  const percent = Math.round((score.points / score.weight) * 100);

  return `
    <div class="score-item">
      <div class="score-head">
        <strong>${escapeHtml(score.label)}</strong>
        <span>${score.points}/${score.weight}</span>
      </div>
      <div class="meter" aria-hidden="true"><span style="width: ${percent}%"></span></div>
      <p class="summary">${escapeHtml(score.note)}</p>
    </div>
  `;
}

function renderLink(link, type) {
  return `
    <a class="link-card" href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">
      <span class="badge ${type === "Primary evidence" ? "evidence" : ""}">${type}</span>
      <p>${escapeHtml(link.label)}</p>
    </a>
  `;
}

function renderCoverage(coverage) {
  const total = Math.max(1, coverage.left + coverage.centre + coverage.right + coverage.unknown);
  const width = (value) => `${(value / total) * 100}%`;

  return `
    <div>
      <div class="coverage-bar" aria-label="Coverage split">
        ${coverage.left ? `<span class="coverage-left" style="width: ${width(coverage.left)}"></span>` : ""}
        ${coverage.centre ? `<span class="coverage-centre" style="width: ${width(coverage.centre)}"></span>` : ""}
        ${coverage.right ? `<span class="coverage-right" style="width: ${width(coverage.right)}"></span>` : ""}
        ${coverage.unknown ? `<span class="coverage-unknown" style="width: ${width(coverage.unknown)}"></span>` : ""}
      </div>
      <div class="coverage-legend">
        <span><i class="dot coverage-left"></i>Left ${coverage.left}</span>
        <span><i class="dot coverage-centre"></i>Centre ${coverage.centre}</span>
        <span><i class="dot coverage-right"></i>Right ${coverage.right}</span>
        <span><i class="dot coverage-unknown"></i>Unknown ${coverage.unknown}</span>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
