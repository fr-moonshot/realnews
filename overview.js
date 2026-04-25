(function () {
  const stories = window.REALNEWS_STORIES || [];
  const list = document.querySelector("#scoreboard-list");

  if (!list) return;

  if (stories.length === 0) {
    list.innerHTML = `
      <section class="empty-state">
        <h2>No stories yet</h2>
        <p>The static story file did not load.</p>
      </section>
    `;
    return;
  }

  const ranked = [...stories]
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 20);

  list.innerHTML = ranked.map(renderScoreRow).join("");
  wireEvidenceToggles(document);
})();

function renderScoreRow(story, index) {
  const topSource = [...story.articles].sort((left, right) => right.credibility - left.credibility)[0];
  const band = confidenceBand(story.confidence);

  return `
    <article class="score-row ${band.className}">
      <div class="score-rank">${index + 1}</div>
      <div class="score-story">
        <div class="story-meta">
          <span>${escapeHtml(story.category)}</span>
          <span>${story.articles.length} sources</span>
        </div>
        <h2><a href="./story.html?slug=${encodeURIComponent(story.slug)}">${escapeHtml(story.title)}</a></h2>
        <p>${escapeHtml(story.read || story.summary)}</p>
      </div>
      <div class="score-confidence">
        <strong>${story.confidence}%</strong>
        <span>${band.label}</span>
      </div>
      <div class="score-source">
        <a href="${escapeAttribute(topSource.url)}" target="_blank" rel="noreferrer">
          <strong>${escapeHtml(topSource.source)}</strong>
          <span>${topSource.credibility}/100</span>
        </a>
        <button class="icon-button evidence-toggle" type="button" aria-expanded="false" aria-controls="overview-evidence-${escapeAttribute(story.slug)}">
          ${sliderIcon()}
          <span>Why?</span>
        </button>
      </div>
      <div id="overview-evidence-${escapeAttribute(story.slug)}" class="evidence-drawer overview-evidence" hidden>
        <div class="evidence-grid">
          <section>
            <h2>Confidence recipe</h2>
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
            <h2>Best sources</h2>
            <ul>
              ${[...story.articles].sort((left, right) => right.credibility - left.credibility).slice(0, 4).map((article) => `
                <li>
                  <span>${escapeHtml(article.source)}</span>
                  <strong>${article.credibility}</strong>
                </li>
              `).join("")}
            </ul>
          </section>
          <section>
            <h2>Needs caution</h2>
            <ul>
              ${story.limitations.map((item) => `<li><span>${escapeHtml(item)}</span></li>`).join("")}
            </ul>
          </section>
        </div>
      </div>
    </article>
  `;
}

function confidenceBand(value) {
  if (value >= 75) {
    return { className: "score-high", label: "Strong" };
  }

  if (value >= 60) {
    return { className: "score-medium", label: "Caution" };
  }

  return { className: "score-low", label: "Limited" };
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
    });
  });
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
