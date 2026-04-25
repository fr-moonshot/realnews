(function () {
  const stories = window.REALNEWS_STORIES || [];
  const lead = document.querySelector("#lead-story");
  const list = document.querySelector("#story-list");

  if (!lead || !list) return;

  if (stories.length === 0) {
    const empty = `
      <section class="empty-state">
        <h2>No stories yet</h2>
        <p>The static story file did not load.</p>
      </section>
    `;
    lead.innerHTML = empty;
    list.innerHTML = empty;
    return;
  }

  const ranked = [...stories].sort((left, right) => right.confidence - left.confidence);
  lead.innerHTML = renderLeadStory(ranked[0]);
  list.innerHTML = ranked.slice(1).map(renderStoryCard).join("");
  wireEvidenceToggles(document);
})();

function renderLeadStory(story) {
  const topSources = sortSources(story.articles).slice(0, 3);

  return `
    <article class="lead-card">
      <div class="lead-copy">
        <div class="story-meta">
          <span>${escapeHtml(story.category)}</span>
          <span>${story.articles.length} sources compared</span>
        </div>
        <h2>${escapeHtml(story.title)}</h2>
        <p class="best-read">${escapeHtml(story.read || story.summary)}</p>
        <div class="lead-actions">
          <a class="button primary" href="./story.html?slug=${encodeURIComponent(story.slug)}">Read the briefing</a>
          <button class="icon-button evidence-toggle" type="button" aria-expanded="false" aria-controls="lead-evidence-${escapeAttribute(story.slug)}">
            ${sliderIcon()}
            <span>Evidence</span>
          </button>
        </div>
      </div>
      <aside class="confidence-card" aria-label="Story confidence">
        <span>Confidence</span>
        <strong>${story.confidence}%</strong>
        <div class="meter" aria-hidden="true"><span style="width: ${story.confidence}%"></span></div>
        <p>${confidenceLabel(story.confidence)}</p>
      </aside>
      <div class="source-rank">
        <span class="rank-label">Most reliable sources in this cluster</span>
        ${topSources.map(renderSourceRank).join("")}
      </div>
      ${renderEvidenceDrawer(story, `lead-evidence-${story.slug}`)}
    </article>
  `;
}

function renderStoryCard(story) {
  const sources = sortSources(story.articles);

  return `
    <article class="news-card">
      <div class="news-card-main">
        <div class="story-meta">
          <span>${escapeHtml(story.category)}</span>
          <span>${story.articles.length} sources</span>
        </div>
        <h3><a href="./story.html?slug=${encodeURIComponent(story.slug)}">${escapeHtml(story.title)}</a></h3>
        <p>${escapeHtml(story.read || story.summary)}</p>
      </div>
      <div class="news-card-side">
        <div class="confidence-pill">
          <strong>${story.confidence}%</strong>
          <span>confidence</span>
        </div>
        <ol class="compact-source-list" aria-label="Sources ranked from most reliable to least">
          ${sources.slice(0, 3).map((article) => `
            <li>
              <a href="${escapeAttribute(article.url)}" target="_blank" rel="noreferrer">
                ${escapeHtml(article.source)}
              </a>
              <span>${article.credibility}/100</span>
            </li>
          `).join("")}
        </ol>
        <div class="card-actions">
          <a class="text-link" href="./story.html?slug=${encodeURIComponent(story.slug)}">Open story</a>
          <button class="icon-button evidence-toggle" type="button" aria-expanded="false" aria-controls="card-evidence-${escapeAttribute(story.slug)}">
            ${sliderIcon()}
            <span>Evidence</span>
          </button>
        </div>
      </div>
      ${renderEvidenceDrawer(story, `card-evidence-${story.slug}`)}
    </article>
  `;
}

function renderEvidenceDrawer(story, id) {
  return `
    <div id="${escapeAttribute(id)}" class="evidence-drawer" hidden>
      <div class="evidence-grid">
        <section>
          <h4>Why this confidence?</h4>
          <ul>
            ${story.scoring.map((item) => `
              <li>
                <span>${escapeHtml(item.label)}</span>
                <strong>${item.points}/${item.weight}</strong>
              </li>
            `).join("")}
          </ul>
        </section>
        <section>
          <h4>Coverage spread</h4>
          ${renderCoverage(story.coverage)}
        </section>
        <section>
          <h4>Still unclear</h4>
          <ul>
            ${story.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
      </div>
    </div>
  `;
}

function renderSourceRank(article, index) {
  return `
    <a class="rank-row" href="${escapeAttribute(article.url)}" target="_blank" rel="noreferrer">
      <span>${index + 1}</span>
      <strong>${escapeHtml(article.source)}</strong>
      <small>${article.credibility}/100</small>
    </a>
  `;
}

function sortSources(articles) {
  return [...articles].sort((left, right) => right.credibility - left.credibility);
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
      <p class="coverage-caption">Left ${coverage.left} · Centre ${coverage.centre} · Right ${coverage.right} · Unknown ${coverage.unknown}</p>
    </div>
  `;
}

function wireEvidenceToggles(root) {
  root.querySelectorAll(".evidence-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("aria-controls");
      const drawer = targetId ? document.getElementById(targetId) : null;

      if (!drawer) return;

      const isOpen = button.getAttribute("aria-expanded") === "true";
      drawer.hidden = isOpen;
      root.querySelectorAll(`[aria-controls="${targetId}"]`).forEach((matchingButton) => {
        matchingButton.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  });
}

function confidenceLabel(value) {
  if (value >= 75) return "Strong support from available reporting.";
  if (value >= 60) return "Reasonable support, with open questions.";
  return "Useful but incomplete evidence.";
}

function sliderIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h10"></path>
      <path d="M18 7h2"></path>
      <path d="M4 17h2"></path>
      <path d="M10 17h10"></path>
      <circle cx="16" cy="7" r="2"></circle>
      <circle cx="8" cy="17" r="2"></circle>
    </svg>
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
