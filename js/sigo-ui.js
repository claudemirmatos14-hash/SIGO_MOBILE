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
  return `
    <header class="sigo-header">
      <div class="sigo-header-content">
        <div>
          <h1>SIGO</h1>
          <p>Sistema Integrado de Gestão de Obras</p>
        </div>

        <div class="sigo-header-actions">
          <button type="button" class="icon-button">🔔</button>
          <span class="status-online">● Online</span>
        </div>
      </div>
    </header>
  `;
}

function createHeroCard(config = {}) {

  return `

    <section class="sigo-card sigo-card--hero">

      <div class="section-title">

        <span>🏗</span>

        <h2>${config.titulo || "OBRA ATIVA"}</h2>

      </div>

      <select id="obraAtiva">

        <option>

          ${config.select || "Carregando obras..."}

        </option>

      </select>

      <div class="obra-content">

        <div>

          <h3 id="nomeObra">

            ${config.nome || "Selecione uma obra"}

          </h3>

          <div class="obra-meta">

            <small id="contadorObrasOffline">

              ${config.offline || "0 de 0 obras offline"}

            </small>

            <small id="contadorAtividadesOffline">

              ${config.atividades || "0 atividades"}

            </small>

            <small>

              ${config.execucao || "0 em execução"}

            </small>

          </div>

        </div>

        <div class="obra-image-placeholder">

        </div>

      </div>

    </section>

  `;
}

function createModule(config) {
  config = config || {};

  return `
    <article class="sigo-module ${config.destaque ? "is-featured" : ""}"
             onclick="${config.acao || ""}">
      <div class="sigo-module__icon ${config.cor || ""}">
        ${config.icone || ""}
      </div>

      <h3 class="sigo-module__title">
        ${config.titulo || ""}
      </h3>

      ${createBadge(config.badge || "", config.badgeTipo || "")}

      <p class="sigo-module__desc">
        ${config.descricao || ""}
      </p>
    </article>
  `;
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
