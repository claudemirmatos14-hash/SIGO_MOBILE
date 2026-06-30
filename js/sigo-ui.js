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

  createFieldSection,

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

function createFieldSection() {
  const modulos = `
    ${createModule({
      acao: "navegarPara('diario')",
      cor: "is-blue",
      icone: "📘",
      titulo: "Diário de Obra",
      badge: "Hoje concluído",
      badgeTipo: "is-success",
      descricao: "Registrar produção diária"
    })}

    ${createModule({
      acao: "navegarPara('diarioItens')",
      cor: "is-orange",
      icone: "📋",
      titulo: "Itens do Diário",
      badge: "14 itens",
      badgeTipo: "is-warning",
      descricao: "Atividades executadas"
    })}

    ${createModule({
      acao: "navegarPara('medicoes')",
      cor: "is-purple",
      icone: "📏",
      titulo: "Medições",
      badge: "MED.05",
      badgeTipo: "is-warning",
      descricao: "6 serviços pendentes",
      destaque: true
    })}

    ${createModule({
      acao: "navegarPara('ocorrencias')",
      cor: "is-red",
      icone: "⚠️",
      titulo: "Ocorrências",
      badge: "3 abertas",
      badgeTipo: "is-danger",
      descricao: "2 críticas"
    })}

    ${createModule({
      acao: "navegarPara('clima')",
      cor: "is-blue",
      icone: "🌦️",
      titulo: "Clima",
      badge: "Hoje",
      badgeTipo: "is-info",
      descricao: "Ensolarado 28°C"
    })}

    ${createModule({
      acao: "navegarPara('evidencias')",
      cor: "is-green",
      icone: "📷",
      titulo: "Evidências",
      badge: "12 fotos",
      badgeTipo: "is-success",
      descricao: "Hoje"
    })}
  `;

  return `
    <section class="sigo-card sigo-card--section field-card">
      <div class="section-header">
        <div>
          <h2>👷 Trabalho de Campo</h2>
          <span>Acompanhe a execução da obra</span>
        </div>
      </div>

      ${createGrid(modulos)}
    </section>
  `;
}

function createStatus() {

  return `

    <section class="sigo-card sigo-card--status">

      <div class="section-header">

        <div>

          <h2>🌐 Situação da Obra</h2>

        </div>

        <span>

          Última Sync:

          <strong id="syncUltima">--</strong>

        </span>

      </div>

      <div class="status-grid">

        <div>

          <strong id="syncSincronizados">0</strong>

          <span>Sincronizados</span>

        </div>

        <div>

          <strong id="syncPendentes">0</strong>

          <span>Pendentes</span>

        </div>

        <div>

          <strong id="syncConflitos">0</strong>

          <span>Conflitos</span>

        </div>

        <div>

          <strong id="syncExcessos">0</strong>

          <span>Excessos</span>

        </div>

      </div>

      <div
          id="syncStatus"
          class="operation-status success">

          🟢 OPERAÇÃO NORMAL

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
