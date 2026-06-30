// =====================================================
// SIGO MOBILE — COMPONENTES PREMIUM
// UX.07.12.2.1
// =====================================================

function criarHeaderSIGO() {
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

function criarBadgeSIGO(texto, tipo) {
  return `
    <span class="sigo-badge ${tipo || ""}">
      ${texto || ""}
    </span>
  `;
}

function criarCardModuloSIGO(config) {
  return `
    <article class="sigo-module ${config.destaque ? "is-featured" : ""}"
             onclick="${config.acao || ""}">
      <div class="sigo-module__icon ${config.cor || ""}">
        ${config.icone || ""}
      </div>

      <h3 class="sigo-module__title">
        ${config.titulo || ""}
      </h3>

      ${criarBadgeSIGO(config.badge || "", config.badgeTipo || "")}

      <p class="sigo-module__desc">
        ${config.descricao || ""}
      </p>
    </article>
  `;
}

function criarBottomNavSIGO() {
  return `
    <nav class="bottom-nav">
      <button onclick="voltarHome()">🏠<span>Home</span></button>
      <button onclick="abrirGerenciadorObrasOffline_()">🏗<span>Obras</span></button>
      <button onclick="sincronizarSIGO()">🔄<span>Sync</span></button>
      <button onclick="alert('Configurações será implementado futuramente.')">⚙<span>Config</span></button>
    </nav>
  `;
}
