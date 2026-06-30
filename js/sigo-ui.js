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

  createTools,

  createBottomNav,

  createScreen,
  
  createActionButton,
  
  createActionBar,

  createInput,
  
  createDate,
  
  createNumber,
  
  createTextarea,
  
  createSelect,

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

function createScreen(config = {}) {
  const header =
    config.header === true
      ? createHeader()
      : (config.header || "");

  const hero = config.hero || "";

  const actions = Array.isArray(config.actions)
    ? createActionBar(config.actions)
    : (config.actions || "");

  const sections =
    (config.sections || []).join("");

  const bottom =
    config.bottom === true
      ? createBottomNav()
      : (config.bottom || "");

  return `
    ${header}

    <main class="home-premium">
      ${hero}
      ${actions}
      ${sections}
    </main>
    <section id="telaApp" class="tela-app"></section>
    ${bottom}
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

function createTools() {
  return `
    <section class="sigo-card sigo-card--compact tools-card">
      <div class="section-header">
        <div>
          <h2>⚙ Ferramentas</h2>
          <span>Utilitários do sistema</span>
        </div>
      </div>

      <div class="tools-grid">

        <button type="button" class="tool-card" onclick="sincronizarDadosBaseObraMobile()">
          <div>🔄</div>
          <strong>Atualizar Base</strong>
          <span>Buscar dados mais recentes</span>
        </button>

        <button type="button" class="tool-card" onclick="sincronizarSIGO()">
          <div>☁</div>
          <strong>Sincronizar Agora</strong>
          <span>Enviar e receber informações</span>
        </button>

        <button type="button" class="tool-card" onclick="abrirGerenciadorObrasOffline_()">
          <div>⬇</div>
          <strong>Baixar Obra</strong>
          <span>Disponibilizar obra offline</span>
        </button>

        <button type="button" class="tool-card" onclick="alert('Configurações será implementado futuramente.')">
          <div>⚙</div>
          <strong>Configurar App</strong>
          <span>Ajustes e preferências</span>
        </button>

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
  return `
    <nav class="bottom-nav">
      <button onclick="voltarHome()">🏠<span>Home</span></button>
      <button onclick="abrirGerenciadorObrasOffline_()">🏗<span>Obras</span></button>
      <button onclick="sincronizarSIGO()">🔄<span>Sync</span></button>
      <button onclick="alert('Configurações será implementado futuramente.')">⚙<span>Config</span></button>
    </nav>
  `;
}

function createActionButton(config = {}) {
  return `
    <button
      type="button"
      class="sigo-action-btn ${config.tipo || "is-secondary"}"
      onclick="${config.acao || ""}"
    >
      <span>${config.icone || ""}</span>
      <strong>${config.texto || ""}</strong>
    </button>
  `;
}

function createActionBar(actions = []) {
  if (!actions || actions.length === 0) return "";

  const botoes = actions
    .map(action => createActionButton(action))
    .join("");

  return `
    <section class="sigo-action-bar">
      ${botoes}
    </section>
  `;
}

function createInput(config = {}) {
  return `
    <label class="sigo-field">
      <span class="sigo-field__label">
        ${config.label || ""}
      </span>

      <input
        id="${config.id || ""}"
        type="${config.type || "text"}"
        class="sigo-input"
        placeholder="${config.placeholder || ""}"
        value="${config.value || ""}"
        ${config.required ? "required" : ""}
        ${config.readonly ? "readonly" : ""}
      >
    </label>
  `;
}

function createDate(config = {}) {
  return createInput({
    ...config,
    type: "date"
  });
}

function createNumber(config = {}) {
  return createInput({
    ...config,
    type: "number"
  });
}

function createTextarea(config = {}) {
  return `
    <label class="sigo-field">
      <span class="sigo-field__label">
        ${config.label || ""}
      </span>

      <textarea
        id="${config.id || ""}"
        class="sigo-textarea"
        rows="${config.rows || 4}"
        placeholder="${config.placeholder || ""}"
      >${config.value || ""}</textarea>
    </label>
  `;
}

function createSelect(config = {}) {

  const options = (config.options || [])
    .map(op => `
      <option value="${op.value}">
        ${op.label}
      </option>
    `)
    .join("");

  return `
    <label class="sigo-field">

      <span class="sigo-field__label">
        ${config.label || ""}
      </span>

      <select
        id="${config.id || ""}"
        class="sigo-select">

        ${options}

      </select>

    </label>
  `;
}
