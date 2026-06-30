// =====================================================
// SIGO UI FRAMEWORK
// SIGO V1.0
// =====================================================


// =====================================================
// API PÚBLICA
// =====================================================

const SIGOUI = {

  createHeader,

  createHeroCard,

  createModule,

  createBadge,

  createButton,

  createSection,

  createGrid,

  createStatus,

  createBottomNav,

  createScreen,

  render

};


// =====================================================
// CORE
// =====================================================

function render(container, html) {

  const el = document.querySelector(container);

  if (!el) return;

  el.innerHTML = html;

}


// =====================================================
// SCREEN
// =====================================================

function createScreen(config) {

  return `

    ${config.header || ""}

    <main class="home-premium">

      ${config.content || ""}

    </main>

    ${config.bottom || ""}

  `;

}


// =====================================================
// SECTION
// =====================================================

function createSection(title, subtitle, body) {

  return `

    <section class="sigo-card">

      <div class="section-header">

        <div>

          <h2>${title}</h2>

          <span>${subtitle}</span>

        </div>

      </div>

      ${body}

    </section>

  `;

}


// =====================================================
// GRID
// =====================================================

function createGrid(content) {

  return `

    <div class="sigo-grid">

      ${content}

    </div>

  `;

}


// =====================================================
// COMPONENTES (virão depois)
// =====================================================

function createHeader() {

}

function createHeroCard() {

}

function createModule() {

}

function createBadge(texto, tipo) {
  if (!texto) return "";

  return `
    <span class="sigo-badge ${tipo || ""}">
      ${texto}
    </span>
  `;
}

function createButton() {

}

function createStatus() {

}

function createBottomNav() {

}
