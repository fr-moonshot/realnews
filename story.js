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
        <p>The static story file did not load.</p>
        <a class="button primary" href="./index.html">Back to stories</a>
      </section>
    `;
    return;
  }

  document.title = `${story.title} | Real News`;
  root.innerHTML = renderStory(story);
  wireEvidenceToggles(document);
})();

function renderStory(story) {
  const rankedSources = sortSources(story.articles);

  return `
    <article class="article-shell">
      <header class="article-hero">
        <div>
          <div class="story-meta">
            <span>${escapeHtml(story.category)}</span>
            <span>${story.articles.length} sources compared</span>
          </div>
          <h1>${escapeHtml(story.title)}</h1>
          <p class="article-dek">${escapeHtml(story.read || story.summary)}</p>
        </div>
        <aside class="confidence-card">
          <span>Confidence</span>
          <strong>${story.confidence}%</strong>
          <div class="meter" aria-hidden="true"><span style="width: ${story.confidence}%"></span></div>
          <p>${confidenceLabel(story.confidence)}</p>
        </aside>
      </header>

      <section class="article-body">
        <div class="article-copy">
          <p class="drop">
            ${escapeHtml(story.summary)}
          </p>
          <p>
            This briefing compares the strongest available reporting and highlights the version of events that is best supported right now. It does not claim final certainty. Where the evidence is thin, contested, or incomplete, that uncertainty stays visible.
          </p>
          <h2>What appears most supported</h2>
          <ul class="plain-list">
            ${story.claims.map((claim) => `
              <li>
                <strong>${escapeHtml(claim.status)}:</strong>
                ${escapeHtml(claim.text)}
              </li>
            `).join("")}
          </ul>
          <h2>What still needs caution</h2>
          <ul class="plain-list">
            ${story.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <button class="icon-button evidence-toggle" type="button" aria-expanded="false" aria-controls="story-evidence">
            ${sliderIcon()}
            <span>Show evidence detail</span>
          </button>
        </div>

        <aside class="article-sidebar">
          <section class="side-box">
            <h2>Sources, ranked</h2>
            <ol class="source-ranking">
              ${rankedSources.map((article) => `
                <li>
                  <a href="${escapeAttribute(article.url)}" target="_blank" rel="noreferrer">
                    <strong>${escapeHtml(article.source)}</strong>
                    <span>${article.credibility}/100 · ${escapeHtml(article.factuality)}</span>
                  </a>
                </li>
              `).join("")}
            </ol>
          </section>
          <section class="side-box">
            <h2>Primary evidence</h2>
            <div class="link-stack">
              ${story.primarySources.map((link) => `
                <a href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>
              `).join("")}
            </div>
          </section>
        </aside>
      </section>

      <section id="story-evidence" class="evidence-drawer article-evidence" hidden>
        <div class="evidence-grid">
          <section>
            <h2>Scoring detail</h2>
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
            <h2>Coverage spread</h2>
            ${renderCoverage(story.coverage)}
          </section>
          <section>
            <h2>How each side frames it</h2>
            <p><strong>Left:</strong> ${escapeHtml(story.framing.left)}</p>
            <p><strong>Centre:</strong> ${escapeHtml(story.framing.centre)}</p>
            <p><strong>Right:</strong> ${escapeHtml(story.framing.right)}</p>
          </section>
        </div>
      </section>
    </article>
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
      button.setAttribute("aria-expanded", String(!isOpen));
      button.querySelector("span").textContent = isOpen ? "Show evidence detail" : "Hide evidence detail";
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
