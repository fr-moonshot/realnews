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

  list.innerHTML = ranked.map(renderChartRow).join("");
})();

function renderChartRow(story, index) {
  const uncertainty = Math.max(0, 100 - story.confidence);
  const attention = story.trend || story.confidence;
  const sourceNames = story.articles.map((article) => shortSourceName(article.source)).join(", ");
  const categoryClass = `category-${story.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return `
    <article class="chart-row">
      <div class="chart-story">
        <span class="chart-index">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <span class="category-pill ${categoryClass}">${escapeHtml(story.category)}</span>
          <h2><a href="./story.html?slug=${encodeURIComponent(story.slug)}">${escapeHtml(story.title)}</a></h2>
          <p>${escapeHtml(sourceNames)}</p>
        </div>
      </div>

      <div class="coverage-chips" aria-label="Coverage split">
        <span class="chip-left">L ${story.coverage.left}</span>
        <span class="chip-centre">C ${story.coverage.centre}</span>
        <span class="chip-right">R ${story.coverage.right}</span>
      </div>

      <div class="bar-zone" aria-label="Confidence and uncertainty">
        <div class="axis-line" aria-hidden="true"></div>
        <div class="uncertainty-track">
          <span class="uncertainty-label">${uncertainty}%</span>
          <span class="uncertainty-bar" style="width: ${uncertainty}%"></span>
        </div>
        <div class="confidence-track">
          <span class="confidence-bar" style="width: ${story.confidence}%"></span>
          <span class="confidence-label">${story.confidence}%</span>
        </div>
      </div>

      <div class="attention-ring" style="--attention: ${attention}">
        <strong>${attention}</strong>
        <span>/100</span>
      </div>
    </article>
  `;
}

function shortSourceName(source) {
  return source
    .replace("Associated Press", "AP")
    .replace("The Guardian", "Guardian")
    .replace("The New York Times", "NYT")
    .replace("The Wall Street Journal", "WSJ")
    .replace("BBC News", "BBC")
    .replace("ABC News Australia", "ABC AU");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
