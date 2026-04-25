(function () {
  const stories = window.REALNEWS_STORIES || [];
  const list = document.querySelector("#story-list");

  if (!list) return;

  if (stories.length === 0) {
    list.innerHTML = `
      <section class="empty-state">
        <h3>No story clusters yet</h3>
        <p class="muted">The static dataset did not load.</p>
      </section>
    `;
    return;
  }

  list.innerHTML = stories.slice(0, 5).map(renderStoryCard).join("");
})();

function renderStoryCard(story) {
  const totalArticles = story.articles.length;
  const sourceLinks = story.articles.slice(0, 3).map((article) => `
    <li>
      <a href="${escapeAttribute(article.url)}" target="_blank" rel="noreferrer">
        ${escapeHtml(article.source)} · ${escapeHtml(article.title)}
      </a>
    </li>
  `).join("");

  return `
    <article class="card">
      <div class="card-grid">
        <div>
          <div class="badge-row">
            <span class="badge">${escapeHtml(story.category)}</span>
            <span class="badge evidence">${story.primaryEvidence ? "Primary evidence found" : "Primary evidence missing"}</span>
            ${totalArticles < 2 ? '<span class="badge caution">Low coverage</span>' : ""}
          </div>
          <h3>${escapeHtml(story.title)}</h3>
          <p class="summary">${escapeHtml(story.summary)}</p>
          <ul class="source-list">${sourceLinks}</ul>
        </div>

        <div class="metric-box">
          <div class="metric-row">
            <span>Evidence confidence</span>
            <strong>${story.confidence}%</strong>
          </div>
          <div class="meter" aria-hidden="true"><span style="width: ${story.confidence}%"></span></div>
          ${renderCoverage(story.coverage)}
          <p class="card-meta">${totalArticles} article${totalArticles === 1 ? "" : "s"} found</p>
          <a class="button primary" href="./story.html?slug=${encodeURIComponent(story.slug)}">View breakdown</a>
        </div>
      </div>
    </article>
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
