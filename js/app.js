const SIGO_API_URL = "https://script.google.com/macros/s/AKfycbzVE7tdTSwHvKgLkrdcaQtGAm_muqNPo6n0wQZBDpmRwtAJuySfWyh6gdef0R6g_drKRw/exec";
const SIGO_TOKEN_OFFLINE = "SIGO_TOKEN_OFFLINE";

document.addEventListener("DOMContentLoaded", async () => {
  await atualizarHomeMobile_();
    iniciarSeletorObra();
});

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let idDiarioEdicao = null;
let idItemDiarioEdicao = null;
let idMedicaoEdicao = null;
let idLoteMedicaoSelecionado = null;
let idOcorrenciaEdicao = null;
let idClimaEdicao = null;
let idEvidenciaEdicao = null;

function iniciarSeletorObra() {
  const seletor = document.getElementById("obraAtiva");

  if (!seletor) return;

  seletor.addEventListener("change", async function () {
    const idObra = seletor.value;

     console.log("TROCOU SELECT:", idObra);

    if (!idObra) return;

    SIGOAppContext.setObraAtiva(idObra);

    await atualizarHeroObraAtivaMobile_();

    if (typeof atualizarHomeMobile_ === "function") {
      await atualizarHomeMobile_();
    }

    if (typeof atualizarPainelSaudeSync_ === "function") {
      await atualizarPainelSaudeSync_();
    }

    console.log(
      "Obra ativa alterada pelo seletor:",
      idObra
    );
  });
}

function atualizarNomeObra_(seletor, nomeObra) {
  // UX.08.1:
  // O Hero da obra agora é atualizado exclusivamente por:
  // atualizarHeroObraAtivaMobile_()
  //
  // Esta função foi mantida apenas para evitar erro
  // em chamadas antigas do sistema.

  if (typeof atualizarHeroObraAtivaMobile_ === "function") {
    atualizarHeroObraAtivaMobile_();
  }
}

async function atualizarContextoDiarioAtivoUX19_() {

  const area =
    document.getElementById(
      "contextoDiarioAtivoUX19"
    );

  const texto =
    document.getElementById(
      "textoContextoDiarioAtivoUX19"
    );

  if (!area || !texto) {
    return null;
  }

  const escaparTextoUX19_ =
    function (valor = "") {

      return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    };

  const formatarDataUX19_ =
    function (valor = "") {

      const data =
        String(valor || "").trim();

      const partes =
        data.split("-");

      if (partes.length !== 3) {
        return data || "Não informada";
      }

      return [
        partes[2],
        partes[1],
        partes[0]
      ].join("/");
    };

  try {

    // ==========================================
    // 1. IDENTIFICAR OBRA E DIÁRIO ATIVOS
    // ==========================================

    const obraAtiva =
      String(
        obterObraAtivaMobile_() || ""
      ).trim();

    const idDiarioAtivo =
      obraAtiva &&
      typeof obterDiarioAtivoSIGO_ ===
        "function"
        ? String(
            obterDiarioAtivoSIGO_(
              obraAtiva
            ) || ""
          ).trim()
        : "";

    if (!obraAtiva || !idDiarioAtivo) {

      area.dataset.idDiario = "";
      area.dataset.idObra = obraAtiva;

      texto.innerHTML = `
        Nenhum Diário aberto nesta obra.
        Crie ou abra um Diário para registrar
        a produção executada.
      `;

      const campoData =
        document.getElementById(
          "itemDiarioData"
        );

      if (campoData) {
        campoData.value = "";
        campoData.readOnly = true;
      }

      return null;
    }

    // ==========================================
    // 2. LOCALIZAR O DIÁRIO E SEUS ITENS
    // ==========================================

    const [
      diarios,
      itens
    ] = await Promise.all([

      listarRegistrosSIGO(
        "TB_DIARIOS"
      ),

      listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      )

    ]);

    const diarioAtivo =
      diarios.find(diario =>
        String(diario.idObra) ===
          obraAtiva &&

        String(diario.idDiario) ===
          idDiarioAtivo
      ) || null;

    if (!diarioAtivo) {

      if (
        typeof limparDiarioAtivoSIGO_ ===
          "function"
      ) {
        limparDiarioAtivoSIGO_(
          obraAtiva
        );
      }

      area.dataset.idDiario = "";
      area.dataset.idObra = obraAtiva;

      texto.innerHTML = `
        O Diário selecionado não foi
        encontrado no banco local.
      `;

      return null;
    }

    const itensDoDiario =
      itens.filter(item =>
        String(item.idObra) ===
          obraAtiva &&

        String(item.idDiario) ===
          idDiarioAtivo
      );

    // ==========================================
    // 3. PREPARAR INFORMAÇÕES
    // ==========================================

    const statusDiario =
      String(
        diarioAtivo.statusDiario ||
        "ABERTO"
      ).toUpperCase();

    const statusSync =
      String(
        diarioAtivo.statusSync ||
        "PENDENTE"
      ).toUpperCase();

    const dataFormatada =
      formatarDataUX19_(
        diarioAtivo.data
      );

    area.dataset.idObra =
      obraAtiva;

    area.dataset.idDiario =
      idDiarioAtivo;

    area.dataset.statusDiario =
      statusDiario;

    // ==========================================
    // 4. MOSTRAR O CONTEXTO REAL
    // ==========================================

    texto.innerHTML = `
      <div
        style="
          display: grid;
          gap: 8px;
          margin-top: 10px;
        "
      >

        <div>
          <strong>Diário:</strong>
          ${escaparTextoUX19_(
            idDiarioAtivo
          )}
        </div>

        <div>
          <strong>Data:</strong>
          ${escaparTextoUX19_(
            dataFormatada
          )}
        </div>

        <div>
          <strong>Responsável:</strong>
          ${escaparTextoUX19_(
            diarioAtivo.responsavel ||
            "Não informado"
          )}
        </div>

        <div>
          <strong>Status:</strong>
          ${escaparTextoUX19_(
            statusDiario
          )}
        </div>

        <div>
          <strong>Sincronização:</strong>
          ${escaparTextoUX19_(
            statusSync
          )}
        </div>

        <div>
          <strong>Atividades registradas:</strong>
          ${itensDoDiario.length}
        </div>

      </div>
    `;

    // ==========================================
    // 5. HERDAR A DATA NO FORMULÁRIO DO ITEM
    // ==========================================

    const campoDataItem =
      document.getElementById(
        "itemDiarioData"
      );

    if (campoDataItem) {

      campoDataItem.value =
        diarioAtivo.data || "";

      campoDataItem.readOnly =
        true;
    }

    return {
      diario:
        diarioAtivo,

      totalItens:
        itensDoDiario.length
    };

  } catch (erro) {

    console.error(
      "Erro ao atualizar contexto do Diário:",
      erro
    );

    texto.innerHTML = `
      Não foi possível carregar os dados
      do Diário ativo.
    `;

    return null;
  }
}

async function iniciarNovoDiarioUnificadoUX19_() {

  try {

    // ==========================================
    // 1. VALIDAR OBRA ATIVA
    // ==========================================

    const obraAtiva =
      String(
        obterObraAtivaMobile_() || ""
      ).trim();

    if (!obraAtiva) {

      SIGOUI.feedback.warning(
        "Obra não selecionada",
        "Selecione uma obra antes de criar o Diário."
      );

      return false;
    }

     // Encerrar qualquer edição anterior.
    
    if (
      typeof idDiarioEdicao !==
        "undefined"
    ) {
      idDiarioEdicao = null;
    }
    
    if (
      typeof atualizarModoEdicaoDiario_ ===
        "function"
    ) {
      atualizarModoEdicaoDiario_();
    }
    
    // ==========================================
    // 2. ENCERRAR O CONTEXTO DO DIÁRIO ANTERIOR
    // ==========================================

    if (
      typeof limparDiarioAtivoSIGO_ ===
        "function"
    ) {
      limparDiarioAtivoSIGO_(
        obraAtiva
      );
    }

    // ==========================================
    // 3. LIMPAR FORMULÁRIO DO CABEÇALHO
    // ==========================================

    if (
      typeof limparFormularioDiario ===
        "function"
    ) {
      limparFormularioDiario();
    }

    // ==========================================
    // 4. LIMPAR FORMULÁRIO DOS ITENS
    // ==========================================

    if (
      typeof limparFormularioItemDiario ===
        "function"
    ) {
      limparFormularioItemDiario();
    }

    // A data do item será definida apenas
    // depois que o novo Diário for salvo.

    const campoDataItem =
      document.getElementById(
        "itemDiarioData"
      );

    if (campoDataItem) {
      campoDataItem.value = "";
      campoDataItem.readOnly = true;
    }

    // ==========================================
    // 5. LIMPAR A LISTA DE ITENS EXIBIDA
    // ==========================================

    const listaItens =
      document.getElementById(
        "listaItensDiarioOffline"
      );

    if (listaItens) {

      listaItens.dataset.idObra =
        obraAtiva;

      listaItens.dataset.idDiario =
        "";

      listaItens.innerHTML = `
        <div class="card-vazio">
          <strong>Novo Diário ainda não salvo.</strong>
          <br>
          Preencha os dados gerais e clique em
          <strong>Salvar Diário</strong> antes de
          adicionar atividades.
        </div>
      `;
    }

    // ==========================================
    // 6. ATUALIZAR O QUADRO DE CONTEXTO
    // ==========================================

    if (
      typeof atualizarContextoDiarioAtivoUX19_ ===
        "function"
    ) {
      await atualizarContextoDiarioAtivoUX19_();
    }

    SIGOUI.feedback.info(
      "Novo Diário",
      "Preencha e salve o cabeçalho antes de adicionar atividades."
    );

    return true;

  } catch (erro) {

    console.error(
      "Erro ao iniciar novo Diário:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao iniciar Diário",
      erro.message ||
      "Não foi possível iniciar um novo Diário."
    );

    return false;
  }
}

function navegarPara(tela) {
localStorage.setItem("telaAtualMobile", tela);
  
  const app = document.querySelector(".app-premium");
  const area = document.getElementById("telaApp");

  const telasPremium = {
  home: {
    montar: montarHomePremium,
  
    depois: async function () {
      if (
        typeof carregarIndicadoresHomePremium ===
        "function"
      ) {
        await carregarIndicadoresHomePremium();
      }
  
      if (
        typeof atualizarIndicadoresMobile_ ===
        "function"
      ) {
        await atualizarIndicadoresMobile_();
      }
  
      if (
        typeof instalarAcaoReidratacaoUX1958_ ===
        "function"
      ) {
        await instalarAcaoReidratacaoUX1958_();
      }
    }
  },
    
    obras: {
      montar: montarTelaObrasOffline,
      depois: async function () {
        if (typeof listarObrasOfflineMobile_ === "function") {
          await listarObrasOfflineMobile_();
        }

        if (typeof listarObrasDisponiveisMobile_ === "function") {
          await listarObrasDisponiveisMobile_();
        }
      }
    },

   diario: {
    montar: montarTelaDiarioObra,
  
    depois: async function () {
  
      // ==========================================
      // 1. CARREGAR ATIVIDADES DISPONÍVEIS
      // ==========================================
  
      if (
        document.getElementById(
          "itemDiarioAtividade"
        ) &&
        typeof
          carregarAtividadesItemDiarioOffline_ ===
          "function"
      ) {
        await carregarAtividadesItemDiarioOffline_();
      }
  
      // ==========================================
      // 2. CARREGAR ITENS DO DIÁRIO ATIVO
      // ==========================================
  
      if (
        document.getElementById(
          "listaItensDiarioOffline"
        ) &&
        typeof listarItensDiarioOffline_ ===
          "function"
      ) {
        await listarItensDiarioOffline_();
      }
  
      // ==========================================
      // 3. CARREGAR HISTÓRICO DOS DIÁRIOS
      // ==========================================
  
      if (
        document.getElementById(
          "listaDiariosOffline"
        ) &&
        typeof carregarListaDiariosOffline ===
          "function"
      ) {
        await carregarListaDiariosOffline();
      }
      
      // ==========================================
      // 4. ATUALIZAR CONTEXTO DO DIÁRIO ATIVO
      // ==========================================
      
      if (
        typeof atualizarContextoDiarioAtivoUX19_ ===
          "function"
      ) {
        await atualizarContextoDiarioAtivoUX19_();
      }
    }
  },

    diarioItens: {
      montar: montarTelaItensDiario,
      depois: async function () {
        if (typeof carregarAtividadesItemDiarioOffline_ === "function") {
          await carregarAtividadesItemDiarioOffline_();
        }

        if (typeof listarItensDiarioOffline_ === "function") {
          await listarItensDiarioOffline_();
        }
      }
    },

    medicoes: {
      montar: montarTelaMedicoes,
      depois: async function () {

        if (typeof fecharLotesVencidosMedicao_ === "function") {
          await fecharLotesVencidosMedicao_();
        }
        
        if (typeof carregarAtividadesMedicaoOffline_ === "function") {
          await carregarAtividadesMedicaoOffline_();
        }
    
        if (typeof listarMedicoesOffline_ === "function") {
          await listarMedicoesOffline_();
        }
      }
    },

    ocorrencias: {
      montar: montarTelaOcorrencias,
      depois: async function () {
        if (typeof listarOcorrenciasOffline_ === "function") {
          await listarOcorrenciasOffline_();
        }
      }
    },

    clima: {
      montar: montarTelaClima,
      depois: async function () {
        if (typeof listarClimasOffline_ === "function") {
          await listarClimasOffline_();
        }
      }
    },

    evidencias: {
      montar: montarTelaEvidencias,
      depois: async function () {
        if (typeof listarEvidenciasOffline_ === "function") {
          await listarEvidenciasOffline_();
        }
      }
    }
  };

 if (app && telasPremium[tela]) {
    (async function () {
      const htmlTela =
        await telasPremium[tela].montar();
  
      SIGOUI.render(".app-premium", htmlTela);
  
      setTimeout(async () => {
        if (typeof carregarObrasMobile_ === "function") {
          await carregarObrasMobile_();
        }
  
        await telasPremium[tela].depois();
        
// Atualiza o contador de notificações
  if (typeof atualizarBadgeNotificacoes_ === "function") {
    await atualizarBadgeNotificacoes_();
  }
        
      }, 100);
      
      window.scrollTo({
        top: 0,
        behavior: "smooth"
     });
  })();

  return;
}
  
  if (!area) return;

  if (tela === "evidencias") {
    setTimeout(() => {
      listarEvidenciasOffline_();
    }, 100);
  }

  if (tela === "clima") {
    setTimeout(() => {
      listarClimasOffline_();
    }, 100);
  }

  if (tela === "ocorrencias") {
    setTimeout(() => {
      listarOcorrenciasOffline_();
    }, 100);
  }
}

function montarTela(tela) {
  const titulos = {
    diario: "📘 Diário de Obra",
    medicoes: "📏 Medições",
    ocorrencias: "⚠️ Ocorrências",
    clima: "🌦️ Clima",
    evidencias: "📎 Evidências"
  };

  const descricoes = {
    diario: "Registrar informações diárias da obra.",
    medicoes: "Atualizar avanço físico das atividades.",
    ocorrencias: "Registrar problemas e impactos da obra.",
    clima: "Registrar condições climáticas do período.",
    evidencias: "Registrar fotos, documentos e anexos."
  };

if (tela === "diario") {
  return montarTelaDiarioObra_();
}

if (tela === "medicoes") {
  return montarTelaMedicoes_();
}

if (tela === "evidencias") {
  return montarTelaEvidencias_();
}

if (tela === "clima") {
  return montarTelaClima_();
}

if (tela === "ocorrencias") {
  return montarTelaOcorrencias_();
}

if (tela === "diarioItens") {
  return montarTelaDiarioItens_();
}

return `
  <div class="tela-card">
    <button class="btn-voltar" onclick="voltarHome()">← Voltar</button>
    <h2>${titulos[tela] || "Tela"}</h2>
    <p>${descricoes[tela] || ""}</p>
    <div class="placeholder">
      Tela em construção.
    </div>
  </div>
`;
}

function voltarHome() {
  window.location.reload();
}

function montarTelaDiarioObra_() {
  const obraAtiva = obterObraAtivaMobile_();

  const hoje = new Date().toISOString().split("T")[0];

  return `
    <div class="tela-card">

      <button class="btn-voltar" onclick="voltarHome()">← Voltar</button>

      <h2>📘 Diário de Obra</h2>

      <p>Registrar informações diárias da obra.</p>

      <form class="formulario" onsubmit="salvarDiarioOffline(event)">

        <label>Data</label>
        <input type="date" id="diarioData" value="${hoje}">

        <label>Obra</label>
          <input type="text" id="diarioObra" value="${obraAtiva}" readonly>

        <label>Responsável</label>
        <input type="text" id="diarioResponsavel" placeholder="Nome do responsável">

        <label>Clima</label>
        
       <select id="diarioClima">

          <option value="☀️ ENSOLARADO">
            ☀️ Ensolarado
          </option>
        
          <option value="⛅ PARCIALMENTE NUBLADO">
            ⛅ Parcialmente Nublado
          </option>
        
          <option value="☁️ NUBLADO">
            ☁️ Nublado
          </option>
        
          <option value="🌧️ CHUVOSO">
            🌧️ Chuvoso
          </option>
        
          <option value="⛈️ TEMPESTADE">
            ⛈️ Tempestade
          </option>
        
        </select>
        
        <label>Ocorrências gerais</label>
        <textarea id="diarioOcorrencias" rows="3" placeholder="Descreva ocorrências gerais"></textarea>

        <label>Observações gerais</label>
        <textarea id="diarioObservacoes" rows="3" placeholder="Observações do dia"></textarea>

        <button type="submit" class="btn-salvar">
          Salvar Offline
        </button>

        <div class="lista-offline">
          <h3>Diários salvos offline</h3>
          <div id="listaDiariosOffline">
            Carregando...
          </div>
        </div>

      </form>

    </div>
  `;
}

async function salvarDiarioOffline(event) {
  if (event) {
    event.preventDefault();
  }

  const diario = {
    idDiario: "DIA-" + Date.now(),

    data:
      document.getElementById("diarioData").value,

    idObra:
      obterObraAtivaMobile_(),

    responsavel:
      document.getElementById("diarioResponsavel").value,

    clima:
      document.getElementById("diarioClima").value,

    ocorrencias:
      document.getElementById("diarioOcorrencias").value,

    observacoes:
      document.getElementById("diarioObservacoes").value,

    statusDiario: "ABERTO",
    statusSync: "PENDENTE",
    origem: "APP_OFFLINE",

    criadoEm:
      new Date().toISOString()
  };

  try {
    // 1. Grava o diário e recebe o registro salvo
    const diarioSalvo =
      await salvarRegistroSIGO(
        "TB_DIARIOS",
        diario
      );

    // 2. Gera a notificação real da ação
    await registrarEventoSIGO_({
      evento: "DIARIO_SALVO",
      dados: diarioSalvo
    });

    // Não usar adicionarNaFilaSyncSIGO aqui.
    // salvarRegistroSIGO já integra com SIGOOfflineEngine.

    SIGOUI.feedback.success(
      "Diário salvo",
      "Registro salvo offline."
    );

    console.log(
      "Diário salvo no IndexedDB:",
      diarioSalvo
    );

    if (typeof atualizarIndicadoresMobile_ === "function") {
      await atualizarIndicadoresMobile_();
    }

    if (typeof carregarListaDiariosOffline === "function") {
      await carregarListaDiariosOffline();
    }

    return diarioSalvo;

  } catch (erro) {
    console.error(
      "Erro ao salvar diário:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao salvar",
      "Não foi possível salvar diário."
    );

    return null;
  }
}

async function atualizarIndicadoresMobile_() {
  try {
    const diarios =
      await listarRegistrosSIGO("TB_DIARIOS");

    const fila =
      await listarRegistrosSIGO("TB_SYNC_QUEUE");

    const atividades =
      await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

    const obraAtiva =
      obterObraAtivaMobile_();

    const atividadesObra =
      atividades.filter(item =>
        String(item.idObra) === String(obraAtiva)
      );

    const totalAtividades =
      atividadesObra.length;

    const emExecucao =
      atividadesObra.filter(item =>
        String(item.status || "").toUpperCase() === "EM EXECUÇÃO"
      ).length;

    const elAtividades =
      document.getElementById("contadorAtividadesOffline");

    if (elAtividades) {
      elAtividades.textContent =
        `${totalAtividades} atividades offline`;
    }

    const elExecucao =
      document.getElementById("contadorAtividadesExecucao");

    if (elExecucao) {
      elExecucao.textContent =
        `${emExecucao} em execução`;
    }

    const pendentes =
      fila.filter(item => item.statusSync === "PENDENTE");

    const cards =
      document.querySelectorAll(".resumo .card strong");

    if (cards[0]) {
      cards[0].textContent = diarios.length;
    }

    if (cards[1]) {
      cards[1].textContent = pendentes.length;
    }

  } catch (erro) {
    console.error(
      "Erro ao atualizar indicadores:",
      erro
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
      await abrirBancoLocalSIGO();

       if (typeof inicializarListenersSIGO_ === "function") {
          inicializarListenersSIGO_();
        }
       if (typeof inicializarDataBindingEventBus_ === "function") {
          inicializarDataBindingEventBus_();
        }

      if (typeof inicializarNotificacoesReativasSIGO_ === "function") {
          inicializarNotificacoesReativasSIGO_();
        }
      
      if (typeof inicializarSmartSyncAutomaticoSIGO_ === "function") {
        inicializarSmartSyncAutomaticoSIGO_();
      }

      if (typeof inicializarSmartRetrySIGO_ === "function") {
        inicializarSmartRetrySIGO_();
      }
      
      console.log("SIGO Mobile inicializado.");
  
      navegarPara("home");
  
    } catch (erro) {
      console.error(
        "Falha ao inicializar banco local.",
        erro
      );
    }
  });

function contarPendentesDashboard_(lista = []) {
  const pendentes = lista.filter(item =>
    String(item.statusSync || "").toUpperCase() === "PENDENTE"
  ).length;

  return pendentes
    ? `${pendentes} pendente(s)`
    : "Tudo sincronizado";
}

function definirBadgeTipoPendencia_(lista = []) {
  const erros = lista.filter(item =>
    String(item.statusSync || "").toUpperCase() === "ERRO"
  ).length;

  const pendentes = lista.filter(item =>
    String(item.statusSync || "").toUpperCase() === "PENDENTE"
  ).length;

  if (erros) return "is-danger";
  if (pendentes) return "is-warning";
  return "is-success";
}

async function obterSaudeSincronizacao_() {

  const fila =
    await listarRegistrosSIGO("TB_SYNC_QUEUE");

  const pendentes =
    fila.filter(item =>
      item.statusSync === "PENDENTE"
    ).length;

  const sincronizados =
    fila.filter(item =>
      item.statusSync === "SINCRONIZADO"
    ).length;

  const conflitos =
    Number(
      localStorage.getItem(
        "SIGO_CONFLITOS"
      ) || 0
    );

  const excessos =
    Number(
      localStorage.getItem(
        "SIGO_EXCESSOS"
      ) || 0
    );

  const ultimaSync =
    localStorage.getItem(
      "SIGO_ULTIMA_SYNC"
    ) || "--";

  let status =
    "🟢 OPERACIONAL";

  if (pendentes > 0) {
    status =
      "🟡 PENDÊNCIAS";
  }

  if (conflitos > 0) {
    status =
      "🔴 ATENÇÃO";
  }

  return {
    pendentes,
    sincronizados,
    conflitos,
    excessos,
    ultimaSync,
    status
  };
}

async function atualizarPainelSaudeSync_() {

  const painel =
    await obterSaudeSincronizacao_();

  const pendentes =
    document.getElementById("syncPendentes");

  const sincronizados =
    document.getElementById("syncSincronizados");

  const conflitos =
    document.getElementById("syncConflitos");

  const excessos =
    document.getElementById("syncExcessos");

  const ultima =
    document.getElementById("syncUltima");

  const status =
    document.getElementById("syncStatus");

  if (pendentes) pendentes.textContent = painel.pendentes;
  if (sincronizados) sincronizados.textContent = painel.sincronizados;
  if (conflitos) conflitos.textContent = painel.conflitos;
  if (excessos) excessos.textContent = painel.excessos;
  if (ultima) ultima.textContent = painel.ultimaSync;
  if (status) status.textContent = painel.status;
}

async function carregarListaDiariosOffline() {
  const areaLista =
    document.getElementById("listaDiariosOffline");

  if (!areaLista) return;

  try {
    const obraAtiva = obterObraAtivaMobile_();

    const diarios =
      await listarRegistrosSIGO("TB_DIARIOS");

    const diariosObra =
      diarios
        .filter(diario =>
          String(diario.idObra) === String(obraAtiva)
        )
        .sort((a, b) =>
          new Date(b.criadoEm) - new Date(a.criadoEm)
        );

    if (!diariosObra.length) {
      areaLista.innerHTML = `
        <div class="card-vazio">
          Nenhum diário salvo offline.
        </div>
      `;
      return;
    }

    areaLista.innerHTML =
      diariosObra
        .map(diario => criarCardDiarioOffline_(diario))
        .join("");

  } catch (erro) {
    console.error("Erro ao carregar diários offline:", erro);

    areaLista.innerHTML = `
      <div class="card-vazio">
        Erro ao carregar diários.
      </div>
    `;
  }
}

function criarCardDiarioOffline_(diario) {
  const status = diario.statusSync || "PENDENTE";

  const badge =
    status === "SINCRONIZADO"
      ? "🟢 SINCRONIZADO"
      : status === "ERRO"
        ? "🔴 ERRO"
        : "🟡 PENDENTE";

  const classeStatus =
    status === "SINCRONIZADO"
      ? "success"
      : status === "ERRO"
        ? "danger"
        : "warning";

  const bloqueioEdicao =
    status !== "PENDENTE";

  return `
    <article class="diario-card">

      <div class="diario-card__header">
        <div>
          <strong>📘 ${formatarDataMedicao_(diario.data)}</strong>
          <span>${diario.idObra || "-"}</span>
        </div>

        <span class="badge-sync badge-${classeStatus}">
          ${badge}
        </span>
      </div>

      <div class="diario-card__grid">

        <div>
          <small>Responsável</small>
          <strong>${diario.responsavel || "Sem responsável"}</strong>
        </div>

        <div>
          <small>Equipe</small>
          <strong>${diario.equipe || "Não informada"}</strong>
        </div>

        <div>
          <small>Clima</small>
          <strong>${diario.clima || "-"}</strong>
        </div>

        <div>
          <small>Horas</small>
          <strong>${formatarNumeroMedicao_(diario.horasDia || diario.horas || 0)} h</strong>
        </div>

      </div>

      ${
        diario.observacoes
          ? `
            <div class="diario-card__obs">
              <small>Observações</small>
              <p>${diario.observacoes}</p>
            </div>
          `
          : ""
      }

      <div class="diario-card__actions">

        <button
          type="button"
          ${bloqueioEdicao ? "disabled" : ""}
          onclick="editarDiarioOffline_('${diario.idDiario}')">
          ✏ Editar
        </button>

        <button
          type="button"
          onclick="excluirDiarioOffline_('${diario.idDiario}')">
          🗑 Excluir
        </button>

        <button
          type="button"
          onclick="detalharDiarioOffline_('${diario.idDiario}')">
          👁 Detalhes
        </button>

      </div>

    </article>
  `;
}

async function detalharDiarioOffline_(idDiario) {
  try {
    const diarios =
      await listarRegistrosSIGO("TB_DIARIOS");

    const diario =
      diarios.find(item =>
        String(item.idDiario) === String(idDiario)
      );

    if (!diario) {
      SIGOUI.feedback.warning(
        "Diário não encontrado",
        "O registro não foi localizado no banco offline."
      );
      return;
    }

    SIGOUI.showDrawer({
      titulo: "📘 Diário de Obra",
      subtitulo: `${formatarDataMedicao_(diario.data)} • ${diario.idObra || "-"}`,
      conteudo: montarDetalhesDiario_(diario),
      textoFechar: "Fechar"
    });

  } catch (erro) {
    console.error("Erro ao detalhar diário:", erro);

    SIGOUI.feedback.error(
      "Erro ao abrir detalhes",
      "Não foi possível carregar os detalhes do diário."
    );
  }
}

function montarDetalhesDiario_(diario) {
  const status = diario.statusSync || "PENDENTE";

  let badge = "";
  let classeStatus = "";
  let descricaoStatus = "";

  switch (status) {
    case "SINCRONIZADO":
      badge = "🟢 SINCRONIZADO";
      classeStatus = "success";
      descricaoStatus = "Registro enviado ao SIGO.";
      break;

    case "ERRO":
      badge = "🔴 ERRO";
      classeStatus = "danger";
      descricaoStatus = "Falha na sincronização.";
      break;

    default:
      badge = "🟡 PENDENTE";
      classeStatus = "warning";
      descricaoStatus = "Aguardando sincronização.";
  }

  const responsavel =
    diario.responsavel || "Sem responsável";

  const equipe =
    diario.equipe || "Equipe não informada";

  const clima =
    diario.clima || "Não informado";

  const horas =
    diario.horasDia ??
    diario.horas ??
    0;

  const ocorrencias =
    diario.ocorrencias ||
    "Nenhuma ocorrência geral registrada.";

  const observacoes =
    diario.observacoes ||
    "Nenhuma observação registrada.";

  return `
    <div class="drawer-status">
      <span class="badge-sync badge-${classeStatus}">
        ${badge}
      </span>

      <p class="drawer-status-text">
        ${descricaoStatus}
      </p>
    </div>

    <div class="drawer-grid">

      <div class="drawer-kpi">
        <small>Clima</small>
        <strong>${clima}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Horas</small>
        <strong>${formatarNumeroMedicao_(horas)} h</strong>
      </div>

      <div class="drawer-kpi">
        <small>Equipe</small>
        <strong>${equipe}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Status</small>
        <strong>${status}</strong>
      </div>

    </div>

    <div class="drawer-section">
      <h4>Dados do Diário</h4>

      <div class="drawer-item">
        <span>Data</span>
        <strong>${formatarDataMedicao_(diario.data)}</strong>
      </div>

      <div class="drawer-item">
        <span>Obra</span>
        <strong>${diario.idObra || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Responsável</span>
        <strong>${responsavel}</strong>
      </div>

      <div class="drawer-item">
        <span>Equipe</span>
        <strong>${equipe}</strong>
      </div>

      <div class="drawer-item">
        <span>Clima</span>
        <strong>${clima}</strong>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Ocorrências Gerais</h4>
      <p>${ocorrencias}</p>
    </div>

    <div class="drawer-section">
      <h4>Observações</h4>
      <p>${observacoes}</p>
    </div>

    <div class="drawer-section">
      <h4>Auditoria</h4>

      <div class="drawer-item">
        <span>ID Diário</span>
        <strong>${diario.idDiario || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Criado em</span>
        <strong>${formatarDataHoraMedicao_(diario.criadoEm)}</strong>
      </div>

      <div class="drawer-item">
        <span>Status Sync</span>
        <strong>${status}</strong>
      </div>

      <div class="drawer-item">
        <span>Versão</span>
        <strong>1.0</strong>
      </div>
    </div>
  `;
}

async function editarDiarioOffline_(
  idDiario
) {

  try {

    // ==========================================
    // 1. VALIDAR OBRA E DIÁRIO
    // ==========================================

    const idObraAtiva =
      String(
        obterObraAtivaMobile_() || ""
      ).trim();

    const idDiarioSelecionado =
      String(
        idDiario || ""
      ).trim();

    if (!idObraAtiva) {

      SIGOUI.feedback.warning(
        "Obra não selecionada",
        "Selecione uma obra antes de abrir o Diário."
      );

      return null;
    }

    if (!idDiarioSelecionado) {
      throw new Error(
        "ID do Diário não informado."
      );
    }

    // ==========================================
    // 2. LOCALIZAR O DIÁRIO NA OBRA ATIVA
    // ==========================================

    const diarios =
      await listarRegistrosSIGO(
        "TB_DIARIOS"
      );

    const diario =
      diarios.find(item =>
        String(item.idDiario) ===
          idDiarioSelecionado &&

        String(item.idObra) ===
          idObraAtiva
      ) || null;

    if (!diario) {

      SIGOUI.feedback.warning(
        "Diário não encontrado",
        "O registro não foi localizado na obra ativa."
      );

      return null;
    }

    // ==========================================
    // 3. LIMPAR DADOS DO ITEM ANTERIOR
    // ==========================================

    if (
      typeof limparFormularioItemDiario ===
        "function"
    ) {
      limparFormularioItemDiario();
    }

    // ==========================================
    // 4. DEFINIR MODO DE EDIÇÃO
    // ==========================================

    idDiarioEdicao =
      diario.idDiario;

    if (
      typeof definirDiarioAtivoSIGO_ ===
        "function"
    ) {
      definirDiarioAtivoSIGO_(
        diario.idDiario,
        diario.idObra
      );
    }

    // ==========================================
    // 5. PREENCHER O CABEÇALHO
    // ==========================================

    const preencherCampo =
      function (
        idElemento,
        valor
      ) {

        const elemento =
          document.getElementById(
            idElemento
          );

        if (elemento) {
          elemento.value =
            valor ?? "";
        }
      };

    preencherCampo(
      "diarioData",
      diario.data
    );

    preencherCampo(
      "diarioResponsavel",
      diario.responsavel
    );

    preencherCampo(
      "diarioEquipe",
      diario.equipe
    );

    preencherCampo(
      "diarioHoras",
      diario.horasDia ||
      diario.horas ||
      ""
    );

    preencherCampo(
      "diarioClima",
      diario.clima
    );

    preencherCampo(
      "diarioOcorrencias",
      diario.ocorrencias
    );

    preencherCampo(
      "diarioObservacoes",
      diario.observacoes
    );

    if (
      typeof atualizarModoEdicaoDiario_ ===
        "function"
    ) {
      atualizarModoEdicaoDiario_();
    }

    // ==========================================
    // 6. CARREGAR ITENS DO DIÁRIO SELECIONADO
    // ==========================================

    if (
      document.getElementById(
        "listaItensDiarioOffline"
      ) &&
      typeof listarItensDiarioOffline_ ===
        "function"
    ) {
      await listarItensDiarioOffline_(
        diario.idDiario
      );
    }

    // ==========================================
    // 7. ATUALIZAR CONTEXTO E DATA DO ITEM
    // ==========================================

    if (
      typeof atualizarContextoDiarioAtivoUX19_ ===
        "function"
    ) {
      await atualizarContextoDiarioAtivoUX19_();
    }

    // ==========================================
    // 8. RETORNAR AO TOPO DO DIÁRIO
    // ==========================================

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    SIGOUI.feedback.info(
      "Diário aberto",
      "Cabeçalho e atividades carregados para edição."
    );

    return diario;

  } catch (erro) {

    console.error(
      "Erro ao abrir Diário:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao abrir Diário",
      erro.message ||
      "Não foi possível carregar o Diário."
    );

    return null;
  }
}

function atualizarModoEdicaoDiario_() {

  // Localiza especificamente o botão do
  // cabeçalho do Diário, sem confundi-lo
  // com o botão "Adicionar Item".
  const botao =
    [...document.querySelectorAll(
      "button"
    )].find(elemento => {

      const acao =
        String(
          elemento.getAttribute(
            "onclick"
          ) || ""
        )
          .replace(/\s+/g, "");

      return (
        acao ===
          "salvarDiarioPremium()" ||

        acao ===
          "atualizarDiarioOffline_()"
      );
    });

  if (!botao) return;

  if (idDiarioEdicao) {

    botao.innerHTML =
      "💾 Atualizar Diário";

    botao.setAttribute(
      "onclick",
      "atualizarDiarioOffline_()"
    );

  } else {

    botao.innerHTML =
      "💾 Salvar Diário";

    botao.setAttribute(
      "onclick",
      "salvarDiarioPremium()"
    );
  }
}

async function atualizarDiarioOffline_() {

  try {

    // ==========================================
    // 1. VALIDAR O MODO DE EDIÇÃO
    // ==========================================

    if (!idDiarioEdicao) {
      throw new Error(
        "Nenhum Diário está em edição."
      );
    }

    const idObraAtiva =
      String(
        obterObraAtivaMobile_() || ""
      ).trim();

    if (!idObraAtiva) {
      throw new Error(
        "Nenhuma obra ativa foi identificada."
      );
    }

    // ==========================================
    // 2. LOCALIZAR O REGISTRO EXISTENTE
    // ==========================================

    const diarios =
      await listarRegistrosSIGO(
        "TB_DIARIOS"
      );

    const diarioAtual =
      diarios.find(item =>
        String(item.idDiario) ===
          String(idDiarioEdicao) &&

        String(item.idObra) ===
          String(idObraAtiva)
      ) || null;

    if (!diarioAtual) {
      throw new Error(
        "O Diário em edição não foi localizado na obra ativa."
      );
    }

    // ==========================================
    // 3. LER OS DADOS ATUALIZADOS
    // ==========================================

    const dadosAtualizados = {
      data:
        document.getElementById(
          "diarioData"
        )?.value || "",

      responsavel:
        document.getElementById(
          "diarioResponsavel"
        )?.value || "",

      equipe:
        document.getElementById(
          "diarioEquipe"
        )?.value || "",

      horasDia:
        Number(
          document.getElementById(
            "diarioHoras"
          )?.value || 0
        ),

      clima:
        document.getElementById(
          "diarioClima"
        )?.value || "",

      ocorrencias:
        document.getElementById(
          "diarioOcorrencias"
        )?.value || "",

      observacoes:
        document.getElementById(
          "diarioObservacoes"
        )?.value || ""
    };

    // ==========================================
    // 4. REUTILIZAR A VALIDAÇÃO OFICIAL
    // ==========================================

    if (
      typeof SIGOEntities?.diario
        ?.validate === "function"
    ) {
      await SIGOEntities.diario.validate({
        ...dadosAtualizados
      });
    }

    // ==========================================
    // 5. PRESERVAR O MESMO ID
    // ==========================================

    const diarioAtualizado = {
      ...diarioAtual,
      ...dadosAtualizados,

      idDiario:
        diarioAtual.idDiario,

      idObra:
        diarioAtual.idObra,

      atualizadoEm:
        new Date().toISOString(),

      statusSync:
        "PENDENTE"
    };

    // ==========================================
    // 6. ATUALIZAR O INDEXEDDB
    // ==========================================

    await salvarRegistroSIGO(
      "TB_DIARIOS",
      diarioAtualizado
    );

    // ==========================================
    // 7. REGISTRAR UPDATE NA FILA OFICIAL
    // ==========================================

    await adicionarNaFilaSyncSIGO({
      tipo: "UPDATE",
      storeOrigem: "TB_DIARIOS",
      idRegistro:
        diarioAtualizado.idDiario,
      idObra:
        diarioAtualizado.idObra
    });

    // ==========================================
    // 8. MANTER O DIÁRIO ABERTO E ATIVO
    // ==========================================

    idDiarioEdicao =
      diarioAtualizado.idDiario;

    if (
      typeof definirDiarioAtivoSIGO_ ===
        "function"
    ) {
      definirDiarioAtivoSIGO_(
        diarioAtualizado.idDiario,
        diarioAtualizado.idObra
      );
    }

    if (
      typeof atualizarModoEdicaoDiario_ ===
        "function"
    ) {
      atualizarModoEdicaoDiario_();
    }

    // ==========================================
    // 9. ATUALIZAR A INTERFACE UNIFICADA
    // ==========================================

    if (
      typeof listarItensDiarioOffline_ ===
        "function"
    ) {
      await listarItensDiarioOffline_(
        diarioAtualizado.idDiario
      );
    }

    if (
      typeof atualizarContextoDiarioAtivoUX19_ ===
        "function"
    ) {
      await atualizarContextoDiarioAtivoUX19_();
    }

    if (
      typeof carregarListaDiariosOffline ===
        "function"
    ) {
      await carregarListaDiariosOffline();
    }

    if (
      typeof atualizarIndicadoresMobile_ ===
        "function"
    ) {
      await atualizarIndicadoresMobile_();
    }

    // ==========================================
    // 10. NOTIFICAÇÃO
    // ==========================================

    if (
      typeof registrarEventoSIGO_ ===
        "function"
    ) {
      await registrarEventoSIGO_({
        evento:
          "DIARIO_ATUALIZADO",

        dados:
          diarioAtualizado
      });
    }

    SIGOUI.feedback.success(
      "Diário atualizado",
      "As alterações foram salvas no mesmo Diário."
    );

    return diarioAtualizado;

  } catch (erro) {

    console.error(
      "Erro ao atualizar Diário:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao atualizar",
      erro.message ||
      "Não foi possível atualizar o Diário."
    );

    return null;
  }
}

// =====================================================
// EXCLUIR DIÁRIO, ITENS E FILA EM UMA ÚNICA TRANSAÇÃO
//
// Item nunca sincronizado:
// - cancela UPSERT pendente;
// - remove localmente;
// - não cria DELETE.
//
// Item sincronizado:
// - preserva histórico;
// - cria tombstone DIARIO_ITEM;
// - remove localmente.
//
// Diário nunca sincronizado:
// - cancela UPSERT pendente;
// - remove localmente;
// - não cria DELETE.
//
// Diário sincronizado:
// - cria tombstone DIARIO;
// - remove localmente.
//
// A transação é atômica entre:
// - TB_DIARIOS
// - TB_DIARIO_ITENS
// - TB_SYNC_QUEUE
// =====================================================
async function excluirDiarioComItensFilaAtomicaSIGO_(
  diario
) {

  if (
    !diario ||
    typeof diario !== "object"
  ) {
    throw new Error(
      "Diário não informado."
    );
  }

  const idDiario =
    String(
      diario.idDiario || ""
    ).trim();

  const idObra =
    String(
      diario.idObra || ""
    ).trim();

  if (!idDiario) {
    throw new Error(
      "ID do Diário não informado."
    );
  }

  if (!idObra) {
    throw new Error(
      "O Diário não está vinculado a uma obra."
    );
  }

  const db =
    (
      typeof SIGO_DB !==
        "undefined" &&
      SIGO_DB
    )
      ? SIGO_DB
      : await abrirBancoLocalSIGO();

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const transaction =
        db.transaction(
          [
            "TB_DIARIOS",
            "TB_DIARIO_ITENS",
            "TB_SYNC_QUEUE"
          ],
          "readwrite"
        );

      const storeDiarios =
        transaction.objectStore(
          "TB_DIARIOS"
        );

      const storeItens =
        transaction.objectStore(
          "TB_DIARIO_ITENS"
        );

      const storeFila =
        transaction.objectStore(
          "TB_SYNC_QUEUE"
        );

      const resultado = {
        idDiario,
        idObra,

        totalItensVinculados:
          0,

        itensRemovidos:
          0,

        diarioRemovido:
          false,

        upsertsItensCancelados:
          0,

        upsertDiarioCancelado:
          0,

        tombstonesItensCriados:
          0,

        tombstonesItensReutilizados:
          0,

        tombstoneDiarioCriado:
          false,

        tombstoneDiarioReutilizado:
          false,

        itensSincronizados:
          0,

        diarioSincronizado:
          false
      };

      let itensCarregados =
        null;

      let filaCarregada =
        null;

      let processamentoIniciado =
        false;

      let erroOperacao =
        null;


      const abortar =
        erro => {

          erroOperacao =
            erro instanceof Error
              ? erro
              : new Error(
                  String(erro)
                );

          try {
            transaction.abort();
          } catch (erroAbortar) {
            console.error(
              "Erro ao abortar transação:",
              erroAbortar
            );
          }
        };


      const normalizar =
        valor =>
          String(
            valor || ""
          ).trim();


      const statusNormalizado =
        registro =>
          normalizar(
            registro?.statusSync
          ).toUpperCase();


      const gerarIdSyncDelete =
        tipo => {

          return (
            "SYNC-LOCAL-" +
            Date.now() +
            "-DEL-" +
            tipo +
            "-" +
            Math.random()
              .toString(36)
              .slice(2, 8)
          );
        };


      const obterPendenciasRelacionadas =
        (
          storeOrigem,
          idRegistro
        ) => {

          return filaCarregada.filter(
            pendencia => {

              return (
                normalizar(
                  pendencia.storeOrigem
                ) ===
                  storeOrigem &&

                normalizar(
                  pendencia.idRegistro
                ) ===
                  idRegistro &&

                normalizar(
                  pendencia.idObra
                ) ===
                  idObra
              );
            }
          );
        };


      const cancelarUpsertsPendentes =
        (
          relacionadas,
          motivo
        ) => {

          let canceladas =
            0;

          relacionadas
            .filter(
              pendencia => {

                return (
                  statusNormalizado(
                    pendencia
                  ) ===
                    "PENDENTE" &&

                  !ehPendenciaDeleteSIGO_(
                    pendencia
                  )
                );
              }
            )
            .forEach(
              pendencia => {

                pendencia.statusSync =
                  "CANCELADO";

                pendencia.canceladoEm =
                  new Date()
                    .toISOString();

                pendencia
                  .motivoCancelamento =
                  motivo;

                storeFila.put(
                  pendencia
                );

                canceladas++;
              }
            );

          return canceladas;
        };


      const possuiHistoricoSincronizado =
        (
          registro,
          relacionadas
        ) => {

          const registroSincronizado =
            statusNormalizado(
              registro
            ) ===
              "SINCRONIZADO" ||

            Boolean(
              normalizar(
                registro?.dataSync
              )
            );

          const filaSincronizada =
            relacionadas.some(
              pendencia => {

                return (
                  statusNormalizado(
                    pendencia
                  ) ===
                    "SINCRONIZADO" &&

                  !ehPendenciaDeleteSIGO_(
                    pendencia
                  )
                );
              }
            );

          return (
            registroSincronizado ||
            filaSincronizada
          );
        };


      const localizarDeletePendente =
        relacionadas => {

          return relacionadas.find(
            pendencia => {

              return (
                statusNormalizado(
                  pendencia
                ) ===
                  "PENDENTE" &&

                ehPendenciaDeleteSIGO_(
                  pendencia
                )
              );
            }
          ) || null;
        };


      const criarTombstoneItem =
        item => {

          const idItem =
            normalizar(
              item.idItemDiario ||
              item.idItem
            );

          const idSyncLocal =
            gerarIdSyncDelete(
              "ITEM"
            );

          const agora =
            new Date()
              .toISOString();

          const tombstone = {
            idSyncLocal,

            tipo:
              "DELETE",

            operacao:
              "DELETE",

            entidade:
              "DIARIO_ITEM",

            storeOrigem:
              "TB_DIARIO_ITENS",

            idRegistro:
              idItem,

            idObra,

            idDiario,

            payloadExclusao: {
              entidade:
                "DIARIO_ITEM",

              storeOrigem:
                "TB_DIARIO_ITENS",

              idRegistro:
                idItem,

              idItemDiario:
                idItem,

              idDiario,

              idObra
            },

            statusSync:
              "PENDENTE",

            tentativas:
              0,

            criadoEm:
              agora
          };

          storeFila.put(
            tombstone
          );

          return tombstone;
        };


      const criarTombstoneDiario =
        () => {

          const idSyncLocal =
            gerarIdSyncDelete(
              "DIARIO"
            );

          const agora =
            new Date()
              .toISOString();

          const tombstone = {
            idSyncLocal,

            tipo:
              "DELETE",

            operacao:
              "DELETE",

            entidade:
              "DIARIO",

            storeOrigem:
              "TB_DIARIOS",

            idRegistro:
              idDiario,

            idObra,

            idDiario,

            payloadExclusao: {
              entidade:
                "DIARIO",

              storeOrigem:
                "TB_DIARIOS",

              idRegistro:
                idDiario,

              idDiario,

              idObra
            },

            statusSync:
              "PENDENTE",

            tentativas:
              0,

            criadoEm:
              agora
          };

          storeFila.put(
            tombstone
          );

          return tombstone;
        };


      const processar =
        () => {

          if (
            processamentoIniciado ||
            !Array.isArray(
              itensCarregados
            ) ||
            !Array.isArray(
              filaCarregada
            )
          ) {
            return;
          }

          processamentoIniciado =
            true;

          try {

            // ==========================================
            // ITENS VINCULADOS AO DIÁRIO
            // ==========================================

            const itensDoDiario =
              itensCarregados.filter(
                item => {

                  return (
                    normalizar(
                      item.idDiario
                    ) ===
                      idDiario &&

                    normalizar(
                      item.idObra
                    ) ===
                      idObra
                  );
                }
              );

            resultado
              .totalItensVinculados =
              itensDoDiario.length;


            itensDoDiario.forEach(
              item => {

                const idItem =
                  normalizar(
                    item.idItemDiario ||
                    item.idItem
                  );

                if (!idItem) {
                  throw new Error(
                    "Foi encontrado um item sem ID " +
                    "vinculado ao Diário."
                  );
                }

                const relacionadas =
                  obterPendenciasRelacionadas(
                    "TB_DIARIO_ITENS",
                    idItem
                  );

                resultado
                  .upsertsItensCancelados +=
                  cancelarUpsertsPendentes(
                    relacionadas,
                    "DIARIO_EXCLUIDO_LOCALMENTE"
                  );

                const jaSincronizado =
                  possuiHistoricoSincronizado(
                    item,
                    relacionadas
                  );

                if (jaSincronizado) {

                  resultado
                    .itensSincronizados++;

                  const deletePendente =
                    localizarDeletePendente(
                      relacionadas
                    );

                  if (deletePendente) {

                    resultado
                      .tombstonesItensReutilizados++;

                  } else {

                    criarTombstoneItem(
                      item
                    );

                    resultado
                      .tombstonesItensCriados++;
                  }
                }

                storeItens.delete(
                  idItem
                );

                resultado
                  .itensRemovidos++;
              }
            );


            // ==========================================
            // CABEÇALHO DO DIÁRIO
            // ==========================================

            const filaDiario =
              obterPendenciasRelacionadas(
                "TB_DIARIOS",
                idDiario
              );

            resultado
              .upsertDiarioCancelado =
              cancelarUpsertsPendentes(
                filaDiario,
                "DIARIO_EXCLUIDO_LOCALMENTE"
              );

            resultado
              .diarioSincronizado =
              possuiHistoricoSincronizado(
                diario,
                filaDiario
              );

            if (
              resultado.diarioSincronizado
            ) {

              const deletePendente =
                localizarDeletePendente(
                  filaDiario
                );

              if (deletePendente) {

                resultado
                  .tombstoneDiarioReutilizado =
                  true;

              } else {

                criarTombstoneDiario();

                resultado
                  .tombstoneDiarioCriado =
                  true;
              }
            }

            storeDiarios.delete(
              idDiario
            );

            resultado.diarioRemovido =
              true;

          } catch (erro) {
            abortar(erro);
          }
        };


      const requestItens =
        storeItens.getAll();

      const requestFila =
        storeFila.getAll();


      requestItens.onsuccess =
        () => {

          itensCarregados =
            Array.isArray(
              requestItens.result
            )
              ? requestItens.result
              : [];

          processar();
        };

      requestItens.onerror =
        () => {

          abortar(
            requestItens.error ||
            new Error(
              "Não foi possível carregar os itens do Diário."
            )
          );
        };


      requestFila.onsuccess =
        () => {

          filaCarregada =
            Array.isArray(
              requestFila.result
            )
              ? requestFila.result
              : [];

          processar();
        };

      requestFila.onerror =
        () => {

          abortar(
            requestFila.error ||
            new Error(
              "Não foi possível carregar a fila."
            )
          );
        };


      transaction.oncomplete =
        () => {

          resolve(
            resultado
          );
        };

      transaction.onerror =
        () => {

          reject(
            erroOperacao ||
            transaction.error ||
            new Error(
              "Falha na transação de exclusão do Diário."
            )
          );
        };

      transaction.onabort =
        () => {

          reject(
            erroOperacao ||
            transaction.error ||
            new Error(
              "A exclusão do Diário foi cancelada."
            )
          );
        };
    }
  );
}

// =====================================================
// EXCLUIR DIÁRIO OFFLINE — UX.19
// =====================================================
async function excluirDiarioOffline_(
  idDiario
) {

  try {

    const idDiarioNormalizado =
      String(
        idDiario || ""
      ).trim();

    if (!idDiarioNormalizado) {
      throw new Error(
        "ID do Diário não informado."
      );
    }


    // ================================================
    // OBRA ATIVA
    // ================================================

    const obraAtiva =
      String(
        await obterObraAtivaMobile_() ||
        localStorage.getItem(
          "obraAtiva"
        ) ||
        ""
      ).trim();

    if (!obraAtiva) {
      throw new Error(
        "Nenhuma obra ativa encontrada."
      );
    }


    // ================================================
    // LOCALIZAR DIÁRIO E ITENS
    // ================================================

    const [
      diarios,
      itens
    ] = await Promise.all([
      listarRegistrosSIGO(
        "TB_DIARIOS"
      ),

      listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      )
    ]);

    const diario =
      diarios.find(item => {

        return (
          String(
            item.idDiario || ""
          ).trim() ===
            idDiarioNormalizado &&

          String(
            item.idObra || ""
          ).trim() ===
            obraAtiva
        );
      }) || null;

    if (!diario) {

      SIGOUI.feedback.warning(
        "Diário não encontrado",
        "O registro não pertence à obra ativa ou já foi removido."
      );

      return null;
    }

    const itensDoDiario =
      itens.filter(item => {

        return (
          String(
            item.idDiario || ""
          ).trim() ===
            idDiarioNormalizado &&

          String(
            item.idObra || ""
          ).trim() ===
            obraAtiva
        );
      });


    // ================================================
    // CONFIRMAÇÃO
    // ================================================

    const dataDiario =
      diario.data ||
      diario.dataDiario ||
      "sem data";

    const totalItens =
      itensDoDiario.length;

    const confirmou =
      await SIGOUI.feedback.confirm({
        tipo:
          "danger",

        icone:
          "🗑️",

        titulo:
          "Excluir Diário",

        mensagem:
          "Diário: " +
          dataDiario +
          "\n" +
          "Itens vinculados: " +
          totalItens +
          "\n\n" +
          "O Diário e todos os itens vinculados serão " +
          "removidos deste dispositivo.\n\n" +
          "Os registros que já foram sincronizados serão " +
          "excluídos do SIGO na próxima sincronização.",

        textoConfirmar:
          "Excluir Diário",

        textoCancelar:
          "Cancelar"
      });

    if (!confirmou) {
      return null;
    }


    // ================================================
    // EXCLUSÃO ATÔMICA
    // ================================================

    const resultado =
      await excluirDiarioComItensFilaAtomicaSIGO_(
        diario
      );


    // ================================================
    // INVALIDAR CACHES
    // ================================================

    const storesAlteradas = [
      "TB_DIARIOS",
      "TB_DIARIO_ITENS",
      "TB_SYNC_QUEUE"
    ];

    storesAlteradas.forEach(
      storeName => {

        if (
          window.SIGODataCache
        ) {
          SIGODataCache.invalidate(
            storeName
          );
        }

        if (
          typeof invalidarCacheObraSIGO_ ===
          "function"
        ) {
          invalidarCacheObraSIGO_(
            storeName,
            obraAtiva
          );
        }
      }
    );


    // ================================================
    // ENCERRAR CONTEXTOS DE EDIÇÃO
    // ================================================

    if (
      typeof idItemDiarioEdicao !==
        "undefined"
    ) {
      idItemDiarioEdicao =
        null;
    }

    if (
      typeof idDiarioEdicao !==
        "undefined" &&
      String(
        idDiarioEdicao || ""
      ) ===
        idDiarioNormalizado
    ) {
      idDiarioEdicao =
        null;
    }

    if (
      typeof atualizarModoEdicaoItemDiario_ ===
      "function"
    ) {
      atualizarModoEdicaoItemDiario_();
    }

    if (
      typeof atualizarModoEdicaoDiario_ ===
      "function"
    ) {
      atualizarModoEdicaoDiario_();
    }


    // ================================================
    // LIMPAR DIÁRIO ATIVO
    // ================================================

    if (
      typeof obterDiarioAtivoSIGO_ ===
        "function" &&
      String(
        obterDiarioAtivoSIGO_(
          obraAtiva
        ) || ""
      ) ===
        idDiarioNormalizado &&
      typeof limparDiarioAtivoSIGO_ ===
        "function"
    ) {
      limparDiarioAtivoSIGO_(
        obraAtiva
      );
    }


    // ================================================
    // LIMPAR FORMULÁRIOS
    // ================================================

    if (
      typeof limparFormularioItemDiario ===
        "function"
    ) {
      await limparFormularioItemDiario();
    }

    if (
      typeof limparFormularioDiario ===
        "function"
    ) {
      await limparFormularioDiario();
    }


    // ================================================
    // NOTIFICAR DATABINDING
    // ================================================

    if (
      window.SIGODataBinding &&
      typeof SIGODataBinding.notify ===
        "function"
    ) {

      await SIGODataBinding.notify(
        "TB_DIARIO_ITENS",
        {
          acao:
            "DELETE",

          store:
            "TB_DIARIO_ITENS",

          idObra:
            obraAtiva,

          idDiario:
            idDiarioNormalizado
        }
      );

      await SIGODataBinding.notify(
        "TB_DIARIOS",
        {
          acao:
            "DELETE",

          store:
            "TB_DIARIOS",

          chave:
            idDiarioNormalizado,

          idObra:
            obraAtiva
        }
      );

      await SIGODataBinding.notify(
        "TB_SYNC_QUEUE",
        {
          acao:
            "UPDATE",

          store:
            "TB_SYNC_QUEUE",

          idObra:
            obraAtiva,

          idDiario:
            idDiarioNormalizado
        }
      );
    }


    // ================================================
    // ATUALIZAR INTERFACE
    // ================================================

    if (
      typeof carregarListaDiariosOffline ===
        "function"
    ) {
      await carregarListaDiariosOffline();
    }

    if (
      typeof listarItensDiarioOffline_ ===
        "function"
    ) {
      await listarItensDiarioOffline_();
    }

    if (
      typeof atualizarContextoDiarioAtivoUX19_ ===
        "function"
    ) {
      await atualizarContextoDiarioAtivoUX19_();
    }

    if (
      typeof atualizarIndicadoresMobile_ ===
        "function"
    ) {
      await atualizarIndicadoresMobile_();
    }

    if (
      typeof atualizarHeroObraAtivaMobile_ ===
        "function"
    ) {
      await atualizarHeroObraAtivaMobile_();
    }


    // ================================================
    // RETORNO VISUAL
    // ================================================

    const totalTombstones =
      resultado
        .tombstonesItensCriados +

      resultado
        .tombstonesItensReutilizados +

      (
        resultado
          .tombstoneDiarioCriado
          ? 1
          : 0
      ) +

      (
        resultado
          .tombstoneDiarioReutilizado
          ? 1
          : 0
      );

    const mensagem =
      totalTombstones > 0
        ? (
            "Diário e " +
            resultado.itensRemovidos +
            " item(ns) removidos. " +
            totalTombstones +
            " exclusão(ões) aguardam sincronização."
          )
        : (
            "Diário e " +
            resultado.itensRemovidos +
            " item(ns) locais removidos. " +
            "Nenhum DELETE precisou ser enviado."
          );

    SIGOUI.feedback.success(
      "Diário excluído",
      mensagem
    );

    console.log(
      "Exclusão atômica do Diário concluída:",
      resultado
    );

    return resultado;

  } catch (erro) {

    console.error(
      "Erro ao excluir Diário:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro?.message ||
      "Não foi possível excluir o Diário."
    );

    return null;
  }
}

async function sincronizarSIGO() {

  try {

    const obraAtiva =
      String(
        localStorage.getItem(
          "obraAtiva"
        ) ||
        "OBR002"
      ).trim();

    const fila =
      await listarRegistrosSIGO(
        "TB_SYNC_QUEUE"
      );

    // =================================================
    // SOMENTE PENDÊNCIAS DA OBRA ATIVA
    // =================================================
    const pendentesObra =
      fila.filter(item => {

        return (
          String(
            item.statusSync || ""
          )
            .trim()
            .toUpperCase() ===
            "PENDENTE" &&

          String(
            item.idObra || ""
          ).trim() ===
            obraAtiva
        );
      });

    if (
      pendentesObra.length === 0
    ) {

      SIGOUI.feedback.info(
        "Tudo sincronizado",
        "Não há registros pendentes para esta obra."
      );

      return;
    }

    const exclusoesPendentes =
      pendentesObra.filter(
        ehPendenciaDeleteSIGO_
      );

    const lotesNaoSuportados =
      pendentesObra.filter(item => {

        return (
          !ehPendenciaDeleteSIGO_(
            item
          ) &&

          String(
            item.storeOrigem || ""
          ) ===
            "TB_LOTES_MEDICAO"
        );
      });

    const pendenciasRegistros =
      pendentesObra.filter(item => {

        return (
          !ehPendenciaDeleteSIGO_(
            item
          ) &&

          String(
            item.storeOrigem || ""
          ) !==
            "TB_LOTES_MEDICAO"
        );
      });


    // =================================================
    // VERIFICAR SE EXISTE PENDÊNCIA DO REGISTRO
    // =================================================
    const possuiPendencia =
      (
        storeOrigem,
        idRegistro
      ) => {

        return pendenciasRegistros
          .some(pendencia => {

            return (
              String(
                pendencia.storeOrigem ||
                ""
              ) ===
                String(
                  storeOrigem ||
                  ""
                ) &&

              String(
                pendencia.idRegistro ||
                ""
              ) ===
                String(
                  idRegistro ||
                  ""
                )
            );
          });
      };


    // =================================================
    // CARREGAR STORES OPERACIONAIS
    // =================================================
    const diarios =
      await listarRegistrosSIGO(
        "TB_DIARIOS"
      );

    const medicoes =
      await listarRegistrosSIGO(
        "TB_MEDICOES"
      );

    const evidencias =
      await listarRegistrosSIGO(
        "TB_EVIDENCIAS"
      );

    const climas =
      await listarRegistrosSIGO(
        "TB_CLIMA"
      );

    const ocorrencias =
      await listarRegistrosSIGO(
        "TB_OCORRENCIAS"
      );

    const diarioItens =
      await listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      );


    // =================================================
    // REGISTROS A ENVIAR
    // =================================================
    const diariosPendentes =
      diarios.filter(diario => {

        return possuiPendencia(
          "TB_DIARIOS",
          diario.idDiario
        );
      });

    const medicoesPendentes =
      medicoes.filter(medicao => {

        return possuiPendencia(
          "TB_MEDICOES",
          medicao.idMedicao
        );
      });

    const evidenciasPendentes =
      evidencias.filter(evidencia => {

        return possuiPendencia(
          "TB_EVIDENCIAS",
          evidencia.idEvidencia
        );
      });

    const climasPendentes =
      climas.filter(clima => {

        return possuiPendencia(
          "TB_CLIMA",
          clima.idClima
        );
      });

    const ocorrenciasPendentes =
      ocorrencias.filter(
        ocorrencia => {

          return possuiPendencia(
            "TB_OCORRENCIAS",
            ocorrencia.idOcorrencia
          );
        }
      );

    const diarioItensPendentes =
      diarioItens.filter(
        itemDiario => {

          const idItem =
            itemDiario.idItemDiario ||
            itemDiario.idItem;

          return possuiPendencia(
            "TB_DIARIO_ITENS",
            idItem
          );
        }
      );


    // =================================================
    // TOMBSTONES
    //
    // Ordem:
    // 1. itens dos Diários;
    // 2. cabeçalhos dos Diários.
    // =================================================
    
    const exclusoes =
      exclusoesPendentes
        .map(
          montarTombstoneFilaSIGO_
        )
        .sort(
          (a, b) => {
    
            const prioridade =
              exclusao => {
    
                if (
                  exclusao.storeOrigem ===
                  "TB_DIARIO_ITENS"
                ) {
                  return 1;
                }
    
                if (
                  exclusao.storeOrigem ===
                  "TB_DIARIOS"
                ) {
                  return 2;
                }
    
                return 99;
              };
    
            return (
              prioridade(a) -
              prioridade(b)
            );
          }
        );
    
    
    const storesExclusaoPermitidas =
      new Set([
        "TB_DIARIO_ITENS",
        "TB_DIARIOS"
      ]);
    
    
    exclusoes.forEach(
      exclusao => {
    
        const storeOrigem =
          String(
            exclusao.storeOrigem || ""
          )
            .trim()
            .toUpperCase();
    
        const entidade =
          String(
            exclusao.entidade || ""
          )
            .trim()
            .toUpperCase();
    
        const idRegistro =
          String(
            exclusao.idRegistro || ""
          ).trim();
    
        const idDiario =
          String(
            exclusao.idDiario || ""
          ).trim();
    
        const idObra =
          String(
            exclusao.idObra || ""
          ).trim();
    
    
        // ==========================================
        // STORE SUPORTADA
        // ==========================================
    
        if (
          !storesExclusaoPermitidas
            .has(
              storeOrigem
            )
        ) {
    
          throw new Error(
            "Exclusão ainda não suportada para a store " +
            storeOrigem +
            "."
          );
        }
    
    
        // ==========================================
        // CAMPOS OBRIGATÓRIOS
        // ==========================================
    
        if (
          !idRegistro ||
          !idObra
        ) {
    
          throw new Error(
            "Tombstone sem ID do registro ou ID da obra."
          );
        }
    
        if (!idDiario) {
    
          throw new Error(
            "Tombstone sem ID do Diário."
          );
        }
    
    
        // ==========================================
        // COMPATIBILIDADE ENTRE STORE E ENTIDADE
        // ==========================================
    
        if (
          storeOrigem ===
            "TB_DIARIO_ITENS" &&
          entidade !==
            "DIARIO_ITEM"
        ) {
    
          throw new Error(
            "Entidade incompatível com TB_DIARIO_ITENS: " +
            entidade
          );
        }
    
        if (
          storeOrigem ===
            "TB_DIARIOS" &&
          entidade !==
            "DIARIO"
        ) {
    
          throw new Error(
            "Entidade incompatível com TB_DIARIOS: " +
            entidade
          );
        }
    
    
        // ==========================================
        // CABEÇALHO: ID_REGISTRO = ID_DIARIO
        // ==========================================
    
        if (
          storeOrigem ===
            "TB_DIARIOS" &&
          idRegistro !==
            idDiario
        ) {
    
          throw new Error(
            "Conflito entre idRegistro e idDiario " +
            "no tombstone do Diário."
          );
        }
      }
    );
         


    // =================================================
    // IDENTIFICAR QUAIS PENDÊNCIAS ENTRARAM NO PACOTE
    // =================================================
    const chavesEnviadas =
      new Set();

    diariosPendentes.forEach(
      registro => {

        chavesEnviadas.add(
          criarChavePendenciaSyncSIGO_(
            "TB_DIARIOS",
            registro.idDiario
          )
        );
      }
    );

    diarioItensPendentes.forEach(
      registro => {

        chavesEnviadas.add(
          criarChavePendenciaSyncSIGO_(
            "TB_DIARIO_ITENS",
            registro.idItemDiario ||
            registro.idItem
          )
        );
      }
    );

    medicoesPendentes.forEach(
      registro => {

        chavesEnviadas.add(
          criarChavePendenciaSyncSIGO_(
            "TB_MEDICOES",
            registro.idMedicao
          )
        );
      }
    );

    ocorrenciasPendentes.forEach(
      registro => {

        chavesEnviadas.add(
          criarChavePendenciaSyncSIGO_(
            "TB_OCORRENCIAS",
            registro.idOcorrencia
          )
        );
      }
    );

    climasPendentes.forEach(
      registro => {

        chavesEnviadas.add(
          criarChavePendenciaSyncSIGO_(
            "TB_CLIMA",
            registro.idClima
          )
        );
      }
    );

    evidenciasPendentes.forEach(
      registro => {

        chavesEnviadas.add(
          criarChavePendenciaSyncSIGO_(
            "TB_EVIDENCIAS",
            registro.idEvidencia
          )
        );
      }
    );

    const pendenciasRegistrosEnviadas =
      pendenciasRegistros.filter(
        pendencia => {

          return chavesEnviadas.has(
            criarChavePendenciaSyncSIGO_(
              pendencia.storeOrigem,
              pendencia.idRegistro
            )
          );
        }
      );

    const pendenciasEnviadas = [
      ...pendenciasRegistrosEnviadas,
      ...exclusoesPendentes
    ];


    if (
      pendenciasEnviadas.length === 0
    ) {

      SIGOUI.feedback.warning(
        "Nada enviado",
        "As pendências não possuem registros de origem elegíveis."
      );

      return;
    }


    // =================================================
    // PACOTE DA API
    // =================================================
    const payload = {
      token:
        SIGO_TOKEN_OFFLINE,

      idDispositivo:
        "WEB-MOBILE-001",

      idUsuario:
        "USUARIO_APP",

      idObra:
        obraAtiva,

      dataEnvio:
        new Date().toISOString(),

      pacote: {
        diarios:
          diariosPendentes,

        diarioItens:
          diarioItensPendentes,

        lotesMedicao: [],

        medicoes:
          medicoesPendentes,

        ocorrencias:
          ocorrenciasPendentes,

        clima:
          climasPendentes,

        evidencias:
          evidenciasPendentes,

        exclusoes
      }
    };

    console.log(
      "Enviando para API SIGO:",
      payload
    );

    const resposta =
      await fetch(
        SIGO_API_URL,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );

    const resultado =
      await resposta.json();

    console.log(
      "Resposta API SIGO:",
      resultado
    );

    if (
      resultado.status !== "OK"
    ) {
      throw new Error(
        resultado.mensagem ||
        "Erro na API SIGO."
      );
    }


    // =================================================
    // MARCAR SOMENTE O QUE FOI ENVIADO
    // =================================================
    const dataSync =
      new Date().toISOString();

    for (
      const pendencia of
      pendenciasEnviadas
    ) {

      pendencia.statusSync =
        "SINCRONIZADO";

      pendencia.dataSync =
        dataSync;

      await atualizarRegistroSIGO(
        "TB_SYNC_QUEUE",
        pendencia
      );
    }


    const marcarRegistroSincronizado =
      async (
        store,
        registro
      ) => {

        registro.statusSync =
          "SINCRONIZADO";

        registro.dataSync =
          dataSync;

        await atualizarRegistroSIGO(
          store,
          registro
        );
      };


    for (
      const diario of
      diariosPendentes
    ) {
      await marcarRegistroSincronizado(
        "TB_DIARIOS",
        diario
      );
    }

    for (
      const medicao of
      medicoesPendentes
    ) {
      await marcarRegistroSincronizado(
        "TB_MEDICOES",
        medicao
      );
    }

    for (
      const evidencia of
      evidenciasPendentes
    ) {
      await marcarRegistroSincronizado(
        "TB_EVIDENCIAS",
        evidencia
      );
    }

    for (
      const clima of
      climasPendentes
    ) {
      await marcarRegistroSincronizado(
        "TB_CLIMA",
        clima
      );
    }

    for (
      const ocorrencia of
      ocorrenciasPendentes
    ) {
      await marcarRegistroSincronizado(
        "TB_OCORRENCIAS",
        ocorrencia
      );
    }

    for (
      const itemDiario of
      diarioItensPendentes
    ) {

      await marcarRegistroSincronizado(
        "TB_DIARIO_ITENS",
        itemDiario
      );

      const idItem =
        itemDiario.idItemDiario ||
        itemDiario.idItem;

      if (
        typeof idItemDiarioEdicao !==
          "undefined" &&
        idItemDiarioEdicao &&
        String(
          idItemDiarioEdicao
        ) ===
          String(idItem)
      ) {

        encerrarModoEdicaoItemDiario_();
      }
    }


    // =================================================
    // ATUALIZAR INTERFACE
    // =================================================
    await atualizarIndicadoresMobile_();
    await carregarListaDiariosOffline();
    await listarMedicoesOffline_();
    await listarEvidenciasOffline_();
    await listarClimasOffline_();
    await listarOcorrenciasOffline_();
    await listarItensDiarioOffline_();

    if (
      typeof atualizarContextoDiarioAtivoUX19_ ===
      "function"
    ) {
      await atualizarContextoDiarioAtivoUX19_();
    }

    if (
      typeof navegarPara ===
        "function" &&
      document.getElementById(
        "listaMedicoesOffline"
      )
    ) {
      navegarPara(
        "medicoes"
      );
    }

    localStorage.setItem(
      "SIGO_ULTIMA_SYNC",
      new Date()
        .toLocaleString("pt-BR")
    );

    await atualizarPainelSaudeSync_();


    // =================================================
    // RESUMO
    // =================================================
    const resumoSync = {
      total:
        pendenciasEnviadas.length,

      diarios:
        diariosPendentes.length,

      itensDiario:
        diarioItensPendentes.length,

      exclusoes:
        exclusoes.length,

      lotesMedicao: 0,

      medicoes:
        medicoesPendentes.length,

      ocorrencias:
        ocorrenciasPendentes.length,

      climas:
        climasPendentes.length,

      evidencias:
        evidenciasPendentes.length,

      naoEnviadas:
        pendentesObra.length -
        pendenciasEnviadas.length
    };

    const detalhesSync = [
      resumoSync.diarios
        ? `${resumoSync.diarios} diário(s)`
        : "",

      resumoSync.itensDiario
        ? `${resumoSync.itensDiario} item(ns) do diário`
        : "",

      resumoSync.exclusoes
        ? `${resumoSync.exclusoes} exclusão(ões)`
        : "",

      resumoSync.medicoes
        ? `${resumoSync.medicoes} medição(ões)`
        : "",

      resumoSync.ocorrencias
        ? `${resumoSync.ocorrencias} ocorrência(s)`
        : "",

      resumoSync.climas
        ? `${resumoSync.climas} registro(s) climático(s)`
        : "",

      resumoSync.evidencias
        ? `${resumoSync.evidencias} evidência(s)`
        : ""
    ]
      .filter(Boolean)
      .join(", ");

    if (
      typeof registrarEventoSIGO_ ===
      "function"
    ) {

      await registrarEventoSIGO_({
        evento:
          "SYNC_CONCLUIDO",

        dados: {
          ...resumoSync,

          mensagem:
            `${resumoSync.total} registro(s) ` +
            `sincronizado(s) com sucesso` +
            (
              detalhesSync
                ? `: ${detalhesSync}.`
                : "."
            )
        }
      });
    }

    SIGOUI.feedback.success(
      "Sincronização concluída",
      `${resumoSync.total} registro(s) enviado(s) ao SIGO.`
    );

    if (
      lotesNaoSuportados.length > 0
    ) {

      console.warn(
        lotesNaoSuportados.length +
        " lote(s) de medição permaneceram pendentes."
      );
    }

    return {
      status: "OK",
      resumo: resumoSync,
      detalhes:
        resultado.detalhes || {}
    };

  } catch (erro) {

    console.error(
      "Erro ao sincronizar com API SIGO:",
      erro
    );

    const mensagemErro =
      erro?.message ||
      "Não foi possível sincronizar com o SIGO.";

    if (
      typeof registrarEventoSIGO_ ===
      "function"
    ) {

      await registrarEventoSIGO_({
        evento:
          "SYNC_ERRO",

        dados: {
          mensagem:
            mensagemErro,

          message:
            mensagemErro,

          ocorridoEm:
            new Date()
              .toISOString()
        }
      });
    }

    SIGOUI.feedback.error(
      "Erro de sincronização",
      mensagemErro
    );

    return {
      status: "ERRO",
      mensagem: mensagemErro
    };
  }
}

async function sincronizarDadosBaseObraMobile() {
  try {
    const obraAtiva =
      localStorage.getItem("obraAtiva") ||
      "OBR002";

    const payload = {
      token: SIGO_TOKEN_OFFLINE,
      acao: "OBTER_DADOS_BASE_OBRA",
      idDispositivo: "WEB-MOBILE-001",
      idUsuario: "USUARIO_APP",
      idObra: obraAtiva,
      dataSolicitacao: new Date().toISOString()
    };

    console.log(
      "Solicitando dados-base da obra:",
      payload
    );

    const resposta = await fetch(
      SIGO_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      }
    );

    const resultado =
      await resposta.json();

    console.log(
      "Dados-base recebidos:",
      resultado
    );

    if (resultado.status !== "OK") {
      throw new Error(
        resultado.mensagem ||
        "Erro ao buscar dados-base."
      );
    }

    const atividades =
      resultado.atividades ||
      resultado.detalhes?.atividades ||
      [];

    if (!Array.isArray(atividades)) {
      throw new Error(
        "A API não retornou uma lista de atividades válida."
      );
    }

    const obrasLocais =
      await listarRegistrosSIGO(
        "TB_OBRAS"
      );

    const jaExiste =
      obrasLocais.some(obra =>
        String(obra.idObra) ===
        String(obraAtiva)
      );

    if (
      !jaExiste &&
      obrasLocais.length >= 3
    ) {
      throw new Error(
        "Limite de 3 obras offline atingido. " +
        "Remova uma obra antes de baixar outra."
      );
    }

    const nomeObra =
      resultado.detalhes?.nomeObra ||
      resultado.nomeObra ||
      obraAtiva;

    const totalAtividades =
      atividades.length;

    console.log(
      "Nome da obra recebido:",
      nomeObra
    );

    console.log(
      "Total de atividades recebidas:",
      totalAtividades
    );

    await salvarRegistroSIGO(
      "TB_OBRAS",
      {
        idObra: obraAtiva,
        nomeObra: nomeObra,
        status: "ATIVA",
        dataSync: new Date().toISOString()
      }
    );

    await removerAtividadesPorObraSIGO_(
      obraAtiva
    );

    for (const atividade of atividades) {
      await salvarRegistroSIGO(
        "TB_ATIVIDADES_OBRA",
        atividade
      );
    }

    await carregarObrasMobile_();

    // =====================================================
    // EVENTO — ATUALIZAÇÃO OU PRIMEIRO DOWNLOAD
    // =====================================================
    if (
      typeof registrarEventoSIGO_ ===
      "function"
    ) {
      if (jaExiste) {
        await registrarEventoSIGO_({
          evento: "BASE_ATUALIZADA",

          dados: {
            idObra: obraAtiva,
            nomeObra: nomeObra,
            totalAtividades:
              totalAtividades,

            mensagem:
              `${totalAtividades} atividade(s) ` +
              `da obra "${nomeObra}" foram ` +
              "atualizadas no dispositivo."
          }
        });

      } else {
        await registrarEventoSIGO_({
          evento: "OBRA_BAIXADA",

          dados: {
            idObra: obraAtiva,
            nomeObra: nomeObra,
            totalAtividades:
              totalAtividades
          }
        });
      }
    }

    if (jaExiste) {
      SIGOUI.feedback.success(
        "Base atualizada",
        `${totalAtividades} atividades ` +
        "sincronizadas para o dispositivo."
      );

    } else {
      SIGOUI.feedback.success(
        "Obra baixada",
        `"${nomeObra}" foi disponibilizada ` +
        "para uso offline."
      );
    }

    return {
      ok: true,

      operacao:
        jaExiste
          ? "ATUALIZACAO_BASE"
          : "DOWNLOAD_OBRA",

      jaExistia: jaExiste,
      idObra: obraAtiva,
      nomeObra: nomeObra,
      totalAtividades:
        totalAtividades
    };

    } catch (erro) {

    console.error(
      "Erro ao sincronizar dados-base da obra:",
      erro
    );

    const mensagemErro =
      erro?.message ||
      "Falha ao atualizar os dados-base da obra.";

    SIGOUI.feedback.error(
      "Erro ao atualizar dados-base",
      mensagemErro
    );

    return {
      ok: false,
      erro: mensagemErro
    };
  }
}
function montarFormularioMedicao_() {
  const obraAtiva =
    obterObraAtivaMobile_();

  const hoje =
    new Date().toISOString().split("T")[0];

  return `
    <div class="sigo-form">

      ${SIGOUI.createDate({
        id: "medicaoData",
        label: "Data",
        value: hoje
      })}

      ${SIGOUI.createInput({
        id: "medicaoObra",
        label: "Obra",
        value: obraAtiva,
        readonly: true
      })}

      ${SIGOUI.createSelect({
        id: "medicaoAtividade",
        label: "Atividade",
        options: [
          { value: "", label: "Selecione uma atividade" }
        ],
        onchange: "preencherDadosAtividadeMedicao()"
      })}

       ${SIGOUI.createInput({
        id: "medicaoEAP",
        label: "EAP",
        readonly: true
      })}

      ${SIGOUI.createInput({
        id: "medicaoServico",
        label: "Serviço",
        readonly: true
      })}

      ${SIGOUI.createNumber({
        id: "medicaoQtdePlanejada",
        label: "Quantidade planejada",
        readonly: true
      })}

      ${SIGOUI.createNumber({
        id: "medicaoQtdeExecutada",
        label: "Quantidade executada",
        step: "0.01",
        oninput: "calcularPercentualMedicao()"
      })}

      ${SIGOUI.createInput({
        id: "medicaoUnidade",
        label: "Unidade",
        readonly: true
      })}

      ${SIGOUI.createNumber({
        id: "medicaoPercentual",
        label: "% Executado",
        readonly: true
      })}

      ${SIGOUI.createInput({
        id: "medicaoResponsavel",
        label: "Responsável",
        placeholder: "Nome do responsável"
      })}

      ${SIGOUI.createTextarea({
        id: "medicaoObservacao",
        label: "Observação",
        rows: 3,
        placeholder: "Observações da medição"
      })}

    </div>
  `;
}

async function preencherDadosAtividadeMedicao() {
  const select = document.getElementById("medicaoAtividade");
  const idAtividade = select.value;

  if (!idAtividade) return;

  const atividades = await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const atividadeBase = atividades.find(item =>
    String(item.idAtividade) === String(idAtividade) ||
    String(item.eap) === String(idAtividade)
  );

 if (!atividadeBase) {

    SIGOUI.feedback.warning(
      "Atualização necessária",
      "Atualize os dados-base da obra para continuar."
    );
  
    return;
  }

  document.getElementById("medicaoServico").value =
    atividadeBase.servico || "";

  document.getElementById("medicaoQtdePlanejada").value =
    Number(atividadeBase.qtdePlanejada || 0);

  document.getElementById("medicaoUnidade").value =
    atividadeBase.unidade || "";
  
  const campoEAP =
    document.getElementById("medicaoEAP");
  
  if (campoEAP) {
    campoEAP.value =
      atividadeBase.eap || "";
  }

  calcularPercentualMedicao();
}

function calcularPercentualMedicao() {
  const qtdePlanejada =
    Number(document.getElementById("medicaoQtdePlanejada").value || 0);

  const qtdeExecutada =
    Number(document.getElementById("medicaoQtdeExecutada").value || 0);

  const campoPercentual =
    document.getElementById("medicaoPercentual");

  if (!qtdePlanejada || qtdePlanejada <= 0) {
    campoPercentual.value = 0;
    return;
  }

  const percentual =
    (qtdeExecutada / qtdePlanejada) * 100;

  campoPercentual.value =
    percentual.toFixed(2);
}

async function carregarAtividadesMedicaoOffline_() {
  const select = document.getElementById("medicaoAtividade");

  if (!select) return;

  const obraAtiva =
    obterObraAtivaMobile_();
  
  const atividadesTodas =
    await listarRegistrosSIGO(
      "TB_ATIVIDADES_OBRA"
    );
  
  const atividades =
    atividadesTodas.filter(item =>
      String(item.idObra) ===
      String(obraAtiva)
    );
  select.innerHTML = '<option value="">Selecione uma atividade</option>';

  atividades.forEach(item => {
    const option = document.createElement("option");

    option.value = item.idAtividade;
    option.textContent =
      item.eap + " - " + item.servico;

    select.appendChild(option);
  });
}


async function salvarMedicaoOffline(event) {
  event.preventDefault();

  
  
  const loteAberto =
    await obterLoteMedicaoAberto_();

   if (!loteAberto) {
      SIGOUI.feedback.warning(
        "Nenhuma medição aberta",
        "Clique em Nova Medição para definir o período antes de salvar itens."
      );
  
      return;
    }

  const hoje =
    new Date().toISOString().split("T")[0];
  
  if (
    loteAberto.dataFim &&
    String(loteAberto.dataFim) < String(hoje)
  ) {
    await fecharLotesVencidosMedicao_();
  
    SIGOUI.feedback.warning(
      "Medição encerrada",
      "O período desta medição venceu. Crie uma nova medição para continuar."
    );
  
    navegarPara("medicoes");
  
    return;
  }

  if (!loteAberto) {

    SIGOUI.feedback.warning(
      "Nenhuma medição aberta",
      "Crie uma nova medição antes de registrar itens."
    );

    return;
  }
  const medicao = {
    idMedicao: "MED-" + Date.now(),

    idLoteMedicao:
      loteAberto.idLoteMedicao,
    
    numeroMedicao:
      loteAberto.numeroMedicao,
    
    data: document.getElementById("medicaoData").value,
    idObra: obterObraAtivaMobile_(),
    atividade: document.getElementById("medicaoAtividade").value,
    eap: document.getElementById("medicaoEAP").value,
    servico: document.getElementById("medicaoServico").value,
    qtdePlanejada: Number(document.getElementById("medicaoQtdePlanejada").value || 0),
    qtdeExecutada: Number(document.getElementById("medicaoQtdeExecutada").value || 0),
    un: document.getElementById("medicaoUnidade").value,
    percentualExecutado: Number(document.getElementById("medicaoPercentual").value || 0),
    responsavel: localStorage.getItem("usuarioSIGO") || "",
    observacao: document.getElementById("medicaoObservacao").value,
    statusMedicao: "MEDIDO",
    statusSync: "PENDENTE",
    origem: "APP_OFFLINE",

    excessoDetectado: "NAO",
    excessoAutorizado: "NAO",
    justificativaExcesso: "",
    
    criadoEm: new Date().toISOString()
  };

  try {
    await validarSaldoOfflineMedicao_(medicao);
    
    await salvarRegistroSIGO("TB_MEDICOES", medicao);

    await adicionarNaFilaSyncSIGO({
      tipo: "MEDICAO",
      storeOrigem: "TB_MEDICOES",
      idRegistro: medicao.idMedicao,
      idObra: medicao.idObra
    });

    await atualizarIndicadoresMobile_();
    await listarMedicoesOffline_();
    
    // =====================================================
    // NOTIFICAÇÃO — NOVA MEDIÇÃO SALVA
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "MEDICAO_SALVA",
        dados: medicao
      });
    }
    
    navegarPara("medicoes");
    
    SIGOUI.feedback.success(
      "Medição salva",
      "Medição salva offline no banco local."
    );

    console.log("Medição salva no IndexedDB:", medicao);

  } catch (erro) {
    console.error("Erro ao salvar medição:", erro);
    SIGOUI.feedback.error(
  "Erro ao salvar medição",
  erro.message || "Não foi possível salvar a medição offline."
);
  }
}

async function validarSaldoOfflineMedicao_(medicao) {

  const atividades = await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const atividadeBase = atividades.find(item =>
    String(item.idAtividade) === String(medicao.atividade) ||
    String(item.eap) === String(medicao.eap)
  );

  if (!atividadeBase) {
    throw new Error(
      "Atividade não encontrada nos dados-base offline. Atualize os dados-base da obra."
    );
  }

  const medicoesOffline = await listarRegistrosSIGO("TB_MEDICOES");

  const totalJaMedidoOffline = medicoesOffline
    .filter(item =>
      String(item.idObra) === String(medicao.idObra) &&
      (
        String(item.atividade) === String(medicao.atividade) ||
        String(item.eap) === String(medicao.eap)
      ) &&
      item.idMedicao !== medicao.idMedicao
    )
    .reduce((total, item) => {
      return total + Number(item.qtdeExecutada || 0);
    }, 0);

  const saldoBase = Number(atividadeBase.qtdePlanejada || 0);
  const saldoDisponivelAtual = saldoBase - totalJaMedidoOffline;
  const qtdeExecutada = Number(medicao.qtdeExecutada || 0);

  if (qtdeExecutada <= 0) {
    throw new Error("Informe uma quantidade executada maior que zero.");
  }

  medicao.qtdePlanejada = Number(atividadeBase.qtdePlanejada || 0);
  medicao.un = atividadeBase.unidade || medicao.un;
  medicao.servico = atividadeBase.servico || medicao.servico;

  const totalExecutadoAcumulado =
  totalJaMedidoOffline + qtdeExecutada;

  const percentualExecutadoAcumulado =
    saldoBase > 0
      ? (totalExecutadoAcumulado / saldoBase) * 100
      : 0;
  
  medicao.saldoBaseOffline = saldoBase;
  medicao.totalJaMedidoOffline = totalJaMedidoOffline;
  medicao.qtdeExecutadaAcumulada = totalExecutadoAcumulado;
  medicao.percentualExecutadoAcumulado = percentualExecutadoAcumulado;
  medicao.saldoDisponivelAntes = saldoDisponivelAtual;
  medicao.saldoDisponivelDepois = saldoDisponivelAtual - qtdeExecutada;
  medicao.validacaoSaldoOffline = "OK";

  medicao.excessoDetectado = "NAO";
  medicao.excessoAutorizado = "NAO";
  medicao.justificativaExcesso = "";

 if (
    saldoDisponivelAtual <= 0 ||
    qtdeExecutada > saldoDisponivelAtual
  ) {

   const justificativa = await SIGOUI.feedback.input({
      tipo: "warning",
      icone: "⚠️",
      titulo: "Excesso detectado",
      mensagem:
        `Atividade: ${atividadeBase.servico}
    
    Saldo disponível: ${saldoDisponivelAtual} ${atividadeBase.unidade}
    
    Quantidade informada: ${qtdeExecutada} ${atividadeBase.unidade}
    
    Informe a justificativa para continuar:`,
    
      placeholder: "Digite a justificativa...",
      textoConfirmar: "Continuar",
      textoCancelar: "Cancelar",
      obrigatorio: true
    });

    if (!justificativa) {
      throw new Error(
        "Medição cancelada. Justificativa obrigatória para excesso."
      );
    }

    medicao.excessoDetectado = "SIM";
    medicao.excessoAutorizado = "SIM";
    medicao.justificativaExcesso = justificativa;
  }

  return true;
}

function montarTelaEvidencias_() {

  const obraAtiva =
    localStorage.getItem("obraAtiva") || "OBR002";

  const hoje =
    new Date().toISOString().split("T")[0];

  return `

    <div class="tela-card">

      <button
        class="btn-voltar"
        onclick="voltarHome()">

        ← Voltar

      </button>

      <h2>📎 Evidências</h2>

      <p>
        Registrar fotos e documentos da obra.
      </p>

      <form
        class="formulario"
        onsubmit="salvarEvidenciaOffline(event)">

        <label>Data</label>

        <input
          type="date"
          id="evidenciaData"
          value="${hoje}">

        <label>Obra</label>

        <input
          type="text"
          id="evidenciaObra"
          value="${obraAtiva}"
          readonly>

        <label>Atividade</label>

        <input
          type="text"
          id="evidenciaAtividade"
          placeholder="Ex.: 2.1">

        <label>Descrição</label>

        <textarea
          id="evidenciaDescricao"
          rows="3"
          placeholder="Descrição da evidência"></textarea>

        <label>Arquivo</label>

        <input
          type="file"
          id="evidenciaArquivo"
          accept="image/*,.pdf">

        <button
          type="submit"
          class="btn-salvar">

          Salvar Evidência Offline

        </button>

        <div class="lista-offline">

          <h3>Evidências salvas offline</h3>
        
          <div id="listaEvidenciasOffline">
            Carregando...
          </div>
        
        </div>

      </form>

    </div>

  `;
}

async function converterArquivoBase64_(arquivo) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () =>
      resolve(reader.result);

    reader.onerror = reject;

    reader.readAsDataURL(arquivo);

  });

}

async function salvarEvidenciaPremium() {
  try {
    const inputArquivo =
      document.getElementById("evidenciaArquivo");

    const arquivo =
      inputArquivo && inputArquivo.files
        ? inputArquivo.files[0]
        : null;

    if (!arquivo) {
      throw new Error("Selecione uma foto ou arquivo.");
    }

    const arquivoBase64 =
      await converterArquivoParaBase64_(arquivo);

    const evidencia = {
      idEvidencia: "EVI-" + Date.now(),

      idObra:
        document.getElementById("evidenciaObra").value ||
        obterObraAtivaMobile_(),

      data:
        document.getElementById("evidenciaData").value,

      categoria:
        document.getElementById("evidenciaCategoria").value,

      titulo:
        document.getElementById("evidenciaTitulo").value,

      descricao:
        document.getElementById("evidenciaDescricao").value,

      arquivoNome:
        arquivo.name,

      arquivoTipo:
        arquivo.type,

      arquivoTamanho:
        arquivo.size,

      arquivoBase64:
        arquivoBase64,

      idAtividade:
        document.getElementById("evidenciaAtividade").value || "",

      idDiario:
        "",

      idItemDiario:
        "",

      idMedicao:
        "",

      idOcorrencia:
        "",

      latitude:
        "",

      longitude:
        "",

      statusSync:
        "PENDENTE",

      origem:
        "APP_OFFLINE",

      criadoEm:
        new Date().toISOString(),

      atualizadoEm:
        "",

      dataSync:
        ""
    };

    validarEvidenciaOffline_(evidencia);

    await salvarRegistroSIGO(
      "TB_EVIDENCIAS",
      evidencia
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "INSERT",
      storeOrigem: "TB_EVIDENCIAS",
      idRegistro: evidencia.idEvidencia,
      idObra: evidencia.idObra
    });

    await listarEvidenciasOffline_();

  // =====================================================
  // NOTIFICAÇÃO — NOVA EVIDÊNCIA ANEXADA
  // =====================================================
  if (typeof registrarEventoSIGO_ === "function") {
    await registrarEventoSIGO_({
      evento: "EVIDENCIA_ANEXADA",
      dados: evidencia
    });
  }
  
  limparFormularioEvidencia();
  
  SIGOUI.feedback.success(
    "Evidência salva",
    "Registro salvo offline com sucesso."
  );

  } catch (erro) {
    console.error("Erro ao salvar evidência:", erro);

    SIGOUI.feedback.error(
      "Erro ao salvar",
      erro.message || "Não foi possível salvar a evidência."
    );
  }
}

function converterArquivoParaBase64_(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo."));
    };

    reader.readAsDataURL(arquivo);
  });
}

function validarEvidenciaOffline_(evidencia) {
  if (!evidencia.idObra) {
    throw new Error("Obra ativa não encontrada.");
  }

  if (!evidencia.data) {
    throw new Error("Informe a data da evidência.");
  }

  if (!evidencia.categoria) {
    throw new Error("Informe a categoria da evidência.");
  }

  if (!evidencia.titulo) {
    throw new Error("Informe o título da evidência.");
  }

  if (!evidencia.arquivoBase64) {
    throw new Error("Selecione uma foto ou arquivo.");
  }

  return true;
}

function limparFormularioEvidencia() {
  const hoje =
    new Date().toISOString().split("T")[0];

  const campos = {
    evidenciaData: hoje,
    evidenciaObra: obterObraAtivaMobile_(),
    evidenciaCategoria: "",
    evidenciaTitulo: "",
    evidenciaDescricao: "",
    evidenciaAtividade: "",
    evidenciaOrigem: "APP_OFFLINE"
  };

  Object.keys(campos).forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = campos[id];
    }
  });

  const arquivo =
    document.getElementById("evidenciaArquivo");

  if (arquivo) {
    arquivo.value = "";
  }
}

async function listarEvidenciasOffline_() {

  const container =
    document.getElementById("listaEvidenciasOffline");

  if (!container) return;

  try {

    const obraAtiva =
      obterObraAtivaMobile_();

    const evidencias =
      await listarRegistrosSIGO("TB_EVIDENCIAS");

    const evidenciasObra =
      evidencias
        .filter(item =>
          String(item.idObra) === String(obraAtiva)
        )
        .sort((a, b) =>
          new Date(b.criadoEm) -
          new Date(a.criadoEm)
        );

    if (!evidenciasObra.length) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma evidência registrada.
        </div>
      `;

      return;

    }

    container.innerHTML =
      evidenciasObra
        .map(evidencia =>
          criarCardEvidenciaOffline_(evidencia)
        )
        .join("");

  } catch (erro) {

    console.error(
      "Erro ao listar evidências:",
      erro
    );

    container.innerHTML = `
      <div class="card-vazio">
        Erro ao carregar evidências.
      </div>
    `;

  }

}

function criarCardEvidenciaOffline_(evidencia) {

  const status =
    evidencia.statusSync || "PENDENTE";

  const badge =
    status === "SINCRONIZADO"
      ? "🟢 SINCRONIZADO"
      : status === "ERRO"
        ? "🔴 ERRO"
        : "🟡 PENDENTE";

  const classeStatus =
    status === "SINCRONIZADO"
      ? "success"
      : status === "ERRO"
        ? "danger"
        : "warning";

  const bloqueado =
    status !== "PENDENTE";

  return `

    <article class="evidencia-card">

      <div class="evidencia-card__header">

        <div class="evidencia-thumb">

          ${
            evidencia.arquivoBase64
              ? `<img src="${evidencia.arquivoBase64}" alt="Evidência">`
              : `<span>📷</span>`
          }

        </div>

        <div class="evidencia-info">

          <strong>
            ${evidencia.titulo || "Sem título"}
          </strong>

          <span>
            ${evidencia.categoria || "-"}
          </span>

          <small>
            ${formatarDataMedicao_(evidencia.data)}
          </small>

        </div>

        <span class="badge-sync badge-${classeStatus}">
          ${badge}
        </span>

      </div>

      ${
        evidencia.descricao
          ? `
          <div class="evidencia-card__descricao">
            ${evidencia.descricao}
          </div>
          `
          : ""
      }

      <div class="evidencia-card__actions">

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="editarEvidenciaOffline_('${evidencia.idEvidencia}')">
          ✏ Editar
        </button>

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="excluirEvidenciaOffline_('${evidencia.idEvidencia}')">
          🗑 Excluir
        </button>

        <button
          type="button"
          onclick="detalharEvidenciaOffline_('${evidencia.idEvidencia}')">
          👁 Detalhes
        </button>

      </div>

    </article>

  `;

}

async function detalharEvidenciaOffline_(idEvidencia) {
  try {
    const evidencias =
      await listarRegistrosSIGO("TB_EVIDENCIAS");

    const evidencia =
      evidencias.find(item =>
        String(item.idEvidencia) === String(idEvidencia)
      );

    if (!evidencia) {
      SIGOUI.feedback.warning(
        "Evidência não encontrada",
        "O registro não foi localizado."
      );
      return;
    }

    SIGOUI.showDrawer({
      titulo: "📷 Evidência",
      subtitulo:
        `${evidencia.categoria || "-"} • ${formatarDataMedicao_(evidencia.data)}`,
      conteudo:
        montarDetalhesEvidencia_(evidencia),
      textoFechar: "Fechar"
    });

  } catch (erro) {
    console.error("Erro ao detalhar evidência:", erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível abrir a evidência."
    );
  }
}

function montarDetalhesEvidencia_(evidencia) {
  const status =
    evidencia.statusSync || "PENDENTE";

  let badge = "";
  let classe = "";
  let descricaoStatus = "";

  switch (status) {
    case "SINCRONIZADO":
      badge = "🟢 SINCRONIZADO";
      classe = "success";
      descricaoStatus = "Registro enviado ao SIGO.";
      break;

    case "ERRO":
      badge = "🔴 ERRO";
      classe = "danger";
      descricaoStatus = "Falha na sincronização.";
      break;

    default:
      badge = "🟡 PENDENTE";
      classe = "warning";
      descricaoStatus = "Aguardando sincronização.";
  }

  return `
    <div class="drawer-status">
      <span class="badge-sync badge-${classe}">
        ${badge}
      </span>

      <p class="drawer-status-text">
        ${descricaoStatus}
      </p>
    </div>

    ${
      evidencia.arquivoBase64
        ? `
          <div class="drawer-section" style="border-top:none;padding-top:0;margin-top:0;">
            <img
              src="${evidencia.arquivoBase64}"
              alt="Evidência"
              style="width:100%;border-radius:18px;object-fit:cover;max-height:260px;"
            >
          </div>
        `
        : ""
    }

    <div class="drawer-grid">

      <div class="drawer-kpi">
        <small>Categoria</small>
        <strong>${evidencia.categoria || "-"}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Arquivo</small>
        <strong>${evidencia.arquivoTipo || "-"}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Tamanho</small>
        <strong>${formatarTamanhoArquivo_(evidencia.arquivoTamanho)}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Origem</small>
        <strong>${evidencia.origem || "APP_OFFLINE"}</strong>
      </div>

    </div>

    <div class="drawer-section">
      <h4>Dados da Evidência</h4>

      <div class="drawer-item">
        <span>Data</span>
        <strong>${formatarDataMedicao_(evidencia.data)}</strong>
      </div>

      <div class="drawer-item">
        <span>Obra</span>
        <strong>${evidencia.idObra || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Título</span>
        <strong>${evidencia.titulo || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Atividade</span>
        <strong>${evidencia.idAtividade || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Arquivo</span>
        <strong>${evidencia.arquivoNome || "-"}</strong>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Descrição</h4>

      <p>
        ${evidencia.descricao || "Nenhuma descrição registrada."}
      </p>
    </div>

    <div class="drawer-section">
      <h4>Auditoria</h4>

      <div class="drawer-item">
        <span>ID</span>
        <strong>${evidencia.idEvidencia || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Criado em</span>
        <strong>${formatarDataHoraMedicao_(evidencia.criadoEm)}</strong>
      </div>

      <div class="drawer-item">
        <span>Status Sync</span>
        <strong>${status}</strong>
      </div>

      <div class="drawer-item">
        <span>Versão</span>
        <strong>1.0</strong>
      </div>
    </div>
  `;
}

function formatarTamanhoArquivo_(bytes) {
  const tamanho = Number(bytes || 0);

  if (!tamanho) return "-";

  if (tamanho < 1024) {
    return tamanho + " B";
  }

  if (tamanho < 1024 * 1024) {
    return (tamanho / 1024).toFixed(2) + " KB";
  }

  return (tamanho / (1024 * 1024)).toFixed(2) + " MB";
}

async function editarEvidenciaOffline_(idEvidencia) {

  try {

    const evidencias =
      await listarRegistrosSIGO("TB_EVIDENCIAS");

    const evidencia =
      evidencias.find(item =>
        String(item.idEvidencia) === String(idEvidencia)
      );

    if (!evidencia) {

      SIGOUI.feedback.warning(
        "Evidência não encontrada",
        "O registro não foi localizado."
      );

      return;

    }

    idEvidenciaEdicao = idEvidencia;

    document.getElementById("evidenciaData").value =
      evidencia.data || "";

    document.getElementById("evidenciaObra").value =
      evidencia.idObra || obterObraAtivaMobile_();

    document.getElementById("evidenciaCategoria").value =
      evidencia.categoria || "";

    document.getElementById("evidenciaTitulo").value =
      evidencia.titulo || "";

    document.getElementById("evidenciaDescricao").value =
      evidencia.descricao || "";

    document.getElementById("evidenciaAtividade").value =
      evidencia.idAtividade || "";

    document.getElementById("evidenciaOrigem").value =
      evidencia.origem || "APP_OFFLINE";

    atualizarModoEdicaoEvidencia_();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    SIGOUI.feedback.info(
      "Modo edição",
      "A evidência foi carregada para edição."
    );

  }

  catch (erro) {

    console.error(erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível carregar a evidência."
    );

  }

}

function atualizarModoEdicaoEvidencia_() {

  const botao =
    document.querySelector(".is-success");

  if (!botao) return;

  if (idEvidenciaEdicao) {

    botao.innerHTML =
      "💾 Atualizar";

    botao.setAttribute(
      "onclick",
      "atualizarEvidenciaOffline_()"
    );

  }

  else {

    botao.innerHTML =
      "💾 Salvar";

    botao.setAttribute(
      "onclick",
      "salvarEvidenciaPremium()"
    );

  }

}

async function atualizarEvidenciaOffline_() {

  try {

    if (!idEvidenciaEdicao) {

      throw new Error(
        "Nenhuma evidência em edição."
      );

    }

    const evidencias =
      await listarRegistrosSIGO(
        "TB_EVIDENCIAS"
      );

    const evidenciaAtual =
      evidencias.find(item =>
        String(item.idEvidencia) ===
        String(idEvidenciaEdicao)
      );

    if (!evidenciaAtual) {

      throw new Error(
        "Evidência não encontrada."
      );

    }

    let arquivoBase64 =
      evidenciaAtual.arquivoBase64;

    let arquivoNome =
      evidenciaAtual.arquivoNome;

    let arquivoTipo =
      evidenciaAtual.arquivoTipo;

    let arquivoTamanho =
      evidenciaAtual.arquivoTamanho;

    const inputArquivo =
      document.getElementById(
        "evidenciaArquivo"
      );

    if (
      inputArquivo &&
      inputArquivo.files &&
      inputArquivo.files.length
    ) {

      const arquivo =
        inputArquivo.files[0];

      arquivoBase64 =
        await converterArquivoParaBase64_(
          arquivo
        );

      arquivoNome =
        arquivo.name;

      arquivoTipo =
        arquivo.type;

      arquivoTamanho =
        arquivo.size;

    }

    const evidenciaAtualizada = {

      ...evidenciaAtual,

      data:
        document.getElementById("evidenciaData").value,

      idObra:
        document.getElementById("evidenciaObra").value,

      categoria:
        document.getElementById("evidenciaCategoria").value,

      titulo:
        document.getElementById("evidenciaTitulo").value,

      descricao:
        document.getElementById("evidenciaDescricao").value,

      idAtividade:
        document.getElementById("evidenciaAtividade").value,

      arquivoBase64,

      arquivoNome,

      arquivoTipo,

      arquivoTamanho,

      atualizadoEm:
        new Date().toISOString(),

      statusSync:
        "PENDENTE"

    };

    validarEvidenciaOffline_(
      evidenciaAtualizada
    );

    await salvarRegistroSIGO(
      "TB_EVIDENCIAS",
      evidenciaAtualizada
    );

    console.log("REGISTRANDO UPDATE EVIDÊNCIA NA FILA", evidenciaAtualizada.idEvidencia);

    await adicionarNaFilaSyncSIGO({
      tipo: "UPDATE",
      storeOrigem: "TB_EVIDENCIAS",
      idRegistro: evidenciaAtualizada.idEvidencia,
      idObra: evidenciaAtualizada.idObra
    });

    idEvidenciaEdicao = null;

    atualizarModoEdicaoEvidencia_();

   limparFormularioEvidencia();

    await listarEvidenciasOffline_();
    
    // =====================================================
    // NOTIFICAÇÃO — EVIDÊNCIA ATUALIZADA
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "EVIDENCIA_ATUALIZADA",
        dados: evidenciaAtualizada
      });
    }
    
    SIGOUI.feedback.success(
      "Evidência atualizada",
      "Registro atualizado com sucesso."
    );

  }

  catch (erro) {

    console.error(erro);

    SIGOUI.feedback.error(
      "Erro",
      erro.message
    );

  }

}

async function excluirEvidenciaOffline_(idEvidencia) {
  try {
    if (!idEvidencia) {
      throw new Error("ID da evidência não informado.");
    }

    const evidencias =
      await listarRegistrosSIGO("TB_EVIDENCIAS");

    const evidencia =
      evidencias.find(item =>
        String(item.idEvidencia) === String(idEvidencia)
      );

    if (!evidencia) {
      SIGOUI.feedback.warning(
        "Evidência não encontrada",
        "O registro não foi localizado."
      );
      return;
    }

    const confirmou = await SIGOUI.feedback.confirm({
      tipo: "danger",
      icone: "🗑️",
      titulo: "Excluir evidência",
      mensagem:
        "Esta evidência será removida deste dispositivo.\n\n" +
        "Deseja realmente continuar?",
      textoConfirmar: "Excluir",
      textoCancelar: "Cancelar"
    });

    if (!confirmou) return;

    await removerRegistroSIGO_(
      "TB_EVIDENCIAS",
      idEvidencia
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "DELETE",
      storeOrigem: "TB_EVIDENCIAS",
      idRegistro: idEvidencia,
      idObra: evidencia.idObra
    });

    if (String(idEvidenciaEdicao) === String(idEvidencia)) {
      idEvidenciaEdicao = null;

      atualizarModoEdicaoEvidencia_();

      if (typeof limparFormularioEvidencia === "function") {
        limparFormularioEvidencia();
      }
    }

    await listarEvidenciasOffline_();

    SIGOUI.feedback.success(
      "Evidência excluída",
      "Registro removido com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao excluir evidência:", erro);

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro.message || "Não foi possível excluir a evidência."
    );
  }
}
/*async function salvarEvidenciaOffline(event) {

  event.preventDefault();

  try {

    const arquivo =
      document.getElementById(
        "evidenciaArquivo"
      ).files[0];

    if (!arquivo) {

      SIGOUI.feedback.warning(
        "Arquivo não selecionado",
        "Selecione um arquivo para continuar."
      );
    
      return;
    }

    const base64 =
      await converterArquivoBase64_(
        arquivo
      );

    const evidencia = {

      idEvidencia:
        "EVD-" + Date.now(),

      data:
        document.getElementById(
          "evidenciaData"
        ).value,

     idObra:
        obterObraAtivaMobile_(),

      idAtividade:
        document.getElementById(
          "evidenciaAtividade"
        ).value,

      descricao:
        document.getElementById(
          "evidenciaDescricao"
        ).value,

      nomeArquivo:
        arquivo.name,

      tipoArquivo:
        arquivo.type,

      arquivoBase64:
        base64,

      statusSync:
        "PENDENTE",

      origem:
        "APP_OFFLINE",

      criadoEm:
        new Date().toISOString()

    };

    await salvarRegistroSIGO(
      "TB_EVIDENCIAS",
      evidencia
    );

    await adicionarNaFilaSyncSIGO({

      tipo: "EVIDENCIA",

      storeOrigem:
        "TB_EVIDENCIAS",

      idRegistro:
        evidencia.idEvidencia,

      idObra:
        evidencia.idObra

    });

    await listarEvidenciasOffline_();

    SIGOUI.feedback.success(
        "Evidência salva",
        "Evidência armazenada offline com sucesso"
    );

    console.log(
      "Evidência:",
      evidencia
    );

  } catch (erro) {

    console.error(erro);

    SIGOUI.feedback.error(
      "Erro ao salvar evidência.",
       "Não foi possível salvar evidência offline"
      
    );

  }

}

async function listarEvidenciasOffline_() {

  const container =
    document.getElementById("listaEvidenciasOffline");

  if (!container) return;

  try {

    const evidencias =
      await listarRegistrosSIGO("TB_EVIDENCIAS");

    if (!evidencias.length) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma evidência salva.
        </div>
      `;

      return;
    }

    container.innerHTML =
      evidencias
        .sort((a, b) =>
          new Date(b.criadoEm) - new Date(a.criadoEm)
        )
        .map(evidencia => {

          const ehImagem =
            String(evidencia.tipoArquivo || "")
              .startsWith("image/");

          return `
            <div
              class="item-offline"
              onclick="abrirEvidenciaOffline('${evidencia.idEvidencia}')">

              ${
                ehImagem
                  ? `<img
                      src="${evidencia.arquivoBase64}"
                      class="preview-evidencia"
                      alt="Evidência">`
                  : `<div class="preview-documento">📄</div>`
              }

              <strong>
                ${evidencia.nomeArquivo || "Arquivo"}
              </strong>

              <small>
                Atividade: ${evidencia.idAtividade || "-"}
              </small>

              <small>
                ${evidencia.descricao || "Sem descrição"}
              </small>

              <span class="
                badge-sync
                ${evidencia.statusSync === "SINCRONIZADO"
                  ? "ok"
                  : "pendente"}
              ">
                ${evidencia.statusSync}
              </span>

            </div>
          `;
        })
        .join("");

  } catch (erro) {

    console.error(
      "Erro ao listar evidências:",
      erro
    );

    container.innerHTML =
      "Erro ao carregar evidências.";

  }
}

async function abrirEvidenciaOffline(idEvidencia) {

  const evidencias =
    await listarRegistrosSIGO(
      "TB_EVIDENCIAS"
    );

  const evidencia =
    evidencias.find(e =>
      e.idEvidencia === idEvidencia
    );

  if (!evidencia) return;

  const area =
    document.getElementById("telaApp");

  if (!area) return;

  area.innerHTML = `

    <div class="tela-card">

      <button
        class="btn-voltar"
        onclick="navegarPara('evidencias')">

        ← Voltar

      </button>

      <h2>📎 Evidência</h2>

      ${
        evidencia.tipoArquivo.startsWith("image/")
          ? `
            <img
              src="${evidencia.arquivoBase64}"
              class="foto-evidencia-completa">
          `
          : `
            <div class="arquivo-documento">
              📄 Documento
            </div>
          `
      }

      <div class="detalhes-evidencia">

        <p>
          <strong>Atividade:</strong>
          ${evidencia.idAtividade}
        </p>

        <p>
          <strong>Descrição:</strong>
          ${evidencia.descricao}
        </p>

        <p>
          <strong>Arquivo:</strong>
          ${evidencia.nomeArquivo}
        </p>

        <p>
          <strong>Status:</strong>
          ${evidencia.statusSync}
        </p>

      </div>

    </div>

  `;
}*/

function montarTelaClima() {
  const formClima = `
    <div class="sigo-form">

      ${SIGOUI.createDate({
        id: "climaData",
        label: "Data",
        value: new Date().toISOString().split("T")[0]
      })}

      ${SIGOUI.createInput({
        id: "climaObra",
        label: "Obra",
        value: obterObraAtivaMobile_(),
        readonly: true
      })}

      ${SIGOUI.createSelect({
        id: "climaPeriodo",
        label: "Período",
        options: [
          { value: "", label: "Selecione" },
          { value: "MANHÃ", label: "Manhã" },
          { value: "TARDE", label: "Tarde" },
          { value: "NOITE", label: "Noite" }
        ]
      })}

      ${SIGOUI.createSelect({
        id: "climaCondicao",
        label: "Condição Climática",
        options: [
          { value: "", label: "Selecione" },
          { value: "☀️ ENSOLARADO", label: "☀️ Ensolarado" },
          { value: "⛅ PARCIALMENTE NUBLADO", label: "⛅ Parcialmente nublado" },
          { value: "☁️ NUBLADO", label: "☁️ Nublado" },
          { value: "🌧️ CHUVA", label: "🌧️ Chuva" },
          { value: "⛈️ TEMPESTADE", label: "⛈️ Tempestade" },
          { value: "🌫️ NEBLINA", label: "🌫️ Neblina" }
        ]
      })}

      ${SIGOUI.createNumber({
        id: "climaTemperatura",
        label: "Temperatura",
        placeholder: "Ex.: 28"
      })}

      ${SIGOUI.createSelect({
        id: "climaIntensidade",
        label: "Intensidade",
        options: [
          { value: "", label: "Selecione" },
          { value: "BAIXA", label: "Baixa" },
          { value: "MODERADA", label: "Moderada" },
          { value: "ALTA", label: "Alta" }
        ]
      })}

      ${SIGOUI.createSelect({
        id: "climaImpacto",
        label: "Impacto na Execução",
        options: [
          { value: "", label: "Selecione" },
          { value: "SEM IMPACTO", label: "Sem impacto" },
          { value: "REDUÇÃO DE PRODUTIVIDADE", label: "Redução de produtividade" },
          { value: "PARALISAÇÃO PARCIAL", label: "Paralisação parcial" },
          { value: "PARALISAÇÃO TOTAL", label: "Paralisação total" }
        ]
      })}

      ${SIGOUI.createInput({
        id: "climaAtividadeAfetada",
        label: "Atividade Afetada",
        placeholder: "Atividade impactada, se houver"
      })}

      ${SIGOUI.createTextarea({
        id: "climaObservacao",
        label: "Observação",
        rows: 3,
        placeholder: "Observações sobre o clima"
      })}

    </div>
  `;

  const listaClima = `
    <div id="listaClimasOffline" class="sigo-list">
      <div class="empty-state">
        <div class="empty-icon">🌦️</div>
        <h3>Nenhum clima carregado</h3>
        <p>Os registros climáticos aparecerão aqui.</p>
      </div>
    </div>
  `;

  return SIGOUI.createCrudScreen({
    titulo: "🌦️ CLIMA",
    nome: "Registro climático",
    subtitulo: "Condições da obra",
    info: "Clima, impacto e produtividade",
    status: "Modo offline",

    actions: [
      {
        icone: "➕",
        texto: "Novo Clima",
        tipo: "is-primary",
        acao: "limparFormularioClima()"
      },
      {
        icone: "💾",
        texto: "Salvar",
        tipo: "is-success",
        acao: "salvarClimaPremium()"
      }
    ],

    formTitle: "📋 Dados do Clima",
    formSubtitle: "Registre as condições climáticas",
    form: formClima,

    listTitle: "📚 Climas Registrados",
    listSubtitle: "Histórico offline da obra ativa",
    list: listaClima,

    bottom: true
  });
}

async function salvarClimaPremium() {
  try {
    const clima = {
      idClima: "CLI-" + Date.now(),

      idObra:
        document.getElementById("climaObra").value ||
        obterObraAtivaMobile_(),

      data:
        document.getElementById("climaData").value,

      periodo:
        document.getElementById("climaPeriodo").value,

      condicao:
        document.getElementById("climaCondicao").value,

      temperatura:
        Number(document.getElementById("climaTemperatura").value || 0),

      intensidade:
        document.getElementById("climaIntensidade").value,

      impacto:
        document.getElementById("climaImpacto").value,

      atividadeAfetada:
        document.getElementById("climaAtividadeAfetada").value,

      observacao:
        document.getElementById("climaObservacao").value,

      statusSync:
        "PENDENTE",

      origem:
        "APP_OFFLINE",

      criadoEm:
        new Date().toISOString(),

      atualizadoEm:
        "",

      dataSync:
        ""
    };

    validarClimaOffline_(clima);

    await salvarRegistroSIGO(
      "TB_CLIMA",
      clima
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "INSERT",
      storeOrigem: "TB_CLIMA",
      idRegistro: clima.idClima,
      idObra: clima.idObra
    });

     await listarClimasOffline_();
  
    // =====================================================
    // NOTIFICAÇÃO — CLIMA REGISTRADO
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "CLIMA_REGISTRADO",
        dados: clima
      });
    }
    
    limparFormularioClima();
    
    SIGOUI.feedback.success(
      "Clima salvo",
      "Registro climático salvo offline."
    );

  } catch (erro) {
    console.error("Erro ao salvar clima:", erro);

    SIGOUI.feedback.error(
      "Erro ao salvar",
      erro.message || "Não foi possível salvar o clima."
    );
  }
}

function validarClimaOffline_(clima) {
  if (!clima.idObra) {
    throw new Error("Obra ativa não encontrada.");
  }

  if (!clima.data) {
    throw new Error("Informe a data do registro climático.");
  }

  if (!clima.periodo) {
    throw new Error("Informe o período.");
  }

  if (!clima.condicao) {
    throw new Error("Informe a condição climática.");
  }

  if (!clima.impacto) {
    throw new Error("Informe o impacto na execução.");
  }

  return true;
}

function limparFormularioClima() {
  const hoje =
    new Date().toISOString().split("T")[0];

  const campos = {
    climaData: hoje,
    climaObra: obterObraAtivaMobile_(),
    climaPeriodo: "",
    climaCondicao: "",
    climaTemperatura: "",
    climaIntensidade: "",
    climaImpacto: "",
    climaAtividadeAfetada: "",
    climaObservacao: ""
  };

  Object.keys(campos).forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = campos[id];
    }
  });
}

async function listarClimasOffline_() {

  const container =
    document.getElementById("listaClimasOffline");

  if (!container) return;

  try {

    const obraAtiva =
      obterObraAtivaMobile_();

    const climas =
      await listarRegistrosSIGO("TB_CLIMA");

    const climasObra =
      climas
        .filter(item =>
          String(item.idObra) === String(obraAtiva)
        )
        .sort((a, b) =>
          new Date(b.criadoEm) -
          new Date(a.criadoEm)
        );

    if (!climasObra.length) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhum registro climático encontrado.
        </div>
      `;

      return;
    }

    container.innerHTML =
      climasObra
        .map(clima =>
          criarCardClimaOffline_(clima)
        )
        .join("");

  } catch (erro) {

    console.error(
      "Erro ao listar clima:",
      erro
    );

    container.innerHTML = `
      <div class="card-vazio">
        Erro ao carregar registros.
      </div>
    `;

  }

}

function criarCardClimaOffline_(clima) {

  const status =
    clima.statusSync || "PENDENTE";

  const badge =
    status === "SINCRONIZADO"
      ? "🟢 SINCRONIZADO"
      : status === "ERRO"
        ? "🔴 ERRO"
        : "🟡 PENDENTE";

  const classeStatus =
    status === "SINCRONIZADO"
      ? "success"
      : status === "ERRO"
        ? "danger"
        : "warning";

  const bloqueado =
    status !== "PENDENTE";

  return `

    <article class="clima-card">

      <div class="clima-card__header">

        <div>

          <strong>
            🌦️ ${clima.condicao || "-"}
          </strong>

          <span>
            ${formatarDataMedicao_(clima.data)}
          </span>

        </div>

        <span class="badge-sync badge-${classeStatus}">
          ${badge}
        </span>

      </div>

      <div class="clima-card__grid">

        <div>
          <small>Período</small>
          <strong>${clima.periodo || "-"}</strong>
        </div>

        <div>
          <small>Temperatura</small>
          <strong>${clima.temperatura || "-"} °C</strong>
        </div>

        <div>
          <small>Impacto</small>
          <strong>${clima.impacto || "-"}</strong>
        </div>

        <div>
          <small>Intensidade</small>
          <strong>${clima.intensidade || "-"}</strong>
        </div>

      </div>

      ${
        clima.atividadeAfetada
          ? `
          <div class="clima-card__obs">
            <small>Atividade Afetada</small>
            <p>${clima.atividadeAfetada}</p>
          </div>
          `
          : ""
      }

      <div class="clima-card__actions">

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="editarClimaOffline_('${clima.idClima}')">
          ✏ Editar
        </button>

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="excluirClimaOffline_('${clima.idClima}')">
          🗑 Excluir
        </button>

        <button
          type="button"
          onclick="detalharClimaOffline_('${clima.idClima}')">
          👁 Detalhes
        </button>

      </div>

    </article>

  `;

}

async function detalharClimaOffline_(idClima) {
  try {
    const climas =
      await listarRegistrosSIGO("TB_CLIMA");

    const clima =
      climas.find(item =>
        String(item.idClima) === String(idClima)
      );

    if (!clima) {
      SIGOUI.feedback.warning(
        "Clima não encontrado",
        "O registro não foi localizado."
      );
      return;
    }

    SIGOUI.showDrawer({
      titulo: "🌦️ Clima",
      subtitulo:
        `${formatarDataMedicao_(clima.data)} • ${clima.periodo || "-"}`,
      conteudo:
        montarDetalhesClima_(clima),
      textoFechar: "Fechar"
    });

  } catch (erro) {
    console.error("Erro ao detalhar clima:", erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível abrir o clima."
    );
  }
}

function montarDetalhesClima_(clima) {
  const status =
    clima.statusSync || "PENDENTE";

  let badge = "";
  let classe = "";
  let descricao = "";

  switch (status) {
    case "SINCRONIZADO":
      badge = "🟢 SINCRONIZADO";
      classe = "success";
      descricao = "Registro enviado ao SIGO.";
      break;

    case "ERRO":
      badge = "🔴 ERRO";
      classe = "danger";
      descricao = "Falha na sincronização.";
      break;

    default:
      badge = "🟡 PENDENTE";
      classe = "warning";
      descricao = "Aguardando sincronização.";
  }

  return `
    <div class="drawer-status">
      <span class="badge-sync badge-${classe}">
        ${badge}
      </span>

      <p class="drawer-status-text">
        ${descricao}
      </p>
    </div>

    <div class="drawer-grid">

      <div class="drawer-kpi">
        <small>Condição</small>
        <strong>${clima.condicao || "-"}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Período</small>
        <strong>${clima.periodo || "-"}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Temperatura</small>
        <strong>${clima.temperatura || "-"} °C</strong>
      </div>

      <div class="drawer-kpi">
        <small>Impacto</small>
        <strong>${clima.impacto || "-"}</strong>
      </div>

    </div>

    <div class="drawer-section">
      <h4>Dados do Clima</h4>

      <div class="drawer-item">
        <span>Data</span>
        <strong>${formatarDataMedicao_(clima.data)}</strong>
      </div>

      <div class="drawer-item">
        <span>Obra</span>
        <strong>${clima.idObra || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Intensidade</span>
        <strong>${clima.intensidade || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Atividade Afetada</span>
        <strong>${clima.atividadeAfetada || "-"}</strong>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Observação</h4>

      <p>
        ${clima.observacao || "Nenhuma observação registrada."}
      </p>
    </div>

    <div class="drawer-section">
      <h4>Auditoria</h4>

      <div class="drawer-item">
        <span>ID</span>
        <strong>${clima.idClima || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Criado em</span>
        <strong>${formatarDataHoraMedicao_(clima.criadoEm)}</strong>
      </div>

      <div class="drawer-item">
        <span>Status Sync</span>
        <strong>${status}</strong>
      </div>

      <div class="drawer-item">
        <span>Versão</span>
        <strong>1.0</strong>
      </div>
    </div>
  `;
}

async function editarClimaOffline_(idClima) {
  try {
    const climas =
      await listarRegistrosSIGO("TB_CLIMA");

    const clima =
      climas.find(item =>
        String(item.idClima) === String(idClima)
      );

    if (!clima) {
      SIGOUI.feedback.warning(
        "Clima não encontrado",
        "O registro não foi localizado."
      );
      return;
    }

    idClimaEdicao = idClima;

    document.getElementById("climaData").value =
      clima.data || "";

    document.getElementById("climaObra").value =
      clima.idObra || obterObraAtivaMobile_();

    document.getElementById("climaPeriodo").value =
      clima.periodo || "";

    document.getElementById("climaCondicao").value =
      clima.condicao || "";

    document.getElementById("climaTemperatura").value =
      clima.temperatura || "";

    document.getElementById("climaIntensidade").value =
      clima.intensidade || "";

    document.getElementById("climaImpacto").value =
      clima.impacto || "";

    document.getElementById("climaAtividadeAfetada").value =
      clima.atividadeAfetada || "";

    document.getElementById("climaObservacao").value =
      clima.observacao || "";

    atualizarModoEdicaoClima_();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    SIGOUI.feedback.info(
      "Modo edição",
      "O registro climático foi carregado para edição."
    );

  } catch (erro) {
    console.error("Erro ao editar clima:", erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível carregar o clima."
    );
  }
}

function atualizarModoEdicaoClima_() {
  const botao =
    document.querySelector(".is-success");

  if (!botao) return;

  if (idClimaEdicao) {
    botao.innerHTML = "💾 Atualizar";

    botao.setAttribute(
      "onclick",
      "atualizarClimaOffline_()"
    );

  } else {
    botao.innerHTML = "💾 Salvar";

    botao.setAttribute(
      "onclick",
      "salvarClimaPremium()"
    );
  }
}

async function atualizarClimaOffline_() {
  try {
    if (!idClimaEdicao) {
      throw new Error("Nenhum clima em edição.");
    }

    const climas =
      await listarRegistrosSIGO("TB_CLIMA");

    const climaAtual =
      climas.find(item =>
        String(item.idClima) === String(idClimaEdicao)
      );

    if (!climaAtual) {
      throw new Error("Registro climático não encontrado.");
    }

    const climaAtualizado = {
      ...climaAtual,

      data:
        document.getElementById("climaData").value,

      idObra:
        document.getElementById("climaObra").value ||
        obterObraAtivaMobile_(),

      periodo:
        document.getElementById("climaPeriodo").value,

      condicao:
        document.getElementById("climaCondicao").value,

      temperatura:
        Number(document.getElementById("climaTemperatura").value || 0),

      intensidade:
        document.getElementById("climaIntensidade").value,

      impacto:
        document.getElementById("climaImpacto").value,

      atividadeAfetada:
        document.getElementById("climaAtividadeAfetada").value,

      observacao:
        document.getElementById("climaObservacao").value,

      atualizadoEm:
        new Date().toISOString(),

      statusSync:
        "PENDENTE"
    };

    validarClimaOffline_(climaAtualizado);

    await salvarRegistroSIGO(
      "TB_CLIMA",
      climaAtualizado
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "UPDATE",
      storeOrigem: "TB_CLIMA",
      idRegistro: climaAtualizado.idClima,
      idObra: climaAtualizado.idObra
    });

    idClimaEdicao = null;

    atualizarModoEdicaoClima_();

   limparFormularioClima();

    await listarClimasOffline_();
    
    // =====================================================
    // NOTIFICAÇÃO — CLIMA ATUALIZADO
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "CLIMA_ATUALIZADO",
        dados: climaAtualizado
      });
    }
    
    SIGOUI.feedback.success(
      "Clima atualizado",
      "Registro climático atualizado com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao atualizar clima:", erro);

    SIGOUI.feedback.error(
      "Erro ao atualizar",
      erro.message || "Não foi possível atualizar o clima."
    );
  }
}

async function excluirClimaOffline_(idClima) {
  try {
    if (!idClima) {
      throw new Error("ID do clima não informado.");
    }

    const climas =
      await listarRegistrosSIGO("TB_CLIMA");

    const clima =
      climas.find(item =>
        String(item.idClima) === String(idClima)
      );

    if (!clima) {
      SIGOUI.feedback.warning(
        "Clima não encontrado",
        "O registro não foi localizado."
      );
      return;
    }

    const confirmou = await SIGOUI.feedback.confirm({
      tipo: "danger",
      icone: "🗑️",
      titulo: "Excluir clima",
      mensagem:
        "Este registro climático será removido deste dispositivo.\n\n" +
        "Deseja realmente continuar?",
      textoConfirmar: "Excluir",
      textoCancelar: "Cancelar"
    });

    if (!confirmou) return;

    await removerRegistroSIGO_(
      "TB_CLIMA",
      idClima
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "DELETE",
      storeOrigem: "TB_CLIMA",
      idRegistro: idClima,
      idObra: clima.idObra
    });

    if (String(idClimaEdicao) === String(idClima)) {
      idClimaEdicao = null;

      atualizarModoEdicaoClima_();

      if (typeof limparFormularioClima === "function") {
        limparFormularioClima();
      }
    }

    await listarClimasOffline_();

    SIGOUI.feedback.success(
      "Clima excluído",
      "Registro removido com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao excluir clima:", erro);

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro.message || "Não foi possível excluir o clima."
    );
  }
}

function montarTelaOcorrencias() {
  const formOcorrencia = `
    <div class="sigo-form">

      ${SIGOUI.createDate({
        id: "ocorrenciaData",
        label: "Data",
        value: new Date().toISOString().split("T")[0]
      })}

      ${SIGOUI.createInput({
        id: "ocorrenciaObra",
        label: "Obra",
        value: obterObraAtivaMobile_(),
        readonly: true
      })}

      ${SIGOUI.createSelect({
        id: "ocorrenciaTipo",
        label: "Tipo",
        options: [
          { value: "", label: "Selecione" },
          { value: "SEGURANÇA", label: "Segurança" },
          { value: "QUALIDADE", label: "Qualidade" },
          { value: "PRODUÇÃO", label: "Produção" },
          { value: "EQUIPAMENTO", label: "Equipamento" },
          { value: "AMBIENTAL", label: "Ambiental" },
          { value: "ADMINISTRATIVO", label: "Administrativo" },
          { value: "OUTRO", label: "Outro" }
        ]
      })}

      ${SIGOUI.createSelect({
        id: "ocorrenciaPrioridade",
        label: "Prioridade",
        options: [
          { value: "", label: "Selecione" },
          { value: "BAIXA", label: "Baixa" },
          { value: "MÉDIA", label: "Média" },
          { value: "ALTA", label: "Alta" },
          { value: "CRÍTICA", label: "Crítica" }
        ]
      })}

      ${SIGOUI.createInput({
        id: "ocorrenciaResponsavel",
        label: "Responsável",
        placeholder: "Responsável pelo registro"
      })}

      ${SIGOUI.createInput({
        id: "ocorrenciaLocal",
        label: "Local",
        placeholder: "Ex.: Bloco A, pavimento térreo"
      })}

      ${SIGOUI.createSelect({
        id: "ocorrenciaStatus",
        label: "Status",
        options: [
          { value: "ABERTA", label: "Aberta" },
          { value: "EM TRATAMENTO", label: "Em tratamento" },
          { value: "RESOLVIDA", label: "Resolvida" }
        ]
      })}

      ${SIGOUI.createTextarea({
        id: "ocorrenciaDescricao",
        label: "Descrição",
        rows: 4,
        placeholder: "Descreva a ocorrência"
      })}

      ${SIGOUI.createTextarea({
        id: "ocorrenciaObservacoes",
        label: "Observações",
        rows: 3,
        placeholder: "Observações complementares"
      })}

    </div>
  `;

  const listaOcorrencias = `
    <div id="listaOcorrenciasOffline" class="sigo-list">
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Nenhuma ocorrência carregada</h3>
        <p>As ocorrências registradas aparecerão aqui.</p>
      </div>
    </div>
  `;

  return SIGOUI.createCrudScreen({
    titulo: "⚠️ OCORRÊNCIAS",
    nome: "Registro de ocorrências",
    subtitulo: "Controle operacional",
    info: "Segurança, qualidade e produção",
    status: "Modo offline",

    actions: [
      {
        icone: "➕",
        texto: "Nova Ocorrência",
        tipo: "is-primary",
        acao: "limparFormularioOcorrencia()"
      },
      {
        icone: "💾",
        texto: "Salvar",
        tipo: "is-success",
        acao: "salvarOcorrenciaPremium()"
      }
    ],

    formTitle: "📋 Dados da Ocorrência",
    formSubtitle: "Registre uma ocorrência da obra",
    form: formOcorrencia,

    listTitle: "📚 Ocorrências Registradas",
    listSubtitle: "Histórico offline da obra ativa",
    list: listaOcorrencias,

    bottom: true
  });
}

async function salvarOcorrenciaPremium() {
  try {
    const ocorrencia = {
      idOcorrencia:
        "OCO-" + Date.now(),

      idObra:
        document.getElementById("ocorrenciaObra").value ||
        obterObraAtivaMobile_(),

      data:
        document.getElementById("ocorrenciaData").value,

      tipo:
        document.getElementById("ocorrenciaTipo").value,

      prioridade:
        document.getElementById("ocorrenciaPrioridade").value,

      responsavel:
        document.getElementById("ocorrenciaResponsavel").value,

      local:
        document.getElementById("ocorrenciaLocal").value,

      status:
        document.getElementById("ocorrenciaStatus").value || "ABERTA",

      descricao:
        document.getElementById("ocorrenciaDescricao").value,

      observacoes:
        document.getElementById("ocorrenciaObservacoes").value,

      statusSync:
        "PENDENTE",

      origem:
        "APP_OFFLINE",

      criadoEm:
        new Date().toISOString(),

      atualizadoEm:
        "",

      dataSync:
        ""
    };

    validarOcorrenciaOffline_(ocorrencia);

    await salvarRegistroSIGO(
      "TB_OCORRENCIAS",
      ocorrencia
    );

   await adicionarNaFilaSyncSIGO({
      tipo: "INSERT",
      storeOrigem: "TB_OCORRENCIAS",
      idRegistro: ocorrencia.idOcorrencia,
      idObra: ocorrencia.idObra
    });

    // TODO UX.07.14.SYNC
    // Registrar INSERT na TB_SYNC_QUEUE

   await listarOcorrenciasOffline_();

  // =====================================================
  // NOTIFICAÇÃO — NOVA OCORRÊNCIA
  // =====================================================
  if (typeof registrarEventoSIGO_ === "function") {
    await registrarEventoSIGO_({
      evento: "OCORRENCIA_CRIADA",
      dados: ocorrencia
    });
  }
  
  limparFormularioOcorrencia();
  
  SIGOUI.feedback.success(
    "Ocorrência salva",
    "Registro salvo offline com sucesso."
  );

  } catch (erro) {
    console.error("Erro ao salvar ocorrência:", erro);

    SIGOUI.feedback.error(
      "Erro ao salvar",
      erro.message || "Não foi possível salvar a ocorrência."
    );
  }
}

function validarOcorrenciaOffline_(ocorrencia) {
  if (!ocorrencia.idObra) {
    throw new Error("Obra ativa não encontrada.");
  }

  if (!ocorrencia.data) {
    throw new Error("Informe a data da ocorrência.");
  }

  if (!ocorrencia.tipo) {
    throw new Error("Informe o tipo da ocorrência.");
  }

  if (!ocorrencia.prioridade) {
    throw new Error("Informe a prioridade da ocorrência.");
  }

  if (!ocorrencia.descricao) {
    throw new Error("Descreva a ocorrência.");
  }

  return true;
}

function limparFormularioOcorrencia() {
  const hoje =
    new Date().toISOString().split("T")[0];

  const campos = {
    ocorrenciaData: hoje,
    ocorrenciaObra: obterObraAtivaMobile_(),
    ocorrenciaTipo: "",
    ocorrenciaPrioridade: "",
    ocorrenciaResponsavel: "",
    ocorrenciaLocal: "",
    ocorrenciaStatus: "ABERTA",
    ocorrenciaDescricao: "",
    ocorrenciaObservacoes: ""
  };

  Object.keys(campos).forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = campos[id];
    }
  });
}

async function listarOcorrenciasOffline_() {
  const container =
    document.getElementById("listaOcorrenciasOffline");

  if (!container) return;

  try {
    const obraAtiva =
      obterObraAtivaMobile_();

    const ocorrencias =
      await listarRegistrosSIGO("TB_OCORRENCIAS");

    const ocorrenciasObra =
      ocorrencias
        .filter(item =>
          String(item.idObra) === String(obraAtiva)
        )
        .sort((a, b) =>
          new Date(b.criadoEm) - new Date(a.criadoEm)
        );

    if (!ocorrenciasObra.length) {
      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma ocorrência registrada.
        </div>
      `;
      return;
    }

    container.innerHTML =
      ocorrenciasObra
        .map(ocorrencia => criarCardOcorrenciaOffline_(ocorrencia))
        .join("");

  } catch (erro) {
    console.error("Erro ao listar ocorrências:", erro);

    container.innerHTML = `
      <div class="card-vazio">
        Erro ao carregar ocorrências.
      </div>
    `;
  }
}

function criarCardOcorrenciaOffline_(ocorrencia) {
  const statusSync =
    ocorrencia.statusSync || "PENDENTE";

  const badge =
    statusSync === "SINCRONIZADO"
      ? "🟢 SINCRONIZADO"
      : statusSync === "ERRO"
        ? "🔴 ERRO"
        : "🟡 PENDENTE";

  const classeStatus =
    statusSync === "SINCRONIZADO"
      ? "success"
      : statusSync === "ERRO"
        ? "danger"
        : "warning";

  const bloqueado =
    statusSync !== "PENDENTE";

  return `
    <article class="ocorrencia-card">

      <div class="ocorrencia-card__header">
        <div>
          <strong>
            ⚠️ ${ocorrencia.tipo || "Ocorrência"}
          </strong>

          <span>
            ${ocorrencia.descricao || "Sem descrição"}
          </span>
        </div>

        <span class="badge-sync badge-${classeStatus}">
          ${badge}
        </span>
      </div>

      <div class="ocorrencia-card__grid">

        <div>
          <small>Data</small>
          <strong>${formatarDataMedicao_(ocorrencia.data)}</strong>
        </div>

        <div>
          <small>Prioridade</small>
          <strong>${ocorrencia.prioridade || "-"}</strong>
        </div>

        <div>
          <small>Status</small>
          <strong>${ocorrencia.status || "ABERTA"}</strong>
        </div>

        <div>
          <small>Responsável</small>
          <strong>${ocorrencia.responsavel || "Não informado"}</strong>
        </div>

      </div>

      ${
        ocorrencia.local
          ? `
            <div class="ocorrencia-card__obs">
              <small>Local</small>
              <p>${ocorrencia.local}</p>
            </div>
          `
          : ""
      }

      <div class="ocorrencia-card__actions">

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="editarOcorrenciaOffline_('${ocorrencia.idOcorrencia}')">
          ✏ Editar
        </button>

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="excluirOcorrenciaOffline_('${ocorrencia.idOcorrencia}')">
          🗑 Excluir
        </button>

        <button
          type="button"
          onclick="detalharOcorrenciaOffline_('${ocorrencia.idOcorrencia}')">
          👁 Detalhes
        </button>

      </div>

    </article>
  `;
}

async function detalharOcorrenciaOffline_(idOcorrencia) {

  try {

    const ocorrencias =
      await listarRegistrosSIGO("TB_OCORRENCIAS");

    const ocorrencia =
      ocorrencias.find(item =>
        String(item.idOcorrencia) === String(idOcorrencia)
      );

    if (!ocorrencia) {

      SIGOUI.feedback.warning(
        "Ocorrência não encontrada",
        "O registro não foi localizado."
      );

      return;
    }

    SIGOUI.showDrawer({
      titulo: "⚠️ Ocorrência",
      subtitulo:
        `${formatarDataMedicao_(ocorrencia.data)} • ${ocorrencia.idObra}`,
      conteudo:
        montarDetalhesOcorrencia_(ocorrencia),
      textoFechar: "Fechar"
    });

  } catch (erro) {

    console.error(erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível abrir a ocorrência."
    );

  }

}

function montarDetalhesOcorrencia_(ocorrencia) {

  const status =
    ocorrencia.statusSync || "PENDENTE";

  let badge = "";
  let classe = "";
  let descricao = "";

  switch (status) {

    case "SINCRONIZADO":
      badge = "🟢 SINCRONIZADO";
      classe = "success";
      descricao = "Registro enviado ao SIGO.";
      break;

    case "ERRO":
      badge = "🔴 ERRO";
      classe = "danger";
      descricao = "Falha na sincronização.";
      break;

    default:
      badge = "🟡 PENDENTE";
      classe = "warning";
      descricao = "Aguardando sincronização.";

  }

  return `

    <div class="drawer-status">

      <span class="badge-sync badge-${classe}">
        ${badge}
      </span>

      <p class="drawer-status-text">
        ${descricao}
      </p>

    </div>

    <div class="drawer-grid">

      <div class="drawer-kpi">
        <small>Prioridade</small>
        <strong>${ocorrencia.prioridade || "-"}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Status</small>
        <strong>${ocorrencia.status || "-"}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Tipo</small>
        <strong>${ocorrencia.tipo || "-"}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Responsável</small>
        <strong>${ocorrencia.responsavel || "Não informado"}</strong>
      </div>

    </div>

    <div class="drawer-section">

      <h4>Dados da Ocorrência</h4>

      <div class="drawer-item">
        <span>Data</span>
        <strong>${formatarDataMedicao_(ocorrencia.data)}</strong>
      </div>

      <div class="drawer-item">
        <span>Obra</span>
        <strong>${ocorrencia.idObra}</strong>
      </div>

      <div class="drawer-item">
        <span>Local</span>
        <strong>${ocorrencia.local || "-"}</strong>
      </div>

    </div>

    <div class="drawer-section">

      <h4>Descrição</h4>

      <p>
        ${ocorrencia.descricao || "Nenhuma descrição."}
      </p>

    </div>

    <div class="drawer-section">

      <h4>Observações</h4>

      <p>
        ${ocorrencia.observacoes || "Nenhuma observação."}
      </p>

    </div>

    <div class="drawer-section">

      <h4>Auditoria</h4>

      <div class="drawer-item">
        <span>ID</span>
        <strong>${ocorrencia.idOcorrencia}</strong>
      </div>

      <div class="drawer-item">
        <span>Criado em</span>
        <strong>${formatarDataHoraMedicao_(ocorrencia.criadoEm)}</strong>
      </div>

      <div class="drawer-item">
        <span>Status Sync</span>
        <strong>${status}</strong>
      </div>

      <div class="drawer-item">
        <span>Versão</span>
        <strong>1.0</strong>
      </div>

    </div>

  `;

}

async function editarOcorrenciaOffline_(idOcorrencia) {
  try {
    const ocorrencias =
      await listarRegistrosSIGO("TB_OCORRENCIAS");

    const ocorrencia =
      ocorrencias.find(item =>
        String(item.idOcorrencia) === String(idOcorrencia)
      );

    if (!ocorrencia) {
      SIGOUI.feedback.warning(
        "Ocorrência não encontrada",
        "O registro não foi localizado."
      );
      return;
    }

    idOcorrenciaEdicao = idOcorrencia;

    document.getElementById("ocorrenciaData").value =
      ocorrencia.data || "";

    document.getElementById("ocorrenciaObra").value =
      ocorrencia.idObra || obterObraAtivaMobile_();

    document.getElementById("ocorrenciaTipo").value =
      ocorrencia.tipo || "";

    document.getElementById("ocorrenciaPrioridade").value =
      ocorrencia.prioridade || "";

    document.getElementById("ocorrenciaResponsavel").value =
      ocorrencia.responsavel || "";

    document.getElementById("ocorrenciaLocal").value =
      ocorrencia.local || "";

    document.getElementById("ocorrenciaStatus").value =
      ocorrencia.status || "ABERTA";

    document.getElementById("ocorrenciaDescricao").value =
      ocorrencia.descricao || "";

    document.getElementById("ocorrenciaObservacoes").value =
      ocorrencia.observacoes || "";

    atualizarModoEdicaoOcorrencia_();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    SIGOUI.feedback.info(
      "Modo edição",
      "A ocorrência foi carregada para edição."
    );

  } catch (erro) {
    console.error("Erro ao editar ocorrência:", erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível carregar a ocorrência."
    );
  }
}

function atualizarModoEdicaoOcorrencia_() {
  const botao =
    document.querySelector(".is-success");

  if (!botao) return;

  if (idOcorrenciaEdicao) {
    botao.innerHTML = "💾 Atualizar";

    botao.setAttribute(
      "onclick",
      "atualizarOcorrenciaOffline_()"
    );

  } else {
    botao.innerHTML = "💾 Salvar";

    botao.setAttribute(
      "onclick",
      "salvarOcorrenciaPremium()"
    );
  }
}

async function atualizarOcorrenciaOffline_() {
  try {
    if (!idOcorrenciaEdicao) {
      throw new Error("Nenhuma ocorrência em edição.");
    }

    const ocorrencias =
      await listarRegistrosSIGO("TB_OCORRENCIAS");

    const ocorrenciaAtual =
      ocorrencias.find(item =>
        String(item.idOcorrencia) === String(idOcorrenciaEdicao)
      );

    if (!ocorrenciaAtual) {
      throw new Error("Ocorrência não encontrada.");
    }

    const ocorrenciaAtualizada = {
      ...ocorrenciaAtual,

      data:
        document.getElementById("ocorrenciaData").value,

      idObra:
        document.getElementById("ocorrenciaObra").value ||
        obterObraAtivaMobile_(),

      tipo:
        document.getElementById("ocorrenciaTipo").value,

      prioridade:
        document.getElementById("ocorrenciaPrioridade").value,

      responsavel:
        document.getElementById("ocorrenciaResponsavel").value,

      local:
        document.getElementById("ocorrenciaLocal").value,

      status:
        document.getElementById("ocorrenciaStatus").value || "ABERTA",

      descricao:
        document.getElementById("ocorrenciaDescricao").value,

      observacoes:
        document.getElementById("ocorrenciaObservacoes").value,

      atualizadoEm:
        new Date().toISOString(),

      statusSync:
        "PENDENTE"
    };

    validarOcorrenciaOffline_(ocorrenciaAtualizada);

    await salvarRegistroSIGO(
      "TB_OCORRENCIAS",
      ocorrenciaAtualizada
    );

   await adicionarNaFilaSyncSIGO({
      tipo: "UPDATE",
      storeOrigem: "TB_OCORRENCIAS",
      idRegistro: ocorrenciaAtualizada.idOcorrencia,
      idObra: ocorrenciaAtualizada.idObra
    });

    idOcorrenciaEdicao = null;

    atualizarModoEdicaoOcorrencia_();

    limparFormularioOcorrencia();

  await listarOcorrenciasOffline_();
  
  // =====================================================
  // NOTIFICAÇÃO — OCORRÊNCIA ATUALIZADA
  // =====================================================
  if (typeof registrarEventoSIGO_ === "function") {
    await registrarEventoSIGO_({
      evento: "OCORRENCIA_ATUALIZADA",
      dados: ocorrenciaAtualizada
    });
  }
  
  SIGOUI.feedback.success(
    "Ocorrência atualizada",
    "Registro atualizado com sucesso."
  );

  } catch (erro) {
    console.error("Erro ao atualizar ocorrência:", erro);

    SIGOUI.feedback.error(
      "Erro ao atualizar",
      erro.message || "Não foi possível atualizar a ocorrência."
    );
  }
}

async function excluirOcorrenciaOffline_(idOcorrencia) {

  try {

    if (!idOcorrencia) {
      throw new Error("ID da ocorrência não informado.");
    }

    const ocorrencias =
      await listarRegistrosSIGO("TB_OCORRENCIAS");

    const ocorrencia =
      ocorrencias.find(item =>
        String(item.idOcorrencia) === String(idOcorrencia)
      );

    if (!ocorrencia) {

      SIGOUI.feedback.warning(
        "Ocorrência não encontrada",
        "O registro não foi localizado."
      );

      return;
    }

    const confirmou =
      await SIGOUI.feedback.confirm({

        tipo: "danger",

        icone: "🗑️",

        titulo: "Excluir ocorrência",

        mensagem:
          "Esta ocorrência será removida deste dispositivo.\n\n" +
          "Deseja realmente continuar?",

        textoConfirmar: "Excluir",

        textoCancelar: "Cancelar"

      });

    if (!confirmou) return;

    await removerRegistroSIGO_(
      "TB_OCORRENCIAS",
      idOcorrencia
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "DELETE",
      storeOrigem: "TB_OCORRENCIAS",
      idRegistro: idOcorrencia,
      idObra: ocorrencia.idObra
    });

    // TODO UX.07.14.SYNC
    // Registrar DELETE na TB_SYNC_QUEUE

    if (
      String(idOcorrenciaEdicao) ===
      String(idOcorrencia)
    ) {

      idOcorrenciaEdicao = null;

      atualizarModoEdicaoOcorrencia_();

      if (
        typeof limparFormularioOcorrencia ===
        "function"
      ) {

        limparFormularioOcorrencia();

      }

    }

    await listarOcorrenciasOffline_();

    SIGOUI.feedback.success(
      "Ocorrência excluída",
      "Registro removido com sucesso."
    );

  }

  catch (erro) {

    console.error(
      "Erro ao excluir ocorrência:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro.message ||
      "Não foi possível excluir a ocorrência."
    );

  }

}

function montarTelaEvidencias() {
  const formEvidencia = `
    <div class="sigo-form">

      ${SIGOUI.createDate({
        id: "evidenciaData",
        label: "Data",
        value: new Date().toISOString().split("T")[0]
      })}

      ${SIGOUI.createInput({
        id: "evidenciaObra",
        label: "Obra",
        value: obterObraAtivaMobile_(),
        readonly: true
      })}

      ${SIGOUI.createSelect({
        id: "evidenciaCategoria",
        label: "Categoria",
        options: [
          { value: "", label: "Selecione" },
          { value: "EXECUÇÃO", label: "📷 Execução" },
          { value: "SEGURANÇA", label: "🛡 Segurança" },
          { value: "QUALIDADE", label: "🏗 Qualidade" },
          { value: "MATERIAIS", label: "📦 Materiais" },
          { value: "EQUIPAMENTOS", label: "🚧 Equipamentos" },
          { value: "OCORRÊNCIA", label: "⚠ Ocorrência" },
          { value: "OUTRO", label: "📑 Outro" }
        ]
      })}

      ${SIGOUI.createInput({
        id: "evidenciaTitulo",
        label: "Título",
        placeholder: "Ex.: Foto da concretagem"
      })}

      ${SIGOUI.createTextarea({
        id: "evidenciaDescricao",
        label: "Descrição",
        rows: 3,
        placeholder: "Descreva a evidência"
      })}

      ${SIGOUI.createInput({
        id: "evidenciaArquivo",
        label: "Arquivo / Foto",
        type: "file"
      })}

      ${SIGOUI.createInput({
        id: "evidenciaAtividade",
        label: "Atividade Vinculada",
        placeholder: "Opcional"
      })}

      ${SIGOUI.createInput({
        id: "evidenciaOrigem",
        label: "Origem",
        value: "APP_OFFLINE",
        readonly: true
      })}

    </div>
  `;

  const listaEvidencias = `
    <div id="listaEvidenciasOffline" class="sigo-list">
      <div class="empty-state">
        <div class="empty-icon">📷</div>
        <h3>Nenhuma evidência carregada</h3>
        <p>As evidências registradas aparecerão aqui.</p>
      </div>
    </div>
  `;

  return SIGOUI.createCrudScreen({
    titulo: "📷 EVIDÊNCIAS",
    nome: "Registro de evidências",
    subtitulo: "Fotos e anexos offline",
    info: "Obra, atividade e observações",
    status: "Modo offline",

    actions: [
      {
        icone: "➕",
        texto: "Nova Evidência",
        tipo: "is-primary",
        acao: "limparFormularioEvidencia()"
      },
      {
        icone: "💾",
        texto: "Salvar",
        tipo: "is-success",
        acao: "salvarEvidenciaPremium()"
      }
    ],

    formTitle: "📋 Dados da Evidência",
    formSubtitle: "Registre fotos e informações de campo",
    form: formEvidencia,

    listTitle: "📚 Evidências Registradas",
    listSubtitle: "Histórico offline da obra ativa",
    list: listaEvidencias,

    bottom: true
  });
}
/*async function registrarSyncQueueSIGO_(config = {}) {
  const registro = {
    idSync: "SYNC-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    idObra: config.idObra || obterObraAtivaMobile_(),
    tabela: config.tabela,
    idRegistro: config.idRegistro,
    tipoOperacao: config.tipoOperacao || "INSERT",
    statusSync: "PENDENTE",
    tentativas: 0,
    erro: "",
    criadoEm: new Date().toISOString(),
    dataSync: ""
  };

  await salvarRegistroSIGO("TB_SYNC_QUEUE", registro);
}*/

async function preencherDadosAtividadeItemDiario() {
  const select = document.getElementById("itemDiarioAtividade");
  const idAtividade = select.value;

  if (!idAtividade) return;

  const atividades = await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const atividadeBase = atividades.find(item =>
    String(item.idAtividade) === String(idAtividade) ||
    String(item.eap) === String(idAtividade)
  );

  if (!atividadeBase) {
   SIGOUI.feedback.warning(
      "Atualização necessária",
      "Atualize os dados-base da obra para continuar."
    );
    return;
  }

  const campoEap =
    document.getElementById("itemDiarioEap");
  
  if (campoEap) {
    campoEap.value =
      atividadeBase.eap || "";
  }
  
  document.getElementById("itemDiarioServico").value =
    atividadeBase.servico || "";

  document.getElementById("itemDiarioUnidade").value =
    atividadeBase.unidade || "";

  const campoQtdePlanejada =
    document.getElementById("itemDiarioQtdePlanejada");

  if (campoQtdePlanejada) {
    campoQtdePlanejada.value =
      Number(atividadeBase.qtdePlanejada || 0);
  }
}

async function salvarItemDiarioOffline(event) {
  event.preventDefault();

  const item = {
  idItemDiario: "DIT-" + Date.now(),
  idDiario: document.getElementById("itemDiarioIdDiario").value,
  data: document.getElementById("itemDiarioData").value,
  idObra: obterObraAtivaMobile_(),
  atividade: document.getElementById("itemDiarioAtividade").value,
  eap: document.getElementById("itemDiarioAtividade").value,
  servico: document.getElementById("itemDiarioServico").value,
  equipe: document.getElementById("itemDiarioEquipe").value,
  equipamento: document.getElementById("itemDiarioEquipamento").value,
  qtdeExecutada: Number(document.getElementById("itemDiarioQtdeExecutada").value || 0),
  un: document.getElementById("itemDiarioUnidade").value,
  horasTrabalhadas: Number(document.getElementById("itemDiarioHoras").value || 0),
  observacao: document.getElementById("itemDiarioObservacao").value,
  statusItem: "EXECUTADO",
  statusSync: "PENDENTE",
  origem: "APP_OFFLINE",

  excessoDetectado: "NAO",
  excessoAutorizado: "NAO",
  justificativaExcesso: "",

  criadoEm: new Date().toISOString()
};

  try {
    await validarAtividadeItemDiarioOffline_(item);

    await validarExcessoItemDiarioOffline_(item);
    
    await salvarRegistroSIGO("TB_DIARIO_ITENS", item);

    await adicionarNaFilaSyncSIGO({
      tipo: "DIARIO_ITEM",
      storeOrigem: "TB_DIARIO_ITENS",
      idRegistro: item.idItemDiario,
      idObra: item.idObra
    });

    await atualizarIndicadoresMobile_();
    await listarItensDiarioOffline_();

    SIGOUI.feedback.success(
        "Item do diário salvo",
        "Item do diário salvo offline."
    );

    console.log("Item diário salvo no IndexedDB:", item);

  } catch (erro) {
    console.error("Erro ao salvar item do diário:", erro);
    SIGOUI.feedback.error(
       "Erro ao salvar item do diário",
        erro.message || "Não foi possível salvar o item do diário offline."
    );
  }
}

async function validarExcessoItemDiarioOffline_(item) {

  const atividades =
    await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const atividadeBase = atividades.find(atividade =>
    String(atividade.idAtividade) === String(item.atividade) ||
    String(atividade.eap) === String(item.eap)
  );

  if (!atividadeBase) return true;

  const itensOffline =
    await listarRegistrosSIGO("TB_DIARIO_ITENS");

  const totalJaExecutadoOffline = itensOffline
    .filter(registro =>
      String(registro.idObra) === String(item.idObra) &&
      (
        String(registro.atividade) === String(item.atividade) ||
        String(registro.eap) === String(item.eap)
      ) &&
      registro.idItemDiario !== item.idItemDiario
    )
    .reduce((total, registro) => {
      return total + Number(registro.qtdeExecutada || 0);
    }, 0);

  const saldoBase =
    Number(atividadeBase.saldoDisponivel || 0);

  const saldoAtual =
    saldoBase - totalJaExecutadoOffline;

  const qtdeExecutada =
    Number(item.qtdeExecutada || 0);

  item.saldoDisponivelBase = saldoBase;
  item.totalJaExecutadoOffline = totalJaExecutadoOffline;
  item.saldoDisponivelAntes = saldoAtual;
  item.saldoDisponivelDepois = saldoAtual - qtdeExecutada;

  const excedeuSaldo =
    saldoAtual <= 0 ||
    qtdeExecutada > saldoAtual;
  
  if (!excedeuSaldo) {
    return true;
  }
  
 const justificativa = await SIGOUI.feedback.input({
      tipo: "warning",
      icone: "⚠️",
      titulo: "Excesso detectado",
      mensagem:
        `Atividade: ${atividadeBase.servico}
    
    Saldo base: ${saldoBase} ${atividadeBase.unidade}
    Já executado offline: ${totalJaExecutadoOffline} ${atividadeBase.unidade}
    Saldo disponível atual: ${saldoAtual} ${atividadeBase.unidade}
    Quantidade informada: ${qtdeExecutada} ${atividadeBase.unidade}
    
    Informe a justificativa:`,
    
      placeholder: "Descreva o motivo...",
      textoConfirmar: "Confirmar",
      textoCancelar: "Cancelar",
      obrigatorio: true
    });
    
    if (!justificativa) {
      throw new Error(
        "Lançamento cancelado. Justificativa obrigatória."
      );
    }

  item.excessoDetectado = "SIM";
  item.excessoAutorizado = "SIM";
  item.justificativaExcesso = justificativa;

  return true;
}
   
async function validarAtividadeItemDiarioOffline_(item) {

  const atividades = await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const atividadeBase = atividades.find(atividade =>
    String(atividade.idAtividade) === String(item.atividade) ||
    String(atividade.eap) === String(item.eap)
  );

  if (!atividadeBase) {
    throw new Error(
      "Atividade não encontrada nos dados-base offline. Atualize os dados-base da obra."
    );
  }

  if (Number(item.qtdeExecutada || 0) <= 0) {
    throw new Error("Informe uma quantidade executada maior que zero.");
  }

  item.eap = atividadeBase.eap || item.eap;
  item.servico = atividadeBase.servico || item.servico;
  item.un = atividadeBase.unidade || item.un;
  item.qtdePlanejada = Number(atividadeBase.qtdePlanejada || 0);
  item.saldoDisponivelBase = Number(atividadeBase.saldoDisponivel || 0);
  item.validacaoDadosBaseOffline = "OK";

  return true;
}

async function listarItensDiarioOffline_(
  idDiarioInformado = ""
) {

  const container =
    document.getElementById(
      "listaItensDiarioOffline"
    );

  if (!container) {
    return [];
  }

  try {

    // ==========================================
    // 1. IDENTIFICAR A OBRA ATIVA
    // ==========================================

    const obraAtiva =
      String(
        obterObraAtivaMobile_() || ""
      ).trim();

    if (!obraAtiva) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma obra ativa selecionada.
        </div>
      `;

      return [];
    }

    // ==========================================
    // 2. IDENTIFICAR O DIÁRIO ATIVO
    // ==========================================

    const diarioAtivoContexto =
      typeof obterDiarioAtivoSIGO_ ===
        "function"
        ? obterDiarioAtivoSIGO_(
            obraAtiva
          )
        : "";

    const idDiarioAtivo =
      String(
        idDiarioInformado ||
        diarioAtivoContexto ||
        ""
      ).trim();

    if (!idDiarioAtivo) {

      container.innerHTML = `
        <div class="card-vazio">
          <strong>Nenhum Diário ativo.</strong>
          <br>
          Crie ou abra um Diário antes de
          registrar atividades.
        </div>
      `;

      return [];
    }

    // ==========================================
    // 3. CARREGAR DIÁRIOS E ITENS
    // ==========================================

    const [
      diarios,
      itens
    ] = await Promise.all([
      listarRegistrosSIGO(
        "TB_DIARIOS"
      ),

      listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      )
    ]);

    // ==========================================
    // 4. VALIDAR O DIÁRIO NO BANCO LOCAL
    // ==========================================

    const diarioAtivo =
      diarios.find(diario =>
        String(diario.idDiario) ===
          String(idDiarioAtivo) &&

        String(diario.idObra) ===
          String(obraAtiva)
      ) || null;

    if (!diarioAtivo) {

      if (
        typeof limparDiarioAtivoSIGO_ ===
          "function"
      ) {
        limparDiarioAtivoSIGO_(
          obraAtiva
        );
      }

      container.innerHTML = `
        <div class="card-vazio">
          O Diário ativo não foi encontrado
          nesta obra.
        </div>
      `;

      return [];
    }

    // ==========================================
    // 5. FILTRAR POR OBRA E DIÁRIO
    // ==========================================

    const itensDiario =
      itens
        .filter(item =>
          String(item.idObra) ===
            String(obraAtiva) &&

          String(item.idDiario) ===
            String(idDiarioAtivo)
        )
        .sort((a, b) =>
          new Date(
            b.criadoEm || 0
          ) -
          new Date(
            a.criadoEm || 0
          )
        );

    container.dataset.idObra =
      obraAtiva;

    container.dataset.idDiario =
      idDiarioAtivo;

    // ==========================================
    // 6. EXIBIR ESTADO VAZIO
    // ==========================================

    if (!itensDiario.length) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma atividade registrada
          neste Diário.
        </div>
      `;

      return [];
    }

    // ==========================================
    // 7. RENDERIZAR SOMENTE OS ITENS DO DIÁRIO
    // ==========================================

    container.innerHTML =
      itensDiario
        .map(item =>
          criarCardItemDiarioOffline_(
            item
          )
        )
        .join("");

    return itensDiario;

  } catch (erro) {

    console.error(
      "Erro ao listar itens do Diário:",
      erro
    );

    container.innerHTML = `
      <div class="card-vazio">
        Erro ao carregar as atividades
        deste Diário.
      </div>
    `;

    return [];
  }
}

function criarCardItemDiarioOffline_(item) {
 const status =
    item.statusSync ||
    "PENDENTE";
  
  // A edição mantém a regra atual.
  // Itens sincronizados continuam protegidos
  // contra edição direta pelo card.
  const bloqueadoEdicao =
    status !== "PENDENTE";

  const badge =
    status === "SINCRONIZADO"
      ? "🟢 SINCRONIZADO"
      : status === "ERRO"
        ? "🔴 ERRO"
        : "🟡 PENDENTE";

  const classeStatus =
    status === "SINCRONIZADO"
      ? "success"
      : status === "ERRO"
        ? "danger"
        : "warning";

  const eap =
    item.eap || item.atividade || "-";

  const servico =
    item.servico || "Serviço não informado";

  const data =
    item.data || item.criadoEm || "";

  const qtde =
    item.qtdeExecutada ??
    item.qtde ??
    0;

  const unidade =
    item.un ||
    item.unidade ||
    "";

  const equipe =
    item.equipe ||
    "Equipe não informada";

  const horas =
    item.horasTrabalhadas ??
    item.horas ??
    0;

  return `
    <article class="item-diario-card">

      <div class="item-diario-card__header">
        <div>
          <strong>
            📋 ${eap}
          </strong>

          <span>
            ${servico}
          </span>
        </div>

        <span class="badge-sync badge-${classeStatus}">
          ${badge}
        </span>
      </div>

      <div class="item-diario-card__grid">

        <div>
          <small>Data</small>
          <strong>${formatarDataMedicao_(data)}</strong>
        </div>

        <div>
          <small>Quantidade</small>
          <strong>
            ${formatarNumeroMedicao_(qtde)}
            ${unidade}
          </strong>
        </div>

        <div>
          <small>Equipe</small>
          <strong>${equipe}</strong>
        </div>

        <div>
          <small>Horas</small>
          <strong>
            ${formatarNumeroMedicao_(horas)} h
          </strong>
        </div>

      </div>

      ${
        item.observacao
          ? `
            <div class="item-diario-card__obs">
              <small>Observação</small>
              <p>${item.observacao}</p>
            </div>
          `
          : ""
      }

      <div class="item-diario-card__actions">

        <button
          type="button"
          ${bloqueadoEdicao ? "disabled" : ""}
          onclick="editarItemDiarioOffline_('${item.idItem || item.idItemDiario || ""}')">
          ✏ Editar
        </button>

        <button
          type="button"
          onclick="excluirItemDiarioOffline_('${item.idItem || item.idItemDiario || ""}')">
          🗑 Excluir
        </button>

        <button
          type="button"
          onclick="detalharItemDiarioOffline_('${item.idItem || item.idItemDiario || ""}')">
          👁 Detalhes
        </button>

      </div>

    </article>
  `;
}

async function carregarAtividadesItemDiarioOffline_() {
  const select = document.getElementById("itemDiarioAtividade");

  if (!select) return;

  const obraAtiva = obterObraAtivaMobile_();

  const atividadesTodas =
    await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");
  
  const atividades =
    atividadesTodas.filter(item =>
      String(item.idObra) === String(obraAtiva)
    );
  select.innerHTML = '<option value="">Selecione uma atividade</option>';

  atividades.forEach(item => {
    const option = document.createElement("option");

    option.value = item.idAtividade;
    option.textContent = item.eap + " - " + item.servico;

    select.appendChild(option);
  });
}

async function detalharItemDiarioOffline_(idItem) {
  try {
    const itens =
      await listarRegistrosSIGO("TB_DIARIO_ITENS");

    const item =
      itens.find(reg =>
        String(reg.idItem || reg.idItemDiario || "") === String(idItem)
      );

    if (!item) {
      SIGOUI.feedback.warning(
        "Item não encontrado",
        "O registro não foi localizado no banco offline."
      );
      return;
    }

    SIGOUI.showDrawer({
      titulo: "📋 Item do Diário",
      subtitulo: `${item.eap || item.atividade || "-"} • ${item.servico || "Serviço não informado"}`,
      conteudo: montarDetalhesItemDiario_(item),
      textoFechar: "Fechar"
    });

  } catch (erro) {
    console.error("Erro ao detalhar item do diário:", erro);

    SIGOUI.feedback.error(
      "Erro ao abrir detalhes",
      "Não foi possível carregar os detalhes do item."
    );
  }
}

function montarDetalhesItemDiario_(item) {
  const status = item.statusSync || "PENDENTE";

  let badge = "";
  let classeStatus = "";
  let descricaoStatus = "";

  switch (status) {
    case "SINCRONIZADO":
      badge = "🟢 SINCRONIZADO";
      classeStatus = "success";
      descricaoStatus = "Registro enviado ao SIGO.";
      break;

    case "ERRO":
      badge = "🔴 ERRO";
      classeStatus = "danger";
      descricaoStatus = "Falha na sincronização.";
      break;

    default:
      badge = "🟡 PENDENTE";
      classeStatus = "warning";
      descricaoStatus = "Aguardando sincronização.";
  }

  const eap = item.eap || item.atividade || "-";
  const servico = item.servico || "Serviço não informado";
  const qtde = item.qtdeExecutada ?? item.qtde ?? 0;
  const unidade = item.un || item.unidade || "";
  const equipe = item.equipe || "Equipe não informada";
  const horas = item.horasTrabalhadas ?? item.horas ?? 0;
  const equipamento = item.equipamento || "Não informado";
  const observacao =
    item.observacao ||
    "Nenhuma observação registrada neste item.";

  return `
    <div class="drawer-status">
      <span class="badge-sync badge-${classeStatus}">
        ${badge}
      </span>

      <p class="drawer-status-text">
        ${descricaoStatus}
      </p>
    </div>

    <div class="drawer-grid">

      <div class="drawer-kpi">
        <small>Quantidade</small>
        <strong>
          ${formatarNumeroMedicao_(qtde)}
          ${unidade}
        </strong>
      </div>

      <div class="drawer-kpi">
        <small>Horas</small>
        <strong>
          ${formatarNumeroMedicao_(horas)} h
        </strong>
      </div>

      <div class="drawer-kpi">
        <small>Equipe</small>
        <strong>${equipe}</strong>
      </div>

      <div class="drawer-kpi">
        <small>Status</small>
        <strong>${status}</strong>
      </div>

    </div>

    <div class="drawer-section">
      <h4>Dados do Item</h4>

      <div class="drawer-item">
        <span>Data</span>
        <strong>${formatarDataMedicao_(item.data)}</strong>
      </div>

      <div class="drawer-item">
        <span>Obra</span>
        <strong>${item.idObra || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>EAP</span>
        <strong>${eap}</strong>
      </div>

      <div class="drawer-item">
        <span>Serviço</span>
        <strong>${servico}</strong>
      </div>

      <div class="drawer-item">
        <span>Unidade</span>
        <strong>${unidade || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Equipamento</span>
        <strong>${equipamento}</strong>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Observações</h4>
      <p>${observacao}</p>
    </div>

    <div class="drawer-section">
      <h4>Auditoria</h4>

      <div class="drawer-item">
        <span>ID Item</span>
        <strong>${item.idItem || item.idItemDiario || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Criado em</span>
        <strong>${formatarDataHoraMedicao_(item.criadoEm)}</strong>
      </div>

      <div class="drawer-item">
        <span>Status Sync</span>
        <strong>${status}</strong>
      </div>

      <div class="drawer-item">
        <span>Versão</span>
        <strong>1.0</strong>
      </div>
    </div>
  `;
}

async function editarItemDiarioOffline_(
  idItem
) {

  try {

    // ==========================================
    // 1. VALIDAR O CONTEXTO OPERACIONAL
    // ==========================================

    const idObraAtiva =
      String(
        obterObraAtivaMobile_() || ""
      ).trim();

    const idDiarioAtivo =
      String(
        obterDiarioAtivoSIGO_(
          idObraAtiva
        ) || ""
      ).trim();

    const idItemSelecionado =
      String(
        idItem || ""
      ).trim();

    if (!idObraAtiva) {
      throw new Error(
        "Nenhuma obra ativa foi identificada."
      );
    }

    if (!idDiarioAtivo) {
      throw new Error(
        "Abra um Diário antes de editar uma atividade."
      );
    }

    if (!idItemSelecionado) {
      throw new Error(
        "ID do item não informado."
      );
    }

    // ==========================================
    // 2. LOCALIZAR O ITEM NO DIÁRIO ATIVO
    // ==========================================

    const itens =
      await listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      );

    const item =
      itens.find(registro => {

        const idRegistro =
          String(
            registro.idItemDiario ||
            registro.idItem ||
            ""
          );

        return (
          idRegistro ===
            idItemSelecionado &&

          String(
            registro.idObra || ""
          ) ===
            idObraAtiva &&

          String(
            registro.idDiario || ""
          ) ===
            idDiarioAtivo
        );
      }) || null;

    if (!item) {

      SIGOUI.feedback.warning(
        "Item não encontrado",
        "A atividade não foi localizada no Diário ativo."
      );

      return null;
    }

    // ==========================================
    // 3. CONFIRMAR QUE A TELA ESTÁ MONTADA
    // ==========================================

    const idsCamposObrigatorios = [
      "itemDiarioData",
      "itemDiarioAtividade",
      "itemDiarioEap",
      "itemDiarioServico",
      "itemDiarioEquipe",
      "itemDiarioEquipamento",
      "itemDiarioQtde",
      "itemDiarioUnidade",
      "itemDiarioHoras",
      "itemDiarioObservacao"
    ];

    const camposAusentes =
      idsCamposObrigatorios.filter(id =>
        !document.getElementById(id)
      );

    if (camposAusentes.length) {
      throw new Error(
        "A tela do Diário ainda não terminou de carregar. " +
        "Campos ausentes: " +
        camposAusentes.join(", ")
      );
    }

    // ==========================================
    // 4. FUNÇÃO SEGURA PARA PREENCHER CAMPOS
    // ==========================================

    const preencherCampo =
      function (
        idElemento,
        valor
      ) {

        const elemento =
          document.getElementById(
            idElemento
          );

        if (!elemento) {
          return false;
        }

        elemento.value =
          valor ?? "";

        return true;
      };

    // ==========================================
    // 5. PREENCHER A ATIVIDADE
    // ==========================================

    preencherCampo(
      "itemDiarioAtividade",

      item.idAtividade ||
      item.atividade ||
      item.eap ||
      ""
    );

    // Recarregar dados automáticos da atividade,
    // quando a função estiver disponível.
    if (
      typeof preencherDadosAtividadeItemDiario ===
        "function"
    ) {
      await preencherDadosAtividadeItemDiario();
    }

    // ==========================================
    // 6. PREENCHER OS DEMAIS CAMPOS
    // ==========================================

    preencherCampo(
      "itemDiarioData",
      item.data || ""
    );

    preencherCampo(
      "itemDiarioEap",
      item.eap || ""
    );

    preencherCampo(
      "itemDiarioServico",
      item.servico || ""
    );

    preencherCampo(
      "itemDiarioEquipe",
      item.equipe || ""
    );

    preencherCampo(
      "itemDiarioEquipamento",
      item.equipamento || ""
    );

    preencherCampo(
      "itemDiarioQtde",
      item.qtdeExecutada ?? ""
    );

    preencherCampo(
      "itemDiarioUnidade",
      item.unidade ||
      item.un ||
      ""
    );

    preencherCampo(
      "itemDiarioHoras",
      item.horasTrabalhadas ?? ""
    );

    preencherCampo(
      "itemDiarioObservacao",
      item.observacao || ""
    );

    // ==========================================
    // 7. PROTEGER A DATA HERDADA DO DIÁRIO
    // ==========================================

    const campoData =
      document.getElementById(
        "itemDiarioData"
      );

    if (campoData) {
      campoData.readOnly = true;
    }

    // ==========================================
    // 8. ATIVAR O MODO DE EDIÇÃO SOMENTE AGORA
    // ==========================================

    idItemDiarioEdicao =
      item.idItemDiario ||
      item.idItem;

    if (
      typeof atualizarModoEdicaoItemDiario_ ===
        "function"
    ) {
      atualizarModoEdicaoItemDiario_();
    }

    // ==========================================
    // 9. POSICIONAR A TELA
    // ==========================================

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    SIGOUI.feedback.info(
      "Item aberto",
      "A atividade foi carregada para edição."
    );

    return item;

  } catch (erro) {

    // Impedir estado parcial de edição.
    if (
      typeof idItemDiarioEdicao !==
        "undefined"
    ) {
      idItemDiarioEdicao = null;
    }

    if (
      typeof atualizarModoEdicaoItemDiario_ ===
        "function"
    ) {
      atualizarModoEdicaoItemDiario_();
    }

    console.error(
      "Erro ao abrir item do Diário:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao abrir item",
      erro.message ||
      "Não foi possível carregar a atividade."
    );

    return null;
  }
}

function atualizarModoEdicaoItemDiario_() {

  // Localiza exclusivamente o botão responsável
  // por salvar ou atualizar um ITEM do Diário.
  const botao =
    [...document.querySelectorAll(
      "button"
    )].find(elemento => {

      const acao =
        String(
          elemento.getAttribute(
            "onclick"
          ) || ""
        )
          .replace(/\s+/g, "");

      return (
        acao ===
          "salvarItemDiarioPremium()" ||

        acao ===
          "atualizarItemDiarioOffline_()"
      );
    });

  if (!botao) return;

  if (idItemDiarioEdicao) {

    botao.innerHTML =
      "💾 Atualizar Item";

    botao.setAttribute(
      "onclick",
      "atualizarItemDiarioOffline_()"
    );

  } else {

    botao.innerHTML =
      "➕ Adicionar Item";

    botao.setAttribute(
      "onclick",
      "salvarItemDiarioPremium()"
    );
  }
}

async function atualizarItemDiarioOffline_() {

  try {

    // ==========================================
    // 1. VALIDAR O MODO DE EDIÇÃO
    // ==========================================

    if (!idItemDiarioEdicao) {
      throw new Error(
        "Nenhum item está em edição."
      );
    }

    // ==========================================
    // 2. IDENTIFICAR OBRA E DIÁRIO ATIVOS
    // ==========================================

    const idObraAtiva =
      String(
        typeof obterObraAtivaMobile_ ===
          "function"
          ? obterObraAtivaMobile_()
          : ""
      ).trim();

    if (!idObraAtiva) {
      throw new Error(
        "Nenhuma obra ativa foi identificada."
      );
    }

    const idDiarioAtivo =
      String(
        typeof obterDiarioAtivoSIGO_ ===
          "function"
          ? obterDiarioAtivoSIGO_(
              idObraAtiva
            )
          : ""
      ).trim();

    if (!idDiarioAtivo) {
      throw new Error(
        "Nenhum Diário ativo foi identificado."
      );
    }

    // ==========================================
    // 3. LOCALIZAR O ITEM EXISTENTE
    // ==========================================

    const itens =
      await listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      );

    const itemAtual =
      itens.find(registro => {

        const idRegistro =
          String(
            registro.idItemDiario ||
            registro.idItem ||
            ""
          );

        return (
          idRegistro ===
            String(
              idItemDiarioEdicao
            ) &&

          String(
            registro.idObra || ""
          ) ===
            idObraAtiva &&

          String(
            registro.idDiario || ""
          ) ===
            idDiarioAtivo
        );
      }) || null;

    if (!itemAtual) {
      throw new Error(
        "O item em edição não pertence ao Diário ativo."
      );
    }

    // ==========================================
    // 4. FUNÇÃO SEGURA PARA LER OS CAMPOS
    // ==========================================

    const obterValorCampo =
      function (idElemento) {

        const elemento =
          document.getElementById(
            idElemento
          );

        if (!elemento) {
          throw new Error(
            "Campo não encontrado na tela: " +
            idElemento
          );
        }

        return elemento.value;
      };

    // ==========================================
    // 5. LER DADOS COM NOMES CANÔNICOS
    // ==========================================

    const dadosFormulario = {

      idAtividade:
        String(
          obterValorCampo(
            "itemDiarioAtividade"
          ) || ""
        ).trim(),

      eap:
        String(
          obterValorCampo(
            "itemDiarioEap"
          ) || ""
        ).trim(),

      servico:
        String(
          obterValorCampo(
            "itemDiarioServico"
          ) || ""
        ).trim(),

      equipe:
        String(
          obterValorCampo(
            "itemDiarioEquipe"
          ) || ""
        ).trim(),

      equipamento:
        String(
          obterValorCampo(
            "itemDiarioEquipamento"
          ) || ""
        ).trim(),

      qtdeExecutada:
        Number(
          obterValorCampo(
            "itemDiarioQtde"
          ) || 0
        ),

      unidade:
        String(
          obterValorCampo(
            "itemDiarioUnidade"
          ) || ""
        ).trim(),

      horasTrabalhadas:
        Number(
          obterValorCampo(
            "itemDiarioHoras"
          ) || 0
        ),

      observacao:
        String(
          obterValorCampo(
            "itemDiarioObservacao"
          ) || ""
        ).trim()
    };

    // ==========================================
    // 6. REUTILIZAR A VALIDAÇÃO DA ENTIDADE
    // ==========================================

    if (
      typeof SIGOEntities?.diarioItem
        ?.validate === "function"
    ) {
      await SIGOEntities.diarioItem.validate({
        ...dadosFormulario
      });
    }

    // ==========================================
    // 7. REVALIDAR O DIÁRIO E HERDAR A DATA
    // ==========================================

    let dadosVinculo = {
      idDiario:
        idDiarioAtivo,

      data:
        itemAtual.data || ""
    };

    if (
      typeof SIGOEntities?.diarioItem
        ?.beforeSave === "function"
    ) {
      const resultadoVinculo =
        await SIGOEntities
          .diarioItem
          .beforeSave({
            ...dadosFormulario
          });

      dadosVinculo = {
        ...dadosVinculo,
        ...(resultadoVinculo || {})
      };
    }

    if (
      String(
        dadosVinculo.idDiario || ""
      ) !== idDiarioAtivo
    ) {
      throw new Error(
        "O vínculo retornado não corresponde ao Diário ativo."
      );
    }

    // ==========================================
    // 8. PRESERVAR O MESMO REGISTRO
    // ==========================================

    const itemAtualizado = {

      ...itemAtual,
      ...dadosFormulario,

      idItemDiario:
        itemAtual.idItemDiario ||
        itemAtual.idItem,

      idObra:
        idObraAtiva,

      idDiario:
        idDiarioAtivo,

      data:
        dadosVinculo.data,

      statusItem:
        itemAtual.statusItem ||
        "ABERTO",

      statusSync:
        "PENDENTE",

      atualizadoEm:
        new Date().toISOString()
    };

    // ==========================================
    // 9. MANTER VALIDAÇÃO OPERACIONAL LEGADA
    // ==========================================

    if (
      typeof validarAtividadeItemDiarioOffline_ ===
        "function"
    ) {
      await validarAtividadeItemDiarioOffline_({
        ...itemAtualizado,

        // Compatibilidade somente durante
        // a validação da função antiga.
        atividade:
          itemAtualizado.idAtividade,

        un:
          itemAtualizado.unidade
      });
    }

    // ==========================================
    // 10. ATUALIZAR O INDEXEDDB
    // ==========================================

    await salvarRegistroSIGO(
      "TB_DIARIO_ITENS",
      itemAtualizado
    );

    // ==========================================
    // 11. REGISTRAR UPDATE NA FILA OFICIAL
    // ==========================================

    await adicionarNaFilaSyncSIGO({
      tipo:
        "UPDATE",

      storeOrigem:
        "TB_DIARIO_ITENS",

      idRegistro:
        itemAtualizado.idItemDiario,

      idObra:
        itemAtualizado.idObra
    });

    // ==========================================
    // 12. REGISTRAR NOTIFICAÇÃO
    // ==========================================

    if (
      typeof registrarEventoSIGO_ ===
        "function"
    ) {
      await registrarEventoSIGO_({
        evento:
          "ITEM_DIARIO_ATUALIZADO",

        dados:
          itemAtualizado
      });
    }

    // ==========================================
    // 13. ENCERRAR SOMENTE A EDIÇÃO DO ITEM
    // ==========================================

    if (
      typeof limparFormularioItemDiario ===
        "function"
    ) {
      await limparFormularioItemDiario();
    } else {
      idItemDiarioEdicao = null;

      if (
        typeof atualizarModoEdicaoItemDiario_ ===
          "function"
      ) {
        atualizarModoEdicaoItemDiario_();
      }
    }

    // ==========================================
    // 14. ATUALIZAR A INTERFACE UNIFICADA
    // ==========================================

    if (
      typeof listarItensDiarioOffline_ ===
        "function"
    ) {
      await listarItensDiarioOffline_(
        itemAtualizado.idDiario
      );
    }

    if (
      typeof atualizarContextoDiarioAtivoUX19_ ===
        "function"
    ) {
      await atualizarContextoDiarioAtivoUX19_();
    }

    if (
      typeof atualizarIndicadoresMobile_ ===
        "function"
    ) {
      await atualizarIndicadoresMobile_();
    }

    SIGOUI.feedback.success(
      "Item atualizado",
      "A atividade foi atualizada no mesmo registro."
    );

    return itemAtualizado;

  } catch (erro) {

    console.error(
      "Erro ao atualizar item do Diário:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao atualizar item",
      erro.message ||
      "Não foi possível atualizar a atividade."
    );

    return null;
  }
}

// =====================================================
// EXCLUIR ITEM DO DIÁRIO COM FILA ATÔMICA
//
// Regras:
//
// Item nunca sincronizado:
// - cancela UPSERTs pendentes;
// - remove somente do dispositivo;
// - não envia DELETE ao servidor.
//
// Item já sincronizado:
// - cancela UPSERTs pendentes;
// - cria tombstone DELETE;
// - remove o item localmente.
//
// Todas as alterações ocorrem na mesma transação.
// =====================================================
async function excluirItemDiarioComFilaAtomicaSIGO_(
  item
) {

  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new Error(
      "Item do Diário não informado."
    );
  }

  const idItem =
    String(
      item.idItemDiario ||
      item.idItem ||
      ""
    ).trim();

  const idDiario =
    String(
      item.idDiario || ""
    ).trim();

  const idObra =
    String(
      item.idObra || ""
    ).trim();

  if (!idItem) {
    throw new Error(
      "ID do item não informado."
    );
  }

  if (!idDiario) {
    throw new Error(
      "O item não está vinculado a um Diário."
    );
  }

  if (!idObra) {
    throw new Error(
      "O item não está vinculado a uma obra."
    );
  }

  const db =
    SIGO_DB ||
    await abrirBancoLocalSIGO();

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const transaction =
        db.transaction(
          [
            "TB_DIARIO_ITENS",
            "TB_SYNC_QUEUE"
          ],
          "readwrite"
        );

      const storeItens =
        transaction.objectStore(
          "TB_DIARIO_ITENS"
        );

      const storeFila =
        transaction.objectStore(
          "TB_SYNC_QUEUE"
        );

      const resultado = {
        idItem,
        idDiario,
        idObra,

        jaSincronizado:
          false,

        pendenciasCanceladas:
          0,

        tombstoneCriado:
          false,

        tombstoneReutilizado:
          false,

        idSyncDelete:
          "",

        itemRemovido:
          false
      };

      let erroOperacao =
        null;

      transaction.oncomplete =
        () => {

          resolve(
            resultado
          );
        };

      transaction.onerror =
        () => {

          reject(
            erroOperacao ||
            transaction.error ||
            new Error(
              "Falha na transação de exclusão."
            )
          );
        };

      transaction.onabort =
        () => {

          reject(
            erroOperacao ||
            transaction.error ||
            new Error(
              "A exclusão foi cancelada."
            )
          );
        };


      // ================================================
      // LER A FILA DENTRO DA MESMA TRANSAÇÃO
      // ================================================
      const requestFila =
        storeFila.getAll();

      requestFila.onerror =
        () => {

          erroOperacao =
            requestFila.error ||
            new Error(
              "Não foi possível consultar a fila."
            );

          transaction.abort();
        };

      requestFila.onsuccess =
        () => {

          try {

            const fila =
              Array.isArray(
                requestFila.result
              )
                ? requestFila.result
                : [];

            const relacionadas =
              fila.filter(
                pendencia => {

                  return (
                    String(
                      pendencia.storeOrigem ||
                      ""
                    ).trim() ===
                      "TB_DIARIO_ITENS" &&

                    String(
                      pendencia.idRegistro ||
                      ""
                    ).trim() ===
                      idItem &&

                    String(
                      pendencia.idObra ||
                      ""
                    ).trim() ===
                      idObra
                  );
                }
              );


            // ==========================================
            // DESCOBRIR SE O REGISTRO JÁ EXISTIU
            // NO SERVIDOR
            // ==========================================
            const itemJaSincronizado =
              String(
                item.statusSync || ""
              )
                .trim()
                .toUpperCase() ===
                "SINCRONIZADO" ||

              Boolean(
                String(
                  item.dataSync || ""
                ).trim()
              );

            const possuiHistoricoSincronizado =
              relacionadas.some(
                pendencia => {

                  return (
                    String(
                      pendencia.statusSync ||
                      ""
                    )
                      .trim()
                      .toUpperCase() ===
                    "SINCRONIZADO"
                  );
                }
              );

            const deletePendenteExistente =
              relacionadas.find(
                pendencia => {

                  return (
                    String(
                      pendencia.statusSync ||
                      ""
                    )
                      .trim()
                      .toUpperCase() ===
                      "PENDENTE" &&

                    ehPendenciaDeleteSIGO_(
                      pendencia
                    )
                  );
                }
              ) || null;

            resultado.jaSincronizado =
              itemJaSincronizado ||
              possuiHistoricoSincronizado ||
              Boolean(
                deletePendenteExistente
              );


            // ==========================================
            // CANCELAR UPSERTS PENDENTES DO MESMO ITEM
            // ==========================================
            const agora =
              new Date()
                .toISOString();

            relacionadas
              .filter(
                pendencia => {

                  return (
                    String(
                      pendencia.statusSync ||
                      ""
                    )
                      .trim()
                      .toUpperCase() ===
                      "PENDENTE" &&

                    !ehPendenciaDeleteSIGO_(
                      pendencia
                    )
                  );
                }
              )
              .forEach(
                pendencia => {

                  pendencia.statusSync =
                    "CANCELADO";

                  pendencia.canceladoEm =
                    agora;

                  pendencia.motivoCancelamento =
                    "REGISTRO_EXCLUIDO_LOCALMENTE";

                  storeFila.put(
                    pendencia
                  );

                  resultado
                    .pendenciasCanceladas++;
                }
              );


            // ==========================================
            // CRIAR OU REUTILIZAR TOMBSTONE
            // ==========================================
            if (
              resultado.jaSincronizado
            ) {

              if (
                deletePendenteExistente
              ) {

                resultado.tombstoneReutilizado =
                  true;

                resultado.idSyncDelete =
                  String(
                    deletePendenteExistente
                      .idSyncLocal ||
                    ""
                  );

              } else {

                const idSyncDelete =
                  "SYNC-LOCAL-" +
                  Date.now() +
                  "-DEL-" +
                  Math.random()
                    .toString(36)
                    .slice(2, 8);

                const tombstone = {
                  idSyncLocal:
                    idSyncDelete,

                  tipo:
                    "DELETE",

                  operacao:
                    "DELETE",

                  entidade:
                    "DIARIO_ITEM",

                  storeOrigem:
                    "TB_DIARIO_ITENS",

                  idRegistro:
                    idItem,

                  idObra,

                  idDiario,

                  payloadExclusao: {
                    entidade:
                      "DIARIO_ITEM",

                    storeOrigem:
                      "TB_DIARIO_ITENS",

                    idRegistro:
                      idItem,

                    idItemDiario:
                      idItem,

                    idDiario,

                    idObra
                  },

                  statusSync:
                    "PENDENTE",

                  tentativas:
                    0,

                  criadoEm:
                    agora
                };

                storeFila.put(
                  tombstone
                );

                resultado.tombstoneCriado =
                  true;

                resultado.idSyncDelete =
                  idSyncDelete;
              }
            }


            // ==========================================
            // REMOVER O ITEM LOCAL
            // ==========================================
            const requestDelete =
              storeItens.delete(
                idItem
              );

            requestDelete.onerror =
              () => {

                erroOperacao =
                  requestDelete.error ||
                  new Error(
                    "Não foi possível remover o item."
                  );

                transaction.abort();
              };

            requestDelete.onsuccess =
              () => {

                resultado.itemRemovido =
                  true;
              };

          } catch (erro) {

            erroOperacao =
              erro;

            transaction.abort();
          }
        };
    }
  );
}

// =====================================================
// EXCLUIR ITEM DO DIÁRIO — UX.19
// =====================================================
async function excluirItemDiarioOffline_(
  idItem
) {

  try {

    const idItemNormalizado =
      String(
        idItem || ""
      ).trim();

    if (!idItemNormalizado) {
      throw new Error(
        "ID do item não informado."
      );
    }


    // ================================================
    // CONTEXTO ATIVO
    // ================================================
    const obraAtiva =
      String(
        await obterObraAtivaMobile_() ||
        ""
      ).trim();

    if (!obraAtiva) {
      throw new Error(
        "Nenhuma obra ativa foi encontrada."
      );
    }

    const idDiarioAtivo =
      String(
        obterDiarioAtivoSIGO_(
          obraAtiva
        ) ||
        ""
      ).trim();

    if (!idDiarioAtivo) {
      throw new Error(
        "Abra o Diário correspondente antes de excluir o item."
      );
    }


    // ================================================
    // LOCALIZAR O ITEM DENTRO DO CONTEXTO CORRETO
    // ================================================
    const itens =
      await listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      );

    const item =
      itens.find(
        registro => {

          const idRegistro =
            String(
              registro.idItemDiario ||
              registro.idItem ||
              ""
            ).trim();

          return (
            idRegistro ===
              idItemNormalizado &&

            String(
              registro.idObra ||
              ""
            ).trim() ===
              obraAtiva &&

            String(
              registro.idDiario ||
              ""
            ).trim() ===
              idDiarioAtivo
          );
        }
      );

    if (!item) {

      SIGOUI.feedback.warning(
        "Item não encontrado",
        "O registro não pertence à obra e ao Diário atualmente abertos."
      );

      return;
    }


    // ================================================
    // CONFIRMAÇÃO
    // ================================================
    const atividade =
      String(
        item.servico ||
        item.idAtividade ||
        item.atividade ||
        item.eap ||
        "Item do Diário"
      ).trim();

    const confirmou =
      await SIGOUI.feedback.confirm({
        tipo:
          "danger",

        icone:
          "🗑️",

        titulo:
          "Excluir item",

        mensagem:
          atividade +
          "\n\n" +
          "O item será removido deste dispositivo. " +
          "Se já tiver sido sincronizado, a exclusão " +
          "será enviada ao SIGO na próxima sincronização.",

        textoConfirmar:
          "Excluir",

        textoCancelar:
          "Cancelar"
      });

    if (!confirmou) {
      return;
    }


    // ================================================
    // EXCLUSÃO ATÔMICA
    // ================================================
    const resultado =
      await excluirItemDiarioComFilaAtomicaSIGO_(
        item
      );


    // ================================================
    // INVALIDAR CACHES
    // ================================================
    if (
      window.SIGODataCache
    ) {

      SIGODataCache.invalidate(
        "TB_DIARIO_ITENS"
      );

      SIGODataCache.invalidate(
        "TB_SYNC_QUEUE"
      );
    }

    if (
      typeof invalidarCacheObraSIGO_ ===
      "function"
    ) {

      invalidarCacheObraSIGO_(
        "TB_DIARIO_ITENS",
        obraAtiva
      );

      invalidarCacheObraSIGO_(
        "TB_SYNC_QUEUE",
        obraAtiva
      );
    }


    // ================================================
    // NOTIFICAR DATABINDING
    // ================================================
    if (
      window.SIGODataBinding &&
      typeof SIGODataBinding.notify ===
        "function"
    ) {

      await SIGODataBinding.notify(
        "TB_DIARIO_ITENS",
        {
          acao:
            "DELETE",

          store:
            "TB_DIARIO_ITENS",

          chave:
            idItemNormalizado,

          idObra:
            obraAtiva,

          idDiario:
            idDiarioAtivo
        }
      );

      await SIGODataBinding.notify(
        "TB_SYNC_QUEUE",
        {
          acao:
            "UPDATE",

          store:
            "TB_SYNC_QUEUE",

          idObra:
            obraAtiva,

          idRegistro:
            idItemNormalizado
        }
      );
    }


    // ================================================
    // ENCERRAR EDIÇÃO DO ITEM, SEM ENCERRAR O DIÁRIO
    // ================================================
    if (
      typeof idItemDiarioEdicao !==
        "undefined" &&
      idItemDiarioEdicao &&
      String(
        idItemDiarioEdicao
      ) ===
        idItemNormalizado
    ) {

      if (
        typeof limparFormularioItemDiario ===
        "function"
      ) {
        await limparFormularioItemDiario();

      } else {

        idItemDiarioEdicao =
          null;

        atualizarModoEdicaoItemDiario_();
      }
    }


    // ================================================
    // ATUALIZAR A TELA UNIFICADA
    // ================================================
    await listarItensDiarioOffline_(
      idDiarioAtivo
    );

    if (
      typeof atualizarContextoDiarioAtivoUX19_ ===
        "function"
    ) {
      await atualizarContextoDiarioAtivoUX19_();
    }

    if (
      typeof atualizarIndicadoresMobile_ ===
        "function"
    ) {
      await atualizarIndicadoresMobile_();
    }


    // ================================================
    // RETORNO VISUAL
    // ================================================
    const mensagem =
      resultado.jaSincronizado
        ? (
            "Item removido. A exclusão ficou pendente " +
            "para ser enviada ao SIGO."
          )
        : (
            "Item local removido. Como ainda não havia " +
            "sido sincronizado, nenhum DELETE será enviado."
          );

    SIGOUI.feedback.success(
      "Item excluído",
      mensagem
    );

    console.log(
      "Exclusão do item concluída:",
      resultado
    );

    return resultado;

  } catch (erro) {

    console.error(
      "Erro ao excluir item:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro?.message ||
      "Não foi possível excluir o item."
    );

    return null;
  }
}

function encerrarModoEdicaoItemDiario_() {
  idItemDiarioEdicao = null;

  atualizarModoEdicaoItemDiario_();

  if (typeof limparFormularioItemDiario === "function") {
    limparFormularioItemDiario();
  }
}

async function carregarObrasMobile_() {
  const select = document.getElementById("obraAtiva");

  if (!select) return;

  const obras = await listarRegistrosSIGO("TB_OBRAS");

  const contador =
    document.getElementById("contadorObrasOffline");

  if (contador) {
    contador.textContent =
      obras.length + " de 3 obras offline";
  }

  select.innerHTML = "";

  if (!obras.length) {
    select.innerHTML = '<option value="">Nenhuma obra offline</option>';
    return;
  }

  obras.forEach(obra => {
    const option = document.createElement("option");

    option.value = obra.idObra;
    option.textContent =
      obra.idObra + " - " + obra.nomeObra;

    select.appendChild(option);
  });

  const obraSalva =
    localStorage.getItem("obraAtiva");

  if (obraSalva) {
    select.value = obraSalva;
  }

  const nomeObra =
    document.getElementById("nomeObra");

  const obraSelecionada =
    obras.find(obra =>
      String(obra.idObra) === String(select.value)
    );

  if (nomeObra && obraSelecionada) {
    nomeObra.textContent =
      obraSelecionada.nomeObra || obraSelecionada.idObra;
  }
}

function obterObraAtivaMobile_() {
  return localStorage.getItem("obraAtiva") || "";
}

async function abrirGerenciadorObrasOffline_() {
  const area = document.getElementById("telaApp");
  document.getElementById("homeApp").style.display = "none";
  
  if (!area) return;

  area.innerHTML = `
    <div class="tela-card gerenciador-obras">

      <button class="btn-voltar" onclick="voltarHome()">← Voltar</button>

      <h2>🏗 Obras Offline</h2>

      <p>Gerencie as obras disponíveis neste dispositivo.</p>

      <section class="obras-bloco">
        <h3>Obras baixadas</h3>
        <div id="listaObrasOffline">
          Carregando obras offline...
        </div>
      </section>

      <section class="obras-bloco">
        <h3>Obras disponíveis</h3>
        <div id="listaObrasDisponiveis">
          Carregando obras disponíveis...
        </div>
      </section>

    </div>
  `;

  await listarObrasOfflineMobile_();
  await listarObrasDisponiveisMobile_();

  window.scrollTo({
    top: area.offsetTop,
    behavior: "smooth"
  });
}

async function listarObrasOfflineMobile_() {
  const container = document.getElementById("listaObrasOffline");

  if (!container) return;

  const obras = await listarRegistrosSIGO("TB_OBRAS");
  const obraAtiva = localStorage.getItem("obraAtiva") || "";

  if (!obras.length) {
    container.innerHTML = `
      <div class="obra-offline-vazia">
        Nenhuma obra baixada neste dispositivo.
      </div>
    `;
    return;
  }

  container.innerHTML = obras.map(obra => {
    const ativa = String(obra.idObra) === String(obraAtiva);

    return `
      <div class="obra-offline-item">
        <strong>${obra.idObra}</strong>
        <span>${obra.nomeObra || obra.idObra}</span>
        <small>Última atualização: ${formatarDataObraOffline_(obra.dataSync)}</small>

        <div class="obra-acoes">
          <button onclick="definirObraAtivaMobile_('${obra.idObra}')">
            ${ativa ? "✅ Ativa" : "Definir ativa"}
          </button>

          <button onclick="removerObraOfflineMobile_('${obra.idObra}')">
            Remover
          </button>
        </div>
      </div>
    `;
  }).join("");
}

async function listarObrasDisponiveisMobile_() {
  const container = document.getElementById("listaObrasDisponiveis");

  if (!container) return;

  try {
    const resposta = await fetch(SIGO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        token: SIGO_TOKEN_OFFLINE,
        acao: "LISTAR_OBRAS_DISPONIVEIS",
        idDispositivo: "WEB-MOBILE-001",
        idUsuario: "USUARIO_APP"
      })
    });

    const resultado = await resposta.json();

    const obras =
      resultado.obras ||
      resultado.detalhes?.obras ||
      [];

    if (!obras.length) {
      container.innerHTML = `
        <div class="obra-offline-vazia">
          Nenhuma obra disponível.
        </div>
      `;
      return;
    }

    const obrasOffline = await listarRegistrosSIGO("TB_OBRAS");
    const idsOffline = obrasOffline.map(obra => String(obra.idObra));

    container.innerHTML = obras.map(obra => {
      const jaBaixada = idsOffline.includes(String(obra.idObra));

      return `
        <div class="obra-offline-item">
          <strong>${obra.idObra}</strong>
          <span>${obra.nomeObra}</span>
          <small>${obra.status || ""} • ${obra.responsavel || ""}</small>

          <div class="obra-acoes">
            <button
              ${jaBaixada ? "disabled" : ""}
              onclick="baixarObraOfflineMobile_('${obra.idObra}')">
              ${jaBaixada ? "Já baixada" : "Baixar"}
            </button>
          </div>
        </div>
      `;
    }).join("");

  } catch (erro) {
    console.error("Erro ao listar obras disponíveis:", erro);

    container.innerHTML = `
      <div class="obra-offline-vazia">
        Erro ao carregar obras disponíveis.
      </div>
    `;
  }
}

function formatarDataObraOffline_(dataISO) {
  if (!dataISO) return "--";

  try {
    return new Date(dataISO).toLocaleString("pt-BR");
  } catch (erro) {
    return "--";
  }
}

async function definirObraAtivaMobile_(idObra) {
  try {
    if (!idObra) {
      throw new Error(
        "ID da obra não informado."
      );
    }

    const obras =
      await listarRegistrosSIGO(
        "TB_OBRAS"
      );

    const obra =
      obras.find(item =>
        String(item.idObra) ===
        String(idObra)
      );

    if (!obra) {
      throw new Error(
        "Obra não encontrada no banco offline."
      );
    }

    const obraAnterior =
      SIGOAppContext.getObraAtiva();

    if (
      String(obraAnterior) ===
      String(idObra)
    ) {
      SIGOUI.feedback.info(
        "Obra já ativa",
        `"${obra.nomeObra || obra.idObra}" já é a obra ativa.`
      );

      return;
    }

    SIGOAppContext.setObraAtiva(
      idObra
    );

    await atualizarHeroObraAtivaMobile_();

    if (
      typeof atualizarHomeMobile_ ===
      "function"
    ) {
      await atualizarHomeMobile_();
    }

    if (
      typeof listarObrasOfflineMobile_ ===
      "function"
    ) {
      await listarObrasOfflineMobile_();
    }

    // =====================================================
    // NOTIFICAÇÃO — OBRA ATIVA ALTERADA
    // =====================================================
    if (
      typeof registrarEventoSIGO_ ===
      "function"
    ) {
      await registrarEventoSIGO_({
        evento: "OBRA_ALTERADA",

        dados: {
          idObra: obra.idObra,

          nomeObra:
            obra.nomeObra ||
            obra.idObra,

          obraAnterior:
            obraAnterior,

          obraAtual:
            obra.idObra
        }
      });
    }

    SIGOUI.feedback.success(
      "Obra ativa alterada",
      `Agora você está trabalhando na obra "${obra.nomeObra || obra.idObra}".`
    );

  } catch (erro) {
    console.error(
      "Erro ao definir obra ativa:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao definir obra ativa",
      erro.message ||
      "Não foi possível alterar a obra ativa."
    );
  }
}

async function baixarObraOfflineMobile_(idObra) {
  let obraAnterior = null;

  try {
    if (!idObra) {
      throw new Error(
        "ID da obra não informado."
      );
    }

    const obrasLocais =
      await listarRegistrosSIGO(
        "TB_OBRAS"
      );

    const jaExiste =
      obrasLocais.some(obra =>
        String(obra.idObra) ===
        String(idObra)
      );

    if (jaExiste) {
      SIGOUI.feedback.warning(
        "Obra já baixada",
        "Esta obra já está disponível neste dispositivo."
      );

      return {
        ok: false,
        motivo: "OBRA_JA_BAIXADA"
      };
    }

    if (obrasLocais.length >= 3) {
      SIGOUI.feedback.warning(
        "Limite atingido",
        "Remova uma obra antes de baixar outra. " +
        "O limite é de 3 obras offline."
      );

      return {
        ok: false,
        motivo: "LIMITE_OBRAS_OFFLINE"
      };
    }

    obraAnterior =
      localStorage.getItem("obraAtiva");

    // A troca é temporária apenas para informar
    // à API qual obra deverá ser baixada.
    localStorage.setItem(
      "obraAtiva",
      idObra
    );

    const resultadoDownload =
      await sincronizarDadosBaseObraMobile();

    // =====================================================
    // RESTAURA A OBRA ANTERIOR
    // =====================================================
    if (obraAnterior) {
      localStorage.setItem(
        "obraAtiva",
        obraAnterior
      );
    } else if (resultadoDownload?.ok) {
      // Se ainda não existia obra ativa,
      // a primeira obra baixada permanece ativa.
      localStorage.setItem(
        "obraAtiva",
        idObra
      );
    } else {
      localStorage.removeItem(
        "obraAtiva"
      );
    }

    // =====================================================
    // DOWNLOAD NÃO CONCLUÍDO
    // =====================================================
    if (!resultadoDownload?.ok) {
      console.warn(
        "Download da obra não concluído:",
        resultadoDownload
      );

      return resultadoDownload || {
        ok: false,
        erro:
          "Não foi possível baixar a obra."
      };
    }

    await atualizarHomeMobile_();
    await listarObrasOfflineMobile_();
    await listarObrasDisponiveisMobile_();

    // Não repetir feedback nem notificação aqui.
    // sincronizarDadosBaseObraMobile() já executou:
    //
    // → feedback de sucesso
    // → evento OBRA_BAIXADA

    return resultadoDownload;

  } catch (erro) {
    // =====================================================
    // RESTAURAÇÃO EM CASO DE ERRO INESPERADO
    // =====================================================
    if (obraAnterior) {
      localStorage.setItem(
        "obraAtiva",
        obraAnterior
      );
    } else {
      localStorage.removeItem(
        "obraAtiva"
      );
    }

    console.error(
      "Erro ao baixar obra offline:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao baixar obra",
      erro.message ||
      "Não foi possível baixar a obra para uso offline."
    );

    return {
      ok: false,
      erro:
        erro.message ||
        "Falha ao baixar obra."
    };
  }
}

async function removerObraOfflineMobile_(idObra) {
  try {
    if (!idObra) {
      throw new Error(
        "ID da obra não informado."
      );
    }

    // =====================================================
    // LOCALIZA A OBRA ANTES DA EXCLUSÃO
    // =====================================================
    const obras =
      await listarRegistrosSIGO(
        "TB_OBRAS"
      );

    const obraRemovida =
      obras.find(obra =>
        String(obra.idObra) ===
        String(idObra)
      );

    if (!obraRemovida) {
      throw new Error(
        "Obra não encontrada no banco offline."
      );
    }

    // =====================================================
    // PROTEÇÃO CONTRA PERDA DE DADOS NÃO SINCRONIZADOS
    // =====================================================
    const fila =
      await listarRegistrosSIGO(
        "TB_SYNC_QUEUE"
      );

    const pendenciasDaObra =
      fila.filter(item =>
        String(item.idObra) ===
          String(idObra) &&
        String(item.statusSync || "PENDENTE")
          .toUpperCase() !== "SINCRONIZADO"
      );

    if (pendenciasDaObra.length > 0) {
      SIGOUI.feedback.warning(
        "Sincronização pendente",
        `A obra possui ${pendenciasDaObra.length} ` +
        "registro(s) ainda não sincronizado(s). " +
        "Sincronize antes de remover a obra."
      );

      return {
        ok: false,
        motivo: "PENDENCIAS_SYNC",
        totalPendencias:
          pendenciasDaObra.length
      };
    }

    // =====================================================
    // CONFIRMAÇÃO
    // =====================================================
    const nomeObra =
      obraRemovida.nomeObra ||
      obraRemovida.idObra;

    const confirmar =
      await SIGOUI.feedback.confirm({
        tipo: "warning",
        icone: "🗑️",
        titulo: "Remover obra",
        mensagem:
          `Deseja remover a obra "${nomeObra}" ` +
          "deste dispositivo?\n\n" +
          "Todos os dados offline desta obra serão apagados.",
        textoConfirmar: "Remover",
        textoCancelar: "Cancelar"
      });

    if (!confirmar) {
      return {
        ok: false,
        motivo: "CANCELADO"
      };
    }

    const obraAtivaAnterior =
      window.SIGOAppContext?.getObraAtiva?.() ||
      localStorage.getItem("obraAtiva");

    // =====================================================
    // REMOVE TODOS OS DADOS OPERACIONAIS DA OBRA
    // =====================================================
    const storesPorObra = [
      "TB_ATIVIDADES_OBRA",
      "TB_DIARIOS",
      "TB_DIARIO_ITENS",
      "TB_MEDICOES",
      "TB_LOTES_MEDICAO",
      "TB_OCORRENCIAS",
      "TB_CLIMA",
      "TB_EVIDENCIAS",
      "TB_SYNC_QUEUE",
      "TB_NOTIFICACOES"
    ];

    for (const storeName of storesPorObra) {
      await removerRegistrosPorObraSIGO_(
        storeName,
        idObra
      );
    }

    await removerRegistroPorChaveSIGO_(
      "TB_OBRAS",
      idObra
    );

    // =====================================================
    // REDEFINE A OBRA ATIVA, SE NECESSÁRIO
    // =====================================================
    const obrasRestantes =
      await listarRegistrosSIGO(
        "TB_OBRAS"
      );

    let novaObraAtiva =
      obraAtivaAnterior;

    if (
      String(obraAtivaAnterior) ===
      String(idObra)
    ) {
      novaObraAtiva =
        obrasRestantes[0]?.idObra ||
        null;

      if (novaObraAtiva) {
        SIGOAppContext.setObraAtiva(
          novaObraAtiva
        );
      } else {
        localStorage.removeItem(
          "obraAtiva"
        );
      }
    }

    // =====================================================
    // ATUALIZA A INTERFACE
    // =====================================================
    if (
      typeof atualizarHomeMobile_ ===
      "function"
    ) {
      await atualizarHomeMobile_();
    }

    if (
      typeof atualizarHeroObraAtivaMobile_ ===
      "function"
    ) {
      await atualizarHeroObraAtivaMobile_();
    }

    if (
      typeof listarObrasOfflineMobile_ ===
      "function"
    ) {
      await listarObrasOfflineMobile_();
    }

    if (
      typeof listarObrasDisponiveisMobile_ ===
      "function"
    ) {
      await listarObrasDisponiveisMobile_();
    }

    // =====================================================
    // NOTIFICAÇÃO — OBRA REMOVIDA
    // =====================================================
    if (
      novaObraAtiva &&
      typeof registrarEventoSIGO_ ===
        "function"
    ) {
      await registrarEventoSIGO_({
        evento: "OBRA_REMOVIDA",

        dados: {
          idObra:
            obraRemovida.idObra,

          nomeObra:
            obraRemovida.nomeObra ||
            obraRemovida.idObra
        }
      });
    }

    SIGOUI.feedback.success(
      "Obra removida",
      `"${nomeObra}" foi removida deste dispositivo.`
    );

    return {
      ok: true,
      idObraRemovida: idObra,
      nomeObraRemovida: nomeObra,
      novaObraAtiva: novaObraAtiva
    };

  } catch (erro) {
    console.error(
      "Erro ao remover obra offline:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro ao remover obra",
      erro.message ||
      "Não foi possível remover a obra deste dispositivo."
    );

    return {
      ok: false,
      erro:
        erro.message ||
        "Falha ao remover obra."
    };
  }
}

async function atualizarHomeMobile_() {
  await carregarObrasMobile_();
  await atualizarPainelSaudeSync_();
  await atualizarIndicadorAtividadesOffline_();
}

async function atualizarIndicadorAtividadesOffline_() {
  const contador =
    document.getElementById("contadorAtividadesOffline");

  if (!contador) return;

  const obraAtiva =
    localStorage.getItem("obraAtiva");

  if (!obraAtiva) {
    contador.textContent =
      "0 atividades offline";
    return;
  }

  const atividades =
    await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const total =
    atividades.filter(item =>
      String(item.idObra) === String(obraAtiva)
    ).length;

  contador.textContent =
    total + " atividades offline";
}


async function auditarTabelasOfflineMobile_() {

  const stores = [
    "TB_DIARIOS",
    "TB_DIARIO_ITENS",
    "TB_MEDICOES",
    "TB_OCORRENCIAS",
    "TB_CLIMA",
    "TB_EVIDENCIAS"
  ];

  const resultado = [];

  for (const storeName of stores) {

    const registros =
      await listarRegistrosSIGO(storeName);

    const total =
      registros.length;

    const semIdObra =
      registros.filter(item => !item.idObra).length;

    const semStatusSync =
      registros.filter(item => !item.statusSync).length;

    const semOrigem =
      registros.filter(item => !item.origem).length;

    const semCriadoEm =
      registros.filter(item => !item.criadoEm).length;

    const pendentes =
      registros.filter(item =>
        item.statusSync === "PENDENTE"
      ).length;

    const sincronizados =
      registros.filter(item =>
        item.statusSync === "SINCRONIZADO"
      ).length;

    resultado.push({
      store: storeName,
      total,
      pendentes,
      sincronizados,
      semIdObra,
      semStatusSync,
      semOrigem,
      semCriadoEm,
      status:
        semIdObra === 0 &&
        semStatusSync === 0 &&
        semOrigem === 0 &&
        semCriadoEm === 0
          ? "OK"
          : "AJUSTAR"
    });

  }

  console.table(resultado);

  return resultado;
}

async function auditarFilaSyncOfflineMobile_() {

  const fila =
    await listarRegistrosSIGO("TB_SYNC_QUEUE");

  const resultado = {
    total: fila.length,

    pendentes: fila.filter(item =>
      item.statusSync === "PENDENTE"
    ).length,

    sincronizados: fila.filter(item =>
      item.statusSync === "SINCRONIZADO"
    ).length,

    semTipo: fila.filter(item =>
      !item.tipo
    ).length,

    semStoreOrigem: fila.filter(item =>
      !item.storeOrigem
    ).length,

    semIdRegistro: fila.filter(item =>
      !item.idRegistro
    ).length,

    semIdObra: fila.filter(item =>
      !item.idObra
    ).length,

    semStatusSync: fila.filter(item =>
      !item.statusSync
    ).length,

    semCriadoEm: fila.filter(item =>
      !item.criadoEm
    ).length
  };

  resultado.status =
    resultado.semTipo === 0 &&
    resultado.semStoreOrigem === 0 &&
    resultado.semIdRegistro === 0 &&
    resultado.semIdObra === 0 &&
    resultado.semStatusSync === 0 &&
    resultado.semCriadoEm === 0
      ? "OK"
      : "AJUSTAR";

  console.table([resultado]);

  const agrupadoPorTipo =
    fila.reduce((acc, item) => {

      const tipo =
        item.tipo || "SEM_TIPO";

      if (!acc[tipo]) {
        acc[tipo] = 0;
      }

      acc[tipo]++;

      return acc;

    }, {});

  console.log(
    "Fila agrupada por tipo:",
    agrupadoPorTipo
  );

  return {
    resumo: resultado,
    porTipo: agrupadoPorTipo,
    registros: fila
  };
}

async function auditarPacoteSyncMobile_() {

  const obraAtiva =
    obterObraAtivaMobile_();

  const diarios =
    await listarRegistrosSIGO("TB_DIARIOS");

  const diarioItens =
    await listarRegistrosSIGO("TB_DIARIO_ITENS");

  const medicoes =
    await listarRegistrosSIGO("TB_MEDICOES");

  const ocorrencias =
    await listarRegistrosSIGO("TB_OCORRENCIAS");

  const clima =
    await listarRegistrosSIGO("TB_CLIMA");

  const evidencias =
    await listarRegistrosSIGO("TB_EVIDENCIAS");

  const pacote = {
    diarios: diarios.filter(item =>
      item.statusSync === "PENDENTE"
    ),

    diarioItens: diarioItens.filter(item =>
      item.statusSync === "PENDENTE"
    ),

    medicoes: medicoes.filter(item =>
      item.statusSync === "PENDENTE"
    ),

    ocorrencias: ocorrencias.filter(item =>
      item.statusSync === "PENDENTE"
    ),

    clima: clima.filter(item =>
      item.statusSync === "PENDENTE"
    ),

    evidencias: evidencias.filter(item =>
      item.statusSync === "PENDENTE"
    )
  };

  const resumo = {
    idObra: obraAtiva,
    diarios: pacote.diarios.length,
    diarioItens: pacote.diarioItens.length,
    medicoes: pacote.medicoes.length,
    ocorrencias: pacote.ocorrencias.length,
    clima: pacote.clima.length,
    evidencias: pacote.evidencias.length,
    total:
      pacote.diarios.length +
      pacote.diarioItens.length +
      pacote.medicoes.length +
      pacote.ocorrencias.length +
      pacote.clima.length +
      pacote.evidencias.length
  };

  console.table([resumo]);

  console.log(
    "Pacote de sincronização auditado:",
    pacote
  );

  return {
    resumo,
    pacote
  };
}

async function preencherDadosAtividadeMedicaoOficial() {
  const idAtividade = document.getElementById("medicaoAtividade")?.value;

  if (!idAtividade) return;

  const atividades = await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const atividadeBase = atividades.find(item =>
    String(item.idAtividade) === String(idAtividade) ||
    String(item.eap) === String(idAtividade)
  );

  if (!atividadeBase) {
    SIGOUI.feedback.warning(
      "Atualização necessária",
      "Atualize os dados-base da obra para continuar."
    );
    return;
  }

  const idObra = obterObraAtivaMobile_();

  const medicoes = await listarRegistrosSIGO("TB_MEDICOES");

  const totalJaMedido = medicoes
    .filter(item =>
      String(item.idObra) === String(idObra) &&
      (
        String(item.atividade) === String(idAtividade) ||
        String(item.eap) === String(atividadeBase.eap)
      )
    )
    .reduce((total, item) => total + Number(item.qtdeExecutada || 0), 0);

  const qtdePlanejada = Number(atividadeBase.qtdePlanejada || 0);
  const saldoDisponivel = qtdePlanejada - totalJaMedido;

  document.getElementById("medicaoEAP").value = atividadeBase.eap || "";
  document.getElementById("medicaoServico").value = atividadeBase.servico || "";
  document.getElementById("medicaoUnidade").value = atividadeBase.unidade || "";
  document.getElementById("medicaoQtdePlanejada").value = qtdePlanejada;
  document.getElementById("medicaoJaMedido").value = totalJaMedido;
  document.getElementById("medicaoSaldoDisponivel").value = saldoDisponivel;

  calcularPercentualMedicaoOficial();
}

function calcularPercentualMedicaoOficial() {
  const qtdePlanejada =
    Number(document.getElementById("medicaoQtdePlanejada")?.value || 0);

  const qtdeExecutada =
    Number(document.getElementById("medicaoQtdeExecutada")?.value || 0);

  const campoPercentual =
    document.getElementById("medicaoPercentual");

  if (!campoPercentual) return;

  if (!qtdePlanejada || qtdePlanejada <= 0) {
    campoPercentual.value = 0;
    return;
  }

  const percentual = (qtdeExecutada / qtdePlanejada) * 100;

  campoPercentual.value = percentual.toFixed(2);
}

function novaMedicaoPremium() {
    idMedicaoEdicao = null;
    atualizarModoEdicaoMedicao_();
  
  [
    "medicaoAtividade",
    "medicaoEAP",
    "medicaoServico",
    "medicaoUnidade",
    "medicaoQtdePlanejada",
    "medicaoJaMedido",
    "medicaoSaldoDisponivel",
    "medicaoQtdeExecutada",
    "medicaoPercentual",
    "medicaoObservacao"
  ].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  const data = document.getElementById("medicaoData");
  if (data) data.value = new Date().toISOString().split("T")[0];

  const obra = document.getElementById("medicaoObra");
  if (obra) obra.value = obterObraAtivaMobile_();
}

async function salvarMedicaoPremium() {
  if (idMedicaoEdicao) {
    await atualizarMedicaoOffline_();
    return;
  }

  await salvarMedicaoOffline({
    preventDefault: function () {}
  });
}

async function atualizarMedicaoOffline_() {
  try {
        
    if (!idMedicaoEdicao) {
      throw new Error("Nenhuma medição selecionada para edição.");
    }

    const medicoes =
      await listarRegistrosSIGO("TB_MEDICOES");

    const medicaoOriginal =
      medicoes.find(item =>
        String(item.idMedicao) === String(idMedicaoEdicao)
      );

    if (!medicaoOriginal) {
      throw new Error("Medição original não encontrada.");
    }

    const medicaoAtualizada = {
      ...medicaoOriginal,

      data: document.getElementById("medicaoData").value,
      idObra: document.getElementById("medicaoObra").value,
      atividade: document.getElementById("medicaoAtividade").value,
      eap: document.getElementById("medicaoEAP").value,
      servico: document.getElementById("medicaoServico").value,
      qtdePlanejada: Number(document.getElementById("medicaoQtdePlanejada").value || 0),
      qtdeExecutada: Number(document.getElementById("medicaoQtdeExecutada").value || 0),
      un: document.getElementById("medicaoUnidade").value,
      percentualExecutado: Number(document.getElementById("medicaoPercentual").value || 0),
      observacao: document.getElementById("medicaoObservacao").value,

      atualizadoEm: new Date().toISOString(),

      statusSync: "PENDENTE"
    };

    await validarSaldoOfflineMedicao_(medicaoAtualizada);

    await salvarRegistroSIGO(
      "TB_MEDICOES",
      medicaoAtualizada
    );

    await recalcularMedicoesAtividadeOffline_(
      medicaoAtualizada.idObra,
      medicaoAtualizada.atividade,
      medicaoAtualizada.eap
    );

   /* await enfileirarSyncSIGO({
      tipoOperacao: "UPDATE",
      storeOrigem: "TB_MEDICOES",
      idRegistro: medicaoAtualizada.idMedicao,
      idObra: medicaoAtualizada.idObra
    });*/

    idMedicaoEdicao = null;

    atualizarModoEdicaoMedicao_();

    await listarMedicoesOffline_();
    await atualizarIndicadoresMobile_();
    
    novaMedicaoPremium();
    
    // =====================================================
    // NOTIFICAÇÃO — MEDIÇÃO ATUALIZADA
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "MEDICAO_ATUALIZAR",
        dados: medicaoAtualizada
      });
    }
    
    SIGOUI.feedback.success(
      "Medição atualizada",
      "Registro atualizado offline com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao atualizar medição:", erro);

    SIGOUI.feedback.error(
      "Erro ao atualizar",
      erro.message || "Não foi possível atualizar a medição offline."
    );
  }
}

async function listarMedicoesOffline_() {
  const container =
    document.getElementById("listaMedicoesOffline");

  if (!container) return;

  try {
    const obraAtiva =
      obterObraAtivaMobile_();

    let loteReferencia = null;

   if (idLoteMedicaoSelecionado) {
    const lotes =
      await listarRegistrosSIGO("TB_LOTES_MEDICAO");
  
    loteReferencia =
      lotes.find(lote =>
        String(lote.idLoteMedicao) ===
          String(idLoteMedicaoSelecionado) &&
        String(lote.idObra) ===
          String(obraAtiva)
      ) || null;
  }
    
    if (!loteReferencia) {
      loteReferencia =
        await obterLoteMedicaoAberto_();
    }
    
    if (!loteReferencia) {
      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma medição selecionada.
        </div>
      `;
      return;
    }

    const medicoes =
      await listarRegistrosSIGO("TB_MEDICOES");

    const medicoesDoLote =
      medicoes
        .filter(item =>
          String(item.idObra) === String(obraAtiva) &&
          String(item.idLoteMedicao) === String(loteReferencia.idLoteMedicao)
        )
        .sort((a, b) =>
          new Date(b.criadoEm) - new Date(a.criadoEm)
        );

    if (!medicoesDoLote.length) {
      container.innerHTML = `
        <div class="card-vazio">
          Nenhum item registrado na ${loteReferencia.numeroMedicao}.
        </div>
      `;
      return;
    }

    container.innerHTML =
      medicoesDoLote
        .map(medicao => criarCardMedicaoOffline_(medicao))
        .join("");

  } catch (erro) {
    console.error("Erro ao listar medições:", erro);

    container.innerHTML = `
      <div class="card-vazio">
        Erro ao carregar medições.
      </div>
    `;
  }
}

function montarDetalhesMedicao_(medicao) {
  const status = medicao.statusSync || "PENDENTE";

  let badge = "";
  let classeStatus = "";
  let descricaoStatus = "";

  switch (status) {
    case "SINCRONIZADO":
      badge = "🟢 SINCRONIZADO";
      classeStatus = "success";
      descricaoStatus = "Registro enviado ao SIGO.";
      break;

    case "ERRO":
      badge = "🔴 ERRO";
      classeStatus = "danger";
      descricaoStatus = "Falha na sincronização.";
      break;

    default:
      badge = "🟡 PENDENTE";
      classeStatus = "warning";
      descricaoStatus = "Aguardando sincronização.";
  }

  const percentual = Number(
    medicao.percentualExecutadoAcumulado ??
    medicao.percentualExecutado ??
    0
  );

  const acumulado = Number(
    medicao.qtdeExecutadaAcumulada ??
    medicao.qtdeExecutada ??
    0
  );

  let progressoClasse = "";

  if (percentual < 30) {
    progressoClasse = "danger";
  } else if (percentual < 70) {
    progressoClasse = "warning";
  } else {
    progressoClasse = "success";
  }

  const observacao =
    medicao.observacao ||
    "Nenhuma observação registrada nesta medição.";

  const origem =
    medicao.origem ||
    "APP OFFLINE";

  const excesso =
    medicao.excessoDetectado === "SIM";

   return `
    <div class="drawer-status">
      <span class="badge-sync badge-${classeStatus}">
        ${badge}
      </span>

      <p class="drawer-status-text">
        ${descricaoStatus}
      </p>
    </div>

    <div class="drawer-grid">

      <div class="drawer-kpi">
        <small>Planejado</small>
        <strong>
          ${formatarNumeroMedicao_(medicao.qtdePlanejada)}
          ${medicao.un || ""}
        </strong>
      </div>

      <div class="drawer-kpi">
        <small>Acumulado</small>
        <strong>
          ${formatarNumeroMedicao_(acumulado)}
          ${medicao.un || ""}
        </strong>
      </div>

      <div class="drawer-kpi">
        <small>Nesta medição</small>
        <strong>
          ${formatarNumeroMedicao_(medicao.qtdeExecutada)}
          ${medicao.un || ""}
        </strong>
      </div>

      <div class="drawer-kpi">
        <small>Saldo</small>
        <strong>
          ${formatarNumeroMedicao_(medicao.saldoDisponivelDepois)}
          ${medicao.un || ""}
        </strong>
      </div>

    </div>

    <div class="drawer-progress">
      <div class="drawer-progress-title">
        <span>Progresso da atividade</span>
        <strong>${formatarNumeroMedicao_(percentual)}%</strong>
      </div>

      <div class="progress">
        <div
          class="progress-fill progress-${progressoClasse}"
          style="width:${Math.min(percentual, 100)}%">
        </div>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Dados da Medição</h4>

      <div class="drawer-item">
        <span>Data</span>
        <strong>${formatarDataMedicao_(medicao.data)}</strong>
      </div>

      <div class="drawer-item">
        <span>Obra</span>
        <strong>${medicao.idObra || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>EAP</span>
        <strong>${medicao.eap || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Origem</span>
        <strong>${origem}</strong>
      </div>

      <div class="drawer-item">
        <span>Status Medição</span>
        <strong>${medicao.statusMedicao || "-"}</strong>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Observações</h4>
      <p>${observacao}</p>
    </div>

    <div class="drawer-section">
      <h4>Excesso</h4>

      ${
        excesso
          ? `
            <div class="medicao-card__excesso">
              ⚠️ Excesso autorizado
              <small>
                ${medicao.justificativaExcesso || "Sem justificativa informada."}
              </small>
            </div>
          `
          : `<p>Nenhum excesso registrado.</p>`
      }
    </div>

    <div class="drawer-section">
      <h4>Auditoria</h4>

      <div class="drawer-item">
        <span>ID Medição</span>
        <strong>${medicao.idMedicao || "-"}</strong>
      </div>

      <div class="drawer-item">
        <span>Criado em</span>
        <strong>${formatarDataHoraMedicao_(medicao.criadoEm)}</strong>
      </div>

      <div class="drawer-item">
        <span>Status Sync</span>
        <strong>${status}</strong>
      </div>

      <div class="drawer-item">
        <span>Versão</span>
        <strong>1.0</strong>
      </div>
    </div>
  `;
}

async function detalharMedicaoOffline_(idMedicao) {
  try {
    const medicoes = await listarRegistrosSIGO("TB_MEDICOES");

    const medicao = medicoes.find(item =>
      String(item.idMedicao) === String(idMedicao)
    );

    if (!medicao) {
      SIGOUI.feedback.warning(
        "Medição não encontrada",
        "O registro não foi localizado no banco offline."
      );
      return;
    }

    SIGOUI.showDrawer({
      titulo: "📏 Medição",
      subtitulo: `${medicao.eap || medicao.atividade || "-"} • ${medicao.servico || ""}`,
      conteudo: montarDetalhesMedicao_(medicao),
      textoFechar: "Fechar"
    });

  } catch (erro) {
    console.error("Erro ao detalhar medição:", erro);

    SIGOUI.feedback.error(
      "Erro ao abrir detalhes",
      "Não foi possível carregar os detalhes da medição."
    );
  }
}

function atualizarModoEdicaoMedicao_() {
  const botao =
    document.getElementById("btnSalvarMedicao");

  if (!botao) return;

  const texto =
    botao.querySelector("strong");

  if (!texto) return;

  if (idMedicaoEdicao) {
    texto.textContent = "Atualizar";
  } else {
    texto.textContent = "Salvar";
  }
}

function ativarModoEdicaoMedicaoTeste_(idMedicao) {
  idMedicaoEdicao = idMedicao;
  atualizarModoEdicaoMedicao_();

  SIGOUI.feedback.info(
    "Modo edição",
    "A medição está pronta para edição."
  );
}

async function editarMedicaoOffline_(idMedicao) {
  try {
    const medicoes =
      await listarRegistrosSIGO("TB_MEDICOES");

    const medicao =
      medicoes.find(item =>
        String(item.idMedicao) === String(idMedicao)
      );

    if (!medicao) {
      SIGOUI.feedback.warning(
        "Medição não encontrada",
        "O registro não foi localizado no banco offline."
      );
      return;
    }

    idMedicaoEdicao = medicao.idMedicao;

    preencherFormularioMedicao_(medicao);

    atualizarModoEdicaoMedicao_();

    SIGOUI.feedback.info(
      "Modo edição",
      "A medição foi carregada para edição."
    );

    const campoData =
      document.getElementById("medicaoData");

    if (campoData) {
      campoData.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

  } catch (erro) {
    console.error("Erro ao editar medição:", erro);

    SIGOUI.feedback.error(
      "Erro ao editar",
      "Não foi possível carregar a medição para edição."
    );
  }
}

function preencherFormularioMedicao_(medicao) {
  const campos = {
    medicaoData: medicao.data || "",
    medicaoObra: medicao.idObra || "",
    medicaoAtividade: medicao.atividade || "",
    medicaoEAP: medicao.eap || "",
    medicaoServico: medicao.servico || "",
    medicaoUnidade: medicao.un || "",
    medicaoQtdePlanejada: medicao.qtdePlanejada || 0,
    medicaoJaMedido: medicao.totalJaMedidoOffline || 0,
    medicaoSaldoDisponivel: medicao.saldoDisponivelAntes || 0,
    medicaoQtdeExecutada: medicao.qtdeExecutada || 0,
    medicaoPercentual: medicao.percentualExecutado || 0,
    medicaoObservacao: medicao.observacao || ""
  };

  Object.keys(campos).forEach(id => {
    const campo =
      document.getElementById(id);

    if (campo) {
      campo.value = campos[id];
    }
  });
}

async function recalcularMedicoesAtividadeOffline_(idObra, atividade, eap) {
  const atividades =
    await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const atividadeBase =
    atividades.find(item =>
      String(item.idObra) === String(idObra) &&
      (
        String(item.idAtividade) === String(atividade) ||
        String(item.eap) === String(eap)
      )
    );

  if (!atividadeBase) {
    throw new Error(
      "Atividade base não encontrada para recálculo."
    );
  }

  const qtdePlanejada =
    Number(atividadeBase.qtdePlanejada || 0);

  const medicoes =
    await listarRegistrosSIGO("TB_MEDICOES");

  const medicoesAtividade =
    medicoes
      .filter(item =>
        String(item.idObra) === String(idObra) &&
        (
          String(item.atividade) === String(atividade) ||
          String(item.eap) === String(eap)
        )
      )
      .sort((a, b) =>
        new Date(a.criadoEm) - new Date(b.criadoEm)
      );

  let acumulado = 0;

  for (const medicao of medicoesAtividade) {
    const qtdeExecutada =
      Number(medicao.qtdeExecutada || 0);

    const saldoAntes =
      qtdePlanejada - acumulado;

    acumulado += qtdeExecutada;

    const saldoDepois =
      qtdePlanejada - acumulado;

    const percentualAcumulado =
      qtdePlanejada > 0
        ? (acumulado / qtdePlanejada) * 100
        : 0;

    medicao.qtdePlanejada =
      qtdePlanejada;

    medicao.totalJaMedidoOffline =
      acumulado - qtdeExecutada;

    medicao.qtdeExecutadaAcumulada =
      acumulado;

    medicao.percentualExecutadoAcumulado =
      percentualAcumulado;

    medicao.saldoBaseOffline =
      qtdePlanejada;

    medicao.saldoDisponivelAntes =
      saldoAntes;

    medicao.saldoDisponivelDepois =
      saldoDepois;

    medicao.validacaoSaldoOffline =
      saldoDepois < 0 ? "EXCESSO" : "OK";

    medicao.atualizadoEm =
      new Date().toISOString();

    await salvarRegistroSIGO(
      "TB_MEDICOES",
      medicao
    );
  }
}

async function excluirMedicaoOffline_(idMedicao) {
  try {
    if (!idMedicao) {
      throw new Error("ID da medição não informado.");
    }

    const medicoes =
      await listarRegistrosSIGO("TB_MEDICOES");

    const medicao =
      medicoes.find(item =>
        String(item.idMedicao) === String(idMedicao)
      );

    if (!medicao) {
      SIGOUI.feedback.warning(
        "Medição não encontrada",
        "O registro não foi localizado no banco offline."
      );
      return;
    }

    const confirmou = await SIGOUI.feedback.confirm({
      tipo: "danger",
      icone: "🗑️",
      titulo: "Excluir medição",
      mensagem:
        "Esta medição será removida deste dispositivo.\n\n" +
        "Os saldos e acumulados da atividade serão recalculados.",
      textoConfirmar: "Excluir",
      textoCancelar: "Cancelar"
    });

    if (!confirmou) return;

   await removerRegistroSIGO_(
      "TB_MEDICOES",
      idMedicao
    );

    await recalcularMedicoesAtividadeOffline_(
      medicao.idObra,
      medicao.atividade,
      medicao.eap
    );

    // TODO UX.07.14
    // Registrar DELETE na TB_SYNC_QUEUE

    if (String(idMedicaoEdicao) === String(idMedicao)) {
      idMedicaoEdicao = null;
      atualizarModoEdicaoMedicao_();
      novaMedicaoPremium();
    }

    await listarMedicoesOffline_();
    await atualizarIndicadoresMobile_();

    SIGOUI.feedback.success(
      "Medição excluída",
      "Registro removido e saldos recalculados."
    );

  } catch (erro) {
    console.error("Erro ao excluir medição:", erro);

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro.message || "Não foi possível excluir a medição."
    );
  }
}

async function obterLoteMedicaoAberto_() {
  const obraAtiva =
    obterObraAtivaMobile_();

  const lotes =
    await listarRegistrosSIGO("TB_LOTES_MEDICAO");

  return lotes.find(lote =>
    String(lote.idObra) === String(obraAtiva) &&
    String(lote.status) === "ABERTA"
  ) || null;
}

async function gerarNumeroMedicao_() {
  const obraAtiva =
    obterObraAtivaMobile_();

  const lotes =
    await listarRegistrosSIGO("TB_LOTES_MEDICAO");

  const lotesObra =
    lotes.filter(lote =>
      String(lote.idObra) === String(obraAtiva)
    );

  const proximo =
    lotesObra.length + 1;

  return "MED." + String(proximo).padStart(3, "0");
}

async function salvarLoteMedicao_(dados = {}) {
  const novoLote =
    !dados.idLoteMedicao;

  const obraAtiva =
    obterObraAtivaMobile_();

  const loteAberto =
    await obterLoteMedicaoAberto_();

  if (
    loteAberto &&
    (
      !dados.idLoteMedicao ||
      String(dados.idLoteMedicao) !==
        String(loteAberto.idLoteMedicao)
    )
  ) {
    throw new Error(
      "Já existe uma medição aberta para esta obra."
    );
  }

  const agora =
    new Date().toISOString();

  const lote = {
    idLoteMedicao:
      dados.idLoteMedicao ||
      "LOTE-MED-" + Date.now(),

    numeroMedicao:
      dados.numeroMedicao ||
      await gerarNumeroMedicao_(),

    idObra:
      dados.idObra || obraAtiva,

    dataInicio:
      dados.dataInicio || "",

    dataFim:
      dados.dataFim || "",

    status:
      dados.status || "ABERTA",

    observacoes:
      dados.observacoes || "",

    usuarioCriacao:
      dados.usuarioCriacao || "USUARIO_APP",

    usuarioFechamento:
      dados.usuarioFechamento || "",

    dataFechamento:
      dados.dataFechamento || "",

    statusSync:
      "PENDENTE",

    criadoEm:
      dados.criadoEm || agora,

    atualizadoEm:
      dados.idLoteMedicao ? agora : "",

    dataSync:
      dados.dataSync || ""
  };

  validarLoteMedicao_(lote);

  await salvarRegistroSIGO(
    "TB_LOTES_MEDICAO",
    lote
  );

  await adicionarNaFilaSyncSIGO({
    tipo: novoLote ? "INSERT" : "UPDATE",
    storeOrigem: "TB_LOTES_MEDICAO",
    idRegistro: lote.idLoteMedicao,
    idObra: lote.idObra
  });

  // =====================================================
  // NOTIFICAÇÃO — NOVO LOTE DE MEDIÇÃO
  // =====================================================
  if (
    novoLote &&
    typeof registrarEventoSIGO_ === "function"
  ) {
    await registrarEventoSIGO_({
      evento: "LOTE_MEDICAO_CRIADO",
      dados: lote
    });
  }

  return lote;
}

function validarLoteMedicao_(lote) {
  if (!lote.idObra) {
    throw new Error("Obra ativa não encontrada.");
  }

  if (!lote.dataInicio) {
    throw new Error("Informe a data inicial da medição.");
  }

  if (!lote.dataFim) {
    throw new Error("Informe a data final da medição.");
  }

  if (new Date(lote.dataFim) < new Date(lote.dataInicio)) {
    throw new Error(
      "A data final não pode ser menor que a data inicial."
    );
  }

  return true;
}

async function fecharLotesVencidosMedicao_() {
  const obraAtiva =
    obterObraAtivaMobile_();

  const hoje =
    new Date().toISOString().split("T")[0];

  const lotes =
    await listarRegistrosSIGO("TB_LOTES_MEDICAO");

  const vencidos =
    lotes.filter(lote =>
      String(lote.idObra) === String(obraAtiva) &&
      String(lote.status) === "ABERTA" &&
      lote.dataFim &&
      String(lote.dataFim) < String(hoje)
    );

  for (const lote of vencidos) {
    lote.status = "FECHADA";
    lote.dataFechamento = new Date().toISOString();
    lote.usuarioFechamento = "SISTEMA";
    lote.atualizadoEm = new Date().toISOString();
    lote.statusSync = "PENDENTE";

    await salvarRegistroSIGO(
      "TB_LOTES_MEDICAO",
      lote
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "UPDATE",
      storeOrigem: "TB_LOTES_MEDICAO",
      idRegistro: lote.idLoteMedicao,
      idObra: lote.idObra
    });
  }

  return vencidos.length;
}

async function contarItensDoLoteMedicao_(idLoteMedicao) {
  if (!idLoteMedicao) return 0;

  const medicoes =
    await listarRegistrosSIGO("TB_MEDICOES");

  return medicoes.filter(item =>
    String(item.idLoteMedicao) === String(idLoteMedicao)
  ).length;
}

async function criarHeroLoteMedicaoAtivo_() {
  const lote =
    await obterLoteMedicaoAberto_();

  if (!lote) {
    return `
      <section class="sigo-card medicao-lote-card medicao-lote-card--empty">
        <div class="section-title">
          <span>📦</span>
          <h2>NENHUMA MEDIÇÃO ABERTA</h2>
        </div>

        <p>Crie uma nova medição para registrar os itens medidos.</p>
      </section>
    `;
  }

  const medicoes =
    await listarRegistrosSIGO("TB_MEDICOES");

  const itensLote =
    medicoes.filter(item =>
      String(item.idObra) === String(lote.idObra) &&
      String(item.idLoteMedicao) === String(lote.idLoteMedicao)
    );

  const totalItens =
    itensLote.length;

  const quantidadeTotal =
    itensLote.reduce((total, item) =>
      total + Number(item.qtdeExecutada || 0),
      0
    );

  const hoje =
    new Date().toISOString().split("T")[0];

  const diasRestantes =
    lote.dataFim
      ? Math.max(
          0,
          Math.ceil(
            (new Date(lote.dataFim) - new Date(hoje)) /
            (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  return `
    <section class="sigo-card medicao-lote-card">
      <div class="section-title">
        <span>📦</span>
        <h2>MEDIÇÃO ATIVA</h2>
      </div>

      <div class="medicao-lote-numero">
        ${lote.numeroMedicao}
      </div>

      <div class="medicao-lote-status">
        🟢 ${lote.status}
      </div>

      <div class="medicao-lote-periodo">
        ${formatarDataMedicao_(lote.dataInicio)}
        →
        ${formatarDataMedicao_(lote.dataFim)}
      </div>

      <div class="medicao-lote-dashboard">
        <div>
          <small>Itens medidos</small>
          <strong>${totalItens}</strong>
        </div>

        <div>
          <small>Quantidade medida</small>
          <strong>${formatarNumeroMedicao_(quantidadeTotal)}</strong>
        </div>

        <div>
          <small>Dias restantes</small>
          <strong>${diasRestantes}</strong>
        </div>
      </div>
    </section>
  `;
}

async function abrirDrawerLoteMedicao_() {
  try {
    await fecharLotesVencidosMedicao_();

    const lote =
      await obterLoteMedicaoAberto_();

    SIGOUI.showDrawer({
      titulo: lote
        ? "📦 Gerenciar Medição"
        : "➕ Nova Medição",

      subtitulo: lote
        ? `${lote.numeroMedicao} • ${lote.status}`
        : "Defina o período da nova medição",

      conteudo: montarFormularioLoteMedicao_(lote),

      textoFechar: "Cancelar"
    });

  } catch (erro) {
    console.error("Erro ao abrir lote:", erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível abrir o gerenciamento da medição."
    );
  }
}

function montarFormularioLoteMedicao_(lote = null) {
  const hoje =
    new Date().toISOString().split("T")[0];

  return `
    <div class="drawer-section" style="border-top:none;margin-top:0;padding-top:0;">

      <input
        type="hidden"
        id="loteMedicaoId"
        value="${lote ? lote.idLoteMedicao : ""}"
      >

      <input
        type="hidden"
        id="loteMedicaoNumero"
        value="${lote ? lote.numeroMedicao : ""}"
      >

      <div class="drawer-grid">

        <div class="drawer-kpi">
          <small>Medição</small>
          <strong>${lote ? lote.numeroMedicao : "Nova"}</strong>
        </div>

        <div class="drawer-kpi">
          <small>Status</small>
          <strong>${lote ? lote.status : "ABERTA"}</strong>
        </div>

      </div>

      <div class="sigo-form" style="margin-top:16px;">

        ${SIGOUI.createDate({
          id: "loteMedicaoDataInicio",
          label: "Data Inicial",
          value: lote ? lote.dataInicio : hoje
        })}

        ${SIGOUI.createDate({
          id: "loteMedicaoDataFim",
          label: "Data Final",
          value: lote ? lote.dataFim : hoje
        })}

        ${SIGOUI.createTextarea({
          id: "loteMedicaoObservacoes",
          label: "Observações",
          rows: 3,
          placeholder: "Observações da medição",
          value: lote ? lote.observacoes : ""
        })}

      </div>

      <div class="drawer-actions" style="margin-top:18px;">
        <button
          type="button"
          class="sigo-action-btn is-success"
          onclick="salvarLoteMedicaoDrawer_()">
          <span>💾</span>
          <strong>Definir / Salvar</strong>
        </button>
      </div>

    </div>
  `;
}

async function salvarLoteMedicaoDrawer_() {
  try {
    const idLote =
      document.getElementById("loteMedicaoId").value;

    const numeroMedicao =
      document.getElementById("loteMedicaoNumero").value;

    const dataInicio =
      document.getElementById("loteMedicaoDataInicio").value;

    const dataFim =
      document.getElementById("loteMedicaoDataFim").value;

    const observacoes =
      document.getElementById("loteMedicaoObservacoes").value;

    const lote =
      await salvarLoteMedicao_({
        idLoteMedicao: idLote,
        numeroMedicao: numeroMedicao,
        dataInicio: dataInicio,
        dataFim: dataFim,
        observacoes: observacoes,
        status: "ABERTA"
      });

    if (typeof SIGOUI.closeDrawer === "function") {
      SIGOUI.closeDrawer();
    }

    SIGOUI.feedback.success(
      "Medição definida",
      `${lote.numeroMedicao} está pronta para receber itens.`
    );

    navegarPara("medicoes");

  } catch (erro) {
    console.error("Erro ao salvar lote:", erro);

    SIGOUI.feedback.error(
      "Erro ao salvar",
      erro.message || "Não foi possível salvar a medição."
    );
  }
}

async function obterAcaoBotaoLoteMedicao_() {

  await fecharLotesVencidosMedicao_();

  const lote =
    await obterLoteMedicaoAberto_();

  if (!lote) {
    return {
      icone: "➕",
      texto: "Nova Medição",
      tipo: "is-primary",
      acao: "abrirDrawerLoteMedicao_()"
    };
  }

  const hoje =
    new Date().toISOString().split("T")[0];

  if (
    lote.dataFim &&
    String(lote.dataFim) < String(hoje)
  ) {
    return {
      icone: "⚠️",
      texto: "Revisar",
      tipo: "is-warning",
      acao: "abrirDrawerLoteMedicao_()"
    };
  }

  return {
    icone: "📦",
    texto: "Gerenciar",
    tipo: "is-primary",
    acao: "abrirDrawerLoteMedicao_()"
  };
}

/*async function criarTimelineLotesMedicao_() {
  const obraAtiva =
    obterObraAtivaMobile_();

  const lotes =
    await listarRegistrosSIGO("TB_LOTES_MEDICAO");

  const lotesObra =
    lotes
      .filter(lote =>
        String(lote.idObra) === String(obraAtiva)
      )
      .sort((a, b) =>
        new Date(b.criadoEm || b.dataInicio) -
        new Date(a.criadoEm || a.dataInicio)
      );

  if (!lotesObra.length) {
    return `
      <section class="sigo-card medicao-timeline-card">
        <div class="section-title">
          <span>📚</span>
          <h2>HISTÓRICO DE MEDIÇÕES</h2>
        </div>
    
        <div class="medicao-timeline">
          ${cards.join("")}
        </div>
    
        <div class="medicao-timeline-footer">
          <button
            type="button"
            class="btn-secondary"
            onclick="abrirDrawerHistoricoMedicoes_()">
            📚 Ver todas as medições
          </button>
        </div>
      </section>
    `;
  }

  const itens =
    await listarRegistrosSIGO("TB_MEDICOES");

  const cards =
    await Promise.all(
      lotesObra.map(async lote => {
        const totalItens =
          itens.filter(item =>
            String(item.idLoteMedicao) === String(lote.idLoteMedicao)
          ).length;

        return criarItemTimelineLoteMedicao_(lote, totalItens);
      })
    );

  return `
    <section class="sigo-card medicao-timeline-card">
      <div class="section-title">
        <span>📚</span>
        <h2>HISTÓRICO DE MEDIÇÕES</h2>
      </div>

      <div class="medicao-timeline">
        ${cards.join("")}
      </div>
    </section>
  `;
}*/

async function criarTimelineLotesMedicao_() {
  const obraAtiva =
    obterObraAtivaMobile_();

  const lotes =
    await listarRegistrosSIGO("TB_LOTES_MEDICAO");

 const lotesObra =
    lotes
      .filter(lote =>
        String(lote.idObra) === String(obraAtiva)
      )
      .sort((a, b) =>
        new Date(b.criadoEm || b.dataInicio) -
        new Date(a.criadoEm || a.dataInicio)
      )
      .slice(0, 3);

  if (!lotesObra.length) {
    return `
      <section class="sigo-card medicao-timeline-card">
        <div class="section-title">
          <span>📚</span>
          <h2>HISTÓRICO DE MEDIÇÕES</h2>
        </div>

        <p>Nenhum lote de medição criado.</p>
      </section>
    `;
  }

  const itens =
    await listarRegistrosSIGO("TB_MEDICOES");

  const cards =
    await Promise.all(
      lotesObra.map(async lote => {
        
  const totalItens =
    itens.filter(item =>
      String(item.idObra) === String(obraAtiva) &&
      String(item.idLoteMedicao) === String(lote.idLoteMedicao)
    ).length;

        return criarItemTimelineLoteMedicao_(lote, totalItens);
      })
    );

  return `
    <section class="sigo-card medicao-timeline-card">
      <div class="section-title">
        <span>📚</span>
        <h2>HISTÓRICO DE MEDIÇÕES</h2>
      </div>

      <div class="medicao-timeline">
        ${cards.join("")}
      </div>

      <div class="medicao-timeline-footer">
        <button
          type="button"
          class="btn-secondary"
          onclick="abrirDrawerHistoricoMedicoes_()">
          📚 Ver todas as medições
        </button>
      </div>
    </section>
  `;
}

function criarItemTimelineLoteMedicao_(lote, totalItens = 0) {
  const status =
    lote.status || "ABERTA";

  const classe =
    status === "ABERTA"
      ? "is-open"
      : "is-closed";

  const badge =
    status === "ABERTA"
      ? "🟢 ABERTA"
      : "⚪ FECHADA";

  return `
    <article
      class="medicao-timeline__item ${classe}"
      onclick="selecionarLoteMedicaoTimeline_('${lote.idLoteMedicao}')"
    >
    
      <div class="medicao-timeline__dot"></div>

      <div class="medicao-timeline__content">
        <div class="medicao-timeline__header">
          <strong>${lote.numeroMedicao || "MED.---"}</strong>
          <span>${badge}</span>
        </div>

        <small>
          ${formatarDataMedicao_(lote.dataInicio)}
          →
          ${formatarDataMedicao_(lote.dataFim)}
        </small>

        <p>
          ${totalItens} item(ns) medido(s)
        </p>
      </div>
    </article>
  `;
}

async function selecionarLoteMedicaoTimeline_(idLoteMedicao) {
  idLoteMedicaoSelecionado =
    idLoteMedicao;

  await listarMedicoesOffline_();
  await atualizarCabecalhoHistoricoMedicao_();

  SIGOUI.feedback.info(
    "Medição selecionada",
    "Histórico atualizado para o lote selecionado."
  );
}

async function obterLoteHistoricoSelecionado_() {
  const obraAtiva = obterObraAtivaMobile_();

  if (idLoteMedicaoSelecionado) {
    const lotes =
      await listarRegistrosSIGO("TB_LOTES_MEDICAO");

    const loteSelecionado =
      lotes.find(lote =>
        String(lote.idLoteMedicao) === String(idLoteMedicaoSelecionado) &&
        String(lote.idObra) === String(obraAtiva)
      ) || null;

    if (loteSelecionado) {
      return loteSelecionado;
    }

    idLoteMedicaoSelecionado = null;
  }

  return await obterLoteMedicaoAberto_();
}

async function abrirDrawerHistoricoMedicoes_() {
  try {
    const conteudo =
      await montarDrawerHistoricoMedicoes_();

    SIGOUI.showDrawer({
      titulo: "📚 Histórico de Medições",
      subtitulo: "Todos os lotes da obra ativa",
      conteudo: conteudo,
      textoFechar: "Fechar"
    });

  } catch (erro) {
    console.error("Erro ao abrir histórico de medições:", erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível abrir o histórico de medições."
    );
  }
}

async function montarDrawerHistoricoMedicoes_() {
  const obraAtiva =
    obterObraAtivaMobile_();

  const lotes =
    await listarRegistrosSIGO("TB_LOTES_MEDICAO");

  const medicoes =
    await listarRegistrosSIGO("TB_MEDICOES");

  const lotesObra =
    lotes
      .filter(lote =>
        String(lote.idObra) === String(obraAtiva)
      )
      .sort((a, b) =>
        new Date(b.criadoEm || b.dataInicio) -
        new Date(a.criadoEm || a.dataInicio)
      );

  if (!lotesObra.length) {
    return `
      <div class="drawer-section">
        <p>Nenhuma medição encontrada para esta obra.</p>
      </div>
    `;
  }

  return `
    <div class="drawer-section" style="border-top:none;margin-top:0;padding-top:0;">

      ${SIGOUI.createInput({
        id: "pesquisaHistoricoMedicao",
        label: "Pesquisar",
        placeholder: "Ex.: MED.001",
        oninput: "filtrarHistoricoMedicoesDrawer_()"
      })}

      <div id="listaHistoricoMedicoesDrawer" class="historico-medicoes-drawer">
        ${lotesObra
          .map(lote => {
            const totalItens =
              medicoes.filter(item =>
                String(item.idLoteMedicao) === String(lote.idLoteMedicao)
              ).length;

            return criarItemDrawerHistoricoMedicao_(lote, totalItens);
          })
          .join("")}
      </div>

    </div>
  `;
}

function criarItemDrawerHistoricoMedicao_(lote, totalItens = 0) {
  const status =
    lote.status || "ABERTA";

  const badge =
    status === "ABERTA"
      ? "🟢 ABERTA"
      : "⚪ FECHADA";

  return `
    <button
      type="button"
      class="historico-medicao-item"
      data-medicao="${lote.numeroMedicao || ""}"
      onclick="selecionarLoteHistoricoDrawer_('${lote.idLoteMedicao}')">

      <div>
        <strong>${lote.numeroMedicao || "MED.---"}</strong>
        <small>
          ${formatarDataMedicao_(lote.dataInicio)}
          →
          ${formatarDataMedicao_(lote.dataFim)}
        </small>
      </div>

      <div>
        <span>${badge}</span>
        <small>${totalItens} item(ns)</small>
      </div>

    </button>
  `;
}

async function selecionarLoteHistoricoDrawer_(idLoteMedicao) {
  idLoteMedicaoSelecionado =
    idLoteMedicao;

  if (typeof SIGOUI.closeDrawer === "function") {
    SIGOUI.closeDrawer();
  }

  await listarMedicoesOffline_();

  SIGOUI.feedback.info(
    "Medição selecionada",
    "Histórico atualizado para o lote selecionado."
  );
}

function filtrarHistoricoMedicoesDrawer_() {
  const termo =
    document
      .getElementById("pesquisaHistoricoMedicao")
      .value
      .toUpperCase();

  const itens =
    document.querySelectorAll(".historico-medicao-item");

  itens.forEach(item => {
    const medicao =
      item.dataset.medicao || "";

    item.style.display =
      medicao.toUpperCase().includes(termo)
        ? "flex"
        : "none";
  });
}

async function atualizarCabecalhoHistoricoMedicao_() {

  const lote =
    await obterLoteHistoricoSelecionado_();

  document.getElementById("tituloHistoricoMedicao").textContent =
    `📚 Histórico da ${lote?.numeroMedicao || "Medição"}`;

  document.getElementById("subtituloHistoricoMedicao").textContent =
    lote
      ? "Itens vinculados a este lote"
      : "Nenhuma medição selecionada";
}

async function contarAtividadesOfflineObra_() {
  const obraAtivaBruta =
    obterObraAtivaMobile_();

  const obraAtiva =
    String(obraAtivaBruta).split(" ")[0].trim();

  const atividades =
    await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  return atividades.filter(item =>
    String(item.idObra).trim() === String(obraAtiva)
  ).length;
}

// =====================================================
// UX.08.1 — APP CONTEXT GLOBAL MULTIOBRAS
// =====================================================
const SIGOAppContext = {
  getObraAtiva() {
    return localStorage.getItem("obraAtiva") || "";
  },

  setObraAtiva(idObra) {
    if (!idObra) return;

    const obraAnterior = this.getObraAtiva();

    localStorage.setItem("obraAtiva", idObra);

    window.dispatchEvent(new CustomEvent("sigo:obra-alterada", {
      detail: {
        obraAnterior: obraAnterior,
        obraAtual: idObra
      }
    }));
  }
};

// =====================================================
// UX.08.2 — NOTIFICAÇÕES SIGO
// =====================================================

window.criarNotificacaoSIGO_ = async function (dados = {}) {
  const notificacao = {
    idNotificacao: crypto.randomUUID(),

    idObra: obterObraAtivaMobile_(),

    categoria: dados.categoria || "SISTEMA",

    tipo: dados.tipo || "INFO",

    titulo: dados.titulo || "",

    mensagem: dados.mensagem || "",

    icone: dados.icone || "🔔",

    lida: false,

    criadaEm: new Date().toISOString()
  };

  await salvarRegistroSIGO(
    "TB_NOTIFICACOES",
    notificacao
  );

  if (typeof window.atualizarBadgeNotificacoes_ === "function") {
    await window.atualizarBadgeNotificacoes_();
  }

  return notificacao;
};

window.atualizarBadgeNotificacoes_ = async function () {
  const badge = document.getElementById("badgeNotificacoes");

  if (!badge) return;

  try {
    const obraAtiva = obterObraAtivaMobile_();

    const notificacoes =
      await listarRegistrosSIGO("TB_NOTIFICACOES");

    const naoLidas =
      notificacoes.filter(item =>
        String(item.idObra) === String(obraAtiva) &&
        item.lida === false
      );

    const total = naoLidas.length;

    badge.textContent = total;

    badge.style.display =
      total > 0 ? "inline-flex" : "none";

  } catch (erro) {
    console.error(
      "Erro ao atualizar badge de notificações:",
      erro
    );
  }
};

// =====================================================
// UX.08.2.6 — EVENTOS DO SISTEMA SIGO
// =====================================================

window.SIGOEventos = {

  async obraAlterada(obra = {}) {
    await criarNotificacaoSIGO_({
      tipo: "INFO",
      categoria: "OBRA",
      prioridade: "BAIXA",
      titulo: "Obra ativa alterada",
      mensagem: `Agora você está trabalhando na obra "${obra.nomeObra || obra.idObra || "selecionada"}".`,
      icone: "🏗"
    });
  },

  async medicaoSalva(medicao = {}) {
    await criarNotificacaoSIGO_({
      tipo: "SUCESSO",
      categoria: "MEDICAO",
      prioridade: "MEDIA",
      titulo: "Medição salva",
      mensagem: `${medicao.numeroMedicao || "Medição"} salva com sucesso.`,
      icone: "📏"
    });
  },

  async loteMedicaoCriado(lote = {}) {
    await criarNotificacaoSIGO_({
      tipo: "SUCESSO",
      categoria: "MEDICAO",
      prioridade: "MEDIA",
      titulo: "Nova medição criada",
      mensagem: `${lote.numeroMedicao || "Nova medição"} criada com sucesso.`,
      icone: "📦"
    });
  },

  async diarioSalvo(diario = {}) {
    await criarNotificacaoSIGO_({
      tipo: "SUCESSO",
      categoria: "DIARIO",
      prioridade: "MEDIA",
      titulo: "Diário salvo",
      mensagem: `Diário ${diario.data || ""} salvo com sucesso.`,
      icone: "📋"
    });
  },

  async ocorrenciaCriada(ocorrencia = {}) {
    await criarNotificacaoSIGO_({
      tipo: "ALERTA",
      categoria: "OCORRENCIA",
      prioridade: "ALTA",
      titulo: "Ocorrência registrada",
      mensagem: ocorrencia.titulo || ocorrencia.descricao || "Nova ocorrência registrada.",
      icone: "⚠️"
    });
  },

  async evidenciaAnexada(evidencia = {}) {
    await criarNotificacaoSIGO_({
      tipo: "SUCESSO",
      categoria: "EVIDENCIA",
      prioridade: "BAIXA",
      titulo: "Evidência anexada",
      mensagem: evidencia.descricao || "Nova evidência registrada na obra.",
      icone: "📷"
    });
  },

  async baseAtualizada(dados = {}) {
    await criarNotificacaoSIGO_({
      tipo: "INFO",
      categoria: "BASE",
      prioridade: "MEDIA",
      titulo: "Base atualizada",
      mensagem: dados.mensagem || "Dados-base da obra atualizados com sucesso.",
      icone: "📥"
    });
  },

  async syncConcluido(dados = {}) {
    await criarNotificacaoSIGO_({
      tipo: "SUCESSO",
      categoria: "SYNC",
      prioridade: "BAIXA",
      titulo: "Sincronização concluída",
      mensagem: dados.mensagem || "Todos os dados pendentes foram enviados.",
      icone: "🔄"
    });
  },

  async syncErro(erro = {}) {
    await criarNotificacaoSIGO_({
      tipo: "ERRO",
      categoria: "SYNC",
      prioridade: "ALTA",
      titulo: "Erro de sincronização",
      mensagem: erro.mensagem || erro.message || "Não foi possível sincronizar os dados.",
      icone: "🔴"
    });
  }

};

// =====================================================
// UX.08.2.5 — CENTRAL DE NOTIFICAÇÕES
// =====================================================

window.abrirCentralNotificacoes_ = async function () {
  try {
    const conteudo =
      await montarDrawerNotificacoes_();

    SIGOUI.showDrawer({
      titulo: "🔔 Central de Notificações",
      subtitulo: "Mensagens da obra ativa",
      conteudo: conteudo,
      textoFechar: "Fechar"
    });

  } catch (erro) {
    console.error("Erro ao abrir notificações:", erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível abrir a central de notificações."
    );
  }
};

// =====================================================
// RESUMO DA CENTRAL DE NOTIFICAÇÕES
// =====================================================

window.montarResumoNotificacoes_ = async function () {
  const obraAtiva = obterObraAtivaMobile_();

  const notificacoes =
    await listarRegistrosSIGO("TB_NOTIFICACOES");

  const notificacoesObra =
    notificacoes.filter(item =>
      String(item.idObra) === String(obraAtiva)
    );

  const total = notificacoesObra.length;

  const naoLidas =
    notificacoesObra.filter(item =>
      item.lida === false
    ).length;

  if (!total) {
    return `
      <div class="notificacoes-resumo vazio">
        <div class="resumo-titulo">
          🔔 Nenhuma notificação
        </div>

        <div class="resumo-subtitulo">
          Esta obra ainda não possui notificações.
        </div>
      </div>
    `;
  }

  if (!naoLidas) {
    return `
      <div class="notificacoes-resumo sucesso">
        <div class="resumo-titulo">
          ✔ Todas as notificações foram lidas
        </div>

        <div class="resumo-subtitulo">
          ${total} notificação(ões) nesta obra
        </div>
      </div>
    `;
  }

  return `
    <div class="notificacoes-resumo alerta">
      <div class="resumo-titulo">
        🔔 ${naoLidas} não lida(s)
      </div>

      <div class="resumo-subtitulo">
        ${total} notificação(ões) nesta obra
      </div>
    </div>
  `;
};

window.montarDrawerNotificacoes_ = async function () {
  const obraAtiva =
    obterObraAtivaMobile_();

  const notificacoes =
    await listarRegistrosSIGO("TB_NOTIFICACOES");

  const notificacoesObra =
    notificacoes
      .filter(item =>
        String(item.idObra) === String(obraAtiva)
      )
      .sort((a, b) =>
        new Date(b.criadaEm) - new Date(a.criadaEm)
      );
  
  const totalNaoLidas =
    notificacoesObra.filter(item =>
      item.lida !== true
    ).length;

  const totalElegiveisLimpeza =
    notificacoesObra.filter(item =>
      notificacaoElegivelParaLimpezaSIGO_(item)
    ).length;

  if (!notificacoesObra.length) {
    return `
      <div class="drawer-section">
        <p>Nenhuma notificação para esta obra.</p>
      </div>
    `;
  }

 return `
    <div
      class="drawer-section"
      style="border-top:none;margin-top:0;padding-top:0;">
  
      <div class="notificacoes-acoes">
        <button
          id="btnMarcarTodasNotificacoesLidas"
          type="button"
          class="btn-marcar-todas-lidas"
          onclick="marcarNotificacoesComoLidas_()"
          ${totalNaoLidas === 0 ? "disabled" : ""}>
  
          ${
            totalNaoLidas > 0
              ? `✓ Marcar todas como lidas <span>${totalNaoLidas}</span>`
              : "✓ Todas foram lidas"
          }
  
        </button>

        <button
          id="btnLimparNotificacoesAntigas"
          type="button"
          class="btn-limpar-notificacoes"
          onclick="limparNotificacoesAntigasSIGO_()"
          ${totalElegiveisLimpeza === 0 ? "disabled" : ""}>
        
          ${
            totalElegiveisLimpeza > 0
              ? `🧹 Limpar antigas <span>${totalElegiveisLimpeza}</span>`
              : "🧹 Nenhuma antiga"
          }
        
        </button>
        
      </div>
  
      ${criarFiltrosNotificacoesSIGO_()}
  
      <div
        id="listaNotificacoesDrawer"
        class="notificacoes-drawer timeline-notificacoes">
  
        ${renderizarTimelineNotificacoes_(notificacoesObra)}
  
      </div>
    </div>
  `;
};



window.criarItemDrawerNotificacao_ = function (item) {

  const data =
    formatarDataNotificacao_(item.criadaEm);

  const categoria =
    item.categoria || "SISTEMA";

  const classeCategoria =
    categoria.toLowerCase();

  return `

    <button
      type="button"
      class="card-notificacao ${classeCategoria} ${
        item.lida === false ? "nao-lida" : "lida"
      }"
      onclick="selecionarNotificacaoDrawer_('${item.idNotificacao}')">

      <div class="notificacao-faixa"></div>

      <div class="notificacao-header">

        <div class="notificacao-icone">
          ${item.icone || "🔔"}
        </div>

        <div class="notificacao-info">

          <div class="notificacao-categoria">
            ${categoria}
          </div>

          <div class="notificacao-titulo">
            ${item.titulo}
          </div>

        </div>

      </div>

      <div class="notificacao-mensagem">
        ${item.mensagem}
      </div>

      <div class="notificacao-rodape">

        <span class="notificacao-data">
          ${data}
        </span>

      </div>

    </button>

  `;

};

window.formatarDataNotificacao_ = function (dataISO) {

  if (!dataISO) return "";

  const data =
    new Date(dataISO);

  const hoje =
    new Date();

  const ontem =
    new Date();

  ontem.setDate(hoje.getDate() - 1);

  const hora =
    data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

  if (data.toDateString() === hoje.toDateString()) {
    return "Hoje • " + hora;
  }

  if (data.toDateString() === ontem.toDateString()) {
    return "Ontem • " + hora;
  }

  return data.toLocaleDateString("pt-BR");
};

// =====================================================
// UX.14.5 — LIMPEZA INTELIGENTE DE NOTIFICAÇÕES
// =====================================================

window.SIGO_NOTIFICACOES_LIMPEZA_CONFIG = Object.freeze({
  diasPadrao: 30,
  diasPrioridadeAlta: 90
});

window.notificacaoElegivelParaLimpezaSIGO_ = function (
  item = {},
  agora = Date.now()
) {
  // Nunca excluir notificações não lidas
  if (item.lida !== true) {
    return false;
  }

  const dataReferencia =
    item.criadaEm ||
    item.criadoEm ||
    item.lidaEm;

  if (!dataReferencia) {
    return false;
  }

  const timestamp =
    new Date(dataReferencia).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const prioridade =
    String(item.prioridade || "")
      .trim()
      .toUpperCase();

  const diasRetencao =
    prioridade === "ALTA"
      ? SIGO_NOTIFICACOES_LIMPEZA_CONFIG.diasPrioridadeAlta
      : SIGO_NOTIFICACOES_LIMPEZA_CONFIG.diasPadrao;

  const idadeMs =
    agora - timestamp;

  const limiteMs =
    diasRetencao * 24 * 60 * 60 * 1000;

  return idadeMs >= limiteMs;
};

window.limparNotificacoesAntigasSIGO_ = async function () {
  try {
    const obraAtiva =
      obterObraAtivaMobile_();

    const notificacoes =
      await listarRegistrosSIGO(
        "TB_NOTIFICACOES"
      );

    const agora =
      Date.now();

    const elegiveis =
      notificacoes.filter(item =>
        String(item.idObra) === String(obraAtiva) &&
        notificacaoElegivelParaLimpezaSIGO_(
          item,
          agora
        )
      );

    if (!elegiveis.length) {
      SIGOUI.feedback.info(
        "Limpeza de notificações",
        "Nenhuma notificação antiga pode ser removida."
      );

      return {
        removidas: 0,
        sucesso: true
      };
    }

    for (const item of elegiveis) {
      await removerRegistroSIGO_(
        "TB_NOTIFICACOES",
        item.idNotificacao
      );
    }

    if (
      typeof atualizarBadgeNotificacoes_ ===
      "function"
    ) {
      await atualizarBadgeNotificacoes_();
    }

    if (
      typeof atualizarCentralNotificacoesAbertaSIGO_ ===
      "function"
    ) {
      await atualizarCentralNotificacoesAbertaSIGO_();
    }

    SIGOUI.feedback.success(
      "Limpeza concluída",
      `${elegiveis.length} notificação(ões) antiga(s) removida(s).`
    );

    return {
      removidas: elegiveis.length,
      sucesso: true
    };

  } catch (erro) {
    console.error(
      "Erro ao limpar notificações antigas:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível limpar as notificações antigas."
    );

    return {
      removidas: 0,
      sucesso: false
    };
  }
};

window.atualizarBotaoLimparNotificacoesSIGO_ =
  function (totalElegiveis = 0) {

    const botao =
      document.getElementById(
        "btnLimparNotificacoesAntigas"
      );

    if (!botao) return;

    const total =
      Number(totalElegiveis || 0);

    botao.disabled =
      total === 0;

    botao.innerHTML =
      total > 0
        ? `🧹 Limpar antigas <span>${total}</span>`
        : "🧹 Nenhuma antiga";
  };
// =====================================================
// UX.14.6 — CENTRAL DE NOTIFICAÇÕES REATIVA
// =====================================================

window.inicializarNotificacoesReativasSIGO_ = function () {

  // Evita registrar o mesmo listener várias vezes
  if (window.SIGO_NOTIFICACOES_REATIVAS_INICIALIZADAS) {
    return false;
  }

  if (
    !window.SIGOEventBus ||
    typeof SIGOEventBus.on !== "function"
  ) {
    console.warn(
      "EventBus indisponível para notificações reativas."
    );

    return false;
  }

  SIGOEventBus.on(
    "TB_NOTIFICACOES_UPDATED",
    async function (dados = {}) {
      try {
        console.log(
          ">>> Smart UI Notificações",
          dados
        );

        // Atualiza o badge do sino
        if (
          typeof atualizarBadgeNotificacoes_ ===
          "function"
        ) {
          await atualizarBadgeNotificacoes_();
        }

        // Atualiza o drawer somente se estiver aberto
        if (
          document.getElementById(
            "listaNotificacoesDrawer"
          ) &&
          typeof atualizarCentralNotificacoesAbertaSIGO_ ===
            "function"
        ) {
          await atualizarCentralNotificacoesAbertaSIGO_();
        }

        // Atualiza um eventual resumo exibido na interface
        if (
          document.getElementById(
            "resumoNotificacoesSIGO"
          ) &&
          typeof montarResumoNotificacoes_ ===
            "function"
        ) {
          const resumo =
            await montarResumoNotificacoes_();

          const containerResumo =
            document.getElementById(
              "resumoNotificacoesSIGO"
            );

          if (containerResumo) {
            containerResumo.innerHTML = resumo;
          }
        }

        return true;

      } catch (erro) {
        console.error(
          "Erro na atualização reativa das notificações:",
          erro
        );

        return false;
      }
    }
  );

  window.SIGO_NOTIFICACOES_REATIVAS_INICIALIZADAS =
    true;

  console.log(
    "Notificações reativas inicializadas."
  );

  return true;
};

// =====================================================
// UX.08.2.5.2.1 — AGRUPAR NOTIFICAÇÕES POR PERÍODO
// =====================================================

window.agruparNotificacoesTimeline_ = function (notificacoes = []) {

  const hoje =
    new Date();

  const ontem =
    new Date();

  ontem.setDate(hoje.getDate() - 1);

  const grupos = {
    hoje: {
      titulo: "Hoje",
      itens: []
    },

    ontem: {
      titulo: "Ontem",
      itens: []
    },

    semana: {
      titulo: "Esta Semana",
      itens: []
    },

    antigas: {
      titulo: "Mais Antigas",
      itens: []
    }
  };

  notificacoes.forEach(item => {
    const data =
      new Date(item.criadaEm);

    const diffDias =
      Math.floor(
        (zerarHora_(hoje) - zerarHora_(data)) /
        (1000 * 60 * 60 * 24)
      );

    if (diffDias === 0) {
      grupos.hoje.itens.push(item);
    } else if (diffDias === 1) {
      grupos.ontem.itens.push(item);
    } else if (diffDias <= 7) {
      grupos.semana.itens.push(item);
    } else {
      grupos.antigas.itens.push(item);
    }
  });

  return Object
    .values(grupos)
    .filter(grupo => grupo.itens.length > 0)
    .map(grupo => ({
      ...grupo,
      quantidade: grupo.itens.length
    }));
};

window.zerarHora_ = function (data) {
  const novaData =
    new Date(data);

  novaData.setHours(0, 0, 0, 0);

  return novaData;
};

window.renderizarTimelineNotificacoes_ = function (notificacoes = []) {

  // ==========================
  // Aplicar filtros
  // ==========================
  const notificacoesFiltradas =
  notificacoes.filter(item => {

    if (
      SIGONotificacoesState.somenteNaoLidas &&
      item.lida === true
    ) {
      return false;
    }

    const textoFiltro =
      String(item.categoria || "").toUpperCase() + " " +
      String(item.tipo || "").toUpperCase() + " " +
      String(item.evento || "").toUpperCase() + " " +
      String(item.titulo || "").toUpperCase() + " " +
      String(item.mensagem || "").toUpperCase();

    if (
      SIGONotificacoesState.categoriaAtual !== "TODAS" &&
      !textoFiltro.includes(SIGONotificacoesState.categoriaAtual)
    ) {
      return false;
    }

    return true;
  });

  // ==========================
  // Agrupar timeline
  // ==========================
  const grupos =
    agruparNotificacoesTimeline_(notificacoesFiltradas);

  if (!grupos.length) {
    return "";
  }

  // ==========================
  // Renderizar
  // ==========================
  return grupos
    .map(grupo => `
      <div class="grupo-notificacoes">

        <div class="grupo-notificacoes-header">
          <span>${grupo.titulo}</span>
          <small>${grupo.quantidade}</small>
        </div>

        <div class="grupo-notificacoes-lista">
          ${grupo.itens
            .map(item => criarItemDrawerNotificacao_(item))
            .join("")}
        </div>

      </div>
    `)
    .join("");
};

window.selecionarNotificacaoDrawer_ = async function (
  idNotificacao
) {
  try {
    const notificacoes =
      await listarRegistrosSIGO(
        "TB_NOTIFICACOES"
      );

    const notificacao =
      notificacoes.find(item =>
        String(item.idNotificacao) ===
        String(idNotificacao)
      );

    if (!notificacao) {
      return false;
    }

    // Grava apenas se ainda não estiver lida
    if (notificacao.lida !== true) {
      notificacao.lida = true;
      notificacao.lidaEm =
        new Date().toISOString();

      await salvarRegistroSIGO(
        "TB_NOTIFICACOES",
        notificacao
      );
    }

    if (
      typeof atualizarBadgeNotificacoes_ ===
      "function"
    ) {
      await atualizarBadgeNotificacoes_();
    }

    if (
      typeof atualizarCentralNotificacoesAbertaSIGO_ ===
      "function"
    ) {
      await atualizarCentralNotificacoesAbertaSIGO_();
    }

    SIGOUI.feedback.info(
      notificacao.titulo || "Notificação",
      notificacao.mensagem || ""
    );

    return true;

  } catch (erro) {
    console.error(
      "Erro ao selecionar notificação:",
      erro
    );

    return false;
  }
};


// =====================================================
// UX.14.4 — MARCAR TODAS COMO LIDAS
// =====================================================

window.marcarNotificacoesComoLidas_ = async function () {
  try {
    const obraAtiva =
      obterObraAtivaMobile_();

    const notificacoes =
      await listarRegistrosSIGO(
        "TB_NOTIFICACOES"
      );

    const naoLidas =
      notificacoes.filter(item =>
        String(item.idObra) === String(obraAtiva) &&
        item.lida !== true
      );

    if (!naoLidas.length) {
      SIGOUI.feedback.info(
        "Notificações",
        "Todas as notificações já foram lidas."
      );

      return {
        total: 0,
        sucesso: true
      };
    }

    for (const item of naoLidas) {
      item.lida = true;
      item.lidaEm =
        new Date().toISOString();

      await salvarRegistroSIGO(
        "TB_NOTIFICACOES",
        item
      );
    }

    if (
      typeof atualizarBadgeNotificacoes_ ===
      "function"
    ) {
      await atualizarBadgeNotificacoes_();
    }

    if (
      typeof atualizarCentralNotificacoesAbertaSIGO_ ===
      "function"
    ) {
      await atualizarCentralNotificacoesAbertaSIGO_();
    }

    atualizarBotaoMarcarTodasLidasSIGO_(0);

    SIGOUI.feedback.success(
      "Notificações atualizadas",
      `${naoLidas.length} notificação(ões) marcada(s) como lida(s).`
    );

    return {
      total: naoLidas.length,
      sucesso: true
    };

  } catch (erro) {
    console.error(
      "Erro ao marcar notificações como lidas:",
      erro
    );

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível atualizar as notificações."
    );

    return {
      total: 0,
      sucesso: false
    };
  }
};

// =====================================================
// UX.14.1 — ESTADO DA CENTRAL DE NOTIFICAÇÕES
// =====================================================

window.SIGONotificacoesState = {
  filtroAtual: "TODAS",
  somenteNaoLidas: false,
  categoriaAtual: "TODAS"
};

window.definirFiltroNotificacoesSIGO_ = async function (filtro = "TODAS") {
  console.log("Filtro:", filtro);
  SIGONotificacoesState.filtroAtual = filtro;

  if (filtro === "NAO_LIDAS") {
    SIGONotificacoesState.somenteNaoLidas = true;
    SIGONotificacoesState.categoriaAtual = "TODAS";
  } else {
    SIGONotificacoesState.somenteNaoLidas = false;
    SIGONotificacoesState.categoriaAtual = filtro;
  }

  document
    .querySelectorAll(".notificacao-filtro-chip")
    .forEach(botao => {
      botao.classList.remove("ativo");
    });

  document
    .querySelectorAll(".notificacao-filtro-chip")
    .forEach(botao => {
      if (
        botao.textContent.trim().toUpperCase() ===
        filtro.replace("_", " ").toUpperCase()
      ) {
        botao.classList.add("ativo");
      }
    });
  console.log(SIGONotificacoesState);

  console.log("Atualizando drawer...");
  
  await atualizarCentralNotificacoesAbertaSIGO_();
  console.log("Drawer atualizado.");
};

window.atualizarBotaoMarcarTodasLidasSIGO_ =
  function (totalNaoLidas = 0) {

    const botao =
      document.getElementById(
        "btnMarcarTodasNotificacoesLidas"
      );

    if (!botao) return;

    const total =
      Number(totalNaoLidas || 0);

    botao.disabled =
      total === 0;

    botao.innerHTML =
      total > 0
        ? `✓ Marcar todas como lidas <span>${total}</span>`
        : "✓ Todas foram lidas";
  };

// =====================================================
// UX.14.2 — FILTROS PREMIUM DA CENTRAL
// =====================================================

window.criarFiltrosNotificacoesSIGO_ = function () {
  const filtros = [
    { id: "TODAS", label: "Todas" },
    { id: "NAO_LIDAS", label: "Não lidas" },
    { id: "SYNC", label: "Sync" },
    { id: "MEDICAO", label: "Medições" },
    { id: "DIARIO", label: "Diário" },
    { id: "OCORRENCIA", label: "Ocorrências" },
    { id: "SISTEMA", label: "Sistema" }
  ];

  return `
    <div class="notificacoes-filtros">
      ${filtros.map(filtro => `
        <button
          type="button"
          class="notificacao-filtro-chip ${
            SIGONotificacoesState.filtroAtual === filtro.id
              ? "ativo"
              : ""
          }"
          onclick="definirFiltroNotificacoesSIGO_('${filtro.id}')">
          ${filtro.label}
        </button>
      `).join("")}
    </div>
  `;
};

window.atualizarCentralNotificacoesAbertaSIGO_ = async function () {
  const container =
    document.getElementById("listaNotificacoesDrawer");

  if (!container) return false;

  const obraAtiva =
    obterObraAtivaMobile_();

  const notificacoes =
    await listarRegistrosSIGO("TB_NOTIFICACOES");

  const notificacoesObra =
    notificacoes
      .filter(item =>
        String(item.idObra || obraAtiva) === String(obraAtiva)
      )
      .sort((a, b) =>
        new Date(b.criadaEm || b.criadoEm) -
        new Date(a.criadaEm || a.criadoEm)
      );

  const totalNaoLidas =
    notificacoesObra.filter(item =>
      item.lida !== true
    ).length;

  const totalElegiveisLimpeza =
    notificacoesObra.filter(item =>
      notificacaoElegivelParaLimpezaSIGO_(item)
    ).length;

  container.innerHTML =
    renderizarTimelineNotificacoes_(notificacoesObra) ||
    `<p class="sem-notificacoes">Nenhuma notificação neste filtro.</p>`;

  atualizarBotaoMarcarTodasLidasSIGO_(
    totalNaoLidas
  );

  atualizarBotaoLimparNotificacoesSIGO_(
    totalElegiveisLimpeza
  );

  return true;
};

async function atualizarHeroObraAtivaMobile_() {

   console.log("CHAMOU atualizarHeroObraAtivaMobile_");
  
  const idObraAtiva = SIGOAppContext.getObraAtiva();
   console.log("obra ativa no contexto:", idObraAtiva);
  
  if (!idObraAtiva) return;

  const obras = await listarRegistrosSIGO("TB_OBRAS");

  const obraSelecionada = obras.find(obra =>
    String(obra.idObra) === String(idObraAtiva)
  );

  if (!obraSelecionada) return;
  
  // Mantém o seletor sincronizado com a obra ativa
  const seletor = document.getElementById("obraAtiva");
  
  if (seletor && seletor.value !== idObraAtiva) {
    seletor.value = idObraAtiva;
  }

  const nomeObra = document.getElementById("nomeObra");
  if (nomeObra) {
    nomeObra.textContent =
      obraSelecionada.nomeObra || obraSelecionada.idObra;
  }

  const codigoObra = document.getElementById("codigoObra");
  if (codigoObra) {
    codigoObra.textContent = obraSelecionada.idObra || "";
  }

  const contadorObrasOffline =
    document.getElementById("contadorObrasOffline");

  if (contadorObrasOffline) {
    contadorObrasOffline.textContent =
      obras.length + " de 3 obras offline";
  }
}

async function definirObraAtivaPeloSeletor_() {
  const select = document.getElementById("obraAtiva");
  if (!select || !select.value) return;

  const idObra = select.value;

  SIGOAppContext.setObraAtiva(idObra);

  await atualizarHeroObraAtivaMobile_();

  if (typeof atualizarIndicadoresMobile_ === "function") {
    await atualizarIndicadoresMobile_();
  }

  if (typeof atualizarDashboardHome_ === "function") {
    await atualizarDashboardHome_();
  }

  if (typeof atualizarTelaAtualPorObra_ === "function") {
    await atualizarTelaAtualPorObra_();
  }
}

async function atualizarTelaAtualPorObra_() {
  const telaAtual =
    localStorage.getItem("telaAtualMobile") || "home";

  console.log("Atualizando tela pela troca de obra:", telaAtual);

  if (typeof navegarPara === "function") {
    await navegarPara(telaAtual);
    return;
  }

  if (typeof navegarParaMobile_ === "function") {
    await navegarParaMobile_(telaAtual);
    return;
  }

  console.warn(
    "Nenhuma função de navegação encontrada para atualizar a tela."
  );
}

// =====================================================
// UX.08.2.6.1 — CENTRAL DE EVENTOS SIGO
// =====================================================

window.registrarEventoSIGO_ = async function (evento = {}) {
  try {
    const chaveEvento =
      evento.evento || evento.chave || "";

    const dados =
      evento.dados || {};

    const modelo =
      window.SIGO_CATALOGO_EVENTOS?.[chaveEvento];

    let notificacao = null;

    if (modelo) {

      notificacao = {
        categoria:
          modelo.categoria ||
          chaveEvento.split("_")[0],
    
        tipo: modelo.tipo,
        prioridade: modelo.prioridade,
    
        titulo: modelo.titulo,
    
        mensagem:
          typeof modelo.mensagem === "function"
            ? modelo.mensagem(dados)
            : modelo.mensagem,
    
        icone: modelo.icone,
        acao: modelo.acao || "",
        dados: dados
      };
    
    } else {
    
      notificacao = {
        categoria: chaveEvento.split("_")[0],
        tipo: evento.tipo || "INFO",
        prioridade: evento.prioridade || "BAIXA",
        titulo: evento.titulo || "Evento SIGO",
        mensagem: evento.mensagem || "Evento registrado no sistema.",
        icone: evento.icone || "🔔",
        acao: evento.acao || "",
        dados: dados
      };
    
    }
    
    await criarNotificacaoSIGO_(notificacao);

// Dispara o evento no barramento
  await SIGOEventBus.emit(
    chaveEvento || "EVENTO_GENERICO",
    notificacao
  );
  
  return true;

  } catch (erro) {
    console.error("Erro ao registrar evento:", erro);
    return false;
  }
};

// =====================================================
// UX.09.1 — CATÁLOGO DE EVENTOS SIGO
// =====================================================

window.SIGO_CATALOGO_EVENTOS = Object.freeze({
  OBRA_ALTERADA: {
    categoria: "OBRA",
    tipo: "INFO",
    prioridade: "BAIXA",
    icone: "🏗",
    titulo: "Obra ativa alterada",
    mensagem: (dados = {}) =>
      `Agora você está trabalhando na obra "${dados.nomeObra || dados.idObra || "selecionada"}".`
  },

  OBRA_BAIXADA: {
    categoria: "OBRA",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "📥",
    titulo: "Obra baixada",
  
    mensagem: function (dados = {}) {
      const obra =
        dados.nomeObra ||
        dados.idObra ||
        "Obra";
  
      const totalAtividades =
        Number(dados.totalAtividades || 0);
  
      const complemento =
        totalAtividades > 0
          ? ` com ${totalAtividades} atividade(s)`
          : "";
  
      return `${obra} foi disponibilizada para uso offline${complemento}.`;
    }
  },
  
  OBRA_REMOVIDA: {
    categoria: "OBRA",
    tipo: "INFO",
    prioridade: "MEDIA",
    icone: "🗑️",
    titulo: "Obra removida",
  
    mensagem: function (dados = {}) {
      const obra =
        dados.nomeObra ||
        dados.idObra ||
        "A obra";
  
      return `${obra} foi removida deste dispositivo.`;
    }
  },

  MEDICAO_SALVA: {
    categoria: "MEDICAO",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "📏",
    titulo: "Medição salva",
  
    mensagem: function (dados = {}) {
      const atividade =
        dados.servico ||
        dados.atividade ||
        dados.eap ||
        "Atividade";
  
      const numeroMedicao =
        dados.numeroMedicao
          ? ` na ${dados.numeroMedicao}`
          : "";
  
      return `${atividade} registrada${numeroMedicao}.`;
    }
  },

  MEDICAO_ATUALIZAR: {
    categoria: "MEDICAO",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "📏",
    titulo: "Medição atualizada",
  
    mensagem: function (dados = {}) {
      const atividade =
        dados.servico ||
        dados.atividade ||
        dados.eap ||
        "Atividade";
    
      const numeroMedicao =
        dados.numeroMedicao
          ? ` na ${dados.numeroMedicao}`
          : "";
    
      return `${atividade} atualizada${numeroMedicao}.`;
    }
  },

  LOTE_MEDICAO_CRIADO: {
    categoria: "MEDICAO",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "📦",
    titulo: "Nova medição criada",
    mensagem: (dados = {}) =>
      `${dados.numeroMedicao || "Nova medição"} criada com sucesso.`
  },

  DIARIO_SALVO: {
    categoria: "DIARIO",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "📋",
    titulo: "Diário salvo",
    mensagem: (dados = {}) =>
      `Diário ${dados.data || ""} salvo com sucesso.`
  },

  DIARIO_ATUALIZADO: {
    categoria: "DIARIO",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "📘",
    titulo: "Diário atualizado",
  
    mensagem: function (dados = {}) {
      const data =
        dados.data ||
        "Data não informada";
  
      const responsavel =
        dados.responsavel
          ? ` — responsável: ${dados.responsavel}`
          : "";
  
      return `Diário de ${data}${responsavel} atualizado com sucesso.`;
    }
  },

  ITEM_DIARIO_SALVO: {
    categoria: "DIARIO",
    tipo: "SUCESSO",
    prioridade: "BAIXA",
    icone: "📝",
    titulo: "Item do diário salvo",
    mensagem: (dados = {}) =>
      `${dados.servico || "Item do diário"} registrado com sucesso.`
  },

  ITEM_DIARIO_ATUALIZADO: {
    categoria: "DIARIO",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "🛠️",
    titulo: "Item do diário atualizado",
  
    mensagem: function (dados = {}) {
      const atividade =
        dados.servico ||
        dados.atividade ||
        dados.eap ||
        "Atividade";
  
      const quantidade =
        Number(dados.qtdeExecutada || 0);
  
      const unidade =
        dados.un || "";
  
      const producao =
        quantidade > 0
          ? ` — ${quantidade} ${unidade}`.trim()
          : "";
  
      return `${atividade}${producao} atualizado com sucesso.`;
    }
  },

  OCORRENCIA_CRIADA: {
    categoria: "OCORRENCIA",
    tipo: "ALERTA",
    prioridade: "ALTA",
    icone: "⚠️",
    titulo: "Ocorrência registrada",
    mensagem: (dados = {}) =>
      dados.titulo || dados.descricao || "Nova ocorrência registrada."
  },

  OCORRENCIA_ATUALIZADA: {
    categoria: "OCORRENCIA",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "⚠️",
    titulo: "Ocorrência atualizada",
  
    mensagem: function (dados = {}) {
      const identificacao =
        dados.descricao ||
        dados.tipo ||
        dados.local ||
        "Ocorrência";
  
      return `${identificacao} foi atualizada com sucesso.`;
    }
  },

  EVIDENCIA_ANEXADA: {
    categoria: "EVIDENCIA",
    tipo: "SUCESSO",
    prioridade: "BAIXA",
    icone: "📷",
    titulo: "Evidência anexada",
    mensagem: (dados = {}) =>
      dados.descricao || "Nova evidência registrada na obra."
  },

  EVIDENCIA_ATUALIZADA: {
    categoria: "EVIDENCIA",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "📷",
    titulo: "Evidência atualizada",
  
    mensagem: function (dados = {}) {
      const identificacao =
        dados.titulo ||
        dados.arquivoNome ||
        dados.categoria ||
        "Evidência";
  
      return `${identificacao} foi atualizada com sucesso.`;
    }
  },

  CLIMA_REGISTRADO: {
    categoria: "CLIMA",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "🌤️",
    titulo: "Clima registrado",
  
    mensagem: function (dados = {}) {
      const condicao =
        dados.condicao ||
        "Condição climática";
  
      const periodo =
        dados.periodo
          ? ` no período ${dados.periodo}`
          : "";
  
      const atividade =
        dados.atividadeAfetada
          ? ` — atividade: ${dados.atividadeAfetada}`
          : "";
  
      return `${condicao}${periodo}${atividade}.`;
    }
  },

  CLIMA_ATUALIZADO: {
    categoria: "CLIMA",
    tipo: "SUCESSO",
    prioridade: "MEDIA",
    icone: "🌤️",
    titulo: "Clima atualizado",
  
    mensagem: function (dados = {}) {
      const condicao =
        dados.condicao ||
        "Condição climática";
  
      const periodo =
        dados.periodo
          ? ` no período ${dados.periodo}`
          : "";
  
      const atividade =
        dados.atividadeAfetada
          ? ` — atividade: ${dados.atividadeAfetada}`
          : "";
  
      return `${condicao}${periodo}${atividade} foi atualizado.`;
    }
  },

  BASE_ATUALIZADA: {
    categoria: "BASE",
    tipo: "INFO",
    prioridade: "MEDIA",
    icone: "📥",
    titulo: "Base atualizada",
    mensagem: (dados = {}) =>
      dados.mensagem || "Dados-base da obra atualizados com sucesso."
  },

  SYNC_CONCLUIDO: {
    categoria: "SYNC",
    tipo: "SUCESSO",
    prioridade: "BAIXA",
    icone: "🔄",
    titulo: "Sincronização concluída",
    mensagem: (dados = {}) =>
      dados.mensagem || "Todos os dados pendentes foram enviados."
  },

  SYNC_ERRO: {
    categoria: "SYNC",
    tipo: "ERRO",
    prioridade: "ALTA",
    icone: "🔴",
    titulo: "Erro de sincronização",
    mensagem: (dados = {}) =>
      dados.mensagem || dados.message || "Não foi possível sincronizar os dados."
  }

});

// =====================================================
// UX.09.2 — EVENTBUS SIGO
// Barramento central de eventos do SIGO Mobile
// =====================================================

window.SIGOEventBus = {

  listeners: {},

  on(evento, callback) {
    if (!evento || typeof callback !== "function") return;

    if (!this.listeners[evento]) {
      this.listeners[evento] = [];
    }

    this.listeners[evento].push(callback);
  },

  off(evento, callback) {
    if (!this.listeners[evento]) return;

    this.listeners[evento] =
      this.listeners[evento].filter(fn => fn !== callback);
  },

  async emit(evento, dados = {}) {
    if (!evento) return;

    console.log("SIGOEventBus.emit:", evento, dados);

    const callbacks =
      this.listeners[evento] || [];

    for (const callback of callbacks) {
      try {
        await callback(dados);
      } catch (erro) {
        console.error(
          `Erro ao executar listener do evento ${evento}:`,
          erro
        );
      }
    }
  }

};

// =====================================================
// UX.09.3 — LISTENERS MODULARES DO EVENTBUS
// =====================================================

window.inicializarListenersBadge_ = function () {
  if (!window.SIGOEventBus) return;

  const atualizarBadge = async function () {
    if (typeof atualizarBadgeNotificacoes_ === "function") {
      await atualizarBadgeNotificacoes_();
    }
  };

  SIGOEventBus.on("MEDICAO_SALVA", atualizarBadge);
  SIGOEventBus.on("LOTE_MEDICAO_CRIADO", atualizarBadge);
  SIGOEventBus.on("DIARIO_SALVO", atualizarBadge);
  SIGOEventBus.on("ITEM_DIARIO_SALVO", atualizarBadge);
  SIGOEventBus.on("OCORRENCIA_CRIADA", atualizarBadge);
  SIGOEventBus.on("EVIDENCIA_ANEXADA", atualizarBadge);
  SIGOEventBus.on("BASE_ATUALIZADA", atualizarBadge);
  SIGOEventBus.on("SYNC_CONCLUIDO", atualizarBadge);
  SIGOEventBus.on("SYNC_ERRO", atualizarBadge);
  SIGOEventBus.on("OBRA_ALTERADA", atualizarBadge);

  console.log("Listeners Badge inicializados.");
};

window.inicializarListenersHome_ = function () {
  if (!window.SIGOEventBus) return;

  const atualizarHome = async function () {
    if (typeof atualizarSmartHomeSIGO_ === "function") {
      await atualizarSmartHomeSIGO_();
    }
  };

  SIGOEventBus.on("MEDICAO_SALVA", atualizarHome);
  SIGOEventBus.on("LOTE_MEDICAO_CRIADO", atualizarHome);
  SIGOEventBus.on("DIARIO_SALVO", atualizarHome);
  SIGOEventBus.on("ITEM_DIARIO_SALVO", atualizarHome);
  SIGOEventBus.on("OCORRENCIA_CRIADA", atualizarHome);
  SIGOEventBus.on("EVIDENCIA_ANEXADA", atualizarHome);
  SIGOEventBus.on("BASE_ATUALIZADA", atualizarHome);
  SIGOEventBus.on("SYNC_CONCLUIDO", atualizarHome);
  SIGOEventBus.on("OBRA_ALTERADA", atualizarHome);

  SIGOEventBus.on("TB_OBRAS_UPDATED", atualizarHome);
  SIGOEventBus.on("TB_ATIVIDADES_OBRA_UPDATED", atualizarHome);
  SIGOEventBus.on("TB_DIARIOS_UPDATED", atualizarHome);
  SIGOEventBus.on("TB_DIARIO_ITENS_UPDATED", atualizarHome);
  SIGOEventBus.on("TB_MEDICOES_UPDATED", atualizarHome);
  SIGOEventBus.on("TB_OCORRENCIAS_UPDATED", atualizarHome);
  SIGOEventBus.on("TB_EVIDENCIAS_UPDATED", atualizarHome);
  SIGOEventBus.on("TB_SYNC_QUEUE_UPDATED", atualizarHome);

  console.log("Listeners Home inicializados.");
};

window.inicializarListenersMedicoes_ = function () {
    if (!window.SIGOEventBus) return;

    const atualizarMedicoes = async function () {
        console.log(">>> Smart UI Medições");

        if (typeof atualizarSmartMedicoesSIGO_ === "function") {
            await atualizarSmartMedicoesSIGO_();
        }
    };

    SIGOEventBus.on("MEDICAO_SALVA", atualizarMedicoes);
    SIGOEventBus.on("LOTE_MEDICAO_CRIADO", atualizarMedicoes);

    SIGOEventBus.on("TB_MEDICOES_UPDATED", atualizarMedicoes);
    SIGOEventBus.on("TB_LOTES_MEDICAO_UPDATED", atualizarMedicoes);
  
    console.log("Listeners Medições inicializados.");
};

window.inicializarListenersDiario_ = function () {
  if (!window.SIGOEventBus) return;

 const atualizarDiario = async function () {
    const telaAtual =
      localStorage.getItem("telaAtualMobile") || "home";
  
    if (telaAtual === "diario") {
      await atualizarSmartDiarioSIGO_();
      return;
    }
  
    if (telaAtual === "diarioItens") {
      await atualizarSmartItensDiarioSIGO_();
      return;
    }
  };

  SIGOEventBus.on("DIARIO_SALVO", atualizarDiario);
  SIGOEventBus.on("ITEM_DIARIO_SALVO", atualizarDiario);
  
  SIGOEventBus.on("TB_DIARIOS_UPDATED", atualizarDiario);
  SIGOEventBus.on("TB_DIARIO_ITENS_UPDATED", atualizarDiario);
  
  console.log("Listeners Diário inicializados.");
};

window.inicializarListenersSync_ = function () {
  if (!window.SIGOEventBus) return;

  const atualizarSync = async function () {
    if (typeof atualizarSmartSyncSIGO_ === "function") {
      await atualizarSmartSyncSIGO_();
    }
  };

  SIGOEventBus.on("SYNC_CONCLUIDO", atualizarSync);
  SIGOEventBus.on("SYNC_ERRO", atualizarSync);
  SIGOEventBus.on("BASE_ATUALIZADA", atualizarSync);
  SIGOEventBus.on("TB_SYNC_QUEUE_UPDATED", atualizarSync);

  console.log("Listeners Sync inicializados.");
};

window.inicializarListenersObras_ = function () {
  if (!window.SIGOEventBus) return;

  const atualizarObras = async function () {
    if (typeof atualizarHeroObraAtivaMobile_ === "function") {
      await atualizarHeroObraAtivaMobile_();
    }

    if (typeof carregarObrasMobile_ === "function") {
      await carregarObrasMobile_();
    }

    if (typeof listarObrasOfflineMobile_ === "function") {
      await listarObrasOfflineMobile_();
    }

    if (typeof listarObrasDisponiveisMobile_ === "function") {
      await listarObrasDisponiveisMobile_();
    }

    if (typeof atualizarIndicadoresMobile_ === "function") {
      await atualizarIndicadoresMobile_();
    }
  };

  SIGOEventBus.on("OBRA_ALTERADA", atualizarObras);
  SIGOEventBus.on("BASE_ATUALIZADA", atualizarObras);
  SIGOEventBus.on("OBRA_BAIXADA", atualizarObras);

  SIGOEventBus.on("TB_OBRAS_UPDATED", atualizarObras);
  SIGOEventBus.on("TB_ATIVIDADES_OBRA_UPDATED", atualizarObras);

  console.log("Listeners Obras inicializados.");
};

// =====================================================
// UX.09.2.3 — LISTENERS REAIS DO SISTEMA
// =====================================================
window.inicializarListenersSIGO_ = function () {
  if (!window.SIGOEventBus) {
    console.warn("SIGOEventBus não encontrado.");
    return;
  }

  if (typeof inicializarListenersBadge_ === "function") {
    inicializarListenersBadge_();
  }

  if (typeof inicializarListenersHome_ === "function") {
    inicializarListenersHome_();
  }

  if (typeof inicializarListenersMedicoes_ === "function") {
    inicializarListenersMedicoes_();
  }

  if (typeof inicializarListenersDiario_ === "function") {
    inicializarListenersDiario_();
  }

  if (typeof inicializarListenersSync_ === "function") {
    inicializarListenersSync_();
  }

  if (typeof inicializarListenersObras_ === "function") {
    inicializarListenersObras_();
  }

  console.log("Listeners SIGO inicializados.");
};

window.atualizarInterfaceAposEventoSIGO_ = async function (evento, dados = {}) {
  try {
    console.log("Atualizando interface após evento:", evento, dados);

    if (typeof atualizarBadgeNotificacoes_ === "function") {
      await atualizarBadgeNotificacoes_();
    }

    if (typeof atualizarIndicadoresMobile_ === "function") {
      await atualizarIndicadoresMobile_();
    }

    if (typeof atualizarDashboardHome_ === "function") {
      await atualizarDashboardHome_();
    }

    if (typeof atualizarPainelSaudeSync_ === "function") {
      await atualizarPainelSaudeSync_();
    }

    const telaAtual =
      localStorage.getItem("telaAtualMobile") || "home";

    if (
      evento === "MEDICAO_SALVA" ||
      evento === "LOTE_MEDICAO_CRIADO"
    ) {
      if (telaAtual === "medicoes") {
        await navegarPara("medicoes");
      }
    }

    if (
      evento === "DIARIO_SALVO" ||
      evento === "ITEM_DIARIO_SALVO"
    ) {
      if (telaAtual === "diario" || telaAtual === "itensDiario") {
        await navegarPara(telaAtual);
      }
    }

    if (evento === "OCORRENCIA_CRIADA") {
      if (telaAtual === "ocorrencias") {
        await navegarPara("ocorrencias");
      }
    }

    if (evento === "EVIDENCIA_ANEXADA") {
      if (telaAtual === "evidencias") {
        await navegarPara("evidencias");
      }
    }

    if (evento === "BASE_ATUALIZADA") {
      await navegarPara(telaAtual);
    }

  } catch (erro) {
    console.error("Erro ao atualizar interface após evento:", erro);
  }
};


// =====================================================
// UX.11.3.1 — SMART DATA BINDING COM DEBOUNCE
// =====================================================

window.SIGODataBinding = {

  watchers: {},

  timers: {},

  pendentes: {},

  delay: 250,

  watch(storeName, callback) {
    if (!storeName || typeof callback !== "function") return;

    if (!this.watchers[storeName]) {
      this.watchers[storeName] = [];
    }

    this.watchers[storeName].push(callback);

    console.log("DataBinding watch:", storeName);
  },

  unwatch(storeName, callback) {
    if (!this.watchers[storeName]) return;

    this.watchers[storeName] =
      this.watchers[storeName].filter(fn => fn !== callback);
  },

  async notify(storeName, dados = {}) {
    if (!storeName) return;

    this.pendentes[storeName] = {
      store: storeName,
      acao: dados.acao || "UPDATE",
      ultimoRegistro: dados.registro || null,
      chave: dados.chave || null,
      idObra: dados.idObra || null,
      origem: dados.origem || "",
      quantidade:
        (this.pendentes[storeName]?.quantidade || 0) + 1
    };

    clearTimeout(this.timers[storeName]);

    this.timers[storeName] = setTimeout(async () => {
      await this.flush(storeName);
    }, this.delay);
  },

  async flush(storeName) {
    const dados =
      this.pendentes[storeName];

    if (!dados) return;

    delete this.pendentes[storeName];
    delete this.timers[storeName];

    console.log("DataBinding flush:", storeName, dados);

    const callbacks =
      this.watchers[storeName] || [];

    for (const callback of callbacks) {
      try {
        await callback(dados);
      } catch (erro) {
        console.error(
          `Erro no DataBinding da store ${storeName}:`,
          erro
        );
      }
    }
  }

};

// =====================================================
// UX.11.2.2 — DATA BINDING → EVENTBUS
// =====================================================

window.inicializarDataBindingEventBus_ = function () {
  if (!window.SIGODataBinding || !window.SIGOEventBus) {
    console.warn("DataBinding ou EventBus não encontrado.");
    return;
  }

  const stores = [
    "TB_MEDICOES",
    "TB_LOTES_MEDICAO",
    "TB_DIARIOS",
    "TB_DIARIO_ITENS",
    "TB_OCORRENCIAS",
    "TB_EVIDENCIAS",
    "TB_SYNC_QUEUE",
    "TB_OBRAS",
    "TB_ATIVIDADES_OBRA",
    "TB_NOTIFICACOES"
  ];

  stores.forEach(storeName => {
    SIGODataBinding.watch(storeName, async function (dados = {}) {
      await SIGOEventBus.emit(
        `${storeName}_UPDATED`,
        {
          store: storeName,
          ...dados
        }
      );
    });
  });

  console.log("DataBinding integrado ao EventBus.");
};

// =====================================================
// UX.12.1 — SMART CACHE BASE
// Cache central em memória do SIGO Mobile
// =====================================================

window.SIGODataCache = {

  cache: {},

  set(chave, dados) {
    if (!chave) return false;

    this.cache[chave] = {
      dados: dados,
      atualizadoEm: new Date().toISOString()
    };

    return true;
  },

  get(chave) {
    if (!chave) return null;

    const item =
      this.cache[chave];

    if (!item) return null;

    return item.dados;
  },

  has(chave) {
    return !!this.cache[chave];
  },

  invalidate(chave) {
    if (!chave) return false;

    delete this.cache[chave];

    console.log("Cache invalidado:", chave);

    return true;
  },

  clear() {
    this.cache = {};

    console.log("Cache limpo.");

    return true;
  },

  info() {
    return Object.keys(this.cache).map(chave => ({
      chave: chave,
      atualizadoEm: this.cache[chave].atualizadoEm,
      total: Array.isArray(this.cache[chave].dados)
        ? this.cache[chave].dados.length
        : 1
    }));
  }

};

// =====================================================
// UX.12.4 — CACHE INTELIGENTE POR OBRA
// =====================================================

window.gerarChaveCacheObraSIGO_ = function (storeName, idObra) {
  return `${storeName}::OBRA::${idObra}`;
};


window.listarRegistrosPorObraCacheSIGO_ = async function (storeName, idObra) {
  if (!storeName || !idObra) return [];

  const chaveCache =
    gerarChaveCacheObraSIGO_(storeName, idObra);

  if (
    window.SIGODataCache &&
    SIGODataCache.has(chaveCache)
  ) {
    return SIGODataCache.get(chaveCache);
  }

  const registros =
    await listarRegistrosSIGO(storeName);

  const registrosObra =
    registros.filter(item =>
      String(item.idObra) === String(idObra)
    );

  if (window.SIGODataCache) {
    SIGODataCache.set(chaveCache, registrosObra);
  }

  return registrosObra;
};

window.invalidarCacheObraSIGO_ = function (storeName, idObra) {
  if (!window.SIGODataCache || !storeName || !idObra) return false;

  const chaveCache =
    gerarChaveCacheObraSIGO_(storeName, idObra);

  return SIGODataCache.invalidate(chaveCache);
};

// =====================================================
// UX.13.2 — CHAVE DE REGISTRO PARA SYNC
// =====================================================

window.obterChaveRegistroSIGO_ = function (storeName, registro = {}) {
  const mapa = {
    TB_OBRAS: "idObra",
    TB_DIARIOS: "idDiario",
    TB_DIARIO_ITENS: "idItemDiario",
    TB_LOTES_MEDICAO: "idLoteMedicao",
    TB_MEDICOES: "idMedicao",
    TB_OCORRENCIAS: "idOcorrencia",
    TB_CLIMA: "idClima",
    TB_EVIDENCIAS: "idEvidencia",
    TB_ATIVIDADES_OBRA: "idRegistro"
  };

  const campo = mapa[storeName];

  if (!campo) return "";

  return registro[campo] || "";
};

// =====================================================
// UX.13.2.1 — STORES SINCRONIZÁVEIS
// =====================================================

window.SIGO_STORES_SINCRONIZAVEIS = [
  "TB_MEDICOES",
  "TB_LOTES_MEDICAO",
  "TB_DIARIOS",
  "TB_DIARIO_ITENS",
  "TB_OCORRENCIAS",
  "TB_CLIMA",
  "TB_EVIDENCIAS"
];

window.storeSincronizavelSIGO_ = function (storeName) {
  return window.SIGO_STORES_SINCRONIZAVEIS.includes(storeName);
};



// ============================================
// FORMATADORES
// ============================================

function formatarDataHoraMedicao_(valor) {
  if (!valor) return "--";

  try {
    return new Date(valor).toLocaleString("pt-BR");
  } catch (erro) {
    return valor;
  }
}

// =====================================================
// SIGO MOBILE — REGISTRO DO SERVICE WORKER
// =====================================================
async function registrarServiceWorkerSIGO_() {
  if (!("serviceWorker" in navigator)) {
    console.warn(
      "[SIGO PWA] Service Worker não suportado."
    );

    return {
      ok: false,
      motivo: "NAO_SUPORTADO"
    };
  }

  try {
    const urlServiceWorker =
      new URL(
        "./service-worker.js",
        window.location.href
      ).href;

    const escopo =
      new URL(
        "./",
        window.location.href
      ).href;

    const registro =
      await navigator.serviceWorker.register(
        urlServiceWorker,
        {
          scope: escopo,
          updateViaCache: "none"
        }
      );

    await navigator.serviceWorker.ready;

    console.log(
      "[SIGO PWA] Service Worker registrado:",
      {
        scope: registro.scope,
        ativo:
          registro.active?.scriptURL ||
          null,
        estado:
          registro.active?.state ||
          null
      }
    );

    return {
      ok: true,
      scope: registro.scope,
      registro: registro
    };

  } catch (erro) {
    console.error(
      "[SIGO PWA] Erro ao registrar Service Worker:",
      erro
    );

    return {
      ok: false,
      erro:
        erro?.message ||
        "Falha no registro do Service Worker."
    };
  }
}

window.addEventListener(
  "load",
  registrarServiceWorkerSIGO_
);

/**
 * ============================================================
 * UX.19.5.5 — CLIENTE MOBILE DA API DE REIDRATAÇÃO
 * ============================================================
 *
 * Responsabilidades:
 * - chamar OBTER_DADOS_OPERACIONAIS_OBRA;
 * - receber Diários e itens;
 * - normalizar o envelope da API;
 * - validar contrato, obra e período;
 * - não alterar o IndexedDB;
 * - não alterar a TB_SYNC_QUEUE.
 */


/**
 * Retorna o token já configurado no aplicativo Mobile.
 */
function obterTokenReidratacaoMobileUX1955_() {
  let token = "";

  /*
   * Primeira opção:
   * constante global já utilizada pela sincronização do SIGO.
   */
  if (
    typeof SIGO_TOKEN_OFFLINE !== "undefined" &&
    SIGO_TOKEN_OFFLINE
  ) {
    token = String(SIGO_TOKEN_OFFLINE).trim();
  }

  /*
   * Alternativa:
   * token armazenado no localStorage.
   */
  if (!token) {
    token = String(
      localStorage.getItem("SIGO_TOKEN_OFFLINE") || ""
    ).trim();
  }

  if (!token) {
    throw new Error(
      "Token offline do SIGO não foi encontrado no aplicativo."
    );
  }

  return token;
}


/**
 * Obtém ou cria um identificador persistente para o dispositivo.
 *
 * Caso o aplicativo já possua uma função oficial para isso,
 * ela será utilizada.
 */
function obterIdDispositivoReidratacaoUX1955_() {
  if (
    typeof obterIdDispositivoSIGO_ === "function"
  ) {
    const idExistente =
      obterIdDispositivoSIGO_();

    if (idExistente) {
      return String(idExistente);
    }
  }

  const chaveLocalStorage =
    "SIGO_ID_DISPOSITIVO";

  let idDispositivo = String(
    localStorage.getItem(chaveLocalStorage) || ""
  ).trim();

  if (!idDispositivo) {
    const identificador =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : (
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2)
        );

    idDispositivo =
      "DISP-MOBILE-" + identificador;

    localStorage.setItem(
      chaveLocalStorage,
      idDispositivo
    );
  }

  return idDispositivo;
}


/**
 * Obtém o identificador do usuário atual.
 *
 * Nesta fase, enquanto a autenticação individual ainda não
 * estiver implantada, utiliza o identificador disponível no app.
 */
function obterIdUsuarioReidratacaoUX1955_() {
  if (
    typeof obterIdUsuarioSIGO_ === "function"
  ) {
    const idUsuarioExistente =
      obterIdUsuarioSIGO_();

    if (idUsuarioExistente) {
      return String(idUsuarioExistente);
    }
  }

  return String(
    localStorage.getItem("SIGO_ID_USUARIO") ||
    localStorage.getItem("SIGO_USUARIO") ||
    "USUARIO_MOBILE"
  ).trim();
}


/**
 * Normaliza a resposta publicada.
 *
 * A API atual devolve:
 *
 * {
 *   status: "OK",
 *   mensagem: "...",
 *   dataResposta: "...",
 *   detalhes: {
 *     versaoContrato,
 *     idObra,
 *     periodoDias,
 *     totais,
 *     diarios,
 *     diarioItens
 *   }
 * }
 */
function normalizarRespostaReidratacaoMobileUX1955_(
  respostaJson
) {
  if (
    !respostaJson ||
    typeof respostaJson !== "object"
  ) {
    throw new Error(
      "A API retornou uma resposta vazia ou inválida."
    );
  }

  const statusResposta = String(
    respostaJson.status || ""
  ).trim().toUpperCase();

  if (statusResposta !== "OK") {
    throw new Error(
      respostaJson.mensagem ||
      respostaJson.erro ||
      "A API não aprovou a solicitação de reidratação."
    );
  }

  /*
   * Compatibilidade com:
   * - detalhes;
   * - dados;
   * - contrato direto na raiz.
   */
  const detalhes =
    respostaJson.detalhes &&
    typeof respostaJson.detalhes === "object"
      ? respostaJson.detalhes
      : respostaJson.dados &&
        typeof respostaJson.dados === "object"
        ? respostaJson.dados
        : respostaJson;

  const diarios =
    Array.isArray(detalhes.diarios)
      ? detalhes.diarios
      : [];

  const diarioItens =
    Array.isArray(detalhes.diarioItens)
      ? detalhes.diarioItens
      : [];

  const totaisRecebidos =
    detalhes.totais &&
    typeof detalhes.totais === "object"
      ? detalhes.totais
      : {};

  const totalDiarios = Number(
    totaisRecebidos.diarios !== undefined
      ? totaisRecebidos.diarios
      : diarios.length
  );

  const totalDiarioItens = Number(
    totaisRecebidos.diarioItens !== undefined
      ? totaisRecebidos.diarioItens
      : diarioItens.length
  );

  if (totalDiarios !== diarios.length) {
    throw new Error(
      "O total de Diários informado pela API não corresponde " +
      "à quantidade recebida."
    );
  }

  if (totalDiarioItens !== diarioItens.length) {
    throw new Error(
      "O total de itens informado pela API não corresponde " +
      "à quantidade recebida."
    );
  }

  return {
    status: statusResposta,
    mensagem: String(
      respostaJson.mensagem || ""
    ),

    dataResposta: String(
      respostaJson.dataResposta || ""
    ),

    versaoContrato: String(
      detalhes.versaoContrato || ""
    ),

    idObra: String(
      detalhes.idObra || ""
    ),

    periodoDias: Number(
      detalhes.periodoDias || 0
    ),

    dataInicio: String(
      detalhes.dataInicio || ""
    ),

    dataFim: String(
      detalhes.dataFim || ""
    ),

    dataSync: String(
      detalhes.dataSync || ""
    ),

    totais: {
      diarios: totalDiarios,
      diarioItens: totalDiarioItens
    },

    diarios: diarios,
    diarioItens: diarioItens
  };
}


/**
 * Consulta os dados operacionais da obra no servidor.
 *
 * IMPORTANTE:
 * Esta função somente consulta e devolve os dados.
 * Ela não grava no IndexedDB.
 */
async function obterDadosOperacionaisObraMobile_(
  idObra,
  diasHistorico
) {
  const obraNormalizada =
    String(idObra || "").trim();

  const periodoNormalizado =
    Number(diasHistorico || 30);

  if (!obraNormalizada) {
    throw new Error(
      "Informe o ID da obra para realizar a reidratação."
    );
  }

  const periodosPermitidos =
    [15, 30, 60, 90];

  if (
    !periodosPermitidos.includes(
      periodoNormalizado
    )
  ) {
    throw new Error(
      "Período inválido. Utilize 15, 30, 60 ou 90 dias."
    );
  }

  const urlApi =
    "https://script.google.com/macros/s/AKfycbzVE7tdTSwHvKgLkrdcaQtGAm_muqNPo6n0wQZBDpmRwtAJuySfWyh6gdef0R6g_drKRw/exec";

  const payload = {
    token:
      obterTokenReidratacaoMobileUX1955_(),

    acao:
      "OBTER_DADOS_OPERACIONAIS_OBRA",

    idDispositivo:
      obterIdDispositivoReidratacaoUX1955_(),

    idUsuario:
      obterIdUsuarioReidratacaoUX1955_(),

    idObra:
      obraNormalizada,

    diasHistorico:
      periodoNormalizado
  };

  console.log(
    "[UX.19.5.5] Solicitando dados operacionais:",
    {
      acao: payload.acao,
      idDispositivo: payload.idDispositivo,
      idUsuario: payload.idUsuario,
      idObra: payload.idObra,
      diasHistorico: payload.diasHistorico
    }
  );

  let respostaHttp;

  try {
    respostaHttp = await fetch(
      urlApi,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=UTF-8"
        },

        body: JSON.stringify(payload),

        redirect: "follow",

        cache: "no-store"
      }
    );

  } catch (erroRede) {
    throw new Error(
      "Não foi possível acessar a API de reidratação. " +
      (
        erroRede &&
        erroRede.message
          ? erroRede.message
          : String(erroRede)
      )
    );
  }

  const codigoHttp =
    respostaHttp.status;

  const textoResposta =
    await respostaHttp.text();

  let respostaJson;

  try {
    respostaJson =
      JSON.parse(textoResposta);

  } catch (erroJson) {
    throw new Error(
      "A API não retornou um JSON válido. " +
      "HTTP: " + codigoHttp
    );
  }

  if (!respostaHttp.ok) {
    throw new Error(
      respostaJson.mensagem ||
      respostaJson.erro ||
      (
        "Falha HTTP ao consultar a API: " +
        codigoHttp
      )
    );
  }

  const dadosNormalizados =
    normalizarRespostaReidratacaoMobileUX1955_(
      respostaJson
    );

  if (
    dadosNormalizados.idObra !==
    obraNormalizada
  ) {
    throw new Error(
      "A API retornou dados de outra obra. " +
      "Solicitada: " +
      obraNormalizada +
      ". Recebida: " +
      dadosNormalizados.idObra
    );
  }

  if (
    dadosNormalizados.periodoDias !==
    periodoNormalizado
  ) {
    throw new Error(
      "A API retornou um período diferente do solicitado."
    );
  }

  return {
    codigoHttp: codigoHttp,
    ...dadosNormalizados
  };
}


/**
 * ============================================================
 * TESTE ISOLADO DO CLIENTE MOBILE
 * ============================================================
 *
 * Não grava dados no banco local.
 */
async function testarClienteReidratacaoMobileUX1955_() {
  console.log(
    "[UX.19.5.5] Iniciando teste do cliente Mobile..."
  );

  const resposta =
    await obterDadosOperacionaisObraMobile_(
      "OBR002",
      30
    );

  const validacoes = {
    codigoHttp200:
      resposta.codigoHttp === 200,

    statusOK:
      resposta.status === "OK",

    contratoVersao1:
      resposta.versaoContrato === "1.0",

    obraCorreta:
      resposta.idObra === "OBR002",

    periodoCorreto:
      resposta.periodoDias === 30,

    listaDiariosValida:
      Array.isArray(resposta.diarios),

    listaItensValida:
      Array.isArray(resposta.diarioItens),

    totalDiariosCoerente:
      resposta.totais.diarios ===
      resposta.diarios.length,

    totalItensCoerente:
      resposta.totais.diarioItens ===
      resposta.diarioItens.length
  };

  const aprovado = Object
    .values(validacoes)
    .every(function (resultado) {
      return resultado === true;
    });

  const resultadoAuditoria = {
    etapa: "UX.19.5.5",
    teste: "Cliente Mobile da reidratação",
    codigoHttp: resposta.codigoHttp,
    status: aprovado
      ? "APROVADO"
      : "REPROVADO",
    respostaStatus: resposta.status,
    versaoContrato: resposta.versaoContrato,
    idObra: resposta.idObra,
    periodoDias: resposta.periodoDias,
    dataInicio: resposta.dataInicio,
    dataFim: resposta.dataFim,
    dataSync: resposta.dataSync,
    diarios: resposta.totais.diarios,
    diarioItens: resposta.totais.diarioItens,
    validacoes: validacoes,
    aprovado: aprovado
  };

  console.log(
    JSON.stringify(
      resultadoAuditoria,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.5.5 REPROVADA. " +
      "Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.5.5 — CLIENTE MOBILE APROVADO."
  );

  /*
   * Mantém o retorno completo disponível para inspeção,
   * mas não imprime os 36 Diários no console.
   */
  return {
    auditoria: resultadoAuditoria,
    dados: resposta
  };
}

/**
 * ============================================================
 * UX.19.5.6 — MESCLAGEM PROTEGIDA NO INDEXEDDB
 * ============================================================
 *
 * Regras:
 *
 * 1. Registro inexistente localmente:
 *    inserir como SINCRONIZADO.
 *
 * 2. Registro existente sem pendência:
 *    atualizar com a versão do servidor.
 *
 * 3. Registro com UPSERT pendente:
 *    preservar integralmente a versão local.
 *
 * 4. Registro com DELETE pendente:
 *    não restaurar.
 *
 * 5. Registro pertencente a outra obra:
 *    rejeitar.
 *
 * 6. Item sem Diário válido:
 *    rejeitar como órfão.
 *
 * 7. TB_SYNC_QUEUE:
 *    não limpar;
 *    não atualizar;
 *    não remover histórico.
 */


/**
 * Normaliza um valor como texto.
 */
function normalizarTextoUX1956_(valor) {
  return String(
    valor === undefined || valor === null
      ? ""
      : valor
  ).trim();
}


/**
 * Normaliza um valor para comparação.
 */
function normalizarMaiusculoUX1956_(valor) {
  return normalizarTextoUX1956_(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}


/**
 * Converte um valor para objeto.
 *
 * Aceita:
 * - objeto JavaScript;
 * - JSON em formato de texto;
 * - valor vazio.
 */
function converterObjetoUX1956_(valor) {
  if (!valor) {
    return {};
  }

  if (typeof valor === "object") {
    return valor;
  }

  if (typeof valor === "string") {
    try {
      const convertido = JSON.parse(valor);

      return (
        convertido &&
        typeof convertido === "object"
      )
        ? convertido
        : {};

    } catch (erro) {
      return {};
    }
  }

  return {};
}


/**
 * Procura o payload dentro de um registro da fila.
 *
 * Foram incluídos nomes alternativos para preservar
 * compatibilidade com diferentes versões da fila.
 */
function obterPayloadFilaUX1956_(registroFila) {
  const candidatos = [
    registroFila && registroFila.payload,
    registroFila && registroFila.dados,
    registroFila && registroFila.registro,
    registroFila && registroFila.objeto,
    registroFila && registroFila.body,
    registroFila && registroFila.pacote,
    registroFila && registroFila.dadosRegistro,
    registroFila && registroFila.registroPayload,
    registroFila && registroFila.conteudo
  ];

  for (const candidato of candidatos) {
    const objeto =
      converterObjetoUX1956_(candidato);

    if (
      objeto &&
      Object.keys(objeto).length
    ) {
      return objeto;
    }
  }

  return {};
}


/**
 * Identifica se uma pendência pertence a:
 *
 * - DIARIO
 * - DIARIO_ITEM
 */
function obterEntidadeFilaUX1956_(registroFila) {
  const payload =
    obterPayloadFilaUX1956_(registroFila);

  const texto = [
    registroFila && registroFila.entidade,
    registroFila && registroFila.tipoEntidade,
    registroFila && registroFila.tipoRegistro,
    registroFila && registroFila.tabela,
    registroFila && registroFila.store,
    registroFila && registroFila.origemTabela,
    registroFila && registroFila.tipo,

    payload.entidade,
    payload.tipoEntidade,
    payload.tipoRegistro,
    payload.tabela,
    payload.store,
    payload.tipo
  ]
    .map(normalizarMaiusculoUX1956_)
    .filter(Boolean)
    .join("|");

  /*
   * O item deve ser verificado primeiro, pois seu nome
   * também contém a palavra DIARIO.
   */
  if (
    texto.includes("TB_DIARIO_ITENS") ||
    texto.includes("DIARIO_ITEM") ||
    texto.includes("DIARIOITENS") ||
    texto.includes("ITEM_DIARIO")
  ) {
    return "DIARIO_ITEM";
  }

  if (
    texto.includes("TB_DIARIOS") ||
    texto.includes("DIARIO_OBRA") ||
    texto.includes("DIARIO")
  ) {
    return "DIARIO";
  }

  return "";
}


/**
 * Identifica a operação registrada na fila.
 */
function obterOperacaoFilaUX1956_(registroFila) {
  const payload =
    obterPayloadFilaUX1956_(registroFila);

  const texto = [
    registroFila && registroFila.operacao,
    registroFila && registroFila.acao,
    registroFila && registroFila.tipoOperacao,
    registroFila && registroFila.metodo,

    payload.operacao,
    payload.acao,
    payload.tipoOperacao,
    payload.metodo
  ]
    .map(normalizarMaiusculoUX1956_)
    .filter(Boolean)
    .join("|");

  if (
    texto.includes("DELETE") ||
    texto.includes("EXCLUIR") ||
    texto.includes("EXCLUSAO") ||
    texto.includes("REMOVER")
  ) {
    return "DELETE";
  }

  if (
    texto.includes("UPSERT") ||
    texto.includes("INSERT") ||
    texto.includes("UPDATE") ||
    texto.includes("SALVAR") ||
    texto.includes("CRIAR")
  ) {
    return "UPSERT";
  }

  if (
    (
      registroFila &&
      registroFila.tombstone === true
    ) ||
    (
      payload &&
      payload.tombstone === true
    ) ||
    (
      registroFila &&
      registroFila.excluido === true
    ) ||
    (
      payload &&
      payload.excluido === true
    )
  ) {
    return "DELETE";
  }

  /*
   * Uma pendência ativa desconhecida também deve proteger
   * o registro local contra sobrescrita.
   */
  return "PENDENCIA";
}


/**
 * Verifica se o registro da fila ainda representa
 * uma pendência ativa.
 */
function filaEstaPendenteUX1956_(registroFila) {
  const payload =
    obterPayloadFilaUX1956_(registroFila);

  const status = normalizarMaiusculoUX1956_(
    registroFila && (
      registroFila.statusSync ||
      registroFila.status ||
      registroFila.situacao
    ) ||
    payload.statusSync ||
    payload.status ||
    payload.situacao
  );

  const statusFinalizados = new Set([
    "SINCRONIZADO",
    "CONCLUIDO",
    "FINALIZADO",
    "CANCELADO",
    "CANCELADA",
    "IGNORADO",
    "IGNORADA"
  ]);

  return !statusFinalizados.has(status);
}


/**
 * Extrai o ID do registro atingido pela pendência.
 */
function obterIdAlvoFilaUX1956_(
  registroFila,
  entidade
) {
  const payload =
    obterPayloadFilaUX1956_(registroFila);

  const registroInterno =
    converterObjetoUX1956_(
      payload.registro ||
      payload.dados ||
      payload.dadosRegistro ||
      {}
    );

  const candidatosComuns = [
    registroFila && registroFila.idRegistro,
    registroFila && registroFila.registroId,
    registroFila && registroFila.idEntidade,
    registroFila && registroFila.idAlvo,
    registroFila && registroFila.chave,
    registroFila && registroFila.chaveRegistro,

    payload.idRegistro,
    payload.registroId,
    payload.idEntidade,
    payload.idAlvo,
    payload.chave,
    payload.chaveRegistro
  ];

  const candidatosEntidade =
    entidade === "DIARIO_ITEM"
      ? [
          registroFila &&
            registroFila.idItemDiario,

          registroFila &&
            registroFila.idDiarioItem,

          registroFila &&
            registroFila.idItem,

          payload.idItemDiario,
          payload.idDiarioItem,
          payload.idItem,

          registroInterno.idItemDiario,
          registroInterno.idDiarioItem,
          registroInterno.idItem
        ]
      : [
          registroFila &&
            registroFila.idDiario,

          payload.idDiario,

          registroInterno.idDiario
        ];

  const candidatos =
    candidatosEntidade.concat(
      candidatosComuns
    );

  for (const candidato of candidatos) {
    const id =
      normalizarTextoUX1956_(candidato);

    if (id) {
      return id;
    }
  }

  return "";
}


/**
 * Cria o mapa de pendências ativas.
 *
 * A chave utilizada é:
 *
 * DIARIO|ID
 * DIARIO_ITEM|ID
 */
function criarMapaPendenciasUX1956_(
  registrosFila
) {
  const mapa = new Map();

  let totalPendenciasAtivas = 0;

  for (
    const registroFila of registrosFila || []
  ) {
    if (
      !filaEstaPendenteUX1956_(
        registroFila
      )
    ) {
      continue;
    }

    const entidade =
      obterEntidadeFilaUX1956_(
        registroFila
      );

    if (!entidade) {
      continue;
    }

    const idRegistro =
      obterIdAlvoFilaUX1956_(
        registroFila,
        entidade
      );

    if (!idRegistro) {
      continue;
    }

    const operacao =
      obterOperacaoFilaUX1956_(
        registroFila
      );

    const chave =
      entidade + "|" + idRegistro;

    const anterior =
      mapa.get(chave);

    totalPendenciasAtivas++;

    if (!anterior) {
      mapa.set(
        chave,
        {
          entidade,
          idRegistro,
          operacao,
          registroFila
        }
      );

      continue;
    }

    /*
     * DELETE sempre tem precedência.
     *
     * Isso impede que um registro excluído localmente seja
     * restaurado pela reidratação.
     */
    if (
      operacao === "DELETE" &&
      anterior.operacao !== "DELETE"
    ) {
      mapa.set(
        chave,
        {
          entidade,
          idRegistro,
          operacao,
          registroFila
        }
      );
    }
  }

  return {
    mapa,
    totalPendenciasAtivas
  };
}


/**
 * Garante que o registro contenha a keyPath da store.
 *
 * Isso protege contra diferenças entre:
 *
 * idDiario
 * idItemDiario
 * id
 * chave
 */
function prepararRegistroParaStoreUX1956_(
  store,
  registro,
  idPreferencial
) {
  const preparado = {
    ...registro
  };

  const keyPath = store.keyPath;

  if (
    typeof keyPath === "string" &&
    keyPath &&
    (
      preparado[keyPath] === undefined ||
      preparado[keyPath] === null ||
      preparado[keyPath] === ""
    )
  ) {
    preparado[keyPath] =
      idPreferencial;
  }

  return preparado;
}


/**
 * Cria o resumo inicial de uma entidade.
 */
function criarResumoEntidadeUX1956_(
  recebidos
) {
  return {
    recebidos,
    inseridos: 0,
    atualizados: 0,

    preservadosPorUpsertPendente: 0,
    bloqueadosPorDeletePendente: 0,

    rejeitadosOutraObra: 0,
    rejeitadosInvalidos: 0,

    duplicadosNoServidor: 0,
    orfaosRejeitados: 0
  };
}


/**
 * Registra um conflito evitado.
 *
 * O log é limitado a 100 registros para impedir
 * excesso de memória ou console muito grande.
 */
function adicionarConflitoUX1956_(
  resultado,
  conflito
) {
  resultado.totalConflitosEvitados++;

  if (
    resultado.conflitos.length < 100
  ) {
    resultado.conflitos.push(
      conflito
    );
  }
}


/**
 * Extrai o ID de um Diário.
 */
function obterIdDiarioUX1956_(registro) {
  return normalizarTextoUX1956_(
    registro && (
      registro.idDiario ||
      registro.id ||
      registro.chave
    )
  );
}


/**
 * Extrai o ID de um item do Diário.
 */
function obterIdItemDiarioUX1956_(
  registro
) {
  return normalizarTextoUX1956_(
    registro && (
      registro.idItemDiario ||
      registro.idDiarioItem ||
      registro.idItem ||
      registro.id ||
      registro.chave
    )
  );
}


/**
 * Extrai o ID da obra.
 */
function obterIdObraUX1956_(registro) {
  return normalizarTextoUX1956_(
    registro &&
    registro.idObra
  );
}


/**
 * ============================================================
 * NÚCLEO DA MESCLAGEM PROTEGIDA
 * ============================================================
 *
 * @param {Object} pacote
 * Resposta normalizada da API.
 *
 * @param {Object} opcoes
 * {
 *   simular: true | false
 * }
 */
async function mesclarDadosOperacionaisReidratacaoSIGO_(
  pacote,
  opcoes = {}
) {
  if (
    !pacote ||
    typeof pacote !== "object"
  ) {
    throw new Error(
      "Pacote de reidratação inválido."
    );
  }

  const idObra =
    normalizarTextoUX1956_(
      pacote.idObra
    );

  const diariosServidor =
    Array.isArray(pacote.diarios)
      ? pacote.diarios
      : [];

  const itensServidor =
    Array.isArray(pacote.diarioItens)
      ? pacote.diarioItens
      : [];

  const simular =
    opcoes.simular === true;

  if (!idObra) {
    throw new Error(
      "O pacote de reidratação não possui idObra."
    );
  }

  if (
    typeof abrirBancoLocalSIGO !==
    "function"
  ) {
    throw new Error(
      "A função abrirBancoLocalSIGO() não foi encontrada."
    );
  }

  const db =
    await abrirBancoLocalSIGO();

  if (
    !db ||
    typeof db.transaction !== "function"
  ) {
    throw new Error(
      "Não foi possível abrir o IndexedDB do SIGO."
    );
  }

  const storesObrigatorias = [
    "TB_DIARIOS",
    "TB_DIARIO_ITENS",
    "TB_SYNC_QUEUE"
  ];

  for (
    const storeName of storesObrigatorias
  ) {
    if (
      !db.objectStoreNames.contains(
        storeName
      )
    ) {
      throw new Error(
        "Store obrigatória não encontrada: " +
        storeName
      );
    }
  }

  /*
   * A leitura e a gravação ocorrem dentro da mesma
   * transação IndexedDB.
   */
  return new Promise(
    function (resolve, reject) {
      const tx = db.transaction(
        storesObrigatorias,
        "readwrite"
      );

      const storeDiarios =
        tx.objectStore(
          "TB_DIARIOS"
        );

      const storeItens =
        tx.objectStore(
          "TB_DIARIO_ITENS"
        );

      const storeFila =
        tx.objectStore(
          "TB_SYNC_QUEUE"
        );

      const reqDiariosLocais =
        storeDiarios.getAll();

      const reqItensLocais =
        storeItens.getAll();

      const reqFila =
        storeFila.getAll();

      let diariosLocais = null;
      let itensLocais = null;
      let registrosFila = null;

      let resultadoFinal = null;
      let processamentoIniciado = false;

      /**
       * Cancela toda a transação em caso de erro.
       */
      function falhar(
        mensagem,
        erroOriginal
      ) {
        try {
          tx.abort();

        } catch (erroAbort) {
          /*
           * A transação pode já estar encerrada.
           */
        }

        const detalhe =
          erroOriginal &&
          erroOriginal.message
            ? erroOriginal.message
            : normalizarTextoUX1956_(
                erroOriginal
              );

        reject(
          new Error(
            detalhe
              ? mensagem + " " + detalhe
              : mensagem
          )
        );
      }


      /**
       * Executa a mesclagem somente depois de carregar
       * as três stores.
       */
      function tentarProcessar() {
        if (processamentoIniciado) {
          return;
        }

        if (
          !diariosLocais ||
          !itensLocais ||
          !registrosFila
        ) {
          return;
        }

        processamentoIniciado = true;

        try {
          const pendencias =
            criarMapaPendenciasUX1956_(
              registrosFila
            );

          const mapaPendencias =
            pendencias.mapa;

          const mapaDiariosLocais =
            new Map();

          const mapaItensLocais =
            new Map();

          for (
            const diarioLocal of diariosLocais
          ) {
            const id =
              obterIdDiarioUX1956_(
                diarioLocal
              );

            if (id) {
              mapaDiariosLocais.set(
                id,
                diarioLocal
              );
            }
          }

          for (
            const itemLocal of itensLocais
          ) {
            const id =
              obterIdItemDiarioUX1956_(
                itemLocal
              );

            if (id) {
              mapaItensLocais.set(
                id,
                itemLocal
              );
            }
          }

          const resultado = {
            etapa: "UX.19.5.6",

            operacao:
              "MESCLAGEM_PROTEGIDA_INDEXEDDB",

            modo: simular
              ? "SIMULACAO"
              : "GRAVACAO_REAL",

            idObra,

            periodoDias: Number(
              pacote.periodoDias || 0
            ),

            dataInicio:
              normalizarTextoUX1956_(
                pacote.dataInicio
              ),

            dataFim:
              normalizarTextoUX1956_(
                pacote.dataFim
              ),

            dataSyncServidor:
              normalizarTextoUX1956_(
                pacote.dataSync
              ),

            diarios:
              criarResumoEntidadeUX1956_(
                diariosServidor.length
              ),

            diarioItens:
              criarResumoEntidadeUX1956_(
                itensServidor.length
              ),

            fila: {
              totalRegistros:
                registrosFila.length,

              pendenciasAtivasReconhecidas:
                pendencias
                  .totalPendenciasAtivas,

              preservadaIntegralmente: true,

              alteracoesRealizadas: 0
            },

            totalConflitosEvitados: 0,

            conflitos: [],

            executadoEm:
              new Date().toISOString()
          };


          /*
           * Conjunto de Diários que podem receber itens.
           */
          const idsDiariosDisponiveis =
            new Set();


          /*
           * Diários locais já existentes podem servir como
           * pai de itens, desde que:
           *
           * - pertençam à obra;
           * - não tenham DELETE pendente.
           */
          for (
            const [
              idDiarioLocal,
              diarioLocal
            ] of mapaDiariosLocais.entries()
          ) {
            const obraLocal =
              obterIdObraUX1956_(
                diarioLocal
              );

            const pendenciaLocal =
              mapaPendencias.get(
                "DIARIO|" +
                idDiarioLocal
              );

            if (
              obraLocal === idObra &&
              (
                !pendenciaLocal ||
                pendenciaLocal.operacao !==
                  "DELETE"
              )
            ) {
              idsDiariosDisponiveis.add(
                idDiarioLocal
              );
            }
          }


          /*
           * ==================================================
           * PROCESSAR DIÁRIOS
           * ==================================================
           */

          const idsDiariosServidorVistos =
            new Set();

          for (
            const diarioServidorOriginal
            of diariosServidor
          ) {
            const idDiario =
              obterIdDiarioUX1956_(
                diarioServidorOriginal
              );

            const obraServidor =
              obterIdObraUX1956_(
                diarioServidorOriginal
              );


            /*
             * Diário sem ID.
             */
            if (!idDiario) {
              resultado.diarios
                .rejeitadosInvalidos++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade: "DIARIO",
                  idRegistro: "",
                  motivo:
                    "ID_DIARIO_AUSENTE"
                }
              );

              continue;
            }


            /*
             * Duplicidade no pacote recebido.
             */
            if (
              idsDiariosServidorVistos.has(
                idDiario
              )
            ) {
              resultado.diarios
                .duplicadosNoServidor++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade: "DIARIO",
                  idRegistro: idDiario,
                  motivo:
                    "DUPLICADO_NO_PACOTE_SERVIDOR"
                }
              );

              continue;
            }

            idsDiariosServidorVistos.add(
              idDiario
            );


            /*
             * Registro recebido de outra obra.
             */
            if (
              obraServidor !== idObra
            ) {
              resultado.diarios
                .rejeitadosOutraObra++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade: "DIARIO",
                  idRegistro: idDiario,
                  motivo:
                    "REGISTRO_DE_OUTRA_OBRA",
                  idObraRecebida:
                    obraServidor
                }
              );

              continue;
            }


            const diarioLocal =
              mapaDiariosLocais.get(
                idDiario
              );


            /*
             * Mesmo ID já utilizado localmente em outra obra.
             */
            if (
              diarioLocal &&
              obterIdObraUX1956_(
                diarioLocal
              ) &&
              obterIdObraUX1956_(
                diarioLocal
              ) !== idObra
            ) {
              resultado.diarios
                .rejeitadosOutraObra++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade: "DIARIO",
                  idRegistro: idDiario,
                  motivo:
                    "ID_JA_EXISTE_LOCALMENTE_EM_OUTRA_OBRA"
                }
              );

              continue;
            }


            const pendencia =
              mapaPendencias.get(
                "DIARIO|" + idDiario
              );


            /*
             * DELETE pendente:
             * nunca restaurar o Diário.
             */
            if (
              pendencia &&
              pendencia.operacao ===
                "DELETE"
            ) {
              resultado.diarios
                .bloqueadosPorDeletePendente++;

              idsDiariosDisponiveis.delete(
                idDiario
              );

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade: "DIARIO",
                  idRegistro: idDiario,
                  motivo:
                    "DELETE_PENDENTE_NAO_RESTAURAR"
                }
              );

              continue;
            }


            /*
             * Qualquer outra pendência ativa protege
             * a versão local contra sobrescrita.
             */
            if (pendencia) {
              resultado.diarios
                .preservadosPorUpsertPendente++;

              if (diarioLocal) {
                idsDiariosDisponiveis.add(
                  idDiario
                );
              }

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade: "DIARIO",
                  idRegistro: idDiario,

                  motivo:
                    pendencia.operacao ===
                    "UPSERT"
                      ? "UPSERT_PENDENTE_LOCAL_PRESERVADO"
                      : "PENDENCIA_LOCAL_PRESERVADA"
                }
              );

              continue;
            }


            /*
             * Registro seguro para inserção ou atualização.
             */
            const diarioMesclado =
              prepararRegistroParaStoreUX1956_(
                storeDiarios,
                {
                  ...(diarioLocal || {}),
                  ...diarioServidorOriginal,

                  idDiario,
                  idObra,

                  statusSync:
                    "SINCRONIZADO",

                  origemReidratacao:
                    "SERVIDOR"
                },
                idDiario
              );


            if (diarioLocal) {
              resultado.diarios
                .atualizados++;

            } else {
              resultado.diarios
                .inseridos++;
            }


            idsDiariosDisponiveis.add(
              idDiario
            );

            mapaDiariosLocais.set(
              idDiario,
              diarioMesclado
            );


            if (!simular) {
              storeDiarios.put(
                diarioMesclado
              );
            }
          }


          /*
           * ==================================================
           * PROCESSAR ITENS DOS DIÁRIOS
           * ==================================================
           */

          const idsItensServidorVistos =
            new Set();

          for (
            const itemServidorOriginal
            of itensServidor
          ) {
            const idItem =
              obterIdItemDiarioUX1956_(
                itemServidorOriginal
              );

            const idDiarioPai =
              normalizarTextoUX1956_(
                itemServidorOriginal
                  .idDiario
              );

            const obraServidor =
              obterIdObraUX1956_(
                itemServidorOriginal
              );


            /*
             * Item sem ID ou sem Diário pai.
             */
            if (
              !idItem ||
              !idDiarioPai
            ) {
              resultado.diarioItens
                .rejeitadosInvalidos++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade:
                    "DIARIO_ITEM",

                  idRegistro:
                    idItem,

                  motivo:
                    !idItem
                      ? "ID_ITEM_AUSENTE"
                      : "ID_DIARIO_PAI_AUSENTE"
                }
              );

              continue;
            }


            /*
             * Item duplicado no pacote.
             */
            if (
              idsItensServidorVistos.has(
                idItem
              )
            ) {
              resultado.diarioItens
                .duplicadosNoServidor++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade:
                    "DIARIO_ITEM",

                  idRegistro:
                    idItem,

                  motivo:
                    "DUPLICADO_NO_PACOTE_SERVIDOR"
                }
              );

              continue;
            }

            idsItensServidorVistos.add(
              idItem
            );


            /*
             * Item recebido de outra obra.
             */
            if (
              obraServidor !== idObra
            ) {
              resultado.diarioItens
                .rejeitadosOutraObra++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade:
                    "DIARIO_ITEM",

                  idRegistro:
                    idItem,

                  motivo:
                    "REGISTRO_DE_OUTRA_OBRA",

                  idObraRecebida:
                    obraServidor
                }
              );

              continue;
            }


            /*
             * O Diário pai precisa existir e não pode
             * estar bloqueado por DELETE.
             */
            if (
              !idsDiariosDisponiveis.has(
                idDiarioPai
              )
            ) {
              resultado.diarioItens
                .orfaosRejeitados++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade:
                    "DIARIO_ITEM",

                  idRegistro:
                    idItem,

                  idDiario:
                    idDiarioPai,

                  motivo:
                    "ITEM_ORFAO_OU_DIARIO_BLOQUEADO"
                }
              );

              continue;
            }


            const itemLocal =
              mapaItensLocais.get(
                idItem
              );


            /*
             * Mesmo ID já existente em outra obra.
             */
            if (
              itemLocal &&
              obterIdObraUX1956_(
                itemLocal
              ) &&
              obterIdObraUX1956_(
                itemLocal
              ) !== idObra
            ) {
              resultado.diarioItens
                .rejeitadosOutraObra++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade:
                    "DIARIO_ITEM",

                  idRegistro:
                    idItem,

                  motivo:
                    "ID_JA_EXISTE_LOCALMENTE_EM_OUTRA_OBRA"
                }
              );

              continue;
            }


            const pendencia =
              mapaPendencias.get(
                "DIARIO_ITEM|" +
                idItem
              );


            /*
             * DELETE pendente:
             * não restaurar o item.
             */
            if (
              pendencia &&
              pendencia.operacao ===
                "DELETE"
            ) {
              resultado.diarioItens
                .bloqueadosPorDeletePendente++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade:
                    "DIARIO_ITEM",

                  idRegistro:
                    idItem,

                  motivo:
                    "DELETE_PENDENTE_NAO_RESTAURAR"
                }
              );

              continue;
            }


            /*
             * UPSERT ou outra pendência:
             * preservar a versão local.
             */
            if (pendencia) {
              resultado.diarioItens
                .preservadosPorUpsertPendente++;

              adicionarConflitoUX1956_(
                resultado,
                {
                  entidade:
                    "DIARIO_ITEM",

                  idRegistro:
                    idItem,

                  motivo:
                    pendencia.operacao ===
                    "UPSERT"
                      ? "UPSERT_PENDENTE_LOCAL_PRESERVADO"
                      : "PENDENCIA_LOCAL_PRESERVADA"
                }
              );

              continue;
            }


            /*
             * Registro seguro para inserção ou atualização.
             */
            const itemMesclado =
              prepararRegistroParaStoreUX1956_(
                storeItens,
                {
                  ...(itemLocal || {}),
                  ...itemServidorOriginal,

                  idItemDiario:
                    idItem,

                  idDiario:
                    idDiarioPai,

                  idObra,

                  statusSync:
                    "SINCRONIZADO",

                  origemReidratacao:
                    "SERVIDOR"
                },
                idItem
              );


            if (itemLocal) {
              resultado.diarioItens
                .atualizados++;

            } else {
              resultado.diarioItens
                .inseridos++;
            }


            mapaItensLocais.set(
              idItem,
              itemMesclado
            );


            if (!simular) {
              storeItens.put(
                itemMesclado
              );
            }
          }


          /*
           * A TB_SYNC_QUEUE foi apenas consultada.
           *
           * Nenhum put, delete ou clear foi executado nela.
           */
          resultadoFinal = resultado;

        } catch (erroProcessamento) {
          falhar(
            "Falha durante a mesclagem protegida.",
            erroProcessamento
          );
        }
      }


      /*
       * Leitura dos Diários locais.
       */
      reqDiariosLocais.onsuccess =
        function () {
          diariosLocais =
            Array.isArray(
              reqDiariosLocais.result
            )
              ? reqDiariosLocais.result
              : [];

          tentarProcessar();
        };


      /*
       * Leitura dos itens locais.
       */
      reqItensLocais.onsuccess =
        function () {
          itensLocais =
            Array.isArray(
              reqItensLocais.result
            )
              ? reqItensLocais.result
              : [];

          tentarProcessar();
        };


      /*
       * Leitura da fila.
       */
      reqFila.onsuccess =
        function () {
          registrosFila =
            Array.isArray(
              reqFila.result
            )
              ? reqFila.result
              : [];

          tentarProcessar();
        };


      reqDiariosLocais.onerror =
        function () {
          falhar(
            "Não foi possível ler TB_DIARIOS.",
            reqDiariosLocais.error
          );
        };


      reqItensLocais.onerror =
        function () {
          falhar(
            "Não foi possível ler TB_DIARIO_ITENS.",
            reqItensLocais.error
          );
        };


      reqFila.onerror =
        function () {
          falhar(
            "Não foi possível ler TB_SYNC_QUEUE.",
            reqFila.error
          );
        };


      /*
       * A resolução ocorre somente depois do commit completo.
       */
      tx.oncomplete =
        function () {
          if (!resultadoFinal) {
            reject(
              new Error(
                "A transação terminou sem produzir resultado."
              )
            );

            return;
          }

          resolve(resultadoFinal);
        };


      tx.onerror =
        function () {
          reject(
            new Error(
              "A transação de mesclagem falhou. " +
              (
                tx.error &&
                tx.error.message
                  ? tx.error.message
                  : ""
              )
            )
          );
        };


      tx.onabort =
        function () {
          reject(
            new Error(
              "A transação de mesclagem foi cancelada. " +
              (
                tx.error &&
                tx.error.message
                  ? tx.error.message
                  : ""
              )
            )
          );
        };
    }
  );
}


/**
 * ============================================================
 * FLUXO OFICIAL
 * API → MESCLAGEM PROTEGIDA
 * ============================================================
 */
async function reidratarDadosOperacionaisObraMobile_(
  idObra,
  diasHistorico,
  opcoes = {}
) {
  const respostaApi =
    await obterDadosOperacionaisObraMobile_(
      idObra,
      diasHistorico
    );

  return mesclarDadosOperacionaisReidratacaoSIGO_(
    respostaApi,
    opcoes
  );
}


/**
 * ============================================================
 * TESTE SEGURO DA UX.19.5.6
 * ============================================================
 *
 * Apenas simula todas as decisões.
 *
 * Não grava:
 * - TB_DIARIOS;
 * - TB_DIARIO_ITENS;
 * - TB_SYNC_QUEUE.
 */
async function testarMesclagemProtegidaUX1956_() {
  console.log(
    "[UX.19.5.6] Iniciando simulação da mesclagem protegida..."
  );

  const resultado =
    await reidratarDadosOperacionaisObraMobile_(
      "OBR002",
      30,
      {
        simular: true
      }
    );

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  console.log(
    "[UX.19.5.6] Simulação concluída. " +
    "Nenhum registro foi gravado."
  );

  return resultado;
}


/**
 * ============================================================
 * EXECUÇÃO REAL DA UX.19.5.6
 * ============================================================
 *
 * Não executar antes da aprovação da simulação.
 */
async function executarMesclagemRealUX1956_() {
  console.log(
    "[UX.19.5.6] Iniciando mesclagem real no IndexedDB..."
  );

  const resultado =
    await reidratarDadosOperacionaisObraMobile_(
      "OBR002",
      30,
      {
        simular: false
      }
    );

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  console.log(
    "[UX.19.5.6] Mesclagem real concluída. " +
    "A TB_SYNC_QUEUE foi preservada."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.5.7 — AUDITORIA DA MESCLAGEM PROTEGIDA
 * ============================================================
 *
 * Auditoria somente leitura.
 *
 * Não executa:
 * - put();
 * - add();
 * - delete();
 * - clear();
 *
 * A simulação de idempotência também não grava registros.
 */


/**
 * Serializa objetos mantendo as propriedades em ordem estável.
 *
 * Utilizado para comparar a TB_SYNC_QUEUE antes e depois
 * da auditoria, independentemente da ordem das propriedades.
 */
function serializarEstavelUX1957_(valor) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return JSON.stringify(valor);
  }

  if (Array.isArray(valor)) {
    return (
      "[" +
      valor
        .map(serializarEstavelUX1957_)
        .join(",") +
      "]"
    );
  }

  if (typeof valor === "object") {
    const chaves =
      Object.keys(valor).sort();

    return (
      "{" +
      chaves
        .map(function (chave) {
          return (
            JSON.stringify(chave) +
            ":" +
            serializarEstavelUX1957_(
              valor[chave]
            )
          );
        })
        .join(",") +
      "}"
    );
  }

  return JSON.stringify(valor);
}


/**
 * Gera uma assinatura independente da ordem dos registros.
 */
function gerarAssinaturaListaUX1957_(
  registros
) {
  const assinaturas =
    (registros || [])
      .map(serializarEstavelUX1957_)
      .sort();

  return JSON.stringify(
    assinaturas
  );
}


/**
 * Lê simultaneamente as três stores auditadas.
 */
async function lerSnapshotReidratacaoUX1957_() {
  if (
    typeof abrirBancoLocalSIGO !==
    "function"
  ) {
    throw new Error(
      "A função abrirBancoLocalSIGO() não foi encontrada."
    );
  }

  const db =
    await abrirBancoLocalSIGO();

  const storesObrigatorias = [
    "TB_DIARIOS",
    "TB_DIARIO_ITENS",
    "TB_SYNC_QUEUE"
  ];

  for (
    const nomeStore of storesObrigatorias
  ) {
    if (
      !db.objectStoreNames.contains(
        nomeStore
      )
    ) {
      throw new Error(
        "Store não encontrada: " +
        nomeStore
      );
    }
  }

  return new Promise(
    function (resolve, reject) {
      const tx = db.transaction(
        storesObrigatorias,
        "readonly"
      );

      const reqDiarios =
        tx.objectStore(
          "TB_DIARIOS"
        ).getAll();

      const reqItens =
        tx.objectStore(
          "TB_DIARIO_ITENS"
        ).getAll();

      const reqFila =
        tx.objectStore(
          "TB_SYNC_QUEUE"
        ).getAll();

      tx.oncomplete =
        function () {
          resolve({
            diarios:
              Array.isArray(
                reqDiarios.result
              )
                ? reqDiarios.result
                : [],

            diarioItens:
              Array.isArray(
                reqItens.result
              )
                ? reqItens.result
                : [],

            fila:
              Array.isArray(
                reqFila.result
              )
                ? reqFila.result
                : []
          });
        };

      tx.onerror =
        function () {
          reject(
            new Error(
              "Falha ao ler o IndexedDB para auditoria. " +
              (
                tx.error &&
                tx.error.message
                  ? tx.error.message
                  : ""
              )
            )
          );
        };

      tx.onabort =
        function () {
          reject(
            new Error(
              "A leitura de auditoria foi cancelada."
            )
          );
        };
    }
  );
}


/**
 * Cria índice por ID e identifica duplicidades.
 */
function criarIndiceAuditoriaUX1957_(
  registros,
  extrairId
) {
  const mapa = new Map();
  const duplicados = [];
  const invalidos = [];

  for (
    const registro of registros || []
  ) {
    const id = String(
      extrairId(registro) || ""
    ).trim();

    if (!id) {
      invalidos.push(registro);
      continue;
    }

    if (mapa.has(id)) {
      duplicados.push(id);
      continue;
    }

    mapa.set(
      id,
      registro
    );
  }

  return {
    mapa,
    duplicados,
    invalidos
  };
}


/**
 * Adiciona um problema, limitando o tamanho do log.
 */
function adicionarProblemaAuditoriaUX1957_(
  problemas,
  problema
) {
  if (problemas.length < 100) {
    problemas.push(problema);
  }
}


/**
 * ============================================================
 * AUDITORIA PRINCIPAL
 * ============================================================
 */
async function auditarMesclagemReidratacaoUX1957_() {
  console.log(
    "[UX.19.5.7] Iniciando auditoria da mesclagem..."
  );

  const idObraEsperado =
    "OBR002";

  const periodoEsperado =
    30;

  const totalFilaEsperado =
    45;

  const idDiarioExcluido =
    "DIA-1783729435514";

  const idItemExcluido =
    "DIT-1783729499226";


  /*
   * ==========================================================
   * 1. CONSULTAR NOVAMENTE A API
   * ==========================================================
   */

  const respostaApi =
    await obterDadosOperacionaisObraMobile_(
      idObraEsperado,
      periodoEsperado
    );


  /*
   * ==========================================================
   * 2. SNAPSHOT ANTES DA SIMULAÇÃO
   * ==========================================================
   */

  const snapshotAntes =
    await lerSnapshotReidratacaoUX1957_();

  const assinaturaFilaAntes =
    gerarAssinaturaListaUX1957_(
      snapshotAntes.fila
    );


  /*
   * ==========================================================
   * 3. SIMULAR NOVAMENTE PARA TESTAR IDEMPOTÊNCIA
   * ==========================================================
   *
   * Como os registros já foram reidratados, uma nova
   * execução deve resultar em:
   *
   * - zero inserções;
   * - 36 atualizações possíveis de Diários;
   * - 6 atualizações possíveis de itens;
   * - nenhuma duplicação;
   * - nenhuma mudança na fila.
   */

  const simulacaoIdempotencia =
    await mesclarDadosOperacionaisReidratacaoSIGO_(
      respostaApi,
      {
        simular: true
      }
    );


  /*
   * ==========================================================
   * 4. SNAPSHOT DEPOIS DA SIMULAÇÃO
   * ==========================================================
   */

  const snapshotDepois =
    await lerSnapshotReidratacaoUX1957_();

  const assinaturaFilaDepois =
    gerarAssinaturaListaUX1957_(
      snapshotDepois.fila
    );


  /*
   * ==========================================================
   * 5. CRIAR ÍNDICES
   * ==========================================================
   */

  const indiceDiariosServidor =
    criarIndiceAuditoriaUX1957_(
      respostaApi.diarios,
      function (registro) {
        return registro.idDiario;
      }
    );

  const indiceItensServidor =
    criarIndiceAuditoriaUX1957_(
      respostaApi.diarioItens,
      function (registro) {
        return (
          registro.idItemDiario ||
          registro.idDiarioItem ||
          registro.idItem
        );
      }
    );

  const indiceDiariosLocais =
    criarIndiceAuditoriaUX1957_(
      snapshotDepois.diarios,
      function (registro) {
        return obterIdDiarioUX1956_(
          registro
        );
      }
    );

  const indiceItensLocais =
    criarIndiceAuditoriaUX1957_(
      snapshotDepois.diarioItens,
      function (registro) {
        return obterIdItemDiarioUX1956_(
          registro
        );
      }
    );


  /*
   * ==========================================================
   * 6. COMPARAR DIÁRIOS DA API COM O INDEXEDDB
   * ==========================================================
   */

  const problemas = [];

  let diariosLocalizados = 0;
  let diariosStatusCorreto = 0;
  let diariosOrigemCorreta = 0;
  let diariosObraCorreta = 0;
  let diariosDataSyncPresente = 0;

  for (
    const [
      idDiario,
      diarioServidor
    ] of indiceDiariosServidor.mapa.entries()
  ) {
    const diarioLocal =
      indiceDiariosLocais.mapa.get(
        idDiario
      );

    if (!diarioLocal) {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO",
          idRegistro: idDiario,
          problema:
            "NAO_ENCONTRADO_NO_INDEXEDDB"
        }
      );

      continue;
    }

    diariosLocalizados++;

    if (
      normalizarMaiusculoUX1956_(
        diarioLocal.statusSync
      ) === "SINCRONIZADO"
    ) {
      diariosStatusCorreto++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO",
          idRegistro: idDiario,
          problema:
            "STATUS_SYNC_INCORRETO",
          valor:
            diarioLocal.statusSync
        }
      );
    }

    if (
      normalizarMaiusculoUX1956_(
        diarioLocal.origemReidratacao
      ) === "SERVIDOR"
    ) {
      diariosOrigemCorreta++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO",
          idRegistro: idDiario,
          problema:
            "ORIGEM_REIDRATACAO_INCORRETA",
          valor:
            diarioLocal.origemReidratacao
        }
      );
    }

    if (
      normalizarTextoUX1956_(
        diarioLocal.idObra
      ) === idObraEsperado
    ) {
      diariosObraCorreta++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO",
          idRegistro: idDiario,
          problema:
            "ID_OBRA_INCORRETO",
          valor:
            diarioLocal.idObra
        }
      );
    }

    if (
      normalizarTextoUX1956_(
        diarioLocal.dataSync
      )
    ) {
      diariosDataSyncPresente++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO",
          idRegistro: idDiario,
          problema:
            "DATA_SYNC_AUSENTE"
        }
      );
    }
  }


  /*
   * ==========================================================
   * 7. COMPARAR ITENS DA API COM O INDEXEDDB
   * ==========================================================
   */

  let itensLocalizados = 0;
  let itensStatusCorreto = 0;
  let itensOrigemCorreta = 0;
  let itensObraCorreta = 0;
  let itensDataSyncPresente = 0;
  let itensComPaiLocal = 0;
  let itensComPaiNoPacote = 0;

  for (
    const [
      idItem,
      itemServidor
    ] of indiceItensServidor.mapa.entries()
  ) {
    const itemLocal =
      indiceItensLocais.mapa.get(
        idItem
      );

    if (!itemLocal) {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          problema:
            "NAO_ENCONTRADO_NO_INDEXEDDB"
        }
      );

      continue;
    }

    itensLocalizados++;

    if (
      normalizarMaiusculoUX1956_(
        itemLocal.statusSync
      ) === "SINCRONIZADO"
    ) {
      itensStatusCorreto++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          problema:
            "STATUS_SYNC_INCORRETO",
          valor:
            itemLocal.statusSync
        }
      );
    }

    if (
      normalizarMaiusculoUX1956_(
        itemLocal.origemReidratacao
      ) === "SERVIDOR"
    ) {
      itensOrigemCorreta++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          problema:
            "ORIGEM_REIDRATACAO_INCORRETA",
          valor:
            itemLocal.origemReidratacao
        }
      );
    }

    if (
      normalizarTextoUX1956_(
        itemLocal.idObra
      ) === idObraEsperado
    ) {
      itensObraCorreta++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          problema:
            "ID_OBRA_INCORRETO",
          valor:
            itemLocal.idObra
        }
      );
    }

    if (
      normalizarTextoUX1956_(
        itemLocal.dataSync
      )
    ) {
      itensDataSyncPresente++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          problema:
            "DATA_SYNC_AUSENTE"
        }
      );
    }

    const idDiarioPai =
      normalizarTextoUX1956_(
        itemLocal.idDiario
      );

    if (
      indiceDiariosLocais.mapa.has(
        idDiarioPai
      )
    ) {
      itensComPaiLocal++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          idDiario: idDiarioPai,
          problema:
            "ITEM_ORFAO_NO_INDEXEDDB"
        }
      );
    }

    if (
      indiceDiariosServidor.mapa.has(
        idDiarioPai
      )
    ) {
      itensComPaiNoPacote++;

    } else {
      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          idDiario: idDiarioPai,
          problema:
            "DIARIO_PAI_NAO_VEIO_NO_PACOTE"
        }
      );
    }
  }


  /*
   * ==========================================================
   * 8. PROCURAR ÓRFÃOS LOCAIS DA OBRA
   * ==========================================================
   */

  const orfaosLocaisObra = [];

  for (
    const itemLocal of snapshotDepois.diarioItens
  ) {
    if (
      normalizarTextoUX1956_(
        itemLocal.idObra
      ) !== idObraEsperado
    ) {
      continue;
    }

    const idItem =
      obterIdItemDiarioUX1956_(
        itemLocal
      );

    const idDiarioPai =
      normalizarTextoUX1956_(
        itemLocal.idDiario
      );

    if (
      !indiceDiariosLocais.mapa.has(
        idDiarioPai
      )
    ) {
      orfaosLocaisObra.push({
        idItem,
        idDiario: idDiarioPai
      });

      adicionarProblemaAuditoriaUX1957_(
        problemas,
        {
          entidade: "DIARIO_ITEM",
          idRegistro: idItem,
          idDiario: idDiarioPai,
          problema:
            "ORFAO_LOCAL_DA_OBRA"
        }
      );
    }
  }


  /*
   * ==========================================================
   * 9. VALIDAR REGISTROS EXCLUÍDOS
   * ==========================================================
   */

  const diarioExcluidoNoLocal =
    indiceDiariosLocais.mapa.has(
      idDiarioExcluido
    );

  const itemExcluidoNoLocal =
    indiceItensLocais.mapa.has(
      idItemExcluido
    );

  const diarioExcluidoNoServidor =
    indiceDiariosServidor.mapa.has(
      idDiarioExcluido
    );

  const itemExcluidoNoServidor =
    indiceItensServidor.mapa.has(
      idItemExcluido
    );


  /*
   * ==========================================================
   * 10. VALIDAR A FILA
   * ==========================================================
   */

  const filaQuantidadeAntes =
    snapshotAntes.fila.length;

  const filaQuantidadeDepois =
    snapshotDepois.fila.length;

  const filaConteudoPreservado =
    assinaturaFilaAntes ===
    assinaturaFilaDepois;


  /*
   * ==========================================================
   * 11. VALIDAÇÕES FINAIS
   * ==========================================================
   */

  const totalDiariosServidor =
    respostaApi.diarios.length;

  const totalItensServidor =
    respostaApi.diarioItens.length;

  const validacoes = {
    apiStatusOK:
      respostaApi.status === "OK",

    contratoVersao1:
      respostaApi.versaoContrato === "1.0",

    obraCorreta:
      respostaApi.idObra ===
      idObraEsperado,

    periodoCorreto:
      respostaApi.periodoDias ===
      periodoEsperado,

    servidorRetornou36Diarios:
      totalDiariosServidor === 36,

    servidorRetornou6Itens:
      totalItensServidor === 6,

    todosDiariosLocalizados:
      diariosLocalizados ===
      totalDiariosServidor,

    todosDiariosSincronizados:
      diariosStatusCorreto ===
      totalDiariosServidor,

    todosDiariosOrigemServidor:
      diariosOrigemCorreta ===
      totalDiariosServidor,

    todosDiariosDaObraCorreta:
      diariosObraCorreta ===
      totalDiariosServidor,

    todosDiariosComDataSync:
      diariosDataSyncPresente ===
      totalDiariosServidor,

    todosItensLocalizados:
      itensLocalizados ===
      totalItensServidor,

    todosItensSincronizados:
      itensStatusCorreto ===
      totalItensServidor,

    todosItensOrigemServidor:
      itensOrigemCorreta ===
      totalItensServidor,

    todosItensDaObraCorreta:
      itensObraCorreta ===
      totalItensServidor,

    todosItensComDataSync:
      itensDataSyncPresente ===
      totalItensServidor,

    todosItensComPaiLocal:
      itensComPaiLocal ===
      totalItensServidor,

    todosItensComPaiNoPacote:
      itensComPaiNoPacote ===
      totalItensServidor,

    nenhumOrfaoLocalNaObra:
      orfaosLocaisObra.length === 0,

    nenhumDiarioDuplicadoServidor:
      indiceDiariosServidor
        .duplicados.length === 0,

    nenhumItemDuplicadoServidor:
      indiceItensServidor
        .duplicados.length === 0,

    nenhumDiarioDuplicadoLocal:
      indiceDiariosLocais
        .duplicados.length === 0,

    nenhumItemDuplicadoLocal:
      indiceItensLocais
        .duplicados.length === 0,

    diarioExcluidoNaoRetornouServidor:
      diarioExcluidoNoServidor === false,

    itemExcluidoNaoRetornouServidor:
      itemExcluidoNoServidor === false,

    diarioExcluidoNaoFoiRestaurado:
      diarioExcluidoNoLocal === false,

    itemExcluidoNaoFoiRestaurado:
      itemExcluidoNoLocal === false,

    filaMantem45Registros:
      filaQuantidadeDepois ===
      totalFilaEsperado,

    filaQuantidadePreservada:
      filaQuantidadeAntes ===
      filaQuantidadeDepois,

    filaConteudoPreservado:
      filaConteudoPreservado === true,

    idempotenciaSemNovosDiarios:
      simulacaoIdempotencia
        .diarios.inseridos === 0,

    idempotenciaTodosDiariosExistentes:
      simulacaoIdempotencia
        .diarios.atualizados ===
      totalDiariosServidor,

    idempotenciaSemNovosItens:
      simulacaoIdempotencia
        .diarioItens.inseridos === 0,

    idempotenciaTodosItensExistentes:
      simulacaoIdempotencia
        .diarioItens.atualizados ===
      totalItensServidor,

    idempotenciaSemConflitos:
      simulacaoIdempotencia
        .totalConflitosEvitados === 0,

    simulacaoNaoAlterouFila:
      simulacaoIdempotencia
        .fila.alteracoesRealizadas === 0
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(function (valor) {
      return valor === true;
    });


  /*
   * ==========================================================
   * 12. RESULTADO
   * ==========================================================
   */

  const resultado = {
    etapa: "UX.19.5.7",
    auditoria:
      "MESCLAGEM_PROTEGIDA_INDEXEDDB",

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    idObra:
      idObraEsperado,

    periodoDias:
      periodoEsperado,

    api: {
      codigoHttp:
        respostaApi.codigoHttp,

      status:
        respostaApi.status,

      versaoContrato:
        respostaApi.versaoContrato,

      diarios:
        totalDiariosServidor,

      diarioItens:
        totalItensServidor
    },

    indexedDB: {
      diariosRecebidosLocalizados:
        diariosLocalizados,

      itensRecebidosLocalizados:
        itensLocalizados,

      diariosSincronizados:
        diariosStatusCorreto,

      itensSincronizados:
        itensStatusCorreto,

      diariosOrigemServidor:
        diariosOrigemCorreta,

      itensOrigemServidor:
        itensOrigemCorreta,

      orfaosLocaisObra:
        orfaosLocaisObra.length
    },

    excluidos: {
      idDiario:
        idDiarioExcluido,

      diarioPresenteLocalmente:
        diarioExcluidoNoLocal,

      diarioPresenteServidor:
        diarioExcluidoNoServidor,

      idItem:
        idItemExcluido,

      itemPresenteLocalmente:
        itemExcluidoNoLocal,

      itemPresenteServidor:
        itemExcluidoNoServidor
    },

    fila: {
      antes:
        filaQuantidadeAntes,

      depois:
        filaQuantidadeDepois,

      quantidadePreservada:
        filaQuantidadeAntes ===
        filaQuantidadeDepois,

      conteudoPreservado:
        filaConteudoPreservado
    },

    idempotencia: {
      modo:
        simulacaoIdempotencia.modo,

      diariosInseridos:
        simulacaoIdempotencia
          .diarios.inseridos,

      diariosAtualizados:
        simulacaoIdempotencia
          .diarios.atualizados,

      itensInseridos:
        simulacaoIdempotencia
          .diarioItens.inseridos,

      itensAtualizados:
        simulacaoIdempotencia
          .diarioItens.atualizados,

      conflitos:
        simulacaoIdempotencia
          .totalConflitosEvitados,

      alteracoesFila:
        simulacaoIdempotencia
          .fila.alteracoesRealizadas
    },

    duplicidades: {
      diariosServidor:
        indiceDiariosServidor
          .duplicados,

      itensServidor:
        indiceItensServidor
          .duplicados,

      diariosLocais:
        indiceDiariosLocais
          .duplicados,

      itensLocais:
        indiceItensLocais
          .duplicados
    },

    problemas:
      problemas,

    validacoes:
      validacoes,

    aprovado:
      aprovado,

    auditadoEm:
      new Date().toISOString()
  };

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.5.7 REPROVADA. " +
      "Consulte as validações e os problemas no console."
    );
  }

  console.log(
    "UX.19.5.7 — AUDITORIA DA MESCLAGEM APROVADA."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.5.7.A — AUDITORIA ISOLADA DO ITEM ÓRFÃO
 * ============================================================
 *
 * Somente leitura.
 *
 * Não altera:
 * - TB_DIARIO_ITENS;
 * - TB_DIARIOS;
 * - TB_SYNC_QUEUE.
 */
async function auditarItemOrfaoUX1957_() {
  const idItemAuditado =
    "DIT-1782754957031";

  const idObraEsperado =
    "OBR002";

  if (
    typeof abrirBancoLocalSIGO !==
    "function"
  ) {
    throw new Error(
      "A função abrirBancoLocalSIGO() não foi encontrada."
    );
  }

  const db =
    await abrirBancoLocalSIGO();

  const snapshot =
    await new Promise(
      function (resolve, reject) {
        const tx = db.transaction(
          [
            "TB_DIARIO_ITENS",
            "TB_SYNC_QUEUE"
          ],
          "readonly"
        );

        const reqItens =
          tx.objectStore(
            "TB_DIARIO_ITENS"
          ).getAll();

        const reqFila =
          tx.objectStore(
            "TB_SYNC_QUEUE"
          ).getAll();

        tx.oncomplete =
          function () {
            resolve({
              itens:
                Array.isArray(reqItens.result)
                  ? reqItens.result
                  : [],

              fila:
                Array.isArray(reqFila.result)
                  ? reqFila.result
                  : []
            });
          };

        tx.onerror =
          function () {
            reject(
              new Error(
                "Falha ao ler o item órfão no IndexedDB."
              )
            );
          };

        tx.onabort =
          function () {
            reject(
              new Error(
                "A auditoria do item órfão foi cancelada."
              )
            );
          };
      }
    );

  const itemLocal =
    snapshot.itens.find(
      function (registro) {
        return (
          obterIdItemDiarioUX1956_(
            registro
          ) === idItemAuditado
        );
      }
    ) || null;

  /*
   * Localizar qualquer registro da fila que faça
   * referência ao item.
   */
  const registrosFilaRelacionados =
    snapshot.fila.filter(
      function (registroFila) {
        const entidade =
          obterEntidadeFilaUX1956_(
            registroFila
          );

        const idAlvo =
          obterIdAlvoFilaUX1956_(
            registroFila,
            entidade ||
              "DIARIO_ITEM"
          );

        if (
          entidade === "DIARIO_ITEM" &&
          idAlvo === idItemAuditado
        ) {
          return true;
        }

        /*
         * Busca complementar para versões antigas da fila.
         */
        try {
          return JSON
            .stringify(registroFila)
            .includes(idItemAuditado);

        } catch (erro) {
          return false;
        }
      }
    );

  const filaRelacionada =
    registrosFilaRelacionados.map(
      function (registroFila) {
        const entidade =
          obterEntidadeFilaUX1956_(
            registroFila
          );

        return {
          entidade:
            entidade,

          idAlvo:
            obterIdAlvoFilaUX1956_(
              registroFila,
              entidade ||
                "DIARIO_ITEM"
            ),

          operacao:
            obterOperacaoFilaUX1956_(
              registroFila
            ),

          pendente:
            filaEstaPendenteUX1956_(
              registroFila
            ),

          statusSync:
            registroFila.statusSync ||
            registroFila.status ||
            registroFila.situacao ||
            "",

          idFila:
            registroFila.idFila ||
            registroFila.idSync ||
            registroFila.id ||
            ""
        };
      }
    );

  /*
   * Confirmar se o servidor ainda devolve esse item.
   */
  const respostaApi =
    await obterDadosOperacionaisObraMobile_(
      idObraEsperado,
      30
    );

  const itemServidor =
    respostaApi.diarioItens.find(
      function (registro) {
        return (
          obterIdItemDiarioUX1956_(
            registro
          ) === idItemAuditado
        );
      }
    ) || null;

  const possuiPendenciaAtiva =
    filaRelacionada.some(
      function (registroFila) {
        return (
          registroFila.pendente === true
        );
      }
    );

  let classificacao =
    "NAO_CLASSIFICADO";

  if (!itemLocal) {
    classificacao =
      "ITEM_NAO_ENCONTRADO_LOCALMENTE";

  } else if (
    normalizarTextoUX1956_(
      itemLocal.idDiario
    )
  ) {
    classificacao =
      "ITEM_NAO_E_MAIS_ORFAO";

  } else if (itemServidor) {
    classificacao =
      "INCONSISTENCIA_ENTRE_SERVIDOR_E_CLIENTE";

  } else if (possuiPendenciaAtiva) {
    classificacao =
      "ORFAO_LOCAL_COM_PENDENCIA_ATIVA_PRESERVAR";

  } else {
    classificacao =
      "ORFAO_LOCAL_LEGADO_SEM_PENDENCIA";
  }

  const resultado = {
    etapa:
      "UX.19.5.7.A",

    auditoria:
      "ITEM_ORFAO_LOCAL",

    idItem:
      idItemAuditado,

    itemEncontradoLocalmente:
      Boolean(itemLocal),

    itemRetornadoPeloServidor:
      Boolean(itemServidor),

    idObraLocal:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.idObra
          )
        : "",

    idDiarioLocal:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.idDiario
          )
        : "",

    statusSyncLocal:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.statusSync
          )
        : "",

    origemReidratacao:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.origemReidratacao
          )
        : "",

    idAtividade:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.idAtividade
          )
        : "",

    eap:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.eap
          )
        : "",

    servico:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.servico
          )
        : "",

    data:
      itemLocal
        ? normalizarTextoUX1956_(
            itemLocal.data
          )
        : "",

    quantidadeFilaRelacionada:
      filaRelacionada.length,

    possuiPendenciaAtiva:
      possuiPendenciaAtiva,

    filaRelacionada:
      filaRelacionada,

    classificacao:
      classificacao,

    registroLocal:
      itemLocal
  };

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  console.log(
    "[UX.19.5.7.A] Auditoria isolada concluída. " +
    "Nenhum registro foi alterado."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.5.7.B — CORREÇÃO SEGURA DE ITEM ÓRFÃO LEGADO
 * ============================================================
 *
 * Remove somente:
 *
 * DIT-1782754957031
 *
 * Proteções obrigatórias:
 *
 * - o item precisa existir localmente;
 * - precisa pertencer à OBR002;
 * - precisa estar sem idDiario;
 * - precisa estar SINCRONIZADO;
 * - não pode existir no servidor;
 * - não pode possuir pendência ativa;
 * - a TB_SYNC_QUEUE não pode ser modificada;
 * - nenhuma outra entidade pode ser alterada.
 */


/**
 * Núcleo protegido da correção.
 *
 * Por segurança, o modo padrão é simulação.
 */
async function corrigirItemOrfaoLegadoUX1957_(
  opcoes = {}
) {
  const simular =
    opcoes.simular !== false;

  const idItemAuditado =
    "DIT-1782754957031";

  const idObraEsperado =
    "OBR002";


  /*
   * ==========================================================
   * 1. CONFIRMAR QUE O SERVIDOR NÃO DEVOLVE O ITEM
   * ==========================================================
   */

  const respostaApi =
    await obterDadosOperacionaisObraMobile_(
      idObraEsperado,
      30
    );

  const itemServidor =
    respostaApi.diarioItens.find(
      function (registro) {
        return (
          obterIdItemDiarioUX1956_(
            registro
          ) === idItemAuditado
        );
      }
    ) || null;

  if (itemServidor) {
    throw new Error(
      "Correção bloqueada: o item ainda existe no servidor."
    );
  }


  /*
   * ==========================================================
   * 2. ABRIR O INDEXEDDB
   * ==========================================================
   */

  if (
    typeof abrirBancoLocalSIGO !==
    "function"
  ) {
    throw new Error(
      "A função abrirBancoLocalSIGO() não foi encontrada."
    );
  }

  const db =
    await abrirBancoLocalSIGO();

  if (
    !db.objectStoreNames.contains(
      "TB_DIARIO_ITENS"
    )
  ) {
    throw new Error(
      "A store TB_DIARIO_ITENS não foi encontrada."
    );
  }

  if (
    !db.objectStoreNames.contains(
      "TB_SYNC_QUEUE"
    )
  ) {
    throw new Error(
      "A store TB_SYNC_QUEUE não foi encontrada."
    );
  }


  /*
   * ==========================================================
   * 3. EXECUTAR VALIDAÇÃO E CORREÇÃO ATÔMICA
   * ==========================================================
   */

  const resultadoTransacao =
    await new Promise(
      function (resolve, reject) {
        const tx = db.transaction(
          [
            "TB_DIARIO_ITENS",
            "TB_SYNC_QUEUE"
          ],
          simular
            ? "readonly"
            : "readwrite"
        );

        const storeItens =
          tx.objectStore(
            "TB_DIARIO_ITENS"
          );

        const storeFila =
          tx.objectStore(
            "TB_SYNC_QUEUE"
          );

        const reqItens =
          storeItens.getAll();

        const reqFila =
          storeFila.getAll();

        let itensLocais = null;
        let registrosFila = null;

        let processamentoIniciado =
          false;

        let resultadoParcial =
          null;

        let erroControlado =
          null;


        /**
         * Cancela a transação de forma controlada.
         */
        function cancelarTransacao(
          mensagem
        ) {
          erroControlado =
            new Error(mensagem);

          try {
            tx.abort();

          } catch (erroAbort) {
            reject(erroControlado);
          }
        }


        /**
         * Processa somente depois de ler as duas stores.
         */
        function tentarProcessar() {
          if (processamentoIniciado) {
            return;
          }

          if (
            itensLocais === null ||
            registrosFila === null
          ) {
            return;
          }

          processamentoIniciado =
            true;

          const itemLocal =
            itensLocais.find(
              function (registro) {
                return (
                  obterIdItemDiarioUX1956_(
                    registro
                  ) === idItemAuditado
                );
              }
            ) || null;


          /*
           * O item precisa existir.
           */
          if (!itemLocal) {
            cancelarTransacao(
              "Correção bloqueada: o item órfão não foi encontrado."
            );

            return;
          }


          /*
           * Precisa pertencer à obra esperada.
           */
          const idObraLocal =
            normalizarTextoUX1956_(
              itemLocal.idObra
            );

          if (
            idObraLocal !==
            idObraEsperado
          ) {
            cancelarTransacao(
              "Correção bloqueada: o item pertence a outra obra."
            );

            return;
          }


          /*
           * O vínculo com o Diário precisa estar vazio.
           */
          const idDiarioLocal =
            normalizarTextoUX1956_(
              itemLocal.idDiario
            );

          if (idDiarioLocal) {
            cancelarTransacao(
              "Correção bloqueada: o item já possui Diário pai."
            );

            return;
          }


          /*
           * O item precisa estar sincronizado.
           */
          const statusSyncLocal =
            normalizarMaiusculoUX1956_(
              itemLocal.statusSync
            );

          if (
            statusSyncLocal !==
            "SINCRONIZADO"
          ) {
            cancelarTransacao(
              "Correção bloqueada: o item não está sincronizado."
            );

            return;
          }


          /*
           * Localizar registros históricos ou pendentes
           * relacionados ao item.
           */
          const filaRelacionada =
            registrosFila.filter(
              function (registroFila) {
                try {
                  return JSON
                    .stringify(
                      registroFila
                    )
                    .includes(
                      idItemAuditado
                    );

                } catch (erro) {
                  return false;
                }
              }
            );

          const pendenciasAtivas =
            filaRelacionada.filter(
              function (registroFila) {
                return (
                  filaEstaPendenteUX1956_(
                    registroFila
                  ) === true
                );
              }
            );


          /*
           * Qualquer pendência ativa bloqueia a remoção.
           */
          if (
            pendenciasAtivas.length > 0
          ) {
            cancelarTransacao(
              "Correção bloqueada: o item possui pendência ativa."
            );

            return;
          }


          /*
           * A store precisa possuir uma keyPath simples.
           */
          const keyPath =
            storeItens.keyPath;

          if (
            typeof keyPath !== "string" ||
            !keyPath
          ) {
            cancelarTransacao(
              "Correção bloqueada: keyPath da TB_DIARIO_ITENS inválida."
            );

            return;
          }

          const chavePrimaria =
            itemLocal[keyPath];

          if (
            chavePrimaria === undefined ||
            chavePrimaria === null ||
            chavePrimaria === ""
          ) {
            cancelarTransacao(
              "Correção bloqueada: chave primária do item não encontrada."
            );

            return;
          }


          const assinaturaFilaAntes =
            gerarAssinaturaListaUX1957_(
              registrosFila
            );


          resultadoParcial = {
            etapa:
              "UX.19.5.7.B",

            operacao:
              "CORRECAO_ITEM_ORFAO_LEGADO",

            modo:
              simular
                ? "SIMULACAO"
                : "CORRECAO_REAL",

            idItem:
              idItemAuditado,

            idObra:
              idObraLocal,

            idDiario:
              idDiarioLocal,

            statusSync:
              itemLocal.statusSync,

            itemRetornadoServidor:
              false,

            registrosFilaRelacionados:
              filaRelacionada.length,

            pendenciasAtivas:
              pendenciasAtivas.length,

            filaTotalAntes:
              registrosFila.length,

            assinaturaFilaAntes:
              assinaturaFilaAntes,

            chavePrimaria:
              chavePrimaria,

            keyPath:
              keyPath,

            acao:
              simular
                ? "NENHUMA_ALTERACAO"
                : "REMOVER_SOMENTE_TB_DIARIO_ITENS",

            aprovadoParaCorrecao:
              true
          };


          /*
           * Na simulação não ocorre nenhuma exclusão.
           */
          if (simular) {
            return;
          }


          /*
           * Remover somente o registro inválido.
           *
           * Não executamos:
           *
           * - clear();
           * - alteração na fila;
           * - criação de tombstone;
           * - exclusão de Diário.
           */
          const reqExcluir =
            storeItens.delete(
              chavePrimaria
            );

          reqExcluir.onerror =
            function () {
              cancelarTransacao(
                "Não foi possível remover o item órfão legado."
              );
            };
        }


        reqItens.onsuccess =
          function () {
            itensLocais =
              Array.isArray(
                reqItens.result
              )
                ? reqItens.result
                : [];

            tentarProcessar();
          };


        reqFila.onsuccess =
          function () {
            registrosFila =
              Array.isArray(
                reqFila.result
              )
                ? reqFila.result
                : [];

            tentarProcessar();
          };


        reqItens.onerror =
          function () {
            cancelarTransacao(
              "Falha ao ler TB_DIARIO_ITENS."
            );
          };


        reqFila.onerror =
          function () {
            cancelarTransacao(
              "Falha ao ler TB_SYNC_QUEUE."
            );
          };


        tx.oncomplete =
          function () {
            if (!resultadoParcial) {
              reject(
                new Error(
                  "A transação terminou sem resultado."
                )
              );

              return;
            }

            resolve(
              resultadoParcial
            );
          };


        tx.onabort =
          function () {
            reject(
              erroControlado ||
              new Error(
                "A transação de correção foi cancelada."
              )
            );
          };


        tx.onerror =
          function () {
            if (!erroControlado) {
              reject(
                new Error(
                  "Falha na transação de correção. " +
                  (
                    tx.error &&
                    tx.error.message
                      ? tx.error.message
                      : ""
                  )
                )
              );
            }
          };
      }
    );


  /*
   * ==========================================================
   * 4. VERIFICAÇÃO POSTERIOR
   * ==========================================================
   */

  const snapshotDepois =
    await lerSnapshotReidratacaoUX1957_();

  const itemAindaPresente =
    snapshotDepois.diarioItens.some(
      function (registro) {
        return (
          obterIdItemDiarioUX1956_(
            registro
          ) === idItemAuditado
        );
      }
    );

  const assinaturaFilaDepois =
    gerarAssinaturaListaUX1957_(
      snapshotDepois.fila
    );

  const filaPreservada =
    resultadoTransacao
      .assinaturaFilaAntes ===
    assinaturaFilaDepois;

  const resultadoFinal = {
    etapa:
      resultadoTransacao.etapa,

    operacao:
      resultadoTransacao.operacao,

    modo:
      resultadoTransacao.modo,

    status:
      (
        resultadoTransacao
          .aprovadoParaCorrecao &&
        filaPreservada &&
        (
          simular
            ? itemAindaPresente === true
            : itemAindaPresente === false
        )
      )
        ? "APROVADO"
        : "REPROVADO",

    idItem:
      resultadoTransacao.idItem,

    idObra:
      resultadoTransacao.idObra,

    idDiario:
      resultadoTransacao.idDiario,

    statusSync:
      resultadoTransacao.statusSync,

    itemRetornadoServidor:
      resultadoTransacao
        .itemRetornadoServidor,

    registrosFilaRelacionados:
      resultadoTransacao
        .registrosFilaRelacionados,

    pendenciasAtivas:
      resultadoTransacao
        .pendenciasAtivas,

    filaAntes:
      resultadoTransacao
        .filaTotalAntes,

    filaDepois:
      snapshotDepois.fila.length,

    filaPreservada:
      filaPreservada,

    itemPresenteDepois:
      itemAindaPresente,

    acao:
      resultadoTransacao.acao,

    aprovado:
      (
        resultadoTransacao
          .aprovadoParaCorrecao &&
        filaPreservada &&
        (
          simular
            ? itemAindaPresente === true
            : itemAindaPresente === false
        )
      )
  };

  console.log(
    JSON.stringify(
      resultadoFinal,
      null,
      2
    )
  );

  if (!resultadoFinal.aprovado) {
    throw new Error(
      "UX.19.5.7.B REPROVADA. " +
      "Consulte o resultado da correção."
    );
  }

  return resultadoFinal;
}


/**
 * ============================================================
 * SIMULAÇÃO SEGURA
 * ============================================================
 */
async function simularCorrecaoItemOrfaoUX1957_() {
  console.log(
    "[UX.19.5.7.B] Iniciando simulação da correção..."
  );

  const resultado =
    await corrigirItemOrfaoLegadoUX1957_({
      simular: true
    });

  console.log(
    "[UX.19.5.7.B] Simulação concluída. " +
    "Nenhum registro foi alterado."
  );

  return resultado;
}


/**
 * ============================================================
 * CORREÇÃO REAL
 * ============================================================
 */
async function executarCorrecaoItemOrfaoUX1957_() {
  console.log(
    "[UX.19.5.7.B] Iniciando correção real..."
  );

  const resultado =
    await corrigirItemOrfaoLegadoUX1957_({
      simular: false
    });

  console.log(
    "[UX.19.5.7.B] Item órfão legado removido. " +
    "A TB_SYNC_QUEUE foi preservada."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.5.8 — REIDRATAÇÃO CONTROLADA PELA INTERFACE
 * ============================================================
 */

window.SIGO_REIDRATACAO_UX1958 =
  window.SIGO_REIDRATACAO_UX1958 || {
    idObra: "",
    nomeObra: "",
    periodoDias: 30,
    pacote: null,
    simulacao: null,
    criadoEm: 0,
    emAndamento: false
  };


/**
 * Escapa valores exibidos no HTML.
 */
function escaparHtmlUX1958_(valor) {
  return String(
    valor === undefined || valor === null
      ? ""
      : valor
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/**
 * Normaliza um possível objeto de obra ativa.
 */
function normalizarObraAtivaUX1958_(valor) {
  if (!valor) {
    return null;
  }

  if (typeof valor === "string") {
    const texto = valor.trim();

    if (!texto) {
      return null;
    }

    try {
      const objeto = JSON.parse(texto);

      return normalizarObraAtivaUX1958_(
        objeto
      );

    } catch (erro) {
      return {
        idObra: texto,
        nomeObra: texto
      };
    }
  }

  if (typeof valor !== "object") {
    return null;
  }

  const idObra = String(
    valor.idObra ||
    valor.ID_OBRA ||
    valor.codigoObra ||
    valor.codigo ||
    valor.id ||
    ""
  ).trim();

  if (!idObra) {
    return null;
  }

  return {
    idObra,

    nomeObra: String(
      valor.nomeObra ||
      valor.NOME_OBRA ||
      valor.nome ||
      valor.descricao ||
      idObra
    ).trim()
  };
}


/**
 * Lê uma store inteira do IndexedDB.
 */
async function listarStoreUX1958_(
  nomeStore
) {
  const db =
    await abrirBancoLocalSIGO();

  if (
    !db.objectStoreNames.contains(
      nomeStore
    )
  ) {
    return [];
  }

  return new Promise(
    function (resolve, reject) {
      const tx = db.transaction(
        [nomeStore],
        "readonly"
      );

      const req = tx
        .objectStore(nomeStore)
        .getAll();

      req.onsuccess = function () {
        resolve(
          Array.isArray(req.result)
            ? req.result
            : []
        );
      };

      req.onerror = function () {
        reject(
          new Error(
            "Não foi possível ler " +
            nomeStore +
            "."
          )
        );
      };
    }
  );
}


/**
 * Identifica a obra ativa utilizando as fontes
 * já existentes no aplicativo.
 */
async function resolverObraAtivaUX1958_() {
  const funcoesCandidatas = [
    "obterObraAtivaMobile_",
    "obterObraAtivaMobile",
    "obterObraAtiva_"
  ];

  for (
    const nomeFuncao of funcoesCandidatas
  ) {
    if (
      typeof window[nomeFuncao] ===
      "function"
    ) {
      try {
        const valor =
          await window[nomeFuncao]();

        const obra =
          normalizarObraAtivaUX1958_(
            valor
          );

        if (obra) {
          return obra;
        }

      } catch (erro) {
        console.warn(
          "[UX.19.5.8] Fonte de obra ativa ignorada:",
          nomeFuncao,
          erro
        );
      }
    }
  }

  const globais = [
    window.obraAtivaMobile,
    window.obraAtiva,
    window.OBRA_ATIVA,
    window.idObraAtiva,
    window.SIGO_OBRA_ATIVA
  ];

  for (const valor of globais) {
    const obra =
      normalizarObraAtivaUX1958_(
        valor
      );

    if (obra) {
      return obra;
    }
  }

  const chavesStorage = [
    "SIGO_OBRA_ATIVA",
    "SIGO_OBRA_ATIVA_ID",
    "OBRA_ATIVA",
    "obraAtiva",
    "idObraAtiva"
  ];

  for (
    const chave of chavesStorage
  ) {
    const valor =
      localStorage.getItem(chave);

    const obra =
      normalizarObraAtivaUX1958_(
        valor
      );

    if (obra) {
      /*
       * Tenta completar o nome usando a TB_OBRAS.
       */
      try {
        const obras =
          await listarStoreUX1958_(
            "TB_OBRAS"
          );

        const registro =
          obras.find(function (item) {
            return String(
              item.idObra ||
              item.ID_OBRA ||
              item.id ||
              ""
            ).trim() === obra.idObra;
          });

        return (
          normalizarObraAtivaUX1958_(
            registro
          ) || obra
        );

      } catch (erro) {
        return obra;
      }
    }
  }

  const obras =
    await listarStoreUX1958_(
      "TB_OBRAS"
    );

  const registroAtivo =
    obras.find(function (obra) {
      const status = String(
        obra.statusAtiva ||
        obra.statusObra ||
        obra.status ||
        ""
      )
        .trim()
        .toUpperCase();

      return (
        obra.ativa === true ||
        obra.obraAtiva === true ||
        obra.selecionada === true ||
        status === "ATIVA" ||
        status === "SIM"
      );
    });

  const obraNormalizada =
    normalizarObraAtivaUX1958_(
      registroAtivo
    );

  if (obraNormalizada) {
    return obraNormalizada;
  }

  throw new Error(
    "Nenhuma obra ativa foi identificada. " +
    "Selecione uma obra antes de reidratar."
  );
}


/**
 * Chave de controle da última atualização por obra.
 */
function chaveMetaReidratacaoUX1958_(
  idObra
) {
  return (
    "SIGO_REIDRATACAO_META_" +
    String(idObra || "").trim()
  );
}


/**
 * Salva somente o resumo operacional.
 *
 * Não salva os Diários no localStorage.
 */
function salvarMetaReidratacaoUX1958_(
  idObra,
  dados
) {
  localStorage.setItem(
    chaveMetaReidratacaoUX1958_(
      idObra
    ),
    JSON.stringify(dados)
  );
}


/**
 * Lê o resumo da última reidratação.
 */
function lerMetaReidratacaoUX1958_(
  idObra
) {
  try {
    return JSON.parse(
      localStorage.getItem(
        chaveMetaReidratacaoUX1958_(
          idObra
        )
      ) || "null"
    );

  } catch (erro) {
    return null;
  }
}


/**
 * Formata data e hora para exibição.
 */
function formatarDataHoraUX1958_(
  valor
) {
  if (!valor) {
    return "Nunca atualizada";
  }

  const data = new Date(valor);

  if (
    Number.isNaN(data.getTime())
  ) {
    return String(valor);
  }

  return data.toLocaleString(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );
}


/**
 * Injeta o modal no documento uma única vez.
 */
function garantirModalReidratacaoUX1958_() {
  let overlay =
    document.getElementById(
      "overlayReidratacaoUX1958"
    );

  if (overlay) {
    return overlay;
  }

  overlay =
    document.createElement("div");

  overlay.id =
    "overlayReidratacaoUX1958";

  overlay.className =
    "sigo-reidratacao-overlay";

  overlay.innerHTML = `
    <section
      class="sigo-reidratacao-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tituloReidratacaoUX1958"
    >
      <header class="sigo-reidratacao-modal__header">
        <div>
          <h2 id="tituloReidratacaoUX1958">
            Atualizar dados da obra
          </h2>

          <p id="obraReidratacaoUX1958">
            Identificando obra ativa...
          </p>
        </div>

        <button
          id="fecharReidratacaoUX1958"
          class="sigo-reidratacao-modal__fechar"
          type="button"
          aria-label="Fechar"
        >
          ×
        </button>
      </header>

      <div class="sigo-reidratacao-modal__body">
        <div class="sigo-reidratacao-box">
          <label
            class="sigo-reidratacao-label"
            for="periodoReidratacaoUX1958"
          >
            Histórico operacional
          </label>

          <select
            id="periodoReidratacaoUX1958"
            class="sigo-reidratacao-select"
          >
            <option value="15">
              Últimos 15 dias
            </option>

            <option value="30" selected>
              Últimos 30 dias
            </option>

            <option value="60">
              Últimos 60 dias
            </option>

            <option value="90">
              Últimos 90 dias
            </option>
          </select>

          <p class="sigo-reidratacao-observacao">
            Antes de gravar, o SIGO fará uma simulação e
            protegerá registros locais com UPSERT ou DELETE
            pendente.
          </p>
        </div>

        <div
          id="statusReidratacaoUX1958"
          class="sigo-reidratacao-status"
        ></div>

        <div
          id="resumoReidratacaoUX1958"
          class="sigo-reidratacao-resumo"
        ></div>

        <div class="sigo-reidratacao-acoes">
          <button
            id="visualizarReidratacaoUX1958"
            class="sigo-reidratacao-btn sigo-reidratacao-btn--primario"
            type="button"
          >
            Pré-visualizar atualização
          </button>

          <button
            id="confirmarReidratacaoUX1958"
            class="sigo-reidratacao-btn sigo-reidratacao-btn--confirmar"
            type="button"
            disabled
          >
            Confirmar reidratação
          </button>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(
    overlay
  );

  document
    .getElementById(
      "fecharReidratacaoUX1958"
    )
    .addEventListener(
      "click",
      fecharReidratacaoUX1958_
    );

  document
    .getElementById(
      "visualizarReidratacaoUX1958"
    )
    .addEventListener(
      "click",
      prepararReidratacaoInterfaceUX1958_
    );

  document
    .getElementById(
      "confirmarReidratacaoUX1958"
    )
    .addEventListener(
      "click",
      confirmarReidratacaoInterfaceUX1958_
    );

  overlay.addEventListener(
    "click",
    function (evento) {
      if (evento.target === overlay) {
        fecharReidratacaoUX1958_();
      }
    }
  );

  return overlay;
}


/**
 * Exibe mensagens no modal.
 */
function definirStatusReidratacaoUX1958_(
  mensagem,
  tipo
) {
  const elemento =
    document.getElementById(
      "statusReidratacaoUX1958"
    );

  if (!elemento) {
    return;
  }

  elemento.className =
    "sigo-reidratacao-status is-visible " +
    (
      tipo === "success"
        ? "is-success"
        : tipo === "error"
          ? "is-error"
          : "is-loading"
    );

  elemento.textContent =
    mensagem;
}


/**
 * Bloqueia ou libera os controles.
 */
function bloquearInterfaceReidratacaoUX1958_(
  bloqueada
) {
  const seletor =
    document.getElementById(
      "periodoReidratacaoUX1958"
    );

  const visualizar =
    document.getElementById(
      "visualizarReidratacaoUX1958"
    );

  const confirmar =
    document.getElementById(
      "confirmarReidratacaoUX1958"
    );

  if (seletor) {
    seletor.disabled = bloqueada;
  }

  if (visualizar) {
    visualizar.disabled = bloqueada;
  }

  if (
    confirmar &&
    bloqueada
  ) {
    confirmar.disabled = true;
  }
}


/**
 * Soma registros locais protegidos.
 */
function totalPreservadosUX1958_(
  resultado
) {
  return (
    resultado.diarios
      .preservadosPorUpsertPendente +

    resultado.diarios
      .bloqueadosPorDeletePendente +

    resultado.diarioItens
      .preservadosPorUpsertPendente +

    resultado.diarioItens
      .bloqueadosPorDeletePendente
  );
}


/**
 * Monta o resumo da simulação.
 */
function renderizarSimulacaoUX1958_(
  resultado
) {
  const elemento =
    document.getElementById(
      "resumoReidratacaoUX1958"
    );

  const recebidos =
    numeroSeguroReidratacaoUX1967_(
      resultado.diarios.recebidos
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.diarioItens.recebidos
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.ocorrencias.recebidos
    );

  const inseridos =
    numeroSeguroReidratacaoUX1967_(
      resultado.diarios.inseridos
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.diarioItens.inseridos
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.ocorrencias.inseridos
    );

  const atualizados =
    numeroSeguroReidratacaoUX1967_(
      resultado.diarios.atualizados
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.diarioItens.atualizados
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.ocorrencias.atualizados
    );

  const preservados =
    totalPreservadosConsolidadosUX1967_(
      resultado
    );

  elemento.innerHTML = `
    <h3 class="sigo-reidratacao-resumo__titulo">
      Pré-visualização segura
    </h3>

    <div class="sigo-reidratacao-grid">
      <div class="sigo-reidratacao-kpi">
        <strong>${recebidos}</strong>
        <span>Registros recebidos</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${inseridos}</strong>
        <span>Novos registros</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${atualizados}</strong>
        <span>Registros atualizados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${preservados}</strong>
        <span>Registros locais protegidos</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.diarios.recebidos}</strong>
        <span>Diários recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.diarioItens.recebidos}</strong>
        <span>Itens recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.ocorrencias.recebidos}</strong>
        <span>Ocorrências recuperadas</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.totalConflitosEvitados}</strong>
        <span>Conflitos evitados</span>
      </div>
    </div>

    <p class="sigo-reidratacao-observacao">
      A fila de sincronização possui
      <strong>${resultado.fila.totalRegistros}</strong>
      registros e não será alterada.
    </p>
  `;

  elemento.classList.add(
    "is-visible"
  );
}


/**
 * Monta o resultado da gravação real.
 */
function renderizarResultadoReidratacaoUX1958_(
  resultado
) {
  const elemento =
    document.getElementById(
      "resumoReidratacaoUX1958"
    );

  const inseridos =
    numeroSeguroReidratacaoUX1967_(
      resultado.diarios.inseridos
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.diarioItens.inseridos
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.ocorrencias.inseridos
    );

  const atualizados =
    numeroSeguroReidratacaoUX1967_(
      resultado.diarios.atualizados
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.diarioItens.atualizados
    ) +
    numeroSeguroReidratacaoUX1967_(
      resultado.ocorrencias.atualizados
    );

  const preservados =
    totalPreservadosConsolidadosUX1967_(
      resultado
    );

  elemento.innerHTML = `
    <h3 class="sigo-reidratacao-resumo__titulo">
      Atualização concluída
    </h3>

    <div class="sigo-reidratacao-grid">
      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.diarios.recebidos}</strong>
        <span>Diários recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.diarioItens.recebidos}</strong>
        <span>Itens recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.ocorrencias.recebidos}</strong>
        <span>Ocorrências recuperadas</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${inseridos}</strong>
        <span>Novos registros</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${atualizados}</strong>
        <span>Registros atualizados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${preservados}</strong>
        <span>Registros preservados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.totalConflitosEvitados}</strong>
        <span>Conflitos evitados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>${resultado.fila.totalRegistros}</strong>
        <span>Registros na fila preservada</span>
      </div>
    </div>

    <p class="sigo-reidratacao-observacao">
      Atualizado em
      <strong>
        ${escaparHtmlUX1958_(
          formatarDataHoraUX1958_(
            resultado.executadoEm
          )
        )}
      </strong>.
      A TB_SYNC_QUEUE foi preservada integralmente.
    </p>
  `;

  elemento.classList.add(
    "is-visible"
  );
}

/**
 * ============================================================
 * UX.19.6.7 — TESTE DA INTEGRAÇÃO VISUAL
 * ============================================================
 *
 * Executa apenas:
 *
 * - consultas às APIs;
 * - simulações readonly;
 * - renderização da prévia.
 *
 * Não grava no IndexedDB.
 */
async function testarIntegracaoVisualReidratacaoUX1967_() {
  await abrirReidratacaoUX1958_();

  await prepararReidratacaoInterfaceUX1958_();

  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  const resultado =
    estado.simulacao || {};

  const diarios =
    resultado.diarios || {};

  const itens =
    resultado.diarioItens || {};

  const ocorrencias =
    resultado.ocorrencias || {};

  const totalRecebidos =
    numeroSeguroReidratacaoUX1967_(
      diarios.recebidos
    ) +
    numeroSeguroReidratacaoUX1967_(
      itens.recebidos
    ) +
    numeroSeguroReidratacaoUX1967_(
      ocorrencias.recebidos
    );

  const totalInseridos =
    numeroSeguroReidratacaoUX1967_(
      diarios.inseridos
    ) +
    numeroSeguroReidratacaoUX1967_(
      itens.inseridos
    ) +
    numeroSeguroReidratacaoUX1967_(
      ocorrencias.inseridos
    );

  const totalAtualizados =
    numeroSeguroReidratacaoUX1967_(
      diarios.atualizados
    ) +
    numeroSeguroReidratacaoUX1967_(
      itens.atualizados
    ) +
    numeroSeguroReidratacaoUX1967_(
      ocorrencias.atualizados
    );

  const confirmar =
    document.getElementById(
      "confirmarReidratacaoUX1958"
    );

  const resumoHtml =
    document.getElementById(
      "resumoReidratacaoUX1958"
    ).innerHTML;

  const validacoes = {
    possuiPacoteDadosOperacionais:
      Boolean(
        estado.pacote &&
        estado.pacote
          .dadosOperacionais
      ),

    possuiPacoteOcorrencias:
      Boolean(
        estado.pacote &&
        estado.pacote.ocorrencias
      ),

    simulacaoConsolidada:
      resultado.operacao ===
      "REIDRATACAO_VISUAL_CONSOLIDADA",

    modoSimulacao:
      resultado.modo ===
      "SIMULACAO",

    recebeu36Diarios:
      diarios.recebidos === 36,

    recebeu6Itens:
      itens.recebidos === 6,

    recebeu14Ocorrencias:
      ocorrencias.recebidos === 14,

    recebeu56Registros:
      totalRecebidos === 56,

    inseririaZero:
      totalInseridos === 0,

    atualizaria56:
      totalAtualizados === 56,

    nenhumProtegido:
      totalPreservadosConsolidadosUX1967_(
        resultado
      ) === 0,

    nenhumConflito:
      resultado.totalConflitosEvitados ===
      0,

    filaPossui45:
      resultado.fila &&
      resultado.fila.totalRegistros ===
      45,

    filaPreservada:
      resultado.fila &&
      resultado.fila
        .preservadaIntegralmente ===
      true,

    confirmacaoHabilitada:
      Boolean(
        confirmar &&
        confirmar.disabled === false
      ),

    resumoMostraOcorrencias:
      resumoHtml.includes(
        "Ocorrências recuperadas"
      )
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(
      valor => valor === true
    );

  const auditoria = {
    etapa:
      "UX.19.6.7",

    teste:
      "INTEGRACAO_VISUAL_OCORRENCIAS",

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    idObra:
      resultado.idObra || "",

    periodoDias:
      resultado.periodoDias || 0,

    totais: {
      diarios:
        numeroSeguroReidratacaoUX1967_(
          diarios.recebidos
        ),

      itens:
        numeroSeguroReidratacaoUX1967_(
          itens.recebidos
        ),

      ocorrencias:
        numeroSeguroReidratacaoUX1967_(
          ocorrencias.recebidos
        ),

      recebidos:
        totalRecebidos,

      inseridos:
        totalInseridos,

      atualizados:
        totalAtualizados,

      preservados:
        totalPreservadosConsolidadosUX1967_(
          resultado
        ),

      conflitos:
        numeroSeguroReidratacaoUX1967_(
          resultado
            .totalConflitosEvitados
        )
    },

    fila: {
      totalRegistros:
        resultado.fila
          ? resultado.fila.totalRegistros
          : 0,

      preservada:
        resultado.fila
          ? resultado.fila
              .preservadaIntegralmente
          : false
    },

    validacoes,

    aprovado
  };

  console.log(
    JSON.stringify(
      auditoria,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.6.7 REPROVADA. Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.6.7 — INTEGRAÇÃO VISUAL DE OCORRÊNCIAS APROVADA."
  );

  return auditoria;
}

/**
 * ============================================================
 * UX.19.6.7 — INTEGRAÇÃO VISUAL DAS OCORRÊNCIAS
 * ============================================================
 */


/**
 * Converte contadores para número seguro.
 */
function numeroSeguroReidratacaoUX1967_(
  valor
) {
  const numero =
    Number(valor || 0);

  return Number.isFinite(numero)
    ? numero
    : 0;
}


/**
 * Normaliza o resumo retornado pela mesclagem
 * de ocorrências.
 *
 * A mesclagem de ocorrências utiliza:
 *
 * recebidas
 * inseridas
 * atualizadas
 *
 * A interface consolidada utiliza:
 *
 * recebidos
 * inseridos
 * atualizados
 */
function normalizarResumoOcorrenciasUX1967_(
  resultadoOcorrencias
) {
  const origem =
    resultadoOcorrencias &&
    resultadoOcorrencias.ocorrencias
      ? resultadoOcorrencias.ocorrencias
      : {};

  const recebidos =
    numeroSeguroReidratacaoUX1967_(
      origem.recebidos !== undefined
        ? origem.recebidos
        : origem.recebidas
    );

  const inseridos =
    numeroSeguroReidratacaoUX1967_(
      origem.inseridos !== undefined
        ? origem.inseridos
        : origem.inseridas
    );

  const atualizados =
    numeroSeguroReidratacaoUX1967_(
      origem.atualizados !== undefined
        ? origem.atualizados
        : origem.atualizadas
    );

  const preservadosPorUpsertPendente =
    numeroSeguroReidratacaoUX1967_(
      origem
        .preservadasPorUpsertPendente
    );

  const bloqueadosPorDeletePendente =
    numeroSeguroReidratacaoUX1967_(
      origem
        .bloqueadasPorDeletePendente
    );

  const preservadosPorPendenciaDesconhecida =
    numeroSeguroReidratacaoUX1967_(
      origem
        .preservadasPorPendenciaDesconhecida
    );

  const preservados =
    preservadosPorUpsertPendente +
    bloqueadosPorDeletePendente +
    preservadosPorPendenciaDesconhecida;

  return {
    ...origem,

    recebidos,
    inseridos,
    atualizados,

    preservadosPorUpsertPendente,
    bloqueadosPorDeletePendente,
    preservadosPorPendenciaDesconhecida,

    preservados
  };
}


/**
 * Soma os registros protegidos de:
 *
 * - Diários;
 * - Itens do Diário;
 * - Ocorrências.
 */
function totalPreservadosConsolidadosUX1967_(
  resultado
) {
  const preservadosDadosOperacionais =
    typeof totalPreservadosUX1958_ ===
      "function"
      ? numeroSeguroReidratacaoUX1967_(
          totalPreservadosUX1958_(
            resultado
          )
        )
      : 0;

  const preservadosOcorrencias =
    numeroSeguroReidratacaoUX1967_(
      resultado &&
      resultado.ocorrencias
        ? resultado.ocorrencias
            .preservados
        : 0
    );

  return (
    preservadosDadosOperacionais +
    preservadosOcorrencias
  );
}


/**
 * Consolida os resultados das duas mesclagens:
 *
 * 1. DIÁRIOS + ITENS;
 * 2. OCORRÊNCIAS.
 *
 * Também valida se ambas trabalharam:
 *
 * - na mesma obra;
 * - no mesmo período;
 * - no mesmo modo;
 * - sobre a mesma fila;
 * - sem alterar TB_SYNC_QUEUE.
 */
function consolidarResultadosReidratacaoUX1967_(
  resultadoDados,
  resultadoOcorrencias
) {
  if (
    !resultadoDados ||
    !resultadoOcorrencias
  ) {
    throw new Error(
      "Os resultados da reidratação estão incompletos."
    );
  }

  const idObraDados =
    String(
      resultadoDados.idObra || ""
    ).trim();

  const idObraOcorrencias =
    String(
      resultadoOcorrencias.idObra || ""
    ).trim();

  if (
    !idObraDados ||
    idObraDados !==
      idObraOcorrencias
  ) {
    throw new Error(
      "As mesclagens retornaram obras diferentes."
    );
  }

  const periodoDados =
    Number(
      resultadoDados.periodoDias || 0
    );

  const periodoOcorrencias =
    Number(
      resultadoOcorrencias
        .periodoDias || 0
    );

  if (
    periodoDados !==
    periodoOcorrencias
  ) {
    throw new Error(
      "As mesclagens retornaram períodos diferentes."
    );
  }

  const modoDados =
    String(
      resultadoDados.modo || ""
    );

  const modoOcorrencias =
    String(
      resultadoOcorrencias.modo || ""
    );

  if (
    modoDados !==
    modoOcorrencias
  ) {
    throw new Error(
      "As mesclagens foram executadas em modos diferentes."
    );
  }

  const filaDados =
    resultadoDados.fila || {};

  const filaOcorrencias =
    resultadoOcorrencias.fila || {};

  const totalFilaDados =
    numeroSeguroReidratacaoUX1967_(
      filaDados.totalRegistros
    );

  const totalFilaOcorrencias =
    numeroSeguroReidratacaoUX1967_(
      filaOcorrencias.totalRegistros
    );

  if (
    totalFilaDados !==
    totalFilaOcorrencias
  ) {
    throw new Error(
      "As mesclagens encontraram quantidades diferentes na fila."
    );
  }

  const alteracoesFila =
    numeroSeguroReidratacaoUX1967_(
      filaDados.alteracoesRealizadas
    ) +
    numeroSeguroReidratacaoUX1967_(
      filaOcorrencias
        .alteracoesRealizadas
    );

  const filaPreservada =
    filaDados.preservadaIntegralmente ===
      true &&
    filaOcorrencias
      .preservadaIntegralmente ===
      true &&
    alteracoesFila === 0;

  if (!filaPreservada) {
    throw new Error(
      "A TB_SYNC_QUEUE não foi preservada integralmente."
    );
  }

  const ocorrencias =
    normalizarResumoOcorrenciasUX1967_(
      resultadoOcorrencias
    );

  const datasExecucao = [
    resultadoDados.executadoEm,
    resultadoOcorrencias.executadoEm
  ]
    .filter(Boolean)
    .sort();

  const executadoEm =
    datasExecucao.length
      ? datasExecucao[
          datasExecucao.length - 1
        ]
      : new Date().toISOString();

  return {
    etapa:
      "UX.19.6.7",

    operacao:
      "REIDRATACAO_VISUAL_CONSOLIDADA",

    modo:
      modoDados,

    idObra:
      idObraDados,

    periodoDias:
      periodoDados,

    dataInicio:
      resultadoDados.dataInicio ||
      resultadoOcorrencias.dataInicio ||
      "",

    dataFim:
      resultadoDados.dataFim ||
      resultadoOcorrencias.dataFim ||
      "",

    diarios:
      resultadoDados.diarios || {},

    diarioItens:
      resultadoDados.diarioItens || {},

    ocorrencias:
      ocorrencias,

    fila: {
      totalRegistros:
        totalFilaDados,

      preservadaIntegralmente:
        true,

      alteracoesRealizadas:
        0
    },

    totalConflitosEvitados:
      numeroSeguroReidratacaoUX1967_(
        resultadoDados
          .totalConflitosEvitados
      ) +
      numeroSeguroReidratacaoUX1967_(
        resultadoOcorrencias
          .totalConflitosEvitados
      ),

    executadoEm,

    resultadosOriginais: {
      dadosOperacionais:
        resultadoDados,

      ocorrencias:
        resultadoOcorrencias
    }
  };
}

/**
 * Abre a interface.
 */
async function abrirReidratacaoUX1958_() {
  const overlay =
    garantirModalReidratacaoUX1958_();

  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  estado.pacote = null;
  estado.simulacao = null;
  estado.criadoEm = 0;
  estado.emAndamento = false;

  const resumo =
    document.getElementById(
      "resumoReidratacaoUX1958"
    );

  resumo.innerHTML = "";

  resumo.classList.remove(
    "is-visible"
  );

  const confirmar =
    document.getElementById(
      "confirmarReidratacaoUX1958"
    );

  confirmar.disabled = true;

  overlay.classList.add(
    "is-open"
  );

  definirStatusReidratacaoUX1958_(
    "Identificando a obra ativa...",
    "loading"
  );

  try {
    const obra =
      await resolverObraAtivaUX1958_();

    estado.idObra =
      obra.idObra;

    estado.nomeObra =
      obra.nomeObra;

    document.getElementById(
      "obraReidratacaoUX1958"
    ).textContent =
      obra.nomeObra +
      " · " +
      obra.idObra;

    definirStatusReidratacaoUX1958_(
      "Escolha o período para recuperar Diários, itens e ocorrências.",
      "success"
    );

  } catch (erro) {
    definirStatusReidratacaoUX1958_(
      erro.message,
      "error"
    );
  }
}


/**
 * Fecha o painel.
 */
function fecharReidratacaoUX1958_() {
  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  if (estado.emAndamento) {
    return;
  }

  const overlay =
    document.getElementById(
      "overlayReidratacaoUX1958"
    );

  if (overlay) {
    overlay.classList.remove(
      "is-open"
    );
  }
}


/**
 * Executa a consulta e a simulação protegida.
 */
async function prepararReidratacaoInterfaceUX1958_() {
  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  if (estado.emAndamento) {
    return;
  }

  if (!navigator.onLine) {
    definirStatusReidratacaoUX1958_(
      "A reidratação precisa de conexão com a internet.",
      "error"
    );

    return;
  }

  try {
    estado.emAndamento = true;

    estado.pacote = null;
    estado.simulacao = null;
    estado.criadoEm = 0;

    bloquearInterfaceReidratacaoUX1958_(
      true
    );

    const obraAtual =
      await resolverObraAtivaUX1958_();

    const periodo =
      Number(
        document.getElementById(
          "periodoReidratacaoUX1958"
        ).value
      );

    estado.idObra =
      obraAtual.idObra;

    estado.nomeObra =
      obraAtual.nomeObra;

    estado.periodoDias =
      periodo;

    definirStatusReidratacaoUX1958_(
      "Consultando Diários, itens e ocorrências no servidor...",
      "loading"
    );

    /*
     * As duas APIs são independentes e podem ser
     * consultadas simultaneamente.
     */
    const [
      pacoteDadosOperacionais,
      pacoteOcorrencias
    ] = await Promise.all([
      obterDadosOperacionaisObraMobile_(
        estado.idObra,
        periodo
      ),

      obterOcorrenciasOperacionaisObraMobile_(
        estado.idObra,
        periodo
      )
    ]);

    definirStatusReidratacaoUX1958_(
      "Analisando os registros locais e protegendo pendências...",
      "loading"
    );

    /*
     * As duas simulações são somente leitura.
     */
    const [
      simulacaoDadosOperacionais,
      simulacaoOcorrencias
    ] = await Promise.all([
      mesclarDadosOperacionaisReidratacaoSIGO_(
        pacoteDadosOperacionais,
        {
          simular: true
        }
      ),

      mesclarOcorrenciasReidratacaoSIGO_(
        pacoteOcorrencias,
        {
          simular: true
        }
      )
    ]);

    const simulacaoConsolidada =
      consolidarResultadosReidratacaoUX1967_(
        simulacaoDadosOperacionais,
        simulacaoOcorrencias
      );

    estado.pacote = {
      dadosOperacionais:
        pacoteDadosOperacionais,

      ocorrencias:
        pacoteOcorrencias
    };

    estado.simulacao =
      simulacaoConsolidada;

    estado.criadoEm =
      Date.now();

    renderizarSimulacaoUX1958_(
      simulacaoConsolidada
    );

    definirStatusReidratacaoUX1958_(
      "Pré-visualização concluída. Confirme para gravar no dispositivo.",
      "success"
    );

    document.getElementById(
      "confirmarReidratacaoUX1958"
    ).disabled = false;

  } catch (erro) {
    console.error(
      "[UX.19.6.7] Falha na pré-visualização:",
      erro
    );

    estado.pacote = null;
    estado.simulacao = null;
    estado.criadoEm = 0;

    definirStatusReidratacaoUX1958_(
      erro.message ||
      "Não foi possível preparar a reidratação.",
      "error"
    );

  } finally {
    estado.emAndamento = false;

    bloquearInterfaceReidratacaoUX1958_(
      false
    );

    const pacoteValido =
      Boolean(
        estado.pacote &&
        estado.pacote
          .dadosOperacionais &&
        estado.pacote.ocorrencias
      );

    document.getElementById(
      "confirmarReidratacaoUX1958"
    ).disabled =
      !pacoteValido;
  }
}


/**
 * Executa a gravação usando exatamente o pacote
 * que foi previamente simulado.
 */
async function confirmarReidratacaoInterfaceUX1958_() {
  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  const pacoteValido =
    Boolean(
      estado.pacote &&
      estado.pacote
        .dadosOperacionais &&
      estado.pacote.ocorrencias
    );

  if (
    estado.emAndamento ||
    !pacoteValido
  ) {
    return;
  }

  try {
    estado.emAndamento = true;

    bloquearInterfaceReidratacaoUX1958_(
      true
    );

    /*
     * A pré-visualização expira após cinco minutos.
     */
    if (
      Date.now() - estado.criadoEm >
      5 * 60 * 1000
    ) {
      throw new Error(
        "A pré-visualização expirou. Faça uma nova consulta."
      );
    }

    const obraAtual =
      await resolverObraAtivaUX1958_();

    if (
      obraAtual.idObra !==
      estado.idObra
    ) {
      throw new Error(
        "A obra ativa foi alterada. Faça uma nova pré-visualização."
      );
    }

    const periodoAtual =
      Number(
        document.getElementById(
          "periodoReidratacaoUX1958"
        ).value
      );

    if (
      periodoAtual !==
      estado.periodoDias
    ) {
      throw new Error(
        "O período foi alterado. Faça uma nova pré-visualização."
      );
    }

    definirStatusReidratacaoUX1958_(
      "Gravando Diários e itens com proteção de pendências...",
      "loading"
    );

    /*
     * A primeira mesclagem grava Diários e itens.
     */
    const resultadoDadosOperacionais =
      await mesclarDadosOperacionaisReidratacaoSIGO_(
        estado.pacote
          .dadosOperacionais,
        {
          simular: false
        }
      );

    definirStatusReidratacaoUX1958_(
      "Gravando ocorrências com proteção de pendências...",
      "loading"
    );

    /*
     * A segunda mesclagem grava ocorrências.
     *
     * Ambas são idempotentes. Caso haja uma interrupção,
     * uma nova pré-visualização poderá ser executada com
     * segurança.
     */
    const resultadoOcorrencias =
      await mesclarOcorrenciasReidratacaoSIGO_(
        estado.pacote.ocorrencias,
        {
          simular: false
        }
      );

    const resultado =
      consolidarResultadosReidratacaoUX1967_(
        resultadoDadosOperacionais,
        resultadoOcorrencias
      );

    const totalInseridos =
      numeroSeguroReidratacaoUX1967_(
        resultado.diarios.inseridos
      ) +
      numeroSeguroReidratacaoUX1967_(
        resultado.diarioItens.inseridos
      ) +
      numeroSeguroReidratacaoUX1967_(
        resultado.ocorrencias.inseridos
      );

    const totalAtualizados =
      numeroSeguroReidratacaoUX1967_(
        resultado.diarios.atualizados
      ) +
      numeroSeguroReidratacaoUX1967_(
        resultado.diarioItens.atualizados
      ) +
      numeroSeguroReidratacaoUX1967_(
        resultado.ocorrencias.atualizados
      );

    const totalRecebidos =
      numeroSeguroReidratacaoUX1967_(
        resultado.diarios.recebidos
      ) +
      numeroSeguroReidratacaoUX1967_(
        resultado.diarioItens.recebidos
      ) +
      numeroSeguroReidratacaoUX1967_(
        resultado.ocorrencias.recebidos
      );

    const meta = {
      idObra:
        estado.idObra,

      nomeObra:
        estado.nomeObra,

      periodoDias:
        estado.periodoDias,

      diarios:
        resultado.diarios.recebidos,

      diarioItens:
        resultado.diarioItens.recebidos,

      ocorrencias:
        resultado.ocorrencias.recebidos,

      registrosRecebidos:
        totalRecebidos,

      inseridos:
        totalInseridos,

      atualizados:
        totalAtualizados,

      preservados:
        totalPreservadosConsolidadosUX1967_(
          resultado
        ),

      conflitosEvitados:
        resultado.totalConflitosEvitados,

      dataAtualizacao:
        resultado.executadoEm ||
        new Date().toISOString()
    };

    salvarMetaReidratacaoUX1958_(
      estado.idObra,
      meta
    );

    renderizarResultadoReidratacaoUX1958_(
      resultado
    );

    definirStatusReidratacaoUX1958_(
      "Diários, itens e ocorrências atualizados com sucesso.",
      "success"
    );

    if (
      typeof criarNotificacaoSIGO_ ===
      "function"
    ) {
      try {
        await criarNotificacaoSIGO_({
          tipo:
            "REIDRATACAO",

          titulo:
            "Obra atualizada",

          mensagem:
            resultado.diarios.recebidos +
            " Diários, " +
            resultado.diarioItens.recebidos +
            " itens e " +
            resultado.ocorrencias.recebidos +
            " ocorrências recuperados.",

          icone:
            "🔄"
        });

      } catch (erroNotificacao) {
        console.warn(
          "[UX.19.6.7] Notificação não criada:",
          erroNotificacao
        );
      }
    }

    await atualizarCardReidratacaoUX1958_();

    /*
     * Atualizações visuais.
     *
     * As funções retornam sem erro quando a respectiva
     * tela não está aberta.
     */
    const funcoesAtualizacao = [
      "carregarListaDiariosOffline",
      "listarDiariosOffline_",
      "listarItensDiarioOffline_",
      "listarOcorrenciasOffline_",
      "atualizarIndicadoresMobile_",
      "atualizarHomeMobile_",
      "atualizarPainelSaudeSync_",
      "atualizarBadgeNotificacoes_"
    ];

    for (
      const nomeFuncao of funcoesAtualizacao
    ) {
      if (
        typeof window[nomeFuncao] ===
        "function"
      ) {
        try {
          await window[nomeFuncao]();

        } catch (erroAtualizacao) {
          console.warn(
            "[UX.19.6.7] Atualização visual ignorada:",
            nomeFuncao,
            erroAtualizacao
          );
        }
      }
    }

    estado.pacote = null;
    estado.simulacao = null;
    estado.criadoEm = 0;

  } catch (erro) {
    console.error(
      "[UX.19.6.7] Falha na confirmação:",
      erro
    );

    definirStatusReidratacaoUX1958_(
      erro.message ||
      "A reidratação não pôde ser concluída.",
      "error"
    );

  } finally {
    estado.emAndamento = false;

    bloquearInterfaceReidratacaoUX1958_(
      false
    );

    document.getElementById(
      "confirmarReidratacaoUX1958"
    ).disabled = true;
  }
}


/**
 * Atualiza a informação exibida no card da Home.
 */
async function atualizarCardReidratacaoUX1958_() {
  const metaElemento =
    document.getElementById(
      "metaReidratacaoUX1958"
    );

  if (!metaElemento) {
    return;
  }

  try {
    const obra =
      await resolverObraAtivaUX1958_();

    const meta =
      lerMetaReidratacaoUX1958_(
        obra.idObra
      );

    if (!meta) {
      metaElemento.textContent =
        "Histórico operacional ainda não atualizado neste dispositivo.";

      return;
    }

    metaElemento.textContent =
      "Última atualização: " +
      formatarDataHoraUX1958_(
        meta.dataAtualizacao
      ) +
      " · " +
      meta.periodoDias +
      " dias";

  } catch (erro) {
    metaElemento.textContent =
      "Selecione uma obra para atualizar o histórico.";
  }
}


/**
 * Instala o card na tela Home.
 */
async function instalarAcaoReidratacaoUX1958_() {
  const area =
    document.getElementById(
      "telaApp"
    );

  if (!area) {
    return;
  }

  let card =
    document.getElementById(
      "cardReidratacaoUX1958"
    );

  if (!card) {
    card =
      document.createElement(
        "section"
      );

    card.id =
      "cardReidratacaoUX1958";

    card.className =
      "sigo-reidratacao-card";

    card.innerHTML = `
      <div class="sigo-reidratacao-card__conteudo">
        <h3 class="sigo-reidratacao-card__titulo">
          Atualizar histórico da obra
        </h3>

        <p class="sigo-reidratacao-card__texto">
          Recupere Diários, itens e ocorrências sincronizados
          em outro dispositivo.
        </p>

        <span
          id="metaReidratacaoUX1958"
          class="sigo-reidratacao-card__meta"
        >
          Verificando última atualização...
        </span>
      </div>

      <button
        class="sigo-reidratacao-card__botao"
        type="button"
        onclick="abrirReidratacaoUX1958_()"
      >
        Atualizar dados
      </button>
    `;

    area.appendChild(card);
  }

  garantirModalReidratacaoUX1958_();

  await atualizarCardReidratacaoUX1958_();
}


/**
 * Auditoria estrutural da interface.
 */
async function auditarInterfaceReidratacaoUX1958_() {
  await instalarAcaoReidratacaoUX1958_();

  const obra =
    await resolverObraAtivaUX1958_();

  const select =
    document.getElementById(
      "periodoReidratacaoUX1958"
    );

  const periodos =
    Array.from(
      select.options
    ).map(function (option) {
      return Number(option.value);
    });

  const validacoes = {
    cardCriado:
      Boolean(
        document.getElementById(
          "cardReidratacaoUX1958"
        )
      ),

    modalCriado:
      Boolean(
        document.getElementById(
          "overlayReidratacaoUX1958"
        )
      ),

    obraAtivaIdentificada:
      Boolean(obra.idObra),

    possuiPeriodo15:
      periodos.includes(15),

    possuiPeriodo30:
      periodos.includes(30),

    possuiPeriodo60:
      periodos.includes(60),

    possuiPeriodo90:
      periodos.includes(90),

    botaoVisualizacaoExiste:
      Boolean(
        document.getElementById(
          "visualizarReidratacaoUX1958"
        )
      ),

    botaoConfirmacaoExiste:
      Boolean(
        document.getElementById(
          "confirmarReidratacaoUX1958"
        )
      )
  };

  const aprovado =
    Object.values(validacoes)
      .every(function (valor) {
        return valor === true;
      });

  const resultado = {
    etapa: "UX.19.5.8",
    auditoria:
      "INTERFACE_REIDRATACAO",
    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",
    idObra:
      obra.idObra,
    nomeObra:
      obra.nomeObra,
    periodos,
    validacoes,
    aprovado
  };

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.6.4 — CLIENTE MOBILE DA API DE OCORRÊNCIAS
 * ============================================================
 *
 * Responsabilidades:
 *
 * - chamar OBTER_OCORRENCIAS_OPERACIONAIS_OBRA;
 * - reconhecer o envelope "detalhes";
 * - validar contrato, obra, período e totais;
 * - devolver a lista de ocorrências;
 * - não gravar no IndexedDB;
 * - não alterar TB_OCORRENCIAS;
 * - não alterar TB_SYNC_QUEUE.
 */


/**
 * Normaliza a resposta recebida da API publicada.
 *
 * Envelope atual:
 *
 * {
 *   status: "OK",
 *   mensagem: "...",
 *   dataResposta: "...",
 *   detalhes: {
 *     versaoContrato: "1.0",
 *     idObra: "OBR002",
 *     periodoDias: 30,
 *     dataInicio: "2026-06-12",
 *     dataFim: "2026-07-11",
 *     dataSync: "...",
 *     totais: {
 *       ocorrencias: 14
 *     },
 *     ocorrencias: []
 *   }
 * }
 */
function normalizarRespostaOcorrenciasMobileUX1964_(
  respostaJson
) {
  if (
    !respostaJson ||
    typeof respostaJson !== "object"
  ) {
    throw new Error(
      "A API de ocorrências retornou uma resposta vazia ou inválida."
    );
  }

  const statusResposta = String(
    respostaJson.status || ""
  )
    .trim()
    .toUpperCase();

  if (statusResposta !== "OK") {
    throw new Error(
      respostaJson.mensagem ||
      respostaJson.erro ||
      "A API não aprovou a consulta de ocorrências."
    );
  }

  /*
   * Compatibilidade com:
   *
   * - respostaJson.detalhes;
   * - respostaJson.dados;
   * - contrato diretamente na raiz.
   */
  const detalhes =
    respostaJson.detalhes &&
    typeof respostaJson.detalhes === "object"
      ? respostaJson.detalhes
      : respostaJson.dados &&
        typeof respostaJson.dados === "object"
        ? respostaJson.dados
        : respostaJson;

  const ocorrencias =
    Array.isArray(detalhes.ocorrencias)
      ? detalhes.ocorrencias
      : [];

  const totaisRecebidos =
    detalhes.totais &&
    typeof detalhes.totais === "object"
      ? detalhes.totais
      : {};

  const totalOcorrencias = Number(
    totaisRecebidos.ocorrencias !== undefined
      ? totaisRecebidos.ocorrencias
      : ocorrencias.length
  );

  if (!Number.isFinite(totalOcorrencias)) {
    throw new Error(
      "O total de ocorrências informado pela API é inválido."
    );
  }

  if (
    totalOcorrencias !==
    ocorrencias.length
  ) {
    throw new Error(
      "O total de ocorrências informado pela API não corresponde " +
      "à quantidade de registros recebidos."
    );
  }

  return {
    status:
      statusResposta,

    mensagem:
      String(
        respostaJson.mensagem || ""
      ),

    dataResposta:
      String(
        respostaJson.dataResposta || ""
      ),

    versaoContrato:
      String(
        detalhes.versaoContrato || ""
      ),

    idObra:
      String(
        detalhes.idObra || ""
      ).trim(),

    periodoDias:
      Number(
        detalhes.periodoDias || 0
      ),

    dataInicio:
      String(
        detalhes.dataInicio || ""
      ),

    dataFim:
      String(
        detalhes.dataFim || ""
      ),

    dataSync:
      String(
        detalhes.dataSync || ""
      ),

    totais: {
      ocorrencias:
        totalOcorrencias
    },

    ocorrencias:
      ocorrencias
  };
}


/**
 * Consulta as ocorrências operacionais da obra.
 *
 * IMPORTANTE:
 *
 * Esta função somente consulta, valida e devolve os dados.
 * Ela não grava nada no IndexedDB.
 */
async function obterOcorrenciasOperacionaisObraMobile_(
  idObra,
  diasHistorico
) {
  const obraNormalizada =
    String(idObra || "").trim();

  const periodoNormalizado =
    Number(diasHistorico || 30);

  const periodosPermitidos =
    [15, 30, 60, 90];

  if (!obraNormalizada) {
    throw new Error(
      "Informe o ID da obra para consultar as ocorrências."
    );
  }

  if (
    !periodosPermitidos.includes(
      periodoNormalizado
    )
  ) {
    throw new Error(
      "Período inválido. Utilize 15, 30, 60 ou 90 dias."
    );
  }

  /*
   * Os auxiliares abaixo foram criados e aprovados
   * na UX.19.5.5.
   */
  if (
    typeof obterTokenReidratacaoMobileUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O auxiliar de token da UX.19.5.5 não foi encontrado."
    );
  }

  if (
    typeof obterIdDispositivoReidratacaoUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O auxiliar de dispositivo da UX.19.5.5 não foi encontrado."
    );
  }

  if (
    typeof obterIdUsuarioReidratacaoUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O auxiliar de usuário da UX.19.5.5 não foi encontrado."
    );
  }

  const urlApi =
    "https://script.google.com/macros/s/AKfycbzVE7tdTSwHvKgLkrdcaQtGAm_muqNPo6n0wQZBDpmRwtAJuySfWyh6gdef0R6g_drKRw/exec";

  const payload = {
    token:
      obterTokenReidratacaoMobileUX1955_(),

    acao:
      "OBTER_OCORRENCIAS_OPERACIONAIS_OBRA",

    idDispositivo:
      obterIdDispositivoReidratacaoUX1955_(),

    idUsuario:
      obterIdUsuarioReidratacaoUX1955_(),

    idObra:
      obraNormalizada,

    diasHistorico:
      periodoNormalizado
  };

  console.log(
    "[UX.19.6.4] Solicitando ocorrências operacionais:",
    {
      acao:
        payload.acao,

      idDispositivo:
        payload.idDispositivo,

      idUsuario:
        payload.idUsuario,

      idObra:
        payload.idObra,

      diasHistorico:
        payload.diasHistorico
    }
  );

  let respostaHttp;

  try {
    respostaHttp = await fetch(
      urlApi,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=UTF-8"
        },

        body:
          JSON.stringify(payload),

        redirect:
          "follow",

        cache:
          "no-store"
      }
    );

  } catch (erroRede) {
    throw new Error(
      "Não foi possível acessar a API de ocorrências. " +
      (
        erroRede &&
        erroRede.message
          ? erroRede.message
          : String(erroRede)
      )
    );
  }

  const codigoHttp =
    respostaHttp.status;

  const textoResposta =
    await respostaHttp.text();

  let respostaJson;

  try {
    respostaJson =
      JSON.parse(textoResposta);

  } catch (erroJson) {
    console.error(
      "[UX.19.6.4] Resposta não JSON:",
      textoResposta
    );

    throw new Error(
      "A API de ocorrências não retornou JSON válido. " +
      "HTTP: " +
      codigoHttp
    );
  }

  if (!respostaHttp.ok) {
    throw new Error(
      respostaJson.mensagem ||
      respostaJson.erro ||
      (
        "Falha HTTP ao consultar ocorrências: " +
        codigoHttp
      )
    );
  }

  const dadosNormalizados =
    normalizarRespostaOcorrenciasMobileUX1964_(
      respostaJson
    );

  if (
    dadosNormalizados.idObra !==
    obraNormalizada
  ) {
    throw new Error(
      "A API retornou ocorrências de outra obra. " +
      "Solicitada: " +
      obraNormalizada +
      ". Recebida: " +
      dadosNormalizados.idObra +
      "."
    );
  }

  if (
    dadosNormalizados.periodoDias !==
    periodoNormalizado
  ) {
    throw new Error(
      "A API retornou um período diferente do solicitado."
    );
  }

  return {
    codigoHttp:
      codigoHttp,

    ...dadosNormalizados
  };
}


/**
 * ============================================================
 * TESTE ISOLADO DO CLIENTE MOBILE
 * ============================================================
 *
 * Não grava em:
 *
 * - TB_OCORRENCIAS;
 * - TB_SYNC_QUEUE;
 * - qualquer outra store.
 */
async function testarClienteOcorrenciasMobileUX1964_() {
  console.log(
    "[UX.19.6.4] Iniciando teste do cliente Mobile de ocorrências..."
  );

  const resposta =
    await obterOcorrenciasOperacionaisObraMobile_(
      "OBR002",
      30
    );

  const idsVistos =
    new Set();

  const duplicados =
    [];

  const invalidos =
    [];

  const outraObra =
    [];

  const statusSyncIncorreto =
    [];

  const origemIncorreta =
    [];

  resposta.ocorrencias.forEach(
    function (ocorrencia) {
      const idOcorrencia =
        String(
          ocorrencia.idOcorrencia || ""
        ).trim();

      const idObra =
        String(
          ocorrencia.idObra || ""
        ).trim();

      const data =
        String(
          ocorrencia.data || ""
        ).trim();

      if (
        !idOcorrencia ||
        !idObra ||
        !data
      ) {
        invalidos.push({
          idOcorrencia:
            idOcorrencia || "SEM_ID",

          motivo:
            "CAMPO_OBRIGATORIO_AUSENTE"
        });
      }

      if (
        idsVistos.has(
          idOcorrencia
        )
      ) {
        duplicados.push(
          idOcorrencia
        );

      } else {
        idsVistos.add(
          idOcorrencia
        );
      }

      if (
        idObra !== "OBR002"
      ) {
        outraObra.push({
          idOcorrencia:
            idOcorrencia,

          idObra:
            idObra
        });
      }

      if (
        ocorrencia.statusSync !==
        "SINCRONIZADO"
      ) {
        statusSyncIncorreto.push(
          idOcorrencia
        );
      }

      if (
        ocorrencia.origemReidratacao !==
        "SERVIDOR"
      ) {
        origemIncorreta.push(
          idOcorrencia
        );
      }
    }
  );

  const validacoes = {
    codigoHttp200:
      resposta.codigoHttp === 200,

    statusOK:
      resposta.status === "OK",

    contratoVersao1:
      resposta.versaoContrato ===
      "1.0",

    obraCorreta:
      resposta.idObra ===
      "OBR002",

    periodoCorreto:
      resposta.periodoDias ===
      30,

    listaOcorrenciasValida:
      Array.isArray(
        resposta.ocorrencias
      ),

    retornou14Ocorrencias:
      resposta.ocorrencias.length ===
      14,

    totalCoerente:
      resposta.totais.ocorrencias ===
      resposta.ocorrencias.length,

    nenhumaDuplicidade:
      duplicados.length === 0,

    nenhumaOcorrenciaInvalida:
      invalidos.length === 0,

    nenhumaMisturaDeObras:
      outraObra.length === 0,

    todosStatusSyncCorretos:
      statusSyncIncorreto.length ===
      0,

    todasOrigensCorretas:
      origemIncorreta.length === 0
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(function (resultado) {
      return resultado === true;
    });

  const resultadoAuditoria = {
    etapa:
      "UX.19.6.4",

    teste:
      "CLIENTE_MOBILE_OCORRENCIAS",

    codigoHttp:
      resposta.codigoHttp,

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    respostaStatus:
      resposta.status,

    versaoContrato:
      resposta.versaoContrato,

    idObra:
      resposta.idObra,

    periodoDias:
      resposta.periodoDias,

    dataInicio:
      resposta.dataInicio,

    dataFim:
      resposta.dataFim,

    dataSync:
      resposta.dataSync,

    ocorrencias:
      resposta.totais.ocorrencias,

    problemas: {
      duplicados:
        duplicados,

      invalidos:
        invalidos,

      outraObra:
        outraObra,

      statusSyncIncorreto:
        statusSyncIncorreto,

      origemIncorreta:
        origemIncorreta
    },

    validacoes:
      validacoes,

    primeiraOcorrencia:
      resposta.ocorrencias.length
        ? resposta.ocorrencias[0]
        : null,

    aprovado:
      aprovado
  };

  console.log(
    JSON.stringify(
      resultadoAuditoria,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.6.4 REPROVADA. " +
      "Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.6.4 — CLIENTE MOBILE DE OCORRÊNCIAS APROVADO."
  );

  /*
   * O retorno completo permanece disponível para inspeção,
   * mas a lista inteira não é impressa no console.
   */
  return {
    auditoria:
      resultadoAuditoria,

    dados:
      resposta
  };
}

/**
 * ============================================================
 * UX.19.7.4 — CLIENTE MOBILE DA API DE CLIMA
 * ============================================================
 *
 * Responsabilidades:
 *
 * - chamar OBTER_CLIMAS_OPERACIONAIS_OBRA;
 * - reconhecer o envelope "detalhes";
 * - validar contrato, obra, período e totais;
 * - validar a estrutura dos registros;
 * - devolver a lista de Climas;
 * - não gravar no IndexedDB;
 * - não alterar TB_CLIMA;
 * - não alterar TB_SYNC_QUEUE.
 */


/**
 * Normaliza e valida a resposta da API publicada.
 */
function normalizarRespostaClimaMobileUX1974_(
  respostaJson
) {
  if (
    !respostaJson ||
    typeof respostaJson !== "object"
  ) {
    throw new Error(
      "A API de Clima retornou uma resposta vazia ou inválida."
    );
  }

  const statusResposta =
    String(
      respostaJson.status || ""
    )
      .trim()
      .toUpperCase();

  if (
    statusResposta !== "OK"
  ) {
    throw new Error(
      respostaJson.mensagem ||
      respostaJson.erro ||
      "A API não aprovou a consulta de Clima."
    );
  }

  /*
   * Compatibilidade com:
   *
   * - respostaJson.detalhes;
   * - respostaJson.dados;
   * - contrato diretamente na raiz.
   */
  const detalhes =
    respostaJson.detalhes &&
    typeof respostaJson.detalhes ===
      "object"
      ? respostaJson.detalhes
      : respostaJson.dados &&
        typeof respostaJson.dados ===
          "object"
        ? respostaJson.dados
        : respostaJson;

  const climas =
    Array.isArray(
      detalhes.climas
    )
      ? detalhes.climas
      : [];

  const totaisRecebidos =
    detalhes.totais &&
    typeof detalhes.totais ===
      "object"
      ? detalhes.totais
      : {};

  const totalClimas =
    Number(
      totaisRecebidos.climas !==
        undefined
        ? totaisRecebidos.climas
        : climas.length
    );

  if (
    !Number.isFinite(
      totalClimas
    )
  ) {
    throw new Error(
      "O total de registros de Clima informado pela API é inválido."
    );
  }

  if (
    totalClimas !==
    climas.length
  ) {
    throw new Error(
      "O total de registros de Clima informado pela API " +
      "não corresponde à quantidade recebida."
    );
  }

  return {
    status:
      statusResposta,

    mensagem:
      String(
        respostaJson.mensagem || ""
      ),

    dataResposta:
      String(
        respostaJson.dataResposta || ""
      ),

    versaoContrato:
      String(
        detalhes.versaoContrato || ""
      ),

    idObra:
      String(
        detalhes.idObra || ""
      ).trim(),

    periodoDias:
      Number(
        detalhes.periodoDias || 0
      ),

    dataInicio:
      String(
        detalhes.dataInicio || ""
      ).trim(),

    dataFim:
      String(
        detalhes.dataFim || ""
      ).trim(),

    dataSync:
      String(
        detalhes.dataSync || ""
      ).trim(),

    totais: {
      climas:
        totalClimas
    },

    climas:
      climas
  };
}


/**
 * Verifica se uma data utiliza o contrato yyyy-MM-dd.
 */
function validarDataContratoClimaUX1974_(
  valor
) {
  const texto =
    String(valor || "").trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )
  ) {
    return false;
  }

  const partes =
    texto.split("-");

  const data =
    new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2])
    );

  if (
    isNaN(data.getTime())
  ) {
    return false;
  }

  return (
    data.getFullYear() ===
      Number(partes[0]) &&
    data.getMonth() ===
      Number(partes[1]) - 1 &&
    data.getDate() ===
      Number(partes[2])
  );
}


/**
 * Consulta os registros operacionais de Clima da obra.
 *
 * IMPORTANTE:
 *
 * Esta função somente consulta, valida e devolve os dados.
 * Ela não grava nada no IndexedDB.
 */
async function obterClimasOperacionaisObraMobile_(
  idObra,
  diasHistorico
) {
  const obraNormalizada =
    String(
      idObra || ""
    ).trim();

  const periodoNormalizado =
    Number(
      diasHistorico || 30
    );

  const periodosPermitidos =
    [15, 30, 60, 90];

  if (!obraNormalizada) {
    throw new Error(
      "Informe o ID da obra para consultar os registros de Clima."
    );
  }

  if (
    !periodosPermitidos.includes(
      periodoNormalizado
    )
  ) {
    throw new Error(
      "Período inválido. Utilize 15, 30, 60 ou 90 dias."
    );
  }

  /*
   * Auxiliares aprovados na UX.19.5.5.
   */
  if (
    typeof obterTokenReidratacaoMobileUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O auxiliar de token da UX.19.5.5 não foi encontrado."
    );
  }

  if (
    typeof obterIdDispositivoReidratacaoUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O auxiliar de dispositivo da UX.19.5.5 não foi encontrado."
    );
  }

  if (
    typeof obterIdUsuarioReidratacaoUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O auxiliar de usuário da UX.19.5.5 não foi encontrado."
    );
  }

  const urlApi =
    "https://script.google.com/macros/s/AKfycbzVE7tdTSwHvKgLkrdcaQtGAm_muqNPo6n0wQZBDpmRwtAJuySfWyh6gdef0R6g_drKRw/exec";

  const payload = {
    token:
      obterTokenReidratacaoMobileUX1955_(),

    acao:
      "OBTER_CLIMAS_OPERACIONAIS_OBRA",

    idDispositivo:
      obterIdDispositivoReidratacaoUX1955_(),

    idUsuario:
      obterIdUsuarioReidratacaoUX1955_(),

    idObra:
      obraNormalizada,

    diasHistorico:
      periodoNormalizado
  };

  console.log(
    "[UX.19.7.4] Solicitando registros operacionais de Clima:",
    {
      acao:
        payload.acao,

      idDispositivo:
        payload.idDispositivo,

      idUsuario:
        payload.idUsuario,

      idObra:
        payload.idObra,

      diasHistorico:
        payload.diasHistorico
    }
  );

  let respostaHttp;

  try {
    respostaHttp =
      await fetch(
        urlApi,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=UTF-8"
          },

          body:
            JSON.stringify(
              payload
            ),

          redirect:
            "follow",

          cache:
            "no-store"
        }
      );

  } catch (erroRede) {
    throw new Error(
      "Não foi possível acessar a API de Clima. " +
      (
        erroRede &&
        erroRede.message
          ? erroRede.message
          : String(erroRede)
      )
    );
  }

  const codigoHttp =
    respostaHttp.status;

  const textoResposta =
    await respostaHttp.text();

  let respostaJson;

  try {
    respostaJson =
      JSON.parse(
        textoResposta
      );

  } catch (erroJson) {
    console.error(
      "[UX.19.7.4] Resposta não JSON:",
      textoResposta
    );

    throw new Error(
      "A API de Clima não retornou JSON válido. " +
      "HTTP: " +
      codigoHttp
    );
  }

  if (
    !respostaHttp.ok
  ) {
    throw new Error(
      respostaJson.mensagem ||
      respostaJson.erro ||
      (
        "Falha HTTP ao consultar Clima: " +
        codigoHttp
      )
    );
  }

  const dadosNormalizados =
    normalizarRespostaClimaMobileUX1974_(
      respostaJson
    );

  if (
    dadosNormalizados.idObra !==
    obraNormalizada
  ) {
    throw new Error(
      "A API retornou registros de Clima de outra obra. " +
      "Solicitada: " +
      obraNormalizada +
      ". Recebida: " +
      dadosNormalizados.idObra +
      "."
    );
  }

  if (
    dadosNormalizados.periodoDias !==
    periodoNormalizado
  ) {
    throw new Error(
      "A API retornou um período diferente do solicitado."
    );
  }

  if (
    dadosNormalizados.versaoContrato !==
    "1.0"
  ) {
    throw new Error(
      "Versão do contrato de Clima não suportada: " +
      dadosNormalizados.versaoContrato
    );
  }

  if (
    !validarDataContratoClimaUX1974_(
      dadosNormalizados.dataInicio
    ) ||
    !validarDataContratoClimaUX1974_(
      dadosNormalizados.dataFim
    )
  ) {
    throw new Error(
      "A API retornou um intervalo de datas inválido."
    );
  }

  return {
    codigoHttp:
      codigoHttp,

    ...dadosNormalizados
  };
}


/**
 * ============================================================
 * TESTE ISOLADO DO CLIENTE MOBILE DE CLIMA
 * ============================================================
 *
 * Não grava em:
 *
 * - TB_CLIMA;
 * - TB_SYNC_QUEUE;
 * - qualquer outra store.
 */
async function testarClienteClimaMobileUX1974_() {
  console.log(
    "[UX.19.7.4] Iniciando teste do cliente Mobile de Clima..."
  );

  const resposta =
    await obterClimasOperacionaisObraMobile_(
      "OBR002",
      30
    );

  const camposContrato = [
    "idClima",
    "data",
    "idObra",
    "periodo",
    "condicaoClimatica",
    "intensidade",
    "impactoExecucao",
    "atividadeAfetada",
    "observacao",
    "statusClima",
    "statusSync",
    "dataSync",
    "origemReidratacao"
  ];

  const idsVistos =
    new Set();

  const duplicados =
    [];

  const invalidos =
    [];

  const camposAusentes =
    [];

  const outraObra =
    [];

  const foraPeriodo =
    [];

  const statusSyncIncorreto =
    [];

  const origemIncorreta =
    [];

  const dataSyncAusente =
    [];

  resposta.climas.forEach(
    function (clima) {
      const idClima =
        String(
          clima.idClima || ""
        ).trim();

      const idObra =
        String(
          clima.idObra || ""
        ).trim();

      const data =
        String(
          clima.data || ""
        ).trim();


      /*
       * Campos essenciais.
       */
      if (
        !idClima ||
        !idObra ||
        !data ||
        !validarDataContratoClimaUX1974_(
          data
        )
      ) {
        invalidos.push({
          idClima:
            idClima || "SEM_ID",

          motivo:
            "CAMPO_ESSENCIAL_OU_DATA_INVALIDA"
        });
      }


      /*
       * Todos os campos devem existir.
       *
       * Alguns podem estar vazios, de acordo com a fonte.
       */
      const ausentes =
        camposContrato.filter(
          function (campo) {
            return !Object.prototype
              .hasOwnProperty.call(
                clima,
                campo
              );
          }
        );

      if (
        ausentes.length
      ) {
        camposAusentes.push({
          idClima:
            idClima || "SEM_ID",

          campos:
            ausentes
        });
      }


      /*
       * Duplicidade.
       */
      if (
        idsVistos.has(
          idClima
        )
      ) {
        duplicados.push(
          idClima
        );

      } else {
        idsVistos.add(
          idClima
        );
      }


      /*
       * Obra.
       */
      if (
        idObra !== "OBR002"
      ) {
        outraObra.push({
          idClima:
            idClima,

          idObra:
            idObra
        });
      }


      /*
       * Intervalo.
       *
       * Datas ISO yyyy-MM-dd podem ser comparadas
       * lexicalmente com segurança.
       */
      if (
        data <
          resposta.dataInicio ||
        data >
          resposta.dataFim
      ) {
        foraPeriodo.push({
          idClima:
            idClima,

          data:
            data
        });
      }


      /*
       * Metadados de reidratação.
       */
      if (
        clima.statusSync !==
        "SINCRONIZADO"
      ) {
        statusSyncIncorreto.push(
          idClima
        );
      }

      if (
        clima.origemReidratacao !==
        "SERVIDOR"
      ) {
        origemIncorreta.push(
          idClima
        );
      }

      if (
        !String(
          clima.dataSync || ""
        ).trim()
      ) {
        dataSyncAusente.push(
          idClima
        );
      }
    }
  );

  const validacoes = {
    codigoHttp200:
      resposta.codigoHttp === 200,

    statusOK:
      resposta.status ===
      "OK",

    contratoVersao1:
      resposta.versaoContrato ===
      "1.0",

    obraCorreta:
      resposta.idObra ===
      "OBR002",

    periodoCorreto:
      resposta.periodoDias ===
      30,

    intervaloValido:
      validarDataContratoClimaUX1974_(
        resposta.dataInicio
      ) &&
      validarDataContratoClimaUX1974_(
        resposta.dataFim
      ),

    listaClimasValida:
      Array.isArray(
        resposta.climas
      ),

    retornou8Registros:
      resposta.climas.length ===
      8,

    totalCoerente:
      resposta.totais.climas ===
      resposta.climas.length,

    nenhumaDuplicidade:
      duplicados.length === 0,

    nenhumRegistroInvalido:
      invalidos.length === 0,

    nenhumCampoDoContratoAusente:
      camposAusentes.length === 0,

    nenhumaMisturaDeObras:
      outraObra.length === 0,

    nenhumRegistroForaPeriodo:
      foraPeriodo.length === 0,

    todosStatusSyncCorretos:
      statusSyncIncorreto.length ===
      0,

    todasOrigensCorretas:
      origemIncorreta.length ===
      0,

    todosPossuemDataSync:
      dataSyncAusente.length ===
      0
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(
      function (resultado) {
        return resultado === true;
      }
    );

  const resultadoAuditoria = {
    etapa:
      "UX.19.7.4",

    teste:
      "CLIENTE_MOBILE_CLIMA",

    codigoHttp:
      resposta.codigoHttp,

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    respostaStatus:
      resposta.status,

    versaoContrato:
      resposta.versaoContrato,

    idObra:
      resposta.idObra,

    periodoDias:
      resposta.periodoDias,

    dataInicio:
      resposta.dataInicio,

    dataFim:
      resposta.dataFim,

    dataSync:
      resposta.dataSync,

    climas:
      resposta.totais.climas,

    problemas: {
      duplicados:
        duplicados,

      invalidos:
        invalidos,

      camposAusentes:
        camposAusentes,

      outraObra:
        outraObra,

      foraPeriodo:
        foraPeriodo,

      statusSyncIncorreto:
        statusSyncIncorreto,

      origemIncorreta:
        origemIncorreta,

      dataSyncAusente:
        dataSyncAusente
    },

    validacoes:
      validacoes,

    primeiroRegistro:
      resposta.climas.length
        ? resposta.climas[0]
        : null,

    aprovado:
      aprovado
  };

  console.log(
    JSON.stringify(
      resultadoAuditoria,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.7.4 REPROVADA. " +
      "Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.7.4 — CLIENTE MOBILE DE CLIMA APROVADO."
  );

  return {
    auditoria:
      resultadoAuditoria,

    dados:
      resposta
  };
}

/**
 * ============================================================
 * UX.19.7.5 — MESCLAGEM PROTEGIDA DE CLIMA
 * ============================================================
 *
 * Stores envolvidas:
 *
 * - TB_CLIMA
 * - TB_SYNC_QUEUE
 *
 * Regras:
 *
 * 1. Registro inexistente:
 *    inserir como SINCRONIZADO.
 *
 * 2. Registro existente sem pendência:
 *    atualizar com a versão do servidor.
 *
 * 3. UPSERT pendente:
 *    preservar versão local.
 *
 * 4. DELETE pendente:
 *    não restaurar o registro.
 *
 * 5. Pendência desconhecida:
 *    preservar versão local por segurança.
 *
 * 6. Registro local marcado como PENDENTE/ERRO:
 *    preservar mesmo que a fila esteja inconsistente.
 *
 * 7. Outra obra:
 *    rejeitar.
 *
 * 8. TB_SYNC_QUEUE:
 *    não inserir, atualizar, excluir ou limpar.
 */


/**
 * Normaliza um valor para texto.
 */
function normalizarTextoClimaUX1975_(
  valor
) {
  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  ).trim();
}


/**
 * Normaliza texto para comparação.
 */
function normalizarMaiusculoClimaUX1975_(
  valor
) {
  return normalizarTextoClimaUX1975_(
    valor
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toUpperCase();
}


/**
 * Converte JSON armazenado como texto.
 */
function converterObjetoFilaClimaUX1975_(
  valor
) {
  if (
    valor &&
    typeof valor === "object"
  ) {
    return valor;
  }

  if (
    typeof valor !== "string"
  ) {
    return null;
  }

  const texto =
    valor.trim();

  if (!texto) {
    return null;
  }

  try {
    const objeto =
      JSON.parse(texto);

    return (
      objeto &&
      typeof objeto === "object"
        ? objeto
        : null
    );

  } catch (erro) {
    return null;
  }
}


/**
 * Obtém o payload funcional de uma pendência.
 */
function obterPayloadFilaClimaUX1975_(
  registroFila
) {
  if (
    !registroFila ||
    typeof registroFila !== "object"
  ) {
    return {};
  }

  const candidatos = [
    registroFila.payload,
    registroFila.registro,
    registroFila.dados,
    registroFila.dadosRegistro,
    registroFila.payloadExclusao,
    registroFila.exclusao
  ];

  for (
    const candidato of candidatos
  ) {
    const objeto =
      converterObjetoFilaClimaUX1975_(
        candidato
      );

    if (objeto) {
      return objeto;
    }
  }

  return {};
}


/**
 * Localiza o ID do Clima dentro de diferentes
 * formatos históricos da fila.
 */
function obterIdClimaFilaUX1975_(
  registroFila
) {
  if (
    !registroFila ||
    typeof registroFila !== "object"
  ) {
    return "";
  }

  const payload =
    obterPayloadFilaClimaUX1975_(
      registroFila
    );

  const payloadInterno =
    converterObjetoFilaClimaUX1975_(
      payload.registro ||
      payload.dados ||
      payload.payload
    ) || {};

  return normalizarTextoClimaUX1975_(
    registroFila.idRegistro ||
    registroFila.chave ||
    registroFila.registroId ||
    registroFila.idClima ||
    payload.idClima ||
    payload.idRegistro ||
    payload.chave ||
    payloadInterno.idClima ||
    payloadInterno.idRegistro ||
    ""
  );
}


/**
 * Identifica se a pendência pertence a TB_CLIMA.
 */
function filaPertenceClimaUX1975_(
  registroFila
) {
  if (
    !registroFila ||
    typeof registroFila !== "object"
  ) {
    return false;
  }

  const store =
    normalizarMaiusculoClimaUX1975_(
      registroFila.storeOrigem ||
      registroFila.store
    );

  if (
    store === "TB_CLIMA"
  ) {
    return true;
  }

  const entidade =
    normalizarMaiusculoClimaUX1975_(
      registroFila.entidade
    );

  if (
    [
      "CLIMA",
      "CLIMA_OBRA",
      "TB_CLIMA"
    ].includes(entidade)
  ) {
    return true;
  }

  const tipo =
    normalizarMaiusculoClimaUX1975_(
      registroFila.tipo
    );

  if (
    [
      "CLIMA",
      "CLIMA_OBRA",
      "TB_CLIMA"
    ].includes(tipo)
  ) {
    return true;
  }

  const payload =
    obterPayloadFilaClimaUX1975_(
      registroFila
    );

  return Boolean(
    normalizarTextoClimaUX1975_(
      payload.idClima
    )
  );
}


/**
 * Verifica se a entrada da fila ainda está pendente.
 */
function filaClimaEstaPendenteUX1975_(
  registroFila
) {
  const status =
    normalizarMaiusculoClimaUX1975_(
      registroFila?.statusSync ||
      registroFila?.status
    );

  return (
    status === "PENDENTE" ||
    status === "ERRO" ||
    status === "FALHA"
  );
}


/**
 * Determina a operação da fila.
 */
function obterOperacaoFilaClimaUX1975_(
  registroFila
) {
  const operacaoDireta =
    normalizarMaiusculoClimaUX1975_(
      registroFila?.operacao ||
      registroFila?.acao
    );

  if (
    operacaoDireta === "DELETE"
  ) {
    return "DELETE";
  }

  if (
    [
      "INSERT",
      "UPDATE",
      "UPSERT",
      "CREATE",
      "SAVE"
    ].includes(operacaoDireta)
  ) {
    return "UPSERT";
  }

  const tipo =
    normalizarMaiusculoClimaUX1975_(
      registroFila?.tipo
    );

  if (
    tipo === "DELETE"
  ) {
    return "DELETE";
  }

  if (
    [
      "INSERT",
      "UPDATE",
      "UPSERT",
      "CREATE",
      "SAVE",
      "CLIMA",
      "CLIMA_OBRA"
    ].includes(tipo)
  ) {
    return "UPSERT";
  }

  const payload =
    obterPayloadFilaClimaUX1975_(
      registroFila
    );

  const operacaoPayload =
    normalizarMaiusculoClimaUX1975_(
      payload.operacao ||
      payload.acao ||
      payload.tipo
    );

  if (
    operacaoPayload === "DELETE"
  ) {
    return "DELETE";
  }

  if (
    [
      "INSERT",
      "UPDATE",
      "UPSERT",
      "CREATE",
      "SAVE"
    ].includes(operacaoPayload)
  ) {
    return "UPSERT";
  }

  return "DESCONHECIDA";
}


/**
 * Cria um mapa de pendências por idClima.
 */
function criarMapaPendenciasClimaUX1975_(
  fila
) {
  const mapa =
    new Map();

  const registrosFila =
    Array.isArray(fila)
      ? fila
      : [];

  registrosFila.forEach(
    function (registroFila) {
      if (
        !filaClimaEstaPendenteUX1975_(
          registroFila
        )
      ) {
        return;
      }

      if (
        !filaPertenceClimaUX1975_(
          registroFila
        )
      ) {
        return;
      }

      const idClima =
        obterIdClimaFilaUX1975_(
          registroFila
        );

      if (!idClima) {
        return;
      }

      const operacao =
        obterOperacaoFilaClimaUX1975_(
          registroFila
        );

      const idObraFila =
        normalizarTextoClimaUX1975_(
          registroFila.idObra ||
          obterPayloadFilaClimaUX1975_(
            registroFila
          ).idObra
        );

      if (
        !mapa.has(idClima)
      ) {
        mapa.set(
          idClima,
          {
            possuiDelete:
              false,

            possuiUpsert:
              false,

            possuiDesconhecida:
              false,

            obras:
              new Set(),

            registros:
              []
          }
        );
      }

      const estado =
        mapa.get(idClima);

      if (
        operacao === "DELETE"
      ) {
        estado.possuiDelete =
          true;

      } else if (
        operacao === "UPSERT"
      ) {
        estado.possuiUpsert =
          true;

      } else {
        estado.possuiDesconhecida =
          true;
      }

      if (idObraFila) {
        estado.obras.add(
          idObraFila
        );
      }

      estado.registros.push(
        registroFila
      );
    }
  );

  return mapa;
}


/**
 * Normaliza um registro recebido do servidor
 * para a estrutura local de TB_CLIMA.
 */
function normalizarRegistroServidorClimaUX1975_(
  registroServidor,
  registroLocal,
  pacote,
  agoraIso
) {
  const servidor =
    registroServidor &&
    typeof registroServidor === "object"
      ? registroServidor
      : {};

  const local =
    registroLocal &&
    typeof registroLocal === "object"
      ? registroLocal
      : {};

  const dataSync =
    normalizarTextoClimaUX1975_(
      servidor.dataSync ||
      pacote.dataSync ||
      agoraIso
    );

  /*
   * O spread do registro local preserva metadados
   * adicionais que possam existir no dispositivo.
   *
   * Os campos funcionais do servidor vêm depois
   * e substituem a versão sincronizada anterior.
   */
  return {
    ...local,

    idClima:
      normalizarTextoClimaUX1975_(
        servidor.idClima
      ),

    data:
      normalizarTextoClimaUX1975_(
        servidor.data
      ),

    idObra:
      normalizarTextoClimaUX1975_(
        servidor.idObra
      ),

    periodo:
      normalizarTextoClimaUX1975_(
        servidor.periodo
      ),

    condicaoClimatica:
      normalizarTextoClimaUX1975_(
        servidor.condicaoClimatica
      ),

    intensidade:
      normalizarTextoClimaUX1975_(
        servidor.intensidade
      ),

    impactoExecucao:
      normalizarTextoClimaUX1975_(
        servidor.impactoExecucao
      ),

    atividadeAfetada:
      normalizarTextoClimaUX1975_(
        servidor.atividadeAfetada
      ),

    observacao:
      normalizarTextoClimaUX1975_(
        servidor.observacao
      ),

    statusClima:
      normalizarTextoClimaUX1975_(
        servidor.statusClima
      ),

    statusSync:
      "SINCRONIZADO",

    dataSync:
      dataSync,

    origemReidratacao:
      "SERVIDOR",

    origem:
      "SERVIDOR",

    criadoEm:
      normalizarTextoClimaUX1975_(
        local.criadoEm ||
        servidor.criadoEm ||
        dataSync ||
        agoraIso
      ),

    atualizadoEm:
      normalizarTextoClimaUX1975_(
        servidor.atualizadoEm ||
        dataSync ||
        agoraIso
      )
  };
}


/**
 * Ordena recursivamente as propriedades de um objeto.
 *
 * Utilizado para criar assinaturas confiáveis.
 */
function ordenarObjetoEstavelClimaUX1975_(
  valor
) {
  if (
    Array.isArray(valor)
  ) {
    return valor.map(
      ordenarObjetoEstavelClimaUX1975_
    );
  }

  if (
    valor &&
    typeof valor === "object"
  ) {
    const resultado = {};

    Object
      .keys(valor)
      .sort()
      .forEach(
        function (chave) {
          resultado[chave] =
            ordenarObjetoEstavelClimaUX1975_(
              valor[chave]
            );
        }
      );

    return resultado;
  }

  return valor;
}


/**
 * Cria assinatura de uma coleção sem depender
 * da ordem retornada pelo IndexedDB.
 */
function criarAssinaturaColecaoClimaUX1975_(
  registros,
  campoOrdenacao
) {
  const lista =
    Array.isArray(registros)
      ? registros
      : [];

  const campo =
    campoOrdenacao ||
    "idClima";

  return JSON.stringify(
    lista
      .map(
        function (registro) {
          return ordenarObjetoEstavelClimaUX1975_(
            registro
          );
        }
      )
      .sort(
        function (a, b) {
          return normalizarTextoClimaUX1975_(
            a?.[campo]
          ).localeCompare(
            normalizarTextoClimaUX1975_(
              b?.[campo]
            )
          );
        }
      )
  );
}


/**
 * Cria os contadores da mesclagem.
 */
function criarResumoClimaUX1975_(
  recebidos
) {
  return {
    recebidos:
      Number(recebidos || 0),

    inseridos:
      0,

    atualizados:
      0,

    preservadosUpsert:
      0,

    preservadosDelete:
      0,

    preservadosStatusLocal:
      0,

    preservadosFilaDesconhecida:
      0,

    rejeitadosOutraObra:
      0,

    rejeitadosDuplicidade:
      0,

    rejeitadosInvalidos:
      0,

    preservados:
      0,

    rejeitados:
      0,

    gravacoesPrevistas:
      0,

    gravacoesExecutadas:
      0
  };
}


/**
 * Registra conflito evitado sem deixar o log ilimitado.
 */
function adicionarConflitoClimaUX1975_(
  resultado,
  conflito
) {
  resultado.totalConflitosEvitados++;

  if (
    resultado.conflitos.length < 100
  ) {
    resultado.conflitos.push(
      conflito
    );
  }
}


/**
 * Executa leitura e eventual escrita na mesma transação.
 *
 * TB_SYNC_QUEUE participa apenas para leitura.
 *
 * Não existe:
 *
 * - put na fila;
 * - delete na fila;
 * - clear na fila.
 */
function executarTransacaoClimaUX1975_(
  db,
  pacote,
  opcoes
) {
  const simular =
    opcoes.simular !== false;

  return new Promise(
    function (
      resolve,
      reject
    ) {
      let finalizado =
        false;

      let resultadoTransacao =
        null;

      let climasLocais =
        null;

      let fila =
        null;

      let processado =
        false;

      const modo =
        simular
          ? "readonly"
          : "readwrite";

      let transacao;

      try {
        transacao =
          db.transaction(
            [
              "TB_CLIMA",
              "TB_SYNC_QUEUE"
            ],
            modo
          );

      } catch (erro) {
        reject(erro);
        return;
      }

      const storeClima =
        transacao.objectStore(
          "TB_CLIMA"
        );

      const storeFila =
        transacao.objectStore(
          "TB_SYNC_QUEUE"
        );

      const requisicaoClimas =
        storeClima.getAll();

      const requisicaoFila =
        storeFila.getAll();


      function rejeitarUmaVez(
        erro
      ) {
        if (finalizado) {
          return;
        }

        finalizado =
          true;

        reject(
          erro instanceof Error
            ? erro
            : new Error(
                String(erro)
              )
        );
      }


      function processarMesclagem() {
        if (
          processado ||
          climasLocais === null ||
          fila === null
        ) {
          return;
        }

        processado =
          true;

        try {
          const idObra =
            normalizarTextoClimaUX1975_(
              pacote.idObra
            );

          const climasServidor =
            Array.isArray(
              pacote.climas
            )
              ? pacote.climas
              : [];

          const agoraIso =
            new Date().toISOString();

          const resumo =
            criarResumoClimaUX1975_(
              climasServidor.length
            );

          const resultado = {
            etapa:
              "UX.19.7.5",

            operacao:
              "MESCLAGEM_PROTEGIDA_CLIMA",

            modo:
              simular
                ? "SIMULACAO"
                : "REAL",

            idObra:
              idObra,

            periodoDias:
              Number(
                pacote.periodoDias || 0
              ),

            dataInicio:
              normalizarTextoClimaUX1975_(
                pacote.dataInicio
              ),

            dataFim:
              normalizarTextoClimaUX1975_(
                pacote.dataFim
              ),

            dataSyncServidor:
              normalizarTextoClimaUX1975_(
                pacote.dataSync
              ),

            climas:
              resumo,

            totalConflitosEvitados:
              0,

            conflitos:
              [],

            fila: {
              totalAntes:
                fila.length,

              assinaturaAntes:
                criarAssinaturaColecaoClimaUX1975_(
                  fila,
                  "idSyncLocal"
                ),

              totalDepois:
                null,

              assinaturaDepois:
                "",

              preservada:
                null
            },

            executadoEm:
              agoraIso
          };

          const locaisPorId =
            new Map();

          climasLocais.forEach(
            function (registroLocal) {
              const idLocal =
                normalizarTextoClimaUX1975_(
                  registroLocal?.idClima
                );

              if (idLocal) {
                locaisPorId.set(
                  idLocal,
                  registroLocal
                );
              }
            }
          );

          const pendenciasPorId =
            criarMapaPendenciasClimaUX1975_(
              fila
            );

          const idsPacote =
            new Set();

          const gravacoes =
            [];


          climasServidor.forEach(
            function (registroServidor) {
              const idClima =
                normalizarTextoClimaUX1975_(
                  registroServidor?.idClima
                );

              const idObraRegistro =
                normalizarTextoClimaUX1975_(
                  registroServidor?.idObra
                );

              const dataRegistro =
                normalizarTextoClimaUX1975_(
                  registroServidor?.data
                );


              /*
               * Registro estruturalmente inválido.
               */
              if (
                !idClima ||
                !idObraRegistro ||
                !dataRegistro
              ) {
                resumo.rejeitadosInvalidos++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima ||
                      "SEM_ID",

                    motivo:
                      "REGISTRO_SERVIDOR_INVALIDO"
                  }
                );

                return;
              }


              /*
               * Mistura de obras no pacote.
               */
              if (
                idObraRegistro !==
                idObra
              ) {
                resumo.rejeitadosOutraObra++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "REGISTRO_SERVIDOR_OUTRA_OBRA",

                    idObraRegistro:
                      idObraRegistro,

                    idObraEsperada:
                      idObra
                  }
                );

                return;
              }


              /*
               * ID duplicado no pacote.
               */
              if (
                idsPacote.has(
                  idClima
                )
              ) {
                resumo.rejeitadosDuplicidade++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "ID_DUPLICADO_NO_PACOTE"
                  }
                );

                return;
              }

              idsPacote.add(
                idClima
              );


              const registroLocal =
                locaisPorId.get(
                  idClima
                ) || null;

              const pendencia =
                pendenciasPorId.get(
                  idClima
                ) || null;


              /*
               * ID local pertencente a outra obra.
               */
              if (
                registroLocal &&
                normalizarTextoClimaUX1975_(
                  registroLocal.idObra
                ) &&
                normalizarTextoClimaUX1975_(
                  registroLocal.idObra
                ) !== idObra
              ) {
                resumo.rejeitadosOutraObra++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "ID_LOCAL_PERTENCE_OUTRA_OBRA",

                    idObraLocal:
                      registroLocal.idObra,

                    idObraEsperada:
                      idObra
                  }
                );

                return;
              }


              /*
               * A própria fila associou o mesmo ID
               * a outra obra.
               */
              if (
                pendencia &&
                Array
                  .from(
                    pendencia.obras
                  )
                  .some(
                    function (obraFila) {
                      return (
                        obraFila &&
                        obraFila !== idObra
                      );
                    }
                  )
              ) {
                resumo.rejeitadosOutraObra++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "PENDENCIA_ASSOCIADA_OUTRA_OBRA",

                    obrasFila:
                      Array.from(
                        pendencia.obras
                      )
                  }
                );

                return;
              }


              /*
               * DELETE pendente possui prioridade.
               *
               * Mesmo que o registro não exista localmente,
               * ele não pode ser ressuscitado.
               */
              if (
                pendencia?.possuiDelete
              ) {
                resumo.preservadosDelete++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "DELETE_PENDENTE_NAO_RESTAURAR"
                  }
                );

                return;
              }


              /*
               * UPSERT pendente.
               */
              if (
                pendencia?.possuiUpsert
              ) {
                resumo.preservadosUpsert++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "UPSERT_PENDENTE_PRESERVAR_LOCAL"
                  }
                );

                return;
              }


              /*
               * Qualquer pendência não reconhecida
               * também bloqueia a sobrescrita.
               */
              if (
                pendencia?.possuiDesconhecida
              ) {
                resumo.preservadosFilaDesconhecida++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "PENDENCIA_DESCONHECIDA_PRESERVAR_LOCAL"
                  }
                );

                return;
              }


              /*
               * Proteção contra inconsistência:
               *
               * local está pendente, mas a entrada correspondente
               * não foi identificada na fila.
               */
              const statusLocal =
                normalizarMaiusculoClimaUX1975_(
                  registroLocal?.statusSync
                );

              if (
                registroLocal &&
                [
                  "PENDENTE",
                  "ERRO",
                  "FALHA"
                ].includes(
                  statusLocal
                )
              ) {
                resumo.preservadosStatusLocal++;

                adicionarConflitoClimaUX1975_(
                  resultado,
                  {
                    idClima:
                      idClima,

                    motivo:
                      "STATUS_LOCAL_NAO_SINCRONIZADO",

                    statusLocal:
                      statusLocal
                  }
                );

                return;
              }


              const registroNormalizado =
                normalizarRegistroServidorClimaUX1975_(
                  registroServidor,
                  registroLocal,
                  pacote,
                  agoraIso
                );


              if (registroLocal) {
                resumo.atualizados++;

              } else {
                resumo.inseridos++;
              }

              gravacoes.push(
                registroNormalizado
              );
            }
          );


          resumo.preservados =
            resumo.preservadosUpsert +
            resumo.preservadosDelete +
            resumo.preservadosStatusLocal +
            resumo.preservadosFilaDesconhecida;

          resumo.rejeitados =
            resumo.rejeitadosOutraObra +
            resumo.rejeitadosDuplicidade +
            resumo.rejeitadosInvalidos;

          resumo.gravacoesPrevistas =
            resumo.inseridos +
            resumo.atualizados;

          resumo.gravacoesExecutadas =
            simular
              ? 0
              : gravacoes.length;


          /*
           * Somente TB_CLIMA recebe put.
           *
           * Nenhuma operação é feita em storeFila.
           */
          if (!simular) {
            gravacoes.forEach(
              function (registro) {
                storeClima.put(
                  registro
                );
              }
            );
          }

          resultadoTransacao =
            resultado;

        } catch (erro) {
          try {
            transacao.abort();
          } catch (erroAbortar) {
            // A transação pode já ter sido encerrada.
          }

          rejeitarUmaVez(
            erro
          );
        }
      }


      requisicaoClimas.onsuccess =
        function () {
          climasLocais =
            Array.isArray(
              requisicaoClimas.result
            )
              ? requisicaoClimas.result
              : [];

          processarMesclagem();
        };


      requisicaoClimas.onerror =
        function () {
          rejeitarUmaVez(
            requisicaoClimas.error ||
            new Error(
              "Não foi possível ler TB_CLIMA."
            )
          );
        };


      requisicaoFila.onsuccess =
        function () {
          fila =
            Array.isArray(
              requisicaoFila.result
            )
              ? requisicaoFila.result
              : [];

          processarMesclagem();
        };


      requisicaoFila.onerror =
        function () {
          rejeitarUmaVez(
            requisicaoFila.error ||
            new Error(
              "Não foi possível ler TB_SYNC_QUEUE."
            )
          );
        };


      transacao.oncomplete =
        function () {
          if (finalizado) {
            return;
          }

          finalizado =
            true;

          resolve(
            resultadoTransacao
          );
        };


      transacao.onerror =
        function () {
          rejeitarUmaVez(
            transacao.error ||
            new Error(
              "Erro na transação de mesclagem de Clima."
            )
          );
        };


      transacao.onabort =
        function () {
          rejeitarUmaVez(
            transacao.error ||
            new Error(
              "A transação de mesclagem de Clima foi cancelada."
            )
          );
        };
    }
  );
}


/**
 * Atualiza cache e DataBinding apenas depois
 * da mesclagem real.
 *
 * Não notifica alteração em TB_SYNC_QUEUE.
 */
async function notificarMesclagemClimaUX1975_(
  resultado
) {
  try {
    if (
      window.SIGODataCache &&
      typeof SIGODataCache.invalidate ===
        "function"
    ) {
      SIGODataCache.invalidate(
        "TB_CLIMA"
      );

      if (
        resultado.idObra &&
        typeof invalidarCacheObraSIGO_ ===
          "function"
      ) {
        invalidarCacheObraSIGO_(
          "TB_CLIMA",
          resultado.idObra
        );
      }
    }

    if (
      window.SIGODataBinding &&
      typeof SIGODataBinding.notify ===
        "function"
    ) {
      await SIGODataBinding.notify(
        "TB_CLIMA",
        {
          acao:
            "UPDATE",

          store:
            "TB_CLIMA",

          idObra:
            resultado.idObra,

          quantidade:
            resultado.climas
              .gravacoesExecutadas,

          origem:
            "REIDRATACAO"
        }
      );

      return;
    }

    if (
      window.SIGOEventBus &&
      typeof SIGOEventBus.emit ===
        "function"
    ) {
      SIGOEventBus.emit(
        "TB_CLIMA_UPDATED",
        {
          acao:
            "UPDATE",

          store:
            "TB_CLIMA",

          idObra:
            resultado.idObra,

          quantidade:
            resultado.climas
              .gravacoesExecutadas,

          origem:
            "REIDRATACAO"
        }
      );
    }

  } catch (erro) {
    console.warn(
      "[UX.19.7.5] Mesclagem gravada, mas a atualização visual falhou:",
      erro
    );
  }
}


/**
 * ============================================================
 * MESCLAGEM PRINCIPAL
 * ============================================================
 */
async function mesclarClimasReidratacaoSIGO_(
  pacote,
  opcoes = {}
) {
  if (
    !pacote ||
    typeof pacote !== "object"
  ) {
    throw new Error(
      "Pacote de Clima não informado."
    );
  }

  const idObra =
    normalizarTextoClimaUX1975_(
      pacote.idObra
    );

  if (!idObra) {
    throw new Error(
      "O pacote de Clima não possui idObra."
    );
  }

  const climas =
    Array.isArray(
      pacote.climas
    )
      ? pacote.climas
      : null;

  if (!climas) {
    throw new Error(
      "A lista de Climas do pacote é inválida."
    );
  }

  const totalInformado =
    pacote.totais &&
    pacote.totais.climas !==
      undefined
      ? Number(
          pacote.totais.climas
        )
      : climas.length;

  if (
    !Number.isFinite(
      totalInformado
    ) ||
    totalInformado !==
      climas.length
  ) {
    throw new Error(
      "O total de Climas informado não corresponde à lista recebida."
    );
  }

  if (
    typeof abrirBancoLocalSIGO !==
    "function"
  ) {
    throw new Error(
      "A função abrirBancoLocalSIGO não foi encontrada."
    );
  }

  const db =
    (
      typeof SIGO_DB !==
        "undefined" &&
      SIGO_DB
    )
      ? SIGO_DB
      : await abrirBancoLocalSIGO();

  if (
    !db.objectStoreNames.contains(
      "TB_CLIMA"
    )
  ) {
    throw new Error(
      "A store TB_CLIMA não existe no IndexedDB."
    );
  }

  if (
    !db.objectStoreNames.contains(
      "TB_SYNC_QUEUE"
    )
  ) {
    throw new Error(
      "A store TB_SYNC_QUEUE não existe no IndexedDB."
    );
  }

  const simular =
    opcoes.simular !== false;

  const resultado =
    await executarTransacaoClimaUX1975_(
      db,
      {
        ...pacote,
        idObra,
        climas
      },
      {
        simular
      }
    );


  /*
   * A fila é relida depois da transação para comprovar
   * que quantidade e conteúdo permaneceram inalterados.
   */
  const filaDepois =
    await listarRegistrosSIGO(
      "TB_SYNC_QUEUE"
    );

  resultado.fila.totalDepois =
    filaDepois.length;

  resultado.fila.assinaturaDepois =
    criarAssinaturaColecaoClimaUX1975_(
      filaDepois,
      "idSyncLocal"
    );

  resultado.fila.preservada =
    (
      resultado.fila.totalAntes ===
        resultado.fila.totalDepois &&

      resultado.fila.assinaturaAntes ===
        resultado.fila.assinaturaDepois
    );

  if (
    !resultado.fila.preservada
  ) {
    throw new Error(
      "TB_SYNC_QUEUE foi alterada durante a mesclagem de Clima."
    );
  }

  if (!simular) {
    await notificarMesclagemClimaUX1975_(
      resultado
    );
  }

  return resultado;
}


/**
 * Consulta a API e aplica a mesclagem protegida.
 */
async function reidratarClimasObraMobile_(
  idObra,
  diasHistorico,
  opcoes = {}
) {
  if (
    typeof obterClimasOperacionaisObraMobile_ !==
    "function"
  ) {
    throw new Error(
      "O cliente de Clima da UX.19.7.4 não foi encontrado."
    );
  }

  const respostaApi =
    await obterClimasOperacionaisObraMobile_(
      idObra,
      diasHistorico
    );

  return mesclarClimasReidratacaoSIGO_(
    respostaApi,
    opcoes
  );
}


/**
 * ============================================================
 * TESTE EM MODO SIMULAÇÃO
 * ============================================================
 *
 * Este é o teste que deve ser executado primeiro.
 *
 * Não grava em TB_CLIMA.
 * Não altera TB_SYNC_QUEUE.
 */
async function testarMesclagemProtegidaClimaUX1975_() {
  console.log(
    "[UX.19.7.5] Iniciando simulação da mesclagem protegida de Clima..."
  );

  const climasAntes =
    await listarRegistrosSIGO(
      "TB_CLIMA"
    );

  const filaAntes =
    await listarRegistrosSIGO(
      "TB_SYNC_QUEUE"
    );

  const assinaturaClimasAntes =
    criarAssinaturaColecaoClimaUX1975_(
      climasAntes,
      "idClima"
    );

  const assinaturaFilaAntes =
    criarAssinaturaColecaoClimaUX1975_(
      filaAntes,
      "idSyncLocal"
    );

  const resultado =
    await reidratarClimasObraMobile_(
      "OBR002",
      30,
      {
        simular:
          true
      }
    );

  const climasDepois =
    await listarRegistrosSIGO(
      "TB_CLIMA"
    );

  const filaDepois =
    await listarRegistrosSIGO(
      "TB_SYNC_QUEUE"
    );

  const assinaturaClimasDepois =
    criarAssinaturaColecaoClimaUX1975_(
      climasDepois,
      "idClima"
    );

  const assinaturaFilaDepois =
    criarAssinaturaColecaoClimaUX1975_(
      filaDepois,
      "idSyncLocal"
    );

  const totalDecisoes =
    resultado.climas.inseridos +
    resultado.climas.atualizados +
    resultado.climas.preservados +
    resultado.climas.rejeitados;

  const validacoes = {
    modoSimulacao:
      resultado.modo ===
      "SIMULACAO",

    obraCorreta:
      resultado.idObra ===
      "OBR002",

    periodoCorreto:
      resultado.periodoDias ===
      30,

    recebeu8Climas:
      resultado.climas.recebidos ===
      8,

    totalDecisoesCoerente:
      totalDecisoes ===
      resultado.climas.recebidos,

    nenhumaGravacaoExecutada:
      resultado.climas
        .gravacoesExecutadas === 0,

    tbClimaNaoAlterada:
      assinaturaClimasAntes ===
      assinaturaClimasDepois,

    quantidadeClimasPreservada:
      climasAntes.length ===
      climasDepois.length,

    filaQuantidadePreservada:
      filaAntes.length ===
      filaDepois.length,

    filaConteudoPreservado:
      assinaturaFilaAntes ===
      assinaturaFilaDepois,

    filaConfirmadaPeloResultado:
      resultado.fila.preservada ===
      true,

    nenhumRegistroInvalido:
      resultado.climas
        .rejeitadosInvalidos === 0,

    nenhumaDuplicidadePacote:
      resultado.climas
        .rejeitadosDuplicidade === 0,

    nenhumaMisturaDeObras:
      resultado.climas
        .rejeitadosOutraObra === 0
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(
      function (valor) {
        return valor === true;
      }
    );

  const auditoria = {
    etapa:
      "UX.19.7.5",

    teste:
      "MESCLAGEM_PROTEGIDA_CLIMA_SIMULACAO",

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    idObra:
      resultado.idObra,

    periodoDias:
      resultado.periodoDias,

    climas: {
      locaisAntes:
        climasAntes.length,

      locaisDepois:
        climasDepois.length,

      recebidos:
        resultado.climas.recebidos,

      inseriria:
        resultado.climas.inseridos,

      atualizaria:
        resultado.climas.atualizados,

      preservariaUpsert:
        resultado.climas
          .preservadosUpsert,

      preservariaDelete:
        resultado.climas
          .preservadosDelete,

      preservariaStatusLocal:
        resultado.climas
          .preservadosStatusLocal,

      preservariaFilaDesconhecida:
        resultado.climas
          .preservadosFilaDesconhecida,

      preservados:
        resultado.climas.preservados,

      rejeitados:
        resultado.climas.rejeitados,

      gravacoesExecutadas:
        resultado.climas
          .gravacoesExecutadas
    },

    conflitosEvitados:
      resultado.totalConflitosEvitados,

    fila: {
      totalAntes:
        filaAntes.length,

      totalDepois:
        filaDepois.length,

      preservada:
        resultado.fila.preservada
    },

    validacoes:
      validacoes,

    conflitos:
      resultado.conflitos,

    aprovado:
      aprovado
  };

  console.log(
    JSON.stringify(
      auditoria,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.7.5 REPROVADA. Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.7.5 — SIMULAÇÃO DA MESCLAGEM PROTEGIDA DE CLIMA APROVADA."
  );

  return {
    auditoria,
    resultado
  };
}


/**
 * ============================================================
 * MESCLAGEM REAL
 * ============================================================
 *
 * NÃO EXECUTAR ANTES DA APROVAÇÃO DA SIMULAÇÃO.
 */
async function executarMesclagemRealClimaUX1975_() {
  console.log(
    "[UX.19.7.5] Iniciando mesclagem real de Clima..."
  );

  const resultado =
    await reidratarClimasObraMobile_(
      "OBR002",
      30,
      {
        simular:
          false
      }
    );

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  console.log(
    "UX.19.7.5 — MESCLAGEM REAL DE CLIMA CONCLUÍDA."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.6.5 — MESCLAGEM PROTEGIDA DE OCORRÊNCIAS
 * ============================================================
 *
 * Stores:
 * - TB_OCORRENCIAS
 * - TB_SYNC_QUEUE
 *
 * A fila é somente consultada.
 * Nenhum registro da fila é removido ou atualizado.
 */


/**
 * Converte possíveis JSONs armazenados como texto.
 */
function converterObjetoFilaOcorrenciasUX1965_(valor) {
  if (!valor) {
    return {};
  }

  if (typeof valor === "object") {
    return valor;
  }

  if (typeof valor === "string") {
    try {
      const objeto = JSON.parse(valor);

      return (
        objeto &&
        typeof objeto === "object"
      )
        ? objeto
        : {};

    } catch (erro) {
      return {};
    }
  }

  return {};
}


/**
 * Obtém o payload armazenado em diferentes versões da fila.
 */
function obterPayloadFilaOcorrenciasUX1965_(
  registroFila
) {
  const candidatos = [
    registroFila && registroFila.payload,
    registroFila && registroFila.dados,
    registroFila && registroFila.registro,
    registroFila && registroFila.objeto,
    registroFila && registroFila.body,
    registroFila && registroFila.pacote,
    registroFila && registroFila.dadosRegistro,
    registroFila && registroFila.registroPayload,
    registroFila && registroFila.conteudo
  ];

  for (const candidato of candidatos) {
    const objeto =
      converterObjetoFilaOcorrenciasUX1965_(
        candidato
      );

    if (
      objeto &&
      Object.keys(objeto).length
    ) {
      return objeto;
    }
  }

  return {};
}


/**
 * Normaliza texto para comparação.
 */
function normalizarTextoOcorrenciasUX1965_(
  valor
) {
  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  ).trim();
}


/**
 * Normaliza texto em caixa alta e sem acentos.
 */
function normalizarMaiusculoOcorrenciasUX1965_(
  valor
) {
  return normalizarTextoOcorrenciasUX1965_(
    valor
  )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}


/**
 * Extrai o ID de uma ocorrência local ou do servidor.
 */
function obterIdOcorrenciaUX1965_(
  registro
) {
  return normalizarTextoOcorrenciasUX1965_(
    registro && (
      registro.idOcorrencia ||
      registro.ID_OCORRENCIA ||
      registro.idRegistro ||
      registro.registroId ||
      registro.id ||
      registro.chave
    )
  );
}


/**
 * Identifica se um registro da fila pertence a ocorrências.
 */
function filaPertenceOcorrenciaUX1965_(
  registroFila
) {
  const payload =
    obterPayloadFilaOcorrenciasUX1965_(
      registroFila
    );

  const registroInterno =
    converterObjetoFilaOcorrenciasUX1965_(
      payload.registro ||
      payload.dados ||
      payload.dadosRegistro ||
      {}
    );

  const textoEntidade = [
    registroFila && registroFila.entidade,
    registroFila && registroFila.tipoEntidade,
    registroFila && registroFila.tipoRegistro,
    registroFila && registroFila.tabela,
    registroFila && registroFila.store,
    registroFila && registroFila.origemTabela,
    registroFila && registroFila.tipo,

    payload.entidade,
    payload.tipoEntidade,
    payload.tipoRegistro,
    payload.tabela,
    payload.store,
    payload.origemTabela,
    payload.tipo,

    registroInterno.entidade,
    registroInterno.tipoEntidade,
    registroInterno.tabela,
    registroInterno.store
  ]
    .map(
      normalizarMaiusculoOcorrenciasUX1965_
    )
    .filter(Boolean)
    .join("|");

  if (
    textoEntidade.includes(
      "TB_OCORRENCIAS"
    ) ||
    textoEntidade.includes(
      "OCORRENCIA"
    )
  ) {
    return true;
  }

  /*
   * Compatibilidade com filas antigas que não gravaram
   * explicitamente o nome da entidade.
   */
  const possuiIdOcorrencia =
    Boolean(
      registroFila &&
      registroFila.idOcorrencia
    ) ||
    Boolean(
      payload.idOcorrencia
    ) ||
    Boolean(
      registroInterno.idOcorrencia
    );

  return possuiIdOcorrencia;
}


/**
 * Extrai o ID da ocorrência referenciada pela fila.
 */
function obterIdOcorrenciaFilaUX1965_(
  registroFila
) {
  const payload =
    obterPayloadFilaOcorrenciasUX1965_(
      registroFila
    );

  const registroInterno =
    converterObjetoFilaOcorrenciasUX1965_(
      payload.registro ||
      payload.dados ||
      payload.dadosRegistro ||
      {}
    );

  const candidatos = [
    registroFila && registroFila.idOcorrencia,
    payload.idOcorrencia,
    registroInterno.idOcorrencia,

    registroFila && registroFila.idRegistro,
    registroFila && registroFila.registroId,
    registroFila && registroFila.idEntidade,
    registroFila && registroFila.idAlvo,
    registroFila && registroFila.chaveRegistro,

    payload.idRegistro,
    payload.registroId,
    payload.idEntidade,
    payload.idAlvo,
    payload.chaveRegistro,

    registroInterno.idRegistro,
    registroInterno.registroId,
    registroInterno.idEntidade,
    registroInterno.idAlvo
  ];

  for (const candidato of candidatos) {
    const id =
      normalizarTextoOcorrenciasUX1965_(
        candidato
      );

    if (id) {
      return id;
    }
  }

  return "";
}


/**
 * Identifica se a fila ainda representa uma pendência ativa.
 */
function filaOcorrenciaEstaPendenteUX1965_(
  registroFila
) {
  /*
   * Reutiliza o auxiliar já aprovado na UX.19.5.6.
   */
  if (
    typeof filaEstaPendenteUX1956_ ===
    "function"
  ) {
    return filaEstaPendenteUX1956_(
      registroFila
    );
  }

  const payload =
    obterPayloadFilaOcorrenciasUX1965_(
      registroFila
    );

  const status =
    normalizarMaiusculoOcorrenciasUX1965_(
      registroFila && (
        registroFila.statusSync ||
        registroFila.status ||
        registroFila.situacao
      ) ||
      payload.statusSync ||
      payload.status ||
      payload.situacao
    );

  const statusFinalizados = new Set([
    "SINCRONIZADO",
    "CONCLUIDO",
    "FINALIZADO",
    "CANCELADO",
    "CANCELADA",
    "IGNORADO",
    "IGNORADA"
  ]);

  return !statusFinalizados.has(
    status
  );
}


/**
 * Identifica a operação da fila.
 */
function obterOperacaoFilaOcorrenciasUX1965_(
  registroFila
) {
  /*
   * Reutiliza o auxiliar já aprovado na UX.19.5.6.
   */
  if (
    typeof obterOperacaoFilaUX1956_ ===
    "function"
  ) {
    return obterOperacaoFilaUX1956_(
      registroFila
    );
  }

  const payload =
    obterPayloadFilaOcorrenciasUX1965_(
      registroFila
    );

  const texto = [
    registroFila && registroFila.operacao,
    registroFila && registroFila.acao,
    registroFila && registroFila.tipoOperacao,
    registroFila && registroFila.metodo,

    payload.operacao,
    payload.acao,
    payload.tipoOperacao,
    payload.metodo
  ]
    .map(
      normalizarMaiusculoOcorrenciasUX1965_
    )
    .filter(Boolean)
    .join("|");

  if (
    texto.includes("DELETE") ||
    texto.includes("EXCLUIR") ||
    texto.includes("EXCLUSAO") ||
    texto.includes("REMOVER")
  ) {
    return "DELETE";
  }

  if (
    texto.includes("UPSERT") ||
    texto.includes("INSERT") ||
    texto.includes("UPDATE") ||
    texto.includes("SALVAR") ||
    texto.includes("CRIAR")
  ) {
    return "UPSERT";
  }

  if (
    registroFila &&
    registroFila.tombstone === true
  ) {
    return "DELETE";
  }

  if (
    payload &&
    payload.tombstone === true
  ) {
    return "DELETE";
  }

  /*
   * Qualquer pendência desconhecida protege o registro local.
   */
  return "PENDENCIA";
}


/**
 * Cria um mapa das pendências ativas das ocorrências.
 *
 * Chave:
 * ID_OCORRENCIA
 */
function criarMapaPendenciasOcorrenciasUX1965_(
  registrosFila
) {
  const mapa =
    new Map();

  let pendenciasAtivasReconhecidas =
    0;

  for (
    const registroFila of registrosFila || []
  ) {
    if (
      !filaPertenceOcorrenciaUX1965_(
        registroFila
      )
    ) {
      continue;
    }

    if (
      !filaOcorrenciaEstaPendenteUX1965_(
        registroFila
      )
    ) {
      continue;
    }

    const idOcorrencia =
      obterIdOcorrenciaFilaUX1965_(
        registroFila
      );

    if (!idOcorrencia) {
      continue;
    }

    const operacao =
      obterOperacaoFilaOcorrenciasUX1965_(
        registroFila
      );

    pendenciasAtivasReconhecidas++;

    const anterior =
      mapa.get(idOcorrencia);

    if (!anterior) {
      mapa.set(
        idOcorrencia,
        {
          idOcorrencia,
          operacao,
          registroFila
        }
      );

      continue;
    }

    /*
     * DELETE sempre possui precedência.
     */
    if (
      operacao === "DELETE" &&
      anterior.operacao !== "DELETE"
    ) {
      mapa.set(
        idOcorrencia,
        {
          idOcorrencia,
          operacao,
          registroFila
        }
      );
    }
  }

  return {
    mapa,
    pendenciasAtivasReconhecidas
  };
}


/**
 * Prepara uma ocorrência para a estrutura local.
 *
 * Mantém também aliases de compatibilidade com versões
 * anteriores da tela de ocorrências.
 */
function prepararOcorrenciaStoreUX1965_(
  storeOcorrencias,
  ocorrenciaServidor,
  ocorrenciaLocal
) {
  const idOcorrencia =
    obterIdOcorrenciaUX1965_(
      ocorrenciaServidor
    );

  const idObra =
    normalizarTextoOcorrenciasUX1965_(
      ocorrenciaServidor.idObra
    );

  const tipoOcorrencia =
    normalizarTextoOcorrenciasUX1965_(
      ocorrenciaServidor.tipoOcorrencia ||
      ocorrenciaServidor.tipo ||
      (
        ocorrenciaLocal &&
        (
          ocorrenciaLocal.tipoOcorrencia ||
          ocorrenciaLocal.tipo
        )
      )
    );

  const statusOcorrencia =
    normalizarTextoOcorrenciasUX1965_(
      ocorrenciaServidor.statusOcorrencia ||
      ocorrenciaServidor.status ||
      (
        ocorrenciaLocal &&
        (
          ocorrenciaLocal.statusOcorrencia ||
          ocorrenciaLocal.status
        )
      )
    );

  const preparado = {
    ...(ocorrenciaLocal || {}),
    ...ocorrenciaServidor,

    idOcorrencia,
    idObra,

    tipoOcorrencia,
    statusOcorrencia,

    /*
     * Aliases mantidos para compatibilidade da interface.
     */
    tipo:
      ocorrenciaServidor.tipo !== undefined
        ? ocorrenciaServidor.tipo
        : tipoOcorrencia,

    status:
      ocorrenciaServidor.status !== undefined
        ? ocorrenciaServidor.status
        : statusOcorrencia,

    statusSync:
      "SINCRONIZADO",

    origemReidratacao:
      "SERVIDOR"
  };

  const keyPath =
    storeOcorrencias.keyPath;

  if (
    typeof keyPath === "string" &&
    keyPath &&
    (
      preparado[keyPath] === undefined ||
      preparado[keyPath] === null ||
      preparado[keyPath] === ""
    )
  ) {
    preparado[keyPath] =
      idOcorrencia;
  }

  return preparado;
}


/**
 * Cria a estrutura de contagem da mesclagem.
 */
function criarResumoOcorrenciasUX1965_(
  recebidas
) {
  return {
    recebidas,

    inseridas: 0,
    atualizadas: 0,

    preservadasPorUpsertPendente: 0,
    bloqueadasPorDeletePendente: 0,
    preservadasPorPendenciaDesconhecida: 0,

    rejeitadasOutraObra: 0,
    rejeitadasInvalidas: 0,

    duplicadasNoServidor: 0,
    duplicadasLocalmente: 0
  };
}


/**
 * Adiciona um conflito protegido ao resultado.
 */
function adicionarConflitoOcorrenciasUX1965_(
  resultado,
  conflito
) {
  resultado.totalConflitosEvitados++;

  if (
    resultado.conflitos.length < 100
  ) {
    resultado.conflitos.push(
      conflito
    );
  }
}


/**
 * ============================================================
 * NÚCLEO DA MESCLAGEM
 * ============================================================
 *
 * @param {Object} pacote
 * Resposta normalizada de
 * obterOcorrenciasOperacionaisObraMobile_().
 *
 * @param {Object} opcoes
 * {
 *   simular: true | false
 * }
 */
async function mesclarOcorrenciasReidratacaoSIGO_(
  pacote,
  opcoes = {}
) {
  if (
    !pacote ||
    typeof pacote !== "object"
  ) {
    throw new Error(
      "Pacote de ocorrências inválido."
    );
  }

  const idObra =
    normalizarTextoOcorrenciasUX1965_(
      pacote.idObra
    );

  const ocorrenciasServidor =
    Array.isArray(
      pacote.ocorrencias
    )
      ? pacote.ocorrencias
      : [];

  const simular =
    opcoes.simular === true;

  if (!idObra) {
    throw new Error(
      "O pacote de ocorrências não possui idObra."
    );
  }

  if (
    typeof abrirBancoLocalSIGO !==
    "function"
  ) {
    throw new Error(
      "A função abrirBancoLocalSIGO() não foi encontrada."
    );
  }

  const db =
    await abrirBancoLocalSIGO();

  const storesObrigatorias = [
    "TB_OCORRENCIAS",
    "TB_SYNC_QUEUE"
  ];

  for (
    const nomeStore of storesObrigatorias
  ) {
    if (
      !db.objectStoreNames.contains(
        nomeStore
      )
    ) {
      throw new Error(
        "Store obrigatória não encontrada: " +
        nomeStore
      );
    }
  }

  return new Promise(
    function (resolve, reject) {
      const tx = db.transaction(
        storesObrigatorias,
        simular
          ? "readonly"
          : "readwrite"
      );

      const storeOcorrencias =
        tx.objectStore(
          "TB_OCORRENCIAS"
        );

      const storeFila =
        tx.objectStore(
          "TB_SYNC_QUEUE"
        );

      const reqOcorrencias =
        storeOcorrencias.getAll();

      const reqFila =
        storeFila.getAll();

      let ocorrenciasLocais = null;
      let registrosFila = null;

      let processamentoIniciado =
        false;

      let resultadoFinal =
        null;

      let erroControlado =
        null;


      function falhar(
        mensagem,
        erroOriginal
      ) {
        const detalhe =
          erroOriginal &&
          erroOriginal.message
            ? erroOriginal.message
            : normalizarTextoOcorrenciasUX1965_(
                erroOriginal
              );

        erroControlado =
          new Error(
            detalhe
              ? mensagem + " " + detalhe
              : mensagem
          );

        try {
          tx.abort();

        } catch (erroAbort) {
          reject(erroControlado);
        }
      }


      function tentarProcessar() {
        if (processamentoIniciado) {
          return;
        }

        if (
          ocorrenciasLocais === null ||
          registrosFila === null
        ) {
          return;
        }

        processamentoIniciado =
          true;

        try {
          const pendencias =
            criarMapaPendenciasOcorrenciasUX1965_(
              registrosFila
            );

          const mapaPendencias =
            pendencias.mapa;

          const mapaLocais =
            new Map();

          const idsDuplicadosLocais =
            new Set();

          let registrosLocaisSemId = 0;


          /*
           * Indexar as ocorrências locais.
           */
          for (
            const ocorrenciaLocal of ocorrenciasLocais
          ) {
            const idOcorrencia =
              obterIdOcorrenciaUX1965_(
                ocorrenciaLocal
              );

            if (!idOcorrencia) {
              registrosLocaisSemId++;
              continue;
            }

            if (
              mapaLocais.has(
                idOcorrencia
              )
            ) {
              idsDuplicadosLocais.add(
                idOcorrencia
              );

              continue;
            }

            mapaLocais.set(
              idOcorrencia,
              ocorrenciaLocal
            );
          }


          const resultado = {
            etapa:
              "UX.19.6.5",

            operacao:
              "MESCLAGEM_PROTEGIDA_OCORRENCIAS",

            modo:
              simular
                ? "SIMULACAO"
                : "GRAVACAO_REAL",

            idObra,

            periodoDias:
              Number(
                pacote.periodoDias || 0
              ),

            dataInicio:
              normalizarTextoOcorrenciasUX1965_(
                pacote.dataInicio
              ),

            dataFim:
              normalizarTextoOcorrenciasUX1965_(
                pacote.dataFim
              ),

            dataSyncServidor:
              normalizarTextoOcorrenciasUX1965_(
                pacote.dataSync
              ),

            ocorrencias:
              criarResumoOcorrenciasUX1965_(
                ocorrenciasServidor.length
              ),

            indexedDB: {
              totalOcorrenciasAntes:
                ocorrenciasLocais.length,

              registrosLocaisSemId,

              idsDuplicadosLocais:
                Array.from(
                  idsDuplicadosLocais
                )
            },

            fila: {
              totalRegistros:
                registrosFila.length,

              pendenciasAtivasReconhecidas:
                pendencias
                  .pendenciasAtivasReconhecidas,

              preservadaIntegralmente:
                true,

              alteracoesRealizadas:
                0
            },

            totalConflitosEvitados:
              0,

            conflitos:
              [],

            executadoEm:
              new Date().toISOString()
          };


          const idsServidorVistos =
            new Set();


          /*
           * ==================================================
           * PROCESSAMENTO DAS OCORRÊNCIAS
           * ==================================================
           */

          for (
            const ocorrenciaServidor
            of ocorrenciasServidor
          ) {
            const idOcorrencia =
              obterIdOcorrenciaUX1965_(
                ocorrenciaServidor
              );

            const idObraServidor =
              normalizarTextoOcorrenciasUX1965_(
                ocorrenciaServidor.idObra
              );


            /*
             * Registro sem ID.
             */
            if (!idOcorrencia) {
              resultado.ocorrencias
                .rejeitadasInvalidas++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    "",

                  motivo:
                    "ID_OCORRENCIA_AUSENTE"
                }
              );

              continue;
            }


            /*
             * Duplicidade no pacote recebido.
             */
            if (
              idsServidorVistos.has(
                idOcorrencia
              )
            ) {
              resultado.ocorrencias
                .duplicadasNoServidor++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    idOcorrencia,

                  motivo:
                    "DUPLICADA_NO_PACOTE_SERVIDOR"
                }
              );

              continue;
            }

            idsServidorVistos.add(
              idOcorrencia
            );


            /*
             * Registro de outra obra.
             */
            if (
              idObraServidor !==
              idObra
            ) {
              resultado.ocorrencias
                .rejeitadasOutraObra++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    idOcorrencia,

                  motivo:
                    "REGISTRO_DE_OUTRA_OBRA",

                  idObraRecebida:
                    idObraServidor
                }
              );

              continue;
            }


            /*
             * Mesmo ID duplicado localmente.
             *
             * A mesclagem é bloqueada para evitar sobrescrever
             * um estado local ambíguo.
             */
            if (
              idsDuplicadosLocais.has(
                idOcorrencia
              )
            ) {
              resultado.ocorrencias
                .duplicadasLocalmente++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    idOcorrencia,

                  motivo:
                    "ID_DUPLICADO_LOCALMENTE"
                }
              );

              continue;
            }


            const ocorrenciaLocal =
              mapaLocais.get(
                idOcorrencia
              );


            /*
             * Mesmo ID já utilizado localmente por outra obra.
             */
            if (
              ocorrenciaLocal &&
              normalizarTextoOcorrenciasUX1965_(
                ocorrenciaLocal.idObra
              ) &&
              normalizarTextoOcorrenciasUX1965_(
                ocorrenciaLocal.idObra
              ) !== idObra
            ) {
              resultado.ocorrencias
                .rejeitadasOutraObra++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    idOcorrencia,

                  motivo:
                    "ID_JA_EXISTE_LOCALMENTE_EM_OUTRA_OBRA"
                }
              );

              continue;
            }


            const pendencia =
              mapaPendencias.get(
                idOcorrencia
              );


            /*
             * DELETE pendente:
             * nunca restaurar a ocorrência.
             */
            if (
              pendencia &&
              pendencia.operacao ===
                "DELETE"
            ) {
              resultado.ocorrencias
                .bloqueadasPorDeletePendente++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    idOcorrencia,

                  motivo:
                    "DELETE_PENDENTE_NAO_RESTAURAR"
                }
              );

              continue;
            }


            /*
             * UPSERT pendente:
             * preservar integralmente a versão local.
             */
            if (
              pendencia &&
              pendencia.operacao ===
                "UPSERT"
            ) {
              resultado.ocorrencias
                .preservadasPorUpsertPendente++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    idOcorrencia,

                  motivo:
                    ocorrenciaLocal
                      ? "UPSERT_PENDENTE_LOCAL_PRESERVADO"
                      : "UPSERT_PENDENTE_SEM_REGISTRO_LOCAL"
                }
              );

              continue;
            }


            /*
             * Pendência ativa de tipo desconhecido:
             * também protege o estado local.
             */
            if (pendencia) {
              resultado.ocorrencias
                .preservadasPorPendenciaDesconhecida++;

              adicionarConflitoOcorrenciasUX1965_(
                resultado,
                {
                  entidade:
                    "OCORRENCIA",

                  idRegistro:
                    idOcorrencia,

                  motivo:
                    "PENDENCIA_ATIVA_DESCONHECIDA_PRESERVADA"
                }
              );

              continue;
            }


            /*
             * Registro seguro para inserção ou atualização.
             */
            const ocorrenciaMesclada =
              prepararOcorrenciaStoreUX1965_(
                storeOcorrencias,
                ocorrenciaServidor,
                ocorrenciaLocal
              );


            if (ocorrenciaLocal) {
              resultado.ocorrencias
                .atualizadas++;

            } else {
              resultado.ocorrencias
                .inseridas++;
            }


            mapaLocais.set(
              idOcorrencia,
              ocorrenciaMesclada
            );


            if (!simular) {
              storeOcorrencias.put(
                ocorrenciaMesclada
              );
            }
          }


          /*
           * TB_SYNC_QUEUE não recebe put, delete ou clear.
           */
          resultadoFinal =
            resultado;

        } catch (erroProcessamento) {
          falhar(
            "Falha durante a mesclagem protegida de ocorrências.",
            erroProcessamento
          );
        }
      }


      reqOcorrencias.onsuccess =
        function () {
          ocorrenciasLocais =
            Array.isArray(
              reqOcorrencias.result
            )
              ? reqOcorrencias.result
              : [];

          tentarProcessar();
        };


      reqFila.onsuccess =
        function () {
          registrosFila =
            Array.isArray(
              reqFila.result
            )
              ? reqFila.result
              : [];

          tentarProcessar();
        };


      reqOcorrencias.onerror =
        function () {
          falhar(
            "Não foi possível ler TB_OCORRENCIAS.",
            reqOcorrencias.error
          );
        };


      reqFila.onerror =
        function () {
          falhar(
            "Não foi possível ler TB_SYNC_QUEUE.",
            reqFila.error
          );
        };


      tx.oncomplete =
        function () {
          if (!resultadoFinal) {
            reject(
              new Error(
                "A transação terminou sem produzir resultado."
              )
            );

            return;
          }

          resolve(
            resultadoFinal
          );
        };


      tx.onerror =
        function () {
          if (!erroControlado) {
            reject(
              new Error(
                "A transação de ocorrências falhou. " +
                (
                  tx.error &&
                  tx.error.message
                    ? tx.error.message
                    : ""
                )
              )
            );
          }
        };


      tx.onabort =
        function () {
          reject(
            erroControlado ||
            new Error(
              "A transação de ocorrências foi cancelada."
            )
          );
        };
    }
  );
}


/**
 * ============================================================
 * FLUXO API → MESCLAGEM PROTEGIDA
 * ============================================================
 */
async function reidratarOcorrenciasObraMobile_(
  idObra,
  diasHistorico,
  opcoes = {}
) {
  const respostaApi =
    await obterOcorrenciasOperacionaisObraMobile_(
      idObra,
      diasHistorico
    );

  return mesclarOcorrenciasReidratacaoSIGO_(
    respostaApi,
    opcoes
  );
}


/**
 * ============================================================
 * SIMULAÇÃO SEGURA
 * ============================================================
 *
 * Não grava em:
 *
 * - TB_OCORRENCIAS;
 * - TB_SYNC_QUEUE.
 */
async function testarMesclagemProtegidaOcorrenciasUX1965_() {
  console.log(
    "[UX.19.6.5] Iniciando simulação da mesclagem de ocorrências..."
  );

  const resultado =
    await reidratarOcorrenciasObraMobile_(
      "OBR002",
      30,
      {
        simular: true
      }
    );

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  console.log(
    "[UX.19.6.5] Simulação concluída. " +
    "Nenhum registro foi gravado."
  );

  return resultado;
}


/**
 * ============================================================
 * GRAVAÇÃO REAL
 * ============================================================
 *
 * Não executar antes da aprovação da simulação.
 */
async function executarMesclagemRealOcorrenciasUX1965_() {
  console.log(
    "[UX.19.6.5] Iniciando mesclagem real de ocorrências..."
  );

  const resultado =
    await reidratarOcorrenciasObraMobile_(
      "OBR002",
      30,
      {
        simular: false
      }
    );

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  console.log(
    "[UX.19.6.5] Mesclagem real concluída. " +
    "A TB_SYNC_QUEUE foi preservada."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.6.6 — AUDITORIA DA MESCLAGEM DE OCORRÊNCIAS
 * ============================================================
 *
 * Auditoria somente leitura.
 *
 * Stores:
 * - TB_OCORRENCIAS
 * - TB_SYNC_QUEUE
 *
 * Nenhum registro é inserido, atualizado ou excluído.
 */


/**
 * Lê as stores necessárias em uma única transação readonly.
 */
async function lerEstadoOcorrenciasUX1966_() {
  if (
    typeof abrirBancoLocalSIGO !==
    "function"
  ) {
    throw new Error(
      "A função abrirBancoLocalSIGO() não foi encontrada."
    );
  }

  const db =
    await abrirBancoLocalSIGO();

  const storesObrigatorias = [
    "TB_OCORRENCIAS",
    "TB_SYNC_QUEUE"
  ];

  for (
    const nomeStore of storesObrigatorias
  ) {
    if (
      !db.objectStoreNames.contains(
        nomeStore
      )
    ) {
      throw new Error(
        "Store obrigatória não encontrada: " +
        nomeStore
      );
    }
  }

  return new Promise(
    function (resolve, reject) {
      const tx =
        db.transaction(
          storesObrigatorias,
          "readonly"
        );

      const storeOcorrencias =
        tx.objectStore(
          "TB_OCORRENCIAS"
        );

      const storeFila =
        tx.objectStore(
          "TB_SYNC_QUEUE"
        );

      const reqOcorrencias =
        storeOcorrencias.getAll();

      const reqFila =
        storeFila.getAll();

      let ocorrencias = [];
      let fila = [];

      reqOcorrencias.onsuccess =
        function () {
          ocorrencias =
            Array.isArray(
              reqOcorrencias.result
            )
              ? reqOcorrencias.result
              : [];
        };

      reqFila.onsuccess =
        function () {
          fila =
            Array.isArray(
              reqFila.result
            )
              ? reqFila.result
              : [];
        };

      reqOcorrencias.onerror =
        function () {
          reject(
            new Error(
              "Não foi possível ler TB_OCORRENCIAS. " +
              (
                reqOcorrencias.error &&
                reqOcorrencias.error.message
                  ? reqOcorrencias.error.message
                  : ""
              )
            )
          );
        };

      reqFila.onerror =
        function () {
          reject(
            new Error(
              "Não foi possível ler TB_SYNC_QUEUE. " +
              (
                reqFila.error &&
                reqFila.error.message
                  ? reqFila.error.message
                  : ""
              )
            )
          );
        };

      tx.oncomplete =
        function () {
          resolve({
            ocorrencias,
            fila
          });
        };

      tx.onerror =
        function () {
          reject(
            new Error(
              "Falha ao ler as stores da auditoria. " +
              (
                tx.error &&
                tx.error.message
                  ? tx.error.message
                  : ""
              )
            )
          );
        };

      tx.onabort =
        function () {
          reject(
            new Error(
              "A transação de auditoria foi cancelada."
            )
          );
        };
    }
  );
}


/**
 * Serialização estável usada para comparar a fila
 * antes e depois da simulação.
 */
function serializarEstavelUX1966_(
  valor
) {
  if (valor === undefined) {
    return '"__UNDEFINED__"';
  }

  if (valor === null) {
    return "null";
  }

  if (Array.isArray(valor)) {
    return (
      "[" +
      valor
        .map(
          serializarEstavelUX1966_
        )
        .join(",") +
      "]"
    );
  }

  if (
    typeof valor === "object"
  ) {
    const chaves =
      Object.keys(valor).sort();

    return (
      "{" +
      chaves
        .map(
          function (chave) {
            return (
              JSON.stringify(chave) +
              ":" +
              serializarEstavelUX1966_(
                valor[chave]
              )
            );
          }
        )
        .join(",") +
      "}"
    );
  }

  return JSON.stringify(valor);
}


/**
 * Gera uma assinatura da fila sem depender
 * da ordem dos registros.
 */
function criarAssinaturaFilaUX1966_(
  registrosFila
) {
  const registrosSerializados =
    (registrosFila || [])
      .map(
        serializarEstavelUX1966_
      )
      .sort();

  return serializarEstavelUX1966_(
    registrosSerializados
  );
}


/**
 * Normaliza um valor para comparação de campos.
 */
function normalizarCampoAuditoriaUX1966_(
  valor
) {
  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  ).trim();
}


/**
 * Obtém um campo que pode possuir alias local.
 */
function obterCampoOcorrenciaLocalUX1966_(
  ocorrencia,
  campo
) {
  if (!ocorrencia) {
    return "";
  }

  if (
    campo === "tipoOcorrencia"
  ) {
    return normalizarCampoAuditoriaUX1966_(
      ocorrencia.tipoOcorrencia ||
      ocorrencia.tipo
    );
  }

  if (
    campo === "statusOcorrencia"
  ) {
    return normalizarCampoAuditoriaUX1966_(
      ocorrencia.statusOcorrencia ||
      ocorrencia.status
    );
  }

  return normalizarCampoAuditoriaUX1966_(
    ocorrencia[campo]
  );
}


/**
 * Compara os campos funcionais de uma ocorrência
 * do servidor com a ocorrência gravada localmente.
 *
 * dataSync não é comparada porque uma nova consulta
 * ao servidor gera um novo horário de sincronização.
 */
function compararOcorrenciaServidorLocalUX1966_(
  servidor,
  local
) {
  const campos = [
    "idOcorrencia",
    "data",
    "idObra",
    "idAtividade",
    "tipoOcorrencia",
    "descricao",
    "impacto",
    "responsavel",
    "acaoCorretiva",
    "statusOcorrencia",
    "dataFechamento"
  ];

  const divergencias = [];

  for (
    const campo of campos
  ) {
    const valorServidor =
      normalizarCampoAuditoriaUX1966_(
        servidor[campo]
      );

    const valorLocal =
      obterCampoOcorrenciaLocalUX1966_(
        local,
        campo
      );

    if (
      valorServidor !== valorLocal
    ) {
      divergencias.push({
        campo,
        servidor:
          valorServidor,
        local:
          valorLocal
      });
    }
  }

  return divergencias;
}


/**
 * ============================================================
 * AUDITORIA PRINCIPAL
 * ============================================================
 */
async function auditarMesclagemOcorrenciasUX1966_() {
  console.log(
    "[UX.19.6.6] Iniciando auditoria da mesclagem de ocorrências..."
  );

  const idObraEsperado =
    "OBR002";

  const periodoEsperado =
    30;

  const totalEsperado =
    14;

  const totalFilaEsperado =
    45;


  /*
   * ==========================================================
   * 1. CONSULTAR O SERVIDOR
   * ==========================================================
   */

  const respostaServidor =
    await obterOcorrenciasOperacionaisObraMobile_(
      idObraEsperado,
      periodoEsperado
    );

  const ocorrenciasServidor =
    Array.isArray(
      respostaServidor.ocorrencias
    )
      ? respostaServidor.ocorrencias
      : [];


  /*
   * ==========================================================
   * 2. LER O INDEXEDDB ANTES DA SIMULAÇÃO
   * ==========================================================
   */

  const estadoAntes =
    await lerEstadoOcorrenciasUX1966_();

  const ocorrenciasLocais =
    estadoAntes.ocorrencias;

  const filaAntes =
    estadoAntes.fila;

  const assinaturaFilaAntes =
    criarAssinaturaFilaUX1966_(
      filaAntes
    );


  /*
   * ==========================================================
   * 3. INDEXAR OCORRÊNCIAS LOCAIS
   * ==========================================================
   */

  const mapaLocais =
    new Map();

  const registrosLocaisSemId =
    [];

  const duplicadosLocais =
    [];

  for (
    const ocorrenciaLocal of ocorrenciasLocais
  ) {
    const idOcorrencia =
      obterIdOcorrenciaUX1965_(
        ocorrenciaLocal
      );

    if (!idOcorrencia) {
      registrosLocaisSemId.push(
        ocorrenciaLocal
      );

      continue;
    }

    if (
      !mapaLocais.has(
        idOcorrencia
      )
    ) {
      mapaLocais.set(
        idOcorrencia,
        []
      );
    }

    mapaLocais
      .get(idOcorrencia)
      .push(
        ocorrenciaLocal
      );
  }

  for (
    const [
      idOcorrencia,
      registros
    ] of mapaLocais.entries()
  ) {
    if (
      registros.length > 1
    ) {
      duplicadosLocais.push({
        idOcorrencia,
        quantidade:
          registros.length
      });
    }
  }


  /*
   * ==========================================================
   * 4. ANALISAR PENDÊNCIAS DE OCORRÊNCIAS
   * ==========================================================
   */

  const informacoesPendencias =
    criarMapaPendenciasOcorrenciasUX1965_(
      filaAntes
    );

  const mapaPendencias =
    informacoesPendencias.mapa;


  /*
   * ==========================================================
   * 5. COMPARAR SERVIDOR × INDEXEDDB
   * ==========================================================
   */

  const idsServidor =
    new Set();

  const ausentesLocalmente =
    [];

  const misturaDeObras =
    [];

  const statusSyncIncorreto =
    [];

  const origemIncorreta =
    [];

  const dataSyncAusente =
    [];

  const divergenciasCampos =
    [];

  const idsServidorDuplicados =
    [];

  for (
    const ocorrenciaServidor
    of ocorrenciasServidor
  ) {
    const idOcorrencia =
      obterIdOcorrenciaUX1965_(
        ocorrenciaServidor
      );

    if (
      idsServidor.has(
        idOcorrencia
      )
    ) {
      idsServidorDuplicados.push(
        idOcorrencia
      );

      continue;
    }

    idsServidor.add(
      idOcorrencia
    );

    const registrosLocais =
      mapaLocais.get(
        idOcorrencia
      ) || [];

    if (!registrosLocais.length) {
      ausentesLocalmente.push(
        idOcorrencia
      );

      continue;
    }

    const ocorrenciaLocal =
      registrosLocais[0];

    const idObraLocal =
      normalizarCampoAuditoriaUX1966_(
        ocorrenciaLocal.idObra
      );

    if (
      idObraLocal !==
      idObraEsperado
    ) {
      misturaDeObras.push({
        idOcorrencia,
        idObraLocal
      });
    }

    const statusSync =
      normalizarMaiusculoOcorrenciasUX1965_(
        ocorrenciaLocal.statusSync
      );

    if (
      statusSync !==
      "SINCRONIZADO"
    ) {
      statusSyncIncorreto.push({
        idOcorrencia,
        statusSync:
          ocorrenciaLocal.statusSync
      });
    }

    const origemReidratacao =
      normalizarMaiusculoOcorrenciasUX1965_(
        ocorrenciaLocal.origemReidratacao
      );

    if (
      origemReidratacao !==
      "SERVIDOR"
    ) {
      origemIncorreta.push({
        idOcorrencia,
        origemReidratacao:
          ocorrenciaLocal.origemReidratacao
      });
    }

    if (
      !normalizarCampoAuditoriaUX1966_(
        ocorrenciaLocal.dataSync
      )
    ) {
      dataSyncAusente.push(
        idOcorrencia
      );
    }

    const divergencias =
      compararOcorrenciaServidorLocalUX1966_(
        ocorrenciaServidor,
        ocorrenciaLocal
      );

    if (
      divergencias.length
    ) {
      divergenciasCampos.push({
        idOcorrencia,
        divergencias
      });
    }
  }


  /*
   * ==========================================================
   * 6. IDENTIFICAR REGISTROS EXTRAS DA OBRA
   * ==========================================================
   */

  const ocorrenciasDaObra =
    ocorrenciasLocais.filter(
      function (ocorrencia) {
        return (
          normalizarCampoAuditoriaUX1966_(
            ocorrencia.idObra
          ) === idObraEsperado
        );
      }
    );

  const extrasSemPendencia =
    [];

  const extrasComPendencia =
    [];

  for (
    const ocorrenciaLocal
    of ocorrenciasDaObra
  ) {
    const idOcorrencia =
      obterIdOcorrenciaUX1965_(
        ocorrenciaLocal
      );

    if (
      !idOcorrencia ||
      idsServidor.has(
        idOcorrencia
      )
    ) {
      continue;
    }

    if (
      mapaPendencias.has(
        idOcorrencia
      )
    ) {
      extrasComPendencia.push(
        idOcorrencia
      );

    } else {
      extrasSemPendencia.push(
        idOcorrencia
      );
    }
  }


  /*
   * ==========================================================
   * 7. TESTE DE IDEMPOTÊNCIA EM MODO SIMULAÇÃO
   * ==========================================================
   *
   * Não realiza gravação.
   */

  const resultadoIdempotencia =
    await mesclarOcorrenciasReidratacaoSIGO_(
      respostaServidor,
      {
        simular: true
      }
    );


  /*
   * ==========================================================
   * 8. LER INDEXEDDB DEPOIS DA SIMULAÇÃO
   * ==========================================================
   */

  const estadoDepois =
    await lerEstadoOcorrenciasUX1966_();

  const assinaturaFilaDepois =
    criarAssinaturaFilaUX1966_(
      estadoDepois.fila
    );

  const ocorrenciasDepoisDaObra =
    estadoDepois.ocorrencias.filter(
      function (ocorrencia) {
        return (
          normalizarCampoAuditoriaUX1966_(
            ocorrencia.idObra
          ) === idObraEsperado
        );
      }
    );


  /*
   * ==========================================================
   * 9. VALIDAÇÕES FINAIS
   * ==========================================================
   */

  const resumoIdempotencia =
    resultadoIdempotencia.ocorrencias ||
    {};

  const filaIdempotencia =
    resultadoIdempotencia.fila ||
    {};

  const validacoes = {
    servidorHttp200:
      respostaServidor.codigoHttp === 200,

    servidorStatusOK:
      respostaServidor.status === "OK",

    contratoVersao1:
      respostaServidor.versaoContrato ===
      "1.0",

    servidorRetornou14:
      ocorrenciasServidor.length ===
      totalEsperado,

    servidorSemDuplicidades:
      idsServidorDuplicados.length === 0,

    indexedDBPossui14DaObra:
      ocorrenciasDaObra.length ===
      totalEsperado,

    nenhumRegistroLocalSemId:
      registrosLocaisSemId.length === 0,

    nenhumaDuplicidadeLocal:
      duplicadosLocais.length === 0,

    nenhumaOcorrenciaAusente:
      ausentesLocalmente.length === 0,

    nenhumaMisturaDeObras:
      misturaDeObras.length === 0,

    todosStatusSyncCorretos:
      statusSyncIncorreto.length === 0,

    todasOrigensCorretas:
      origemIncorreta.length === 0,

    todasPossuemDataSync:
      dataSyncAusente.length === 0,

    camposServidorLocalCoerentes:
      divergenciasCampos.length === 0,

    nenhumaOcorrenciaExtraSemPendencia:
      extrasSemPendencia.length === 0,

    nenhumaPendenciaAtivaOcorrencias:
      informacoesPendencias
        .pendenciasAtivasReconhecidas ===
      0,

    filaPossui45Registros:
      filaAntes.length ===
      totalFilaEsperado,

    filaPermaneceuCom45Registros:
      estadoDepois.fila.length ===
      totalFilaEsperado,

    filaNaoFoiAlterada:
      assinaturaFilaAntes ===
      assinaturaFilaDepois,

    idempotenciaRecebeu14:
      resumoIdempotencia.recebidas ===
      totalEsperado,

    idempotenciaInseriuZero:
      resumoIdempotencia.inseridas ===
      0,

    idempotenciaAtualizaria14:
      resumoIdempotencia.atualizadas ===
      totalEsperado,

    idempotenciaSemUpsertProtegido:
      resumoIdempotencia
        .preservadasPorUpsertPendente ===
      0,

    idempotenciaSemDeleteBloqueado:
      resumoIdempotencia
        .bloqueadasPorDeletePendente ===
      0,

    idempotenciaSemPendenciaDesconhecida:
      resumoIdempotencia
        .preservadasPorPendenciaDesconhecida ===
      0,

    idempotenciaSemRegistroInvalido:
      resumoIdempotencia
        .rejeitadasInvalidas ===
      0,

    idempotenciaSemOutraObra:
      resumoIdempotencia
        .rejeitadasOutraObra ===
      0,

    idempotenciaSemDuplicidadeServidor:
      resumoIdempotencia
        .duplicadasNoServidor ===
      0,

    idempotenciaSemDuplicidadeLocal:
      resumoIdempotencia
        .duplicadasLocalmente ===
      0,

    idempotenciaSemConflitos:
      resultadoIdempotencia
        .totalConflitosEvitados ===
      0,

    idempotenciaPreservouFila:
      filaIdempotencia
        .preservadaIntegralmente ===
      true,

    idempotenciaNaoAlterouFila:
      filaIdempotencia
        .alteracoesRealizadas ===
      0,

    simulacaoNaoAlterouQuantidadeLocal:
      ocorrenciasDepoisDaObra.length ===
      ocorrenciasDaObra.length
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(
      function (valor) {
        return valor === true;
      }
    );


  /*
   * ==========================================================
   * 10. RESULTADO
   * ==========================================================
   */

  const resultado = {
    etapa:
      "UX.19.6.6",

    auditoria:
      "MESCLAGEM_OCORRENCIAS_INDEXEDDB",

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    idObra:
      idObraEsperado,

    periodoDias:
      periodoEsperado,

    servidor: {
      ocorrencias:
        ocorrenciasServidor.length,

      duplicados:
        idsServidorDuplicados.length
    },

    indexedDB: {
      totalGeralAntes:
        ocorrenciasLocais.length,

      ocorrenciasDaObraAntes:
        ocorrenciasDaObra.length,

      ocorrenciasDaObraDepois:
        ocorrenciasDepoisDaObra.length,

      registrosSemId:
        registrosLocaisSemId.length,

      duplicados:
        duplicadosLocais.length,

      ausentes:
        ausentesLocalmente.length,

      misturaDeObras:
        misturaDeObras.length,

      statusSyncIncorreto:
        statusSyncIncorreto.length,

      origemIncorreta:
        origemIncorreta.length,

      dataSyncAusente:
        dataSyncAusente.length,

      divergenciasCampos:
        divergenciasCampos.length,

      extrasSemPendencia:
        extrasSemPendencia.length,

      extrasComPendencia:
        extrasComPendencia.length
    },

    fila: {
      registrosAntes:
        filaAntes.length,

      registrosDepois:
        estadoDepois.fila.length,

      pendenciasAtivasOcorrencias:
        informacoesPendencias
          .pendenciasAtivasReconhecidas,

      assinaturaPreservada:
        assinaturaFilaAntes ===
        assinaturaFilaDepois
    },

    idempotencia: {
      modo:
        resultadoIdempotencia.modo,

      recebidas:
        resumoIdempotencia.recebidas,

      inseridas:
        resumoIdempotencia.inseridas,

      atualizadas:
        resumoIdempotencia.atualizadas,

      preservadasPorUpsertPendente:
        resumoIdempotencia
          .preservadasPorUpsertPendente,

      bloqueadasPorDeletePendente:
        resumoIdempotencia
          .bloqueadasPorDeletePendente,

      preservadasPorPendenciaDesconhecida:
        resumoIdempotencia
          .preservadasPorPendenciaDesconhecida,

      conflitos:
        resultadoIdempotencia
          .totalConflitosEvitados,

      filaPreservada:
        filaIdempotencia
          .preservadaIntegralmente,

      alteracoesNaFila:
        filaIdempotencia
          .alteracoesRealizadas
    },

    problemas: {
      idsServidorDuplicados,
      registrosLocaisSemId,
      duplicadosLocais,
      ausentesLocalmente,
      misturaDeObras,
      statusSyncIncorreto,
      origemIncorreta,
      dataSyncAusente,
      divergenciasCampos,
      extrasSemPendencia,
      extrasComPendencia
    },

    validacoes,

    primeiraOcorrenciaLocal:
      ocorrenciasDaObra.length
        ? ocorrenciasDaObra[0]
        : null,

    aprovado
  };

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.6.6 REPROVADA. " +
      "Consulte as validações e os problemas no console."
    );
  }

  console.log(
    "UX.19.6.6 — AUDITORIA DA MESCLAGEM DE OCORRÊNCIAS APROVADA."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.7.6 — AUDITORIA DA MESCLAGEM DE CLIMA
 * ============================================================
 *
 * Esta auditoria:
 *
 * - consulta novamente o servidor;
 * - compara o servidor com TB_CLIMA;
 * - executa uma nova mesclagem apenas em modo SIMULAÇÃO;
 * - confirma a idempotência;
 * - confirma que TB_CLIMA não foi modificada;
 * - confirma que TB_SYNC_QUEUE não foi modificada.
 */


/**
 * Normaliza valores funcionais para comparação.
 */
function normalizarValorAuditoriaClimaUX1976_(
  valor
) {
  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  ).trim();
}


/**
 * Compara os campos funcionais do servidor
 * com o registro gravado no IndexedDB.
 */
function compararRegistroClimaUX1976_(
  registroServidor,
  registroLocal
) {
  const camposFuncionais = [
    "idClima",
    "data",
    "idObra",
    "periodo",
    "condicaoClimatica",
    "intensidade",
    "impactoExecucao",
    "atividadeAfetada",
    "observacao",
    "statusClima"
  ];

  const divergencias = [];

  camposFuncionais.forEach(
    function (campo) {
      const valorServidor =
        normalizarValorAuditoriaClimaUX1976_(
          registroServidor?.[campo]
        );

      const valorLocal =
        normalizarValorAuditoriaClimaUX1976_(
          registroLocal?.[campo]
        );

      if (
        valorServidor !==
        valorLocal
      ) {
        divergencias.push({
          campo:
            campo,

          servidor:
            valorServidor,

          local:
            valorLocal
        });
      }
    }
  );

  return divergencias;
}


/**
 * Detecta IDs repetidos em uma coleção.
 */
function localizarDuplicidadesClimaUX1976_(
  registros
) {
  const contagem =
    new Map();

  const duplicados =
    [];

  (
    Array.isArray(registros)
      ? registros
      : []
  ).forEach(
    function (registro) {
      const idClima =
        normalizarValorAuditoriaClimaUX1976_(
          registro?.idClima
        );

      if (!idClima) {
        return;
      }

      contagem.set(
        idClima,
        Number(
          contagem.get(idClima) || 0
        ) + 1
      );
    }
  );

  contagem.forEach(
    function (quantidade, idClima) {
      if (
        quantidade > 1
      ) {
        duplicados.push({
          idClima:
            idClima,

          quantidade:
            quantidade
        });
      }
    }
  );

  return duplicados;
}


/**
 * ============================================================
 * AUDITORIA PRINCIPAL
 * ============================================================
 */
async function auditarMesclagemClimaUX1976_() {
  console.log(
    "[UX.19.7.6] Iniciando auditoria da mesclagem de Clima..."
  );

  const idObraEsperado =
    "OBR002";

  const periodoEsperado =
    30;

  const totalEsperado =
    8;

  const totalFilaEsperado =
    45;


  /*
   * ==========================================================
   * DEPENDÊNCIAS
   * ==========================================================
   */

  if (
    typeof obterClimasOperacionaisObraMobile_ !==
    "function"
  ) {
    throw new Error(
      "O cliente Mobile de Clima da UX.19.7.4 não foi encontrado."
    );
  }

  if (
    typeof mesclarClimasReidratacaoSIGO_ !==
    "function"
  ) {
    throw new Error(
      "A mesclagem protegida da UX.19.7.5 não foi encontrada."
    );
  }

  if (
    typeof listarRegistrosSIGO !==
    "function"
  ) {
    throw new Error(
      "A função listarRegistrosSIGO não foi encontrada."
    );
  }

  if (
    typeof criarAssinaturaColecaoClimaUX1975_ !==
    "function"
  ) {
    throw new Error(
      "O auxiliar de assinatura da UX.19.7.5 não foi encontrado."
    );
  }


  /*
   * ==========================================================
   * ESTADO ANTES DA AUDITORIA
   * ==========================================================
   */

  const climasAntes =
    await listarRegistrosSIGO(
      "TB_CLIMA"
    );

  const filaAntes =
    await listarRegistrosSIGO(
      "TB_SYNC_QUEUE"
    );

  const assinaturaClimasAntes =
    criarAssinaturaColecaoClimaUX1975_(
      climasAntes,
      "idClima"
    );

  const assinaturaFilaAntes =
    criarAssinaturaColecaoClimaUX1975_(
      filaAntes,
      "idSyncLocal"
    );


  /*
   * ==========================================================
   * CONSULTA AO SERVIDOR
   * ==========================================================
   */

  const pacoteServidor =
    await obterClimasOperacionaisObraMobile_(
      idObraEsperado,
      periodoEsperado
    );

  const climasServidor =
    Array.isArray(
      pacoteServidor.climas
    )
      ? pacoteServidor.climas
      : [];

  const idsServidor =
    new Set(
      climasServidor
        .map(
          function (registro) {
            return normalizarValorAuditoriaClimaUX1976_(
              registro?.idClima
            );
          }
        )
        .filter(Boolean)
    );


  /*
   * ==========================================================
   * REGISTROS LOCAIS DA OBRA
   * ==========================================================
   */

  const climasLocaisObra =
    climasAntes.filter(
      function (registro) {
        return (
          normalizarValorAuditoriaClimaUX1976_(
            registro?.idObra
          ) === idObraEsperado
        );
      }
    );

  const locaisPorId =
    new Map();

  climasLocaisObra.forEach(
    function (registro) {
      const idClima =
        normalizarValorAuditoriaClimaUX1976_(
          registro?.idClima
        );

      if (idClima) {
        locaisPorId.set(
          idClima,
          registro
        );
      }
    }
  );


  /*
   * ==========================================================
   * PROBLEMAS ESTRUTURAIS
   * ==========================================================
   */

  const duplicadosServidor =
    localizarDuplicidadesClimaUX1976_(
      climasServidor
    );

  const duplicadosLocal =
    localizarDuplicidadesClimaUX1976_(
      climasLocaisObra
    );

  const invalidosLocal =
    climasLocaisObra
      .filter(
        function (registro) {
          return (
            !normalizarValorAuditoriaClimaUX1976_(
              registro?.idClima
            ) ||
            !normalizarValorAuditoriaClimaUX1976_(
              registro?.data
            ) ||
            !normalizarValorAuditoriaClimaUX1976_(
              registro?.idObra
            )
          );
        }
      )
      .map(
        function (registro) {
          return {
            idClima:
              normalizarValorAuditoriaClimaUX1976_(
                registro?.idClima
              ) || "SEM_ID",

            data:
              normalizarValorAuditoriaClimaUX1976_(
                registro?.data
              ),

            idObra:
              normalizarValorAuditoriaClimaUX1976_(
                registro?.idObra
              )
          };
        }
      );


  /*
   * ==========================================================
   * FALTANTES E EXTRAS
   * ==========================================================
   */

  const faltantesLocal = [];

  climasServidor.forEach(
    function (registroServidor) {
      const idClima =
        normalizarValorAuditoriaClimaUX1976_(
          registroServidor?.idClima
        );

      if (
        idClima &&
        !locaisPorId.has(idClima)
      ) {
        faltantesLocal.push(
          idClima
        );
      }
    }
  );

  const extrasLocal =
    climasLocaisObra
      .filter(
        function (registroLocal) {
          const idClima =
            normalizarValorAuditoriaClimaUX1976_(
              registroLocal?.idClima
            );

          return (
            idClima &&
            !idsServidor.has(idClima)
          );
        }
      )
      .map(
        function (registroLocal) {
          return registroLocal.idClima;
        }
      );


  /*
   * ==========================================================
   * MISTURA DE OBRAS
   * ==========================================================
   *
   * Procuramos IDs do pacote de OBR002 armazenados
   * localmente com outro idObra.
   *
   * Registros independentes de outras obras não são
   * considerados erro, pois o sistema é multiobras.
   */

  const misturaDeObras =
    climasAntes
      .filter(
        function (registroLocal) {
          const idClima =
            normalizarValorAuditoriaClimaUX1976_(
              registroLocal?.idClima
            );

          const idObra =
            normalizarValorAuditoriaClimaUX1976_(
              registroLocal?.idObra
            );

          return (
            idsServidor.has(idClima) &&
            idObra !== idObraEsperado
          );
        }
      )
      .map(
        function (registroLocal) {
          return {
            idClima:
              registroLocal.idClima,

            idObra:
              registroLocal.idObra
          };
        }
      );


  /*
   * ==========================================================
   * COMPARAÇÃO DOS CAMPOS FUNCIONAIS
   * ==========================================================
   */

  const divergenciasFuncionais = [];

  climasServidor.forEach(
    function (registroServidor) {
      const idClima =
        normalizarValorAuditoriaClimaUX1976_(
          registroServidor?.idClima
        );

      const registroLocal =
        locaisPorId.get(idClima);

      if (!registroLocal) {
        return;
      }

      const divergencias =
        compararRegistroClimaUX1976_(
          registroServidor,
          registroLocal
        );

      if (
        divergencias.length
      ) {
        divergenciasFuncionais.push({
          idClima:
            idClima,

          divergencias:
            divergencias
        });
      }
    }
  );


  /*
   * ==========================================================
   * METADADOS LOCAIS
   * ==========================================================
   */

  const statusSyncIncorreto =
    climasLocaisObra
      .filter(
        function (registro) {
          return (
            normalizarValorAuditoriaClimaUX1976_(
              registro?.statusSync
            ) !== "SINCRONIZADO"
          );
        }
      )
      .map(
        function (registro) {
          return {
            idClima:
              registro.idClima,

            statusSync:
              registro.statusSync
          };
        }
      );

  const origemIncorreta =
    climasLocaisObra
      .filter(
        function (registro) {
          return (
            normalizarValorAuditoriaClimaUX1976_(
              registro?.origemReidratacao
            ) !== "SERVIDOR"
          );
        }
      )
      .map(
        function (registro) {
          return {
            idClima:
              registro.idClima,

            origemReidratacao:
              registro.origemReidratacao
          };
        }
      );

  const dataSyncAusente =
    climasLocaisObra
      .filter(
        function (registro) {
          return !normalizarValorAuditoriaClimaUX1976_(
            registro?.dataSync
          );
        }
      )
      .map(
        function (registro) {
          return registro.idClima;
        }
      );


  /*
   * ==========================================================
   * TESTE DE IDEMPOTÊNCIA
   * ==========================================================
   *
   * A mesma coleção é submetida novamente à mesclagem,
   * exclusivamente em modo SIMULAÇÃO.
   */

  const resultadoIdempotencia =
    await mesclarClimasReidratacaoSIGO_(
      pacoteServidor,
      {
        simular:
          true
      }
    );


  /*
   * ==========================================================
   * ESTADO DEPOIS DA SIMULAÇÃO
   * ==========================================================
   */

  const climasDepois =
    await listarRegistrosSIGO(
      "TB_CLIMA"
    );

  const filaDepois =
    await listarRegistrosSIGO(
      "TB_SYNC_QUEUE"
    );

  const assinaturaClimasDepois =
    criarAssinaturaColecaoClimaUX1975_(
      climasDepois,
      "idClima"
    );

  const assinaturaFilaDepois =
    criarAssinaturaColecaoClimaUX1975_(
      filaDepois,
      "idSyncLocal"
    );


  /*
   * ==========================================================
   * VALIDAÇÕES
   * ==========================================================
   */

  const validacoes = {
    apiHttp200:
      pacoteServidor.codigoHttp === 200,

    apiStatusOK:
      pacoteServidor.status === "OK",

    contratoVersao1:
      pacoteServidor.versaoContrato ===
      "1.0",

    obraCorreta:
      pacoteServidor.idObra ===
      idObraEsperado,

    periodoCorreto:
      pacoteServidor.periodoDias ===
      periodoEsperado,

    servidorRetornou8:
      climasServidor.length ===
      totalEsperado,

    localPossui8DaObra:
      climasLocaisObra.length ===
      totalEsperado,

    nenhumDuplicadoServidor:
      duplicadosServidor.length === 0,

    nenhumDuplicadoLocal:
      duplicadosLocal.length === 0,

    nenhumLocalInvalido:
      invalidosLocal.length === 0,

    nenhumRegistroFaltante:
      faltantesLocal.length === 0,

    nenhumRegistroExtra:
      extrasLocal.length === 0,

    nenhumaMisturaDeObras:
      misturaDeObras.length === 0,

    nenhumCampoFuncionalDivergente:
      divergenciasFuncionais.length ===
      0,

    todosStatusSyncCorretos:
      statusSyncIncorreto.length === 0,

    todasOrigensCorretas:
      origemIncorreta.length === 0,

    todosPossuemDataSync:
      dataSyncAusente.length === 0,

    idempotenciaModoSimulacao:
      resultadoIdempotencia.modo ===
      "SIMULACAO",

    idempotenciaRecebeu8:
      resultadoIdempotencia.climas
        .recebidos === totalEsperado,

    idempotenciaInseririaZero:
      resultadoIdempotencia.climas
        .inseridos === 0,

    idempotenciaAtualizaria8:
      resultadoIdempotencia.climas
        .atualizados === totalEsperado,

    idempotenciaNenhumPreservado:
      resultadoIdempotencia.climas
        .preservados === 0,

    idempotenciaNenhumRejeitado:
      resultadoIdempotencia.climas
        .rejeitados === 0,

    idempotenciaNenhumConflito:
      resultadoIdempotencia
        .totalConflitosEvitados === 0,

    idempotenciaNenhumaGravacao:
      resultadoIdempotencia.climas
        .gravacoesExecutadas === 0,

    tbClimaNaoAlterada:
      assinaturaClimasAntes ===
      assinaturaClimasDepois,

    quantidadeTbClimaPreservada:
      climasAntes.length ===
      climasDepois.length,

    filaPossui45Antes:
      filaAntes.length ===
      totalFilaEsperado,

    filaPossui45Depois:
      filaDepois.length ===
      totalFilaEsperado,

    filaQuantidadePreservada:
      filaAntes.length ===
      filaDepois.length,

    filaConteudoPreservado:
      assinaturaFilaAntes ===
      assinaturaFilaDepois,

    filaConfirmadaPelaMesclagem:
      resultadoIdempotencia.fila
        .preservada === true
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(
      function (valor) {
        return valor === true;
      }
    );


  /*
   * ==========================================================
   * RESULTADO DA AUDITORIA
   * ==========================================================
   */

  const auditoria = {
    etapa:
      "UX.19.7.6",

    auditoria:
      "MESCLAGEM_CLIMA_E_IDEMPOTENCIA",

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    idObra:
      idObraEsperado,

    periodoDias:
      periodoEsperado,

    totais: {
      servidor:
        climasServidor.length,

      localObra:
        climasLocaisObra.length,

      localStoreCompleta:
        climasAntes.length,

      duplicadosServidor:
        duplicadosServidor.length,

      duplicadosLocal:
        duplicadosLocal.length,

      invalidosLocal:
        invalidosLocal.length,

      faltantesLocal:
        faltantesLocal.length,

      extrasLocal:
        extrasLocal.length,

      misturaDeObras:
        misturaDeObras.length,

      divergenciasFuncionais:
        divergenciasFuncionais.length,

      statusSyncIncorreto:
        statusSyncIncorreto.length,

      origemIncorreta:
        origemIncorreta.length,

      dataSyncAusente:
        dataSyncAusente.length
    },

    idempotencia: {
      modo:
        resultadoIdempotencia.modo,

      recebidos:
        resultadoIdempotencia.climas
          .recebidos,

      inseriria:
        resultadoIdempotencia.climas
          .inseridos,

      atualizaria:
        resultadoIdempotencia.climas
          .atualizados,

      preservaria:
        resultadoIdempotencia.climas
          .preservados,

      rejeitaria:
        resultadoIdempotencia.climas
          .rejeitados,

      conflitos:
        resultadoIdempotencia
          .totalConflitosEvitados,

      gravacoesExecutadas:
        resultadoIdempotencia.climas
          .gravacoesExecutadas
    },

    fila: {
      totalAntes:
        filaAntes.length,

      totalDepois:
        filaDepois.length,

      preservada:
        assinaturaFilaAntes ===
        assinaturaFilaDepois,

      confirmadaPelaMesclagem:
        resultadoIdempotencia.fila
          .preservada
    },

    problemas: {
      duplicadosServidor:
        duplicadosServidor,

      duplicadosLocal:
        duplicadosLocal,

      invalidosLocal:
        invalidosLocal,

      faltantesLocal:
        faltantesLocal,

      extrasLocal:
        extrasLocal,

      misturaDeObras:
        misturaDeObras,

      divergenciasFuncionais:
        divergenciasFuncionais,

      statusSyncIncorreto:
        statusSyncIncorreto,

      origemIncorreta:
        origemIncorreta,

      dataSyncAusente:
        dataSyncAusente
    },

    validacoes:
      validacoes,

    primeiroRegistroLocal:
      climasLocaisObra.length
        ? climasLocaisObra[0]
        : null,

    aprovado:
      aprovado
  };

  console.log(
    JSON.stringify(
      auditoria,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.7.6 REPROVADA. Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.7.6 — AUDITORIA DA MESCLAGEM DE CLIMA APROVADA."
  );

  return {
    auditoria:
      auditoria,

    pacoteServidor:
      pacoteServidor,

    idempotencia:
      resultadoIdempotencia
  };
}

/**
 * ============================================================
 * UX.19.7.7 — INTEGRAÇÃO VISUAL DE CLIMA
 * ============================================================
 *
 * Entidades consolidadas:
 *
 * - TB_DIARIOS;
 * - TB_DIARIO_ITENS;
 * - TB_OCORRENCIAS;
 * - TB_CLIMA.
 */


/**
 * Converte valores em número seguro.
 */
function numeroSeguroReidratacaoUX1977_(
  valor
) {
  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
}


/**
 * Escapa conteúdo utilizado no HTML.
 */
function escaparHtmlReidratacaoUX1977_(
  valor
) {
  if (
    typeof escaparHtmlUX1958_ ===
    "function"
  ) {
    return escaparHtmlUX1958_(
      valor
    );
  }

  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/**
 * Soma as diferentes categorias de proteção
 * usadas pelas mesclagens.
 */
function calcularPreservadosEntidadeUX1977_(
  resumo
) {
  const origem =
    resumo &&
    typeof resumo === "object"
      ? resumo
      : {};

  if (
    Object.prototype.hasOwnProperty.call(
      origem,
      "preservados"
    )
  ) {
    return numeroSeguroReidratacaoUX1977_(
      origem.preservados
    );
  }

  return (
    numeroSeguroReidratacaoUX1977_(
      origem.preservadosUpsert
    ) +
    numeroSeguroReidratacaoUX1977_(
      origem.preservadosDelete
    ) +
    numeroSeguroReidratacaoUX1977_(
      origem.preservadosStatusLocal
    ) +
    numeroSeguroReidratacaoUX1977_(
      origem.preservadosFilaDesconhecida
    )
  );
}


/**
 * Normaliza o resumo de uma entidade.
 */
function normalizarResumoEntidadeUX1977_(
  resultado,
  chave
) {
  const origem =
    resultado &&
    resultado[chave] &&
    typeof resultado[chave] === "object"
      ? resultado[chave]
      : {};

  return {
    recebidos:
      numeroSeguroReidratacaoUX1977_(
        origem.recebidos
      ),

    inseridos:
      numeroSeguroReidratacaoUX1977_(
        origem.inseridos
      ),

    atualizados:
      numeroSeguroReidratacaoUX1977_(
        origem.atualizados
      ),

    preservados:
      calcularPreservadosEntidadeUX1977_(
        origem
      ),

    rejeitados:
      numeroSeguroReidratacaoUX1977_(
        origem.rejeitados
      ),

    gravacoesExecutadas:
      numeroSeguroReidratacaoUX1977_(
        origem.gravacoesExecutadas
      )
  };
}


/**
 * Obtém a quantidade da fila em diferentes
 * contratos já utilizados pelo SIGO.
 */
function obterTotalFilaResultadoUX1977_(
  resultado
) {
  const fila =
    resultado &&
    resultado.fila &&
    typeof resultado.fila === "object"
      ? resultado.fila
      : {};

  const candidatos = [
    fila.totalDepois,
    fila.totalRegistros,
    fila.totalAntes
  ];

  for (
    const valor of candidatos
  ) {
    const numero =
      Number(valor);

    if (
      Number.isFinite(numero)
    ) {
      return numero;
    }
  }

  return 0;
}


/**
 * Consolida as três mesclagens em um único
 * resultado para a interface.
 */
function consolidarResultadosReidratacaoUX1977_(
  resultadoDados,
  resultadoOcorrencias,
  resultadoClimas
) {
  const diarios =
    normalizarResumoEntidadeUX1977_(
      resultadoDados,
      "diarios"
    );

  const diarioItens =
    normalizarResumoEntidadeUX1977_(
      resultadoDados,
      "diarioItens"
    );

  const ocorrenciasBase =
    typeof normalizarResumoOcorrenciasUX1967_ ===
      "function"
      ? normalizarResumoOcorrenciasUX1967_(
          resultadoOcorrencias
        )
      : normalizarResumoEntidadeUX1977_(
          resultadoOcorrencias,
          "ocorrencias"
        );
  
  const ocorrencias = {
    recebidos:
      numeroSeguroReidratacaoUX1977_(
        ocorrenciasBase.recebidos
      ),
  
    inseridos:
      numeroSeguroReidratacaoUX1977_(
        ocorrenciasBase.inseridos
      ),
  
    atualizados:
      numeroSeguroReidratacaoUX1977_(
        ocorrenciasBase.atualizados
      ),
  
    preservados:
      numeroSeguroReidratacaoUX1977_(
        ocorrenciasBase.preservados
      ),
  
    rejeitados:
      numeroSeguroReidratacaoUX1977_(
        ocorrenciasBase.rejeitados
      ),
  
    gravacoesExecutadas:
      numeroSeguroReidratacaoUX1977_(
        ocorrenciasBase.gravacoesExecutadas
      )
  };
  const climas =
    normalizarResumoEntidadeUX1977_(
      resultadoClimas,
      "climas"
    );

  const resultados = [
    resultadoDados,
    resultadoOcorrencias,
    resultadoClimas
  ];

  const totaisFila =
    resultados
      .map(
        obterTotalFilaResultadoUX1977_
      )
      .filter(
        function (total) {
          return total > 0;
        }
      );

  const filasComValidacao =
    resultados
      .map(
        function (resultado) {
          return resultado?.fila;
        }
      )
      .filter(
        function (fila) {
          return (
            fila &&
            typeof fila === "object" &&
            typeof fila.preservada ===
              "boolean"
          );
        }
      );

  const totalConflitos =
    resultados.reduce(
      function (
        total,
        resultado
      ) {
        return (
          total +
          numeroSeguroReidratacaoUX1977_(
            resultado
              ?.totalConflitosEvitados
          )
        );
      },
      0
    );

  const entidades = [
    diarios,
    diarioItens,
    ocorrencias,
    climas
  ];

  const totais = entidades.reduce(
    function (
      acumulado,
      entidade
    ) {
      acumulado.recebidos +=
        entidade.recebidos;

      acumulado.inseridos +=
        entidade.inseridos;

      acumulado.atualizados +=
        entidade.atualizados;

      acumulado.preservados +=
        entidade.preservados;

      acumulado.rejeitados +=
        entidade.rejeitados;

      acumulado.gravacoesExecutadas +=
        entidade.gravacoesExecutadas;

      return acumulado;
    },
    {
      recebidos:
        0,

      inseridos:
        0,

      atualizados:
        0,

      preservados:
        0,

      rejeitados:
        0,

      gravacoesExecutadas:
        0
    }
  );

  totais.conflitos =
    totalConflitos;

  return {
    etapa:
      "UX.19.7.7",

    operacao:
      "REIDRATACAO_VISUAL_CONSOLIDADA",

    modo:
      String(
        resultadoClimas?.modo ||
        resultadoOcorrencias?.modo ||
        resultadoDados?.modo ||
        ""
      ),

    idObra:
      String(
        resultadoClimas?.idObra ||
        resultadoOcorrencias?.idObra ||
        resultadoDados?.idObra ||
        ""
      ),

    periodoDias:
      Number(
        resultadoClimas?.periodoDias ||
        resultadoOcorrencias?.periodoDias ||
        resultadoDados?.periodoDias ||
        0
      ),

    diarios:
      diarios,

    diarioItens:
      diarioItens,

    ocorrencias:
      ocorrencias,

    climas:
      climas,

    totais:
      totais,

    totalConflitosEvitados:
      totalConflitos,

    fila: {
      totalRegistros:
        totaisFila.length
          ? Math.max(
              ...totaisFila
            )
          : 0,

      preservada:
        filasComValidacao.length
          ? filasComValidacao.every(
              function (fila) {
                return (
                  fila.preservada ===
                  true
                );
              }
            )
          : true
    },

    executadoEm:
      resultadoClimas?.executadoEm ||
      resultadoOcorrencias?.executadoEm ||
      resultadoDados?.executadoEm ||
      new Date().toISOString(),

    resultados: {
      dadosOperacionais:
        resultadoDados,

      ocorrencias:
        resultadoOcorrencias,

      climas:
        resultadoClimas
    }
  };
}


/**
 * ============================================================
 * CARD DA REIDRATAÇÃO
 * ============================================================
 */
async function instalarAcaoReidratacaoUX1958_() {
  const area =
    document.getElementById(
      "telaApp"
    );

  if (!area) {
    return;
  }

  let card =
    document.getElementById(
      "cardReidratacaoUX1958"
    );

  if (!card) {
    card =
      document.createElement(
        "section"
      );

    card.id =
      "cardReidratacaoUX1958";

    card.className =
      "sigo-reidratacao-card";

    area.appendChild(
      card
    );
  }

  card.innerHTML = `
    <div class="sigo-reidratacao-card__conteudo">
      <h3 class="sigo-reidratacao-card__titulo">
        Atualizar histórico da obra
      </h3>

      <p class="sigo-reidratacao-card__texto">
        Recupere Diários, itens, ocorrências e registros
        de Clima sincronizados em outros dispositivos.
      </p>

      <span
        id="metaReidratacaoUX1958"
        class="sigo-reidratacao-card__meta"
      >
        Verificando última atualização...
      </span>
    </div>

    <button
      class="sigo-reidratacao-card__botao"
      type="button"
      onclick="abrirReidratacaoUX1958_()"
    >
      Atualizar dados
    </button>
  `;

  garantirModalReidratacaoUX1958_();

  await atualizarCardReidratacaoUX1958_();
}


/**
 * ============================================================
 * PRÉ-VISUALIZAÇÃO
 * ============================================================
 */
async function prepararReidratacaoInterfaceUX1958_() {
  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  if (
    !estado ||
    estado.emAndamento
  ) {
    return;
  }

  if (!navigator.onLine) {
    definirStatusReidratacaoUX1958_(
      "A reidratação precisa de conexão com a internet.",
      "error"
    );

    return;
  }

  try {
    estado.emAndamento =
      true;

    bloquearInterfaceReidratacaoUX1958_(
      true
    );

    const obraAtual =
      await resolverObraAtivaUX1958_();

    const periodo =
      Number(
        document.getElementById(
          "periodoReidratacaoUX1958"
        ).value
      );

    estado.idObra =
      obraAtual.idObra;

    estado.nomeObra =
      obraAtual.nomeObra;

    estado.periodoDias =
      periodo;

    definirStatusReidratacaoUX1958_(
      "Consultando Diários, ocorrências e Clima no servidor...",
      "loading"
    );


    /*
     * ========================================================
     * CONSULTA DOS TRÊS PACOTES
     * ========================================================
     */

    const [
      pacoteDados,
      pacoteOcorrencias,
      pacoteClimas
    ] = await Promise.all([
      obterDadosOperacionaisObraMobile_(
        estado.idObra,
        periodo
      ),

      obterOcorrenciasOperacionaisObraMobile_(
        estado.idObra,
        periodo
      ),

      obterClimasOperacionaisObraMobile_(
        estado.idObra,
        periodo
      )
    ]);


    definirStatusReidratacaoUX1958_(
      "Analisando os dados locais e protegendo pendências...",
      "loading"
    );


    /*
     * ========================================================
     * SIMULAÇÕES — NENHUMA GRAVAÇÃO
     * ========================================================
     */

    const [
      simulacaoDados,
      simulacaoOcorrencias,
      simulacaoClimas
    ] = await Promise.all([
      mesclarDadosOperacionaisReidratacaoSIGO_(
        pacoteDados,
        {
          simular:
            true
        }
      ),

      mesclarOcorrenciasReidratacaoSIGO_(
        pacoteOcorrencias,
        {
          simular:
            true
        }
      ),

      mesclarClimasReidratacaoSIGO_(
        pacoteClimas,
        {
          simular:
            true
        }
      )
    ]);

    const simulacaoConsolidada =
      consolidarResultadosReidratacaoUX1977_(
        simulacaoDados,
        simulacaoOcorrencias,
        simulacaoClimas
      );


    /*
     * O estado armazena os três pacotes para que
     * a confirmação utilize exatamente os dados
     * que foram pré-visualizados.
     */
    estado.pacote = {
      dadosOperacionais:
        pacoteDados,

      ocorrencias:
        pacoteOcorrencias,

      climas:
        pacoteClimas
    };

    estado.simulacao =
      simulacaoConsolidada;

    estado.criadoEm =
      Date.now();

    renderizarSimulacaoUX1958_(
      simulacaoConsolidada
    );

    definirStatusReidratacaoUX1958_(
      "Pré-visualização concluída. Confirme para gravar no dispositivo.",
      "success"
    );

    document.getElementById(
      "confirmarReidratacaoUX1958"
    ).disabled = false;

  } catch (erro) {
    estado.pacote =
      null;

    estado.simulacao =
      null;

    definirStatusReidratacaoUX1958_(
      erro?.message ||
      "Não foi possível preparar a reidratação.",
      "error"
    );

  } finally {
    estado.emAndamento =
      false;

    bloquearInterfaceReidratacaoUX1958_(
      false
    );

    document.getElementById(
      "confirmarReidratacaoUX1958"
    ).disabled =
      !estado.pacote;
  }
}


/**
 * ============================================================
 * CONFIRMAÇÃO REAL
 * ============================================================
 */
async function confirmarReidratacaoInterfaceUX1958_() {
  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  if (
    !estado ||
    estado.emAndamento ||
    !estado.pacote
  ) {
    return;
  }

  try {
    estado.emAndamento =
      true;

    bloquearInterfaceReidratacaoUX1958_(
      true
    );


    /*
     * A pré-visualização expira após cinco minutos.
     */
    if (
      Date.now() -
        estado.criadoEm >
      5 * 60 * 1000
    ) {
      throw new Error(
        "A pré-visualização expirou. Faça uma nova consulta."
      );
    }

    const obraAtual =
      await resolverObraAtivaUX1958_();

    if (
      obraAtual.idObra !==
      estado.idObra
    ) {
      throw new Error(
        "A obra ativa foi alterada. Faça uma nova pré-visualização."
      );
    }

    const pacotes =
      estado.pacote;

    if (
      !pacotes.dadosOperacionais ||
      !pacotes.ocorrencias ||
      !pacotes.climas
    ) {
      throw new Error(
        "A pré-visualização não possui todos os pacotes necessários."
      );
    }

    definirStatusReidratacaoUX1958_(
      "Gravando Diários, itens, ocorrências e Clima com proteção local...",
      "loading"
    );


    /*
     * As operações são executadas sequencialmente.
     *
     * Cada entidade possui mesclagem idempotente
     * e preserva TB_SYNC_QUEUE.
     */

    const resultadoDados =
      await mesclarDadosOperacionaisReidratacaoSIGO_(
        pacotes.dadosOperacionais,
        {
          simular:
            false
        }
      );

    const resultadoOcorrencias =
      await mesclarOcorrenciasReidratacaoSIGO_(
        pacotes.ocorrencias,
        {
          simular:
            false
        }
      );

    const resultadoClimas =
      await mesclarClimasReidratacaoSIGO_(
        pacotes.climas,
        {
          simular:
            false
        }
      );

    const resultadoConsolidado =
      consolidarResultadosReidratacaoUX1977_(
        resultadoDados,
        resultadoOcorrencias,
        resultadoClimas
      );


    /*
     * ========================================================
     * METADADOS DA ÚLTIMA ATUALIZAÇÃO
     * ========================================================
     */

    const meta = {
      idObra:
        estado.idObra,

      nomeObra:
        estado.nomeObra,

      periodoDias:
        estado.periodoDias,

      diarios:
        resultadoConsolidado
          .diarios
          .recebidos,

      diarioItens:
        resultadoConsolidado
          .diarioItens
          .recebidos,

      ocorrencias:
        resultadoConsolidado
          .ocorrencias
          .recebidos,

      climas:
        resultadoConsolidado
          .climas
          .recebidos,

      recebidos:
        resultadoConsolidado
          .totais
          .recebidos,

      inseridos:
        resultadoConsolidado
          .totais
          .inseridos,

      atualizados:
        resultadoConsolidado
          .totais
          .atualizados,

      preservados:
        resultadoConsolidado
          .totais
          .preservados,

      conflitosEvitados:
        resultadoConsolidado
          .totalConflitosEvitados,

      dataAtualizacao:
        resultadoConsolidado
          .executadoEm
    };

    salvarMetaReidratacaoUX1958_(
      estado.idObra,
      meta
    );


    /*
     * ========================================================
     * INTERFACE
     * ========================================================
     */

    renderizarResultadoReidratacaoUX1958_(
      resultadoConsolidado
    );

    definirStatusReidratacaoUX1958_(
      "Diários, itens, ocorrências e Clima atualizados com sucesso.",
      "success"
    );


    /*
     * ========================================================
     * NOTIFICAÇÃO
     * ========================================================
     */

    if (
      typeof criarNotificacaoSIGO_ ===
      "function"
    ) {
      try {
        await criarNotificacaoSIGO_({
          idObra:
            estado.idObra,

          categoria:
            "SISTEMA",

          tipo:
            "REIDRATACAO",

          titulo:
            "Obra atualizada",

          mensagem:
            resultadoConsolidado
              .diarios
              .recebidos +
            " Diários, " +
            resultadoConsolidado
              .diarioItens
              .recebidos +
            " itens, " +
            resultadoConsolidado
              .ocorrencias
              .recebidos +
            " ocorrências e " +
            resultadoConsolidado
              .climas
              .recebidos +
            " registros de Clima recuperados.",

          icone:
            "🔄"
        });

      } catch (
        erroNotificacao
      ) {
        console.warn(
          "[UX.19.7.7] Notificação não criada:",
          erroNotificacao
        );
      }
    }


    /*
     * ========================================================
     * ATUALIZAÇÕES VISUAIS
     * ========================================================
     */

    await atualizarCardReidratacaoUX1958_();

    const funcoesAtualizacao = [
      "listarDiariosOffline_",
      "listarOcorrenciasOffline_",
      "listarClimasOffline_",
      "atualizarHomeMobile_",
      "atualizarPainelSaudeSync_",
      "atualizarBadgeNotificacoes_"
    ];

    for (
      const nomeFuncao of
      funcoesAtualizacao
    ) {
      if (
        typeof window[nomeFuncao] ===
        "function"
      ) {
        try {
          await window[
            nomeFuncao
          ]();

        } catch (
          erroAtualizacao
        ) {
          console.warn(
            "[UX.19.7.7] Atualização visual ignorada:",
            nomeFuncao,
            erroAtualizacao
          );
        }
      }
    }

    estado.pacote =
      null;

    estado.simulacao =
      null;

  } catch (erro) {
    definirStatusReidratacaoUX1958_(
      erro?.message ||
      "A reidratação não pôde ser concluída.",
      "error"
    );

  } finally {
    estado.emAndamento =
      false;

    bloquearInterfaceReidratacaoUX1958_(
      false
    );

    document.getElementById(
      "confirmarReidratacaoUX1958"
    ).disabled = true;
  }
}


/**
 * ============================================================
 * RENDERIZAÇÃO DA SIMULAÇÃO
 * ============================================================
 */
function renderizarSimulacaoUX1958_(
  resultado
) {
  const elemento =
    document.getElementById(
      "resumoReidratacaoUX1958"
    );

  if (!elemento) {
    return;
  }

  const totais =
    resultado.totais || {};

  elemento.innerHTML = `
    <h3 class="sigo-reidratacao-resumo__titulo">
      Pré-visualização segura
    </h3>

    <div class="sigo-reidratacao-grid">
      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            totais.recebidos
          )}
        </strong>
        <span>Registros recebidos</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            totais.inseridos
          )}
        </strong>
        <span>Novos registros</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            totais.atualizados
          )}
        </strong>
        <span>Registros atualizados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            totais.preservados
          )}
        </strong>
        <span>Registros locais protegidos</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.diarios.recebidos}
        </strong>
        <span>Diários recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.diarioItens.recebidos}
        </strong>
        <span>Itens recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.ocorrencias.recebidos}
        </strong>
        <span>Ocorrências recuperadas</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.climas.recebidos}
        </strong>
        <span>Registros de Clima</span>
      </div>
    </div>

    <p class="sigo-reidratacao-observacao">
      Conflitos evitados:
      <strong>
        ${numeroSeguroReidratacaoUX1977_(
          resultado.totalConflitosEvitados
        )}
      </strong>.

      A fila de sincronização possui
      <strong>
        ${numeroSeguroReidratacaoUX1977_(
          resultado.fila.totalRegistros
        )}
      </strong>
      registros e será preservada.
    </p>
  `;

  elemento.classList.add(
    "is-visible"
  );
}


/**
 * ============================================================
 * RENDERIZAÇÃO DO RESULTADO REAL
 * ============================================================
 */
function renderizarResultadoReidratacaoUX1958_(
  resultado
) {
  const elemento =
    document.getElementById(
      "resumoReidratacaoUX1958"
    );

  if (!elemento) {
    return;
  }

  const totais =
    resultado.totais || {};

  elemento.innerHTML = `
    <h3 class="sigo-reidratacao-resumo__titulo">
      Atualização concluída
    </h3>

    <div class="sigo-reidratacao-grid">
      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.diarios.recebidos}
        </strong>
        <span>Diários recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.diarioItens.recebidos}
        </strong>
        <span>Itens recuperados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.ocorrencias.recebidos}
        </strong>
        <span>Ocorrências recuperadas</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${resultado.climas.recebidos}
        </strong>
        <span>Registros de Clima</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            totais.inseridos
          )}
        </strong>
        <span>Novos registros</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            totais.atualizados
          )}
        </strong>
        <span>Registros atualizados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            totais.preservados
          )}
        </strong>
        <span>Registros preservados</span>
      </div>

      <div class="sigo-reidratacao-kpi">
        <strong>
          ${numeroSeguroReidratacaoUX1977_(
            resultado.totalConflitosEvitados
          )}
        </strong>
        <span>Conflitos evitados</span>
      </div>
    </div>

    <p class="sigo-reidratacao-observacao">
      Foram processados
      <strong>
        ${numeroSeguroReidratacaoUX1977_(
          totais.recebidos
        )}
      </strong>
      registros.

      Atualizado em
      <strong>
        ${escaparHtmlReidratacaoUX1977_(
          formatarDataHoraUX1958_(
            resultado.executadoEm
          )
        )}
      </strong>.

      A TB_SYNC_QUEUE foi preservada integralmente.
    </p>
  `;

  elemento.classList.add(
    "is-visible"
  );
}


/**
 * ============================================================
 * TESTE DA INTEGRAÇÃO VISUAL
 * ============================================================
 *
 * Executa somente a pré-visualização.
 *
 * Não grava nas stores operacionais.
 */
async function testarIntegracaoVisualReidratacaoUX1977_() {
  console.log(
    "[UX.19.7.7] Iniciando teste da integração visual de Clima..."
  );

  const filaAntes =
    await listarRegistrosSIGO(
      "TB_SYNC_QUEUE"
    );

  const assinaturaFilaAntes =
    typeof criarAssinaturaColecaoClimaUX1975_ ===
      "function"
      ? criarAssinaturaColecaoClimaUX1975_(
          filaAntes,
          "idSyncLocal"
        )
      : JSON.stringify(
          filaAntes
        );

  await instalarAcaoReidratacaoUX1958_();

  await abrirReidratacaoUX1958_();

  const seletor =
    document.getElementById(
      "periodoReidratacaoUX1958"
    );

  seletor.value =
    "30";

  await prepararReidratacaoInterfaceUX1958_();

  const estado =
    window.SIGO_REIDRATACAO_UX1958;

  const simulacao =
    estado?.simulacao || {};

  const filaDepois =
    await listarRegistrosSIGO(
      "TB_SYNC_QUEUE"
    );

  const assinaturaFilaDepois =
    typeof criarAssinaturaColecaoClimaUX1975_ ===
      "function"
      ? criarAssinaturaColecaoClimaUX1975_(
          filaDepois,
          "idSyncLocal"
        )
      : JSON.stringify(
          filaDepois
        );

  const confirmar =
    document.getElementById(
      "confirmarReidratacaoUX1958"
    );

  const resumo =
    document.getElementById(
      "resumoReidratacaoUX1958"
    );

  const validacoes = {
    possuiPacoteDadosOperacionais:
      Boolean(
        estado?.pacote
          ?.dadosOperacionais
      ),

    possuiPacoteOcorrencias:
      Boolean(
        estado?.pacote
          ?.ocorrencias
      ),

    possuiPacoteClimas:
      Boolean(
        estado?.pacote
          ?.climas
      ),

    simulacaoConsolidada:
      simulacao.etapa ===
      "UX.19.7.7",

    modoSimulacao:
      simulacao.modo ===
      "SIMULACAO",

    recebeu36Diarios:
      simulacao.diarios
        ?.recebidos === 36,

    recebeu6Itens:
      simulacao.diarioItens
        ?.recebidos === 6,

    recebeu14Ocorrencias:
      simulacao.ocorrencias
        ?.recebidos === 14,

    recebeu8Climas:
      simulacao.climas
        ?.recebidos === 8,

    recebeu64Registros:
      simulacao.totais
        ?.recebidos === 64,

    inseririaZero:
      simulacao.totais
        ?.inseridos === 0,

    atualizaria64:
      simulacao.totais
        ?.atualizados === 64,

    nenhumProtegido:
      simulacao.totais
        ?.preservados === 0,

    nenhumConflito:
      simulacao
        .totalConflitosEvitados === 0,

    filaPossui45:
      filaDepois.length === 45,

    filaPreservada:
      filaAntes.length ===
        filaDepois.length &&
      assinaturaFilaAntes ===
        assinaturaFilaDepois,

    filaConfirmadaPelosResultados:
      simulacao.fila
        ?.preservada === true,

    confirmacaoHabilitada:
      Boolean(
        confirmar &&
        confirmar.disabled === false
      ),

    resumoMostraClima:
      Boolean(
        resumo &&
        /Clima/i.test(
          resumo.textContent
        )
      )
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(
      function (valor) {
        return valor === true;
      }
    );

  const resultado = {
    etapa:
      "UX.19.7.7",

    teste:
      "INTEGRACAO_VISUAL_CLIMA",

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    idObra:
      estado?.idObra || "",

    periodoDias:
      estado?.periodoDias || 0,

    totais: {
      diarios:
        simulacao.diarios
          ?.recebidos || 0,

      itens:
        simulacao.diarioItens
          ?.recebidos || 0,

      ocorrencias:
        simulacao.ocorrencias
          ?.recebidos || 0,

      climas:
        simulacao.climas
          ?.recebidos || 0,

      recebidos:
        simulacao.totais
          ?.recebidos || 0,

      inseridos:
        simulacao.totais
          ?.inseridos || 0,

      atualizados:
        simulacao.totais
          ?.atualizados || 0,

      preservados:
        simulacao.totais
          ?.preservados || 0,

      conflitos:
        simulacao
          .totalConflitosEvitados || 0
    },

    fila: {
      totalRegistros:
        filaDepois.length,

      preservada:
        assinaturaFilaAntes ===
        assinaturaFilaDepois
    },

    validacoes:
      validacoes,

    aprovado:
      aprovado
  };

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.7.7 REPROVADA. Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.7.7 — INTEGRAÇÃO VISUAL DE CLIMA APROVADA."
  );

  return resultado;
}

/**
 * ============================================================
 * UX.19.8.4 — CLIENTE MOBILE DA API DE EVIDÊNCIAS
 * ============================================================
 *
 * Ação:
 * OBTER_EVIDENCIAS_OPERACIONAIS_OBRA
 *
 * Nesta etapa:
 *
 * - consulta a API publicada;
 * - valida o contrato 1.0;
 * - preserva os links do Google Drive;
 * - não grava em TB_EVIDENCIAS;
 * - não altera TB_SYNC_QUEUE;
 * - não baixa arquivos binários.
 */


/**
 * Normaliza valores textuais do contrato.
 */
function normalizarTextoEvidenciaMobileUX1984_(valor) {
  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  ).trim();
}


/**
 * Valida datas no formato yyyy-MM-dd.
 */
function validarDataEvidenciaMobileUX1984_(valor) {
  const texto =
    normalizarTextoEvidenciaMobileUX1984_(
      valor
    );

  const correspondencia =
    texto.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!correspondencia) {
    return false;
  }

  const ano =
    Number(correspondencia[1]);

  const mes =
    Number(correspondencia[2]);

  const dia =
    Number(correspondencia[3]);

  const data =
    new Date(
      Date.UTC(
        ano,
        mes - 1,
        dia
      )
    );

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}


/**
 * Valida URLs HTTP ou HTTPS.
 */
function validarUrlEvidenciaMobileUX1984_(valor) {
  return /^https?:\/\/\S+$/i.test(
    normalizarTextoEvidenciaMobileUX1984_(
      valor
    )
  );
}


/**
 * Resume o domínio do link para os logs.
 *
 * A URL completa não é exibida pelo teste.
 */
function resumirLinkEvidenciaMobileUX1984_(link) {
  const texto =
    normalizarTextoEvidenciaMobileUX1984_(
      link
    );

  if (!texto) {
    return "";
  }

  try {
    const url =
      new URL(texto);

    return (
      url.protocol +
      "//" +
      url.hostname +
      "/..."
    );

  } catch (erro) {
    return "LINK_PRESENTE";
  }
}


/**
 * Normaliza o envelope retornado pela API publicada.
 *
 * Aceita:
 *
 * {
 *   status,
 *   mensagem,
 *   dataResposta,
 *   detalhes: {...}
 * }
 *
 * Também aceita contratos sem o envelope "detalhes".
 */
function normalizarRespostaEvidenciasMobileUX1984_(
  respostaBruta,
  codigoHttp
) {
  const envelope =
    respostaBruta &&
    typeof respostaBruta === "object"
      ? respostaBruta
      : {};

  const detalhes =
    envelope.detalhes &&
    typeof envelope.detalhes === "object"
      ? envelope.detalhes
      : envelope.dados &&
        typeof envelope.dados === "object"
        ? envelope.dados
        : envelope;

  const totaisOrigem =
    detalhes.totais &&
    typeof detalhes.totais === "object"
      ? detalhes.totais
      : {};

  const registrosOrigem =
    Array.isArray(
      detalhes.evidencias
    )
      ? detalhes.evidencias
      : [];

  const evidencias =
    registrosOrigem.map(
      function (registro) {
        const origem =
          registro &&
          typeof registro === "object"
            ? registro
            : {};

        return {
          idEvidencia:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.idEvidencia
            ),

          data:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.data
            ),

          idObra:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.idObra
            ),

          origem:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.origem
            ),

          idReferencia:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.idReferencia
            ),

          /*
           * Pode estar vazio para Evidências gerais da obra.
           */
          idAtividade:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.idAtividade
            ),

          tipoEvidencia:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.tipoEvidencia
            ),

          descricao:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.descricao
            ),

          linkArquivo:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.linkArquivo
            ),

          responsavel:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.responsavel
            ),

          statusEvidencia:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.statusEvidencia
            ),

          statusSync:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.statusSync
            ),

          dataSync:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.dataSync
            ),

          origemReidratacao:
            normalizarTextoEvidenciaMobileUX1984_(
              origem.origemReidratacao
            )
        };
      }
    );

  return {
    codigoHttp:
      Number(codigoHttp || 0),

    status:
      normalizarTextoEvidenciaMobileUX1984_(
        envelope.status ||
        detalhes.status
      ).toUpperCase(),

    mensagem:
      normalizarTextoEvidenciaMobileUX1984_(
        envelope.mensagem ||
        detalhes.mensagem
      ),

    dataResposta:
      normalizarTextoEvidenciaMobileUX1984_(
        envelope.dataResposta ||
        detalhes.dataResposta
      ),

    versaoContrato:
      normalizarTextoEvidenciaMobileUX1984_(
        detalhes.versaoContrato
      ),

    idObra:
      normalizarTextoEvidenciaMobileUX1984_(
        detalhes.idObra
      ),

    periodoDias:
      Number(
        detalhes.periodoDias || 0
      ),

    dataInicio:
      normalizarTextoEvidenciaMobileUX1984_(
        detalhes.dataInicio
      ),

    dataFim:
      normalizarTextoEvidenciaMobileUX1984_(
        detalhes.dataFim
      ),

    dataSync:
      normalizarTextoEvidenciaMobileUX1984_(
        detalhes.dataSync
      ),

    totais: {
      evidencias:
        Number(
          totaisOrigem.evidencias || 0
        ),

      comAtividade:
        Number(
          totaisOrigem.comAtividade || 0
        ),

      semAtividade:
        Number(
          totaisOrigem.semAtividade || 0
        )
    },

    evidencias:
      evidencias
  };
}


/**
 * Valida o contrato normalizado da API.
 */
function validarDataContratoEvidenciasUX1984_(
  pacote,
  idObraEsperado,
  periodoEsperado
) {
  const origem =
    pacote &&
    typeof pacote === "object"
      ? pacote
      : {};

  const evidencias =
    Array.isArray(
      origem.evidencias
    )
      ? origem.evidencias
      : [];

  const camposContrato = [
    "idEvidencia",
    "data",
    "idObra",
    "origem",
    "idReferencia",
    "idAtividade",
    "tipoEvidencia",
    "descricao",
    "linkArquivo",
    "responsavel",
    "statusEvidencia",
    "statusSync",
    "dataSync",
    "origemReidratacao"
  ];

  const idsVistos =
    new Set();

  const linksVistos =
    new Set();

  const duplicados =
    [];

  const linksDuplicados =
    [];

  const invalidos =
    [];

  const datasInvalidas =
    [];

  const linksInvalidos =
    [];

  const camposAusentes =
    [];

  const outraObra =
    [];

  const foraPeriodo =
    [];

  const statusSyncIncorreto =
    [];

  const origemIncorreta =
    [];

  const dataSyncAusente =
    [];

  let comAtividade = 0;
  let semAtividade = 0;

  evidencias.forEach(
    function (evidencia) {
      const idEvidencia =
        normalizarTextoEvidenciaMobileUX1984_(
          evidencia.idEvidencia
        );

      const idObra =
        normalizarTextoEvidenciaMobileUX1984_(
          evidencia.idObra
        );

      const data =
        normalizarTextoEvidenciaMobileUX1984_(
          evidencia.data
        );

      const linkArquivo =
        normalizarTextoEvidenciaMobileUX1984_(
          evidencia.linkArquivo
        );


      /*
       * Campos essenciais.
       */
      if (
        !idEvidencia ||
        !idObra ||
        !data ||
        !linkArquivo
      ) {
        invalidos.push({
          idEvidencia:
            idEvidencia || "SEM_ID",

          motivo:
            "CAMPO_ESSENCIAL_AUSENTE"
        });
      }


      /*
       * Propriedades do contrato.
       *
       * Campos como idAtividade e descrição podem estar vazios,
       * mas a propriedade precisa existir.
       */
      const ausentes =
        camposContrato.filter(
          function (campo) {
            return !Object.prototype
              .hasOwnProperty.call(
                evidencia,
                campo
              );
          }
        );

      if (ausentes.length) {
        camposAusentes.push({
          idEvidencia:
            idEvidencia || "SEM_ID",

          campos:
            ausentes
        });
      }


      /*
       * IDs.
       */
      if (
        idsVistos.has(
          idEvidencia
        )
      ) {
        duplicados.push(
          idEvidencia
        );

      } else {
        idsVistos.add(
          idEvidencia
        );
      }


      /*
       * Datas.
       */
      if (
        !validarDataEvidenciaMobileUX1984_(
          data
        )
      ) {
        datasInvalidas.push({
          idEvidencia:
            idEvidencia,

          data:
            data
        });
      }

      if (
        data <
          normalizarTextoEvidenciaMobileUX1984_(
            origem.dataInicio
          ) ||
        data >
          normalizarTextoEvidenciaMobileUX1984_(
            origem.dataFim
          )
      ) {
        foraPeriodo.push({
          idEvidencia:
            idEvidencia,

          data:
            data
        });
      }


      /*
       * Links.
       */
      if (
        !validarUrlEvidenciaMobileUX1984_(
          linkArquivo
        )
      ) {
        linksInvalidos.push({
          idEvidencia:
            idEvidencia,

          linkResumo:
            resumirLinkEvidenciaMobileUX1984_(
              linkArquivo
            )
        });
      }

      if (
        linksVistos.has(
          linkArquivo
        )
      ) {
        linksDuplicados.push(
          idEvidencia
        );

      } else {
        linksVistos.add(
          linkArquivo
        );
      }


      /*
       * Obra.
       */
      if (
        idObra !==
        idObraEsperado
      ) {
        outraObra.push({
          idEvidencia:
            idEvidencia,

          idObra:
            idObra
        });
      }


      /*
       * Vínculo com atividade.
       */
      if (
        normalizarTextoEvidenciaMobileUX1984_(
          evidencia.idAtividade
        )
      ) {
        comAtividade++;

      } else {
        semAtividade++;
      }


      /*
       * Metadados de reidratação.
       */
      if (
        evidencia.statusSync !==
        "SINCRONIZADO"
      ) {
        statusSyncIncorreto.push(
          idEvidencia
        );
      }

      if (
        evidencia.origemReidratacao !==
        "SERVIDOR"
      ) {
        origemIncorreta.push(
          idEvidencia
        );
      }

      if (
        !normalizarTextoEvidenciaMobileUX1984_(
          evidencia.dataSync
        )
      ) {
        dataSyncAusente.push(
          idEvidencia
        );
      }
    }
  );


  const validacoes = {
    codigoHttp200:
      origem.codigoHttp === 200,

    statusOK:
      origem.status === "OK",

    contratoVersao1:
      origem.versaoContrato === "1.0",

    obraCorreta:
      origem.idObra ===
      idObraEsperado,

    periodoCorreto:
      origem.periodoDias ===
      periodoEsperado,

    dataInicioValida:
      validarDataEvidenciaMobileUX1984_(
        origem.dataInicio
      ),

    dataFimValida:
      validarDataEvidenciaMobileUX1984_(
        origem.dataFim
      ),

    possuiDataSyncServidor:
      Boolean(
        normalizarTextoEvidenciaMobileUX1984_(
          origem.dataSync
        )
      ),

    listaEvidenciasValida:
      Array.isArray(
        origem.evidencias
      ),

    totalCoerente:
      origem.totais.evidencias ===
      evidencias.length,

    totalVinculosCoerente:
      origem.totais.comAtividade ===
        comAtividade &&
      origem.totais.semAtividade ===
        semAtividade,

    nenhumaDuplicidade:
      duplicados.length === 0,

    nenhumLinkDuplicado:
      linksDuplicados.length === 0,

    nenhumRegistroInvalido:
      invalidos.length === 0,

    nenhumaDataInvalida:
      datasInvalidas.length === 0,

    todosLinksValidos:
      linksInvalidos.length === 0,

    nenhumCampoAusente:
      camposAusentes.length === 0,

    nenhumaMisturaDeObras:
      outraObra.length === 0,

    nenhumRegistroForaPeriodo:
      foraPeriodo.length === 0,

    todosStatusSyncCorretos:
      statusSyncIncorreto.length === 0,

    todasOrigensCorretas:
      origemIncorreta.length === 0,

    todosPossuemDataSync:
      dataSyncAusente.length === 0
  };

  const valido =
    Object.values(
      validacoes
    ).every(
      function (valor) {
        return valor === true;
      }
    );

  return {
    valido:
      valido,

    totais: {
      evidencias:
        evidencias.length,

      comAtividade:
        comAtividade,

      semAtividade:
        semAtividade,

      duplicados:
        duplicados.length,

      linksDuplicados:
        linksDuplicados.length,

      invalidos:
        invalidos.length,

      datasInvalidas:
        datasInvalidas.length,

      linksInvalidos:
        linksInvalidos.length,

      camposAusentes:
        camposAusentes.length,

      outraObra:
        outraObra.length,

      foraPeriodo:
        foraPeriodo.length,

      statusSyncIncorreto:
        statusSyncIncorreto.length,

      origemIncorreta:
        origemIncorreta.length,

      dataSyncAusente:
        dataSyncAusente.length
    },

    problemas: {
      duplicados:
        duplicados,

      linksDuplicados:
        linksDuplicados,

      invalidos:
        invalidos,

      datasInvalidas:
        datasInvalidas,

      linksInvalidos:
        linksInvalidos,

      camposAusentes:
        camposAusentes,

      outraObra:
        outraObra,

      foraPeriodo:
        foraPeriodo,

      statusSyncIncorreto:
        statusSyncIncorreto,

      origemIncorreta:
        origemIncorreta,

      dataSyncAusente:
        dataSyncAusente
    },

    validacoes:
      validacoes
  };
}


/**
 * Consulta a API publicada de Evidências.
 *
 * Retorna o pacote normalizado e validado.
 */
async function obterEvidenciasOperacionaisObraMobile_(
  idObra,
  diasHistorico
) {
  const urlApi =
    "https://script.google.com/macros/s/AKfycbzVE7tdTSwHvKgLkrdcaQtGAm_muqNPo6n0wQZBDpmRwtAJuySfWyh6gdef0R6g_drKRw/exec";

  const obra =
    normalizarTextoEvidenciaMobileUX1984_(
      idObra
    );

  const periodo =
    Number(
      diasHistorico || 30
    );

  const periodosPermitidos =
    [15, 30, 60, 90];

  if (!obra) {
    throw new Error(
      "O ID da obra é obrigatório para consultar Evidências."
    );
  }

  if (
    !periodosPermitidos.includes(
      periodo
    )
  ) {
    throw new Error(
      "Período inválido. Utilize 15, 30, 60 ou 90 dias."
    );
  }


  /*
   * ==========================================================
   * HELPERS OBRIGATÓRIOS
   * ==========================================================
   */

  if (
    typeof obterTokenReidratacaoMobileUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O helper obterTokenReidratacaoMobileUX1955_ não foi encontrado."
    );
  }

  if (
    typeof obterIdDispositivoReidratacaoUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O helper obterIdDispositivoReidratacaoUX1955_ não foi encontrado."
    );
  }

  if (
    typeof obterIdUsuarioReidratacaoUX1955_ !==
    "function"
  ) {
    throw new Error(
      "O helper obterIdUsuarioReidratacaoUX1955_ não foi encontrado."
    );
  }


  const token =
    await Promise.resolve(
      obterTokenReidratacaoMobileUX1955_()
    );

  const idDispositivo =
    await Promise.resolve(
      obterIdDispositivoReidratacaoUX1955_()
    );

  const idUsuario =
    await Promise.resolve(
      obterIdUsuarioReidratacaoUX1955_()
    );

  if (!token) {
    throw new Error(
      "O token da API offline não foi encontrado."
    );
  }

  if (!idDispositivo) {
    throw new Error(
      "O identificador do dispositivo não foi encontrado."
    );
  }

  if (!idUsuario) {
    throw new Error(
      "O identificador do usuário não foi encontrado."
    );
  }


  /*
   * ==========================================================
   * PAYLOAD
   * ==========================================================
   */

  const payload = {
    token:
      token,

    acao:
      "OBTER_EVIDENCIAS_OPERACIONAIS_OBRA",

    idDispositivo:
      idDispositivo,

    idUsuario:
      idUsuario,

    idObra:
      obra,

    diasHistorico:
      periodo
  };

  /*
   * O token não é registrado no console.
   */
  console.log(
    "[UX.19.8.4] Solicitando Evidências operacionais:",
    {
      acao:
        payload.acao,

      idDispositivo:
        payload.idDispositivo,

      idUsuario:
        payload.idUsuario,

      idObra:
        payload.idObra,

      diasHistorico:
        payload.diasHistorico
    }
  );


  /*
   * ==========================================================
   * REQUISIÇÃO
   * ==========================================================
   */

  let respostaHttp;

  try {
    respostaHttp =
      await fetch(
        urlApi,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            ),

          redirect:
            "follow",

          cache:
            "no-store"
        }
      );

  } catch (erroRede) {
    throw new Error(
      "Não foi possível conectar à API de Evidências: " +
      (
        erroRede?.message ||
        "erro de rede"
      )
    );
  }

  const textoResposta =
    await respostaHttp.text();

  let respostaJson;

  try {
    respostaJson =
      JSON.parse(
        textoResposta
      );

  } catch (erroJson) {
    console.error(
      "[UX.19.8.4] Resposta não JSON:",
      textoResposta.substring(
        0,
        300
      )
    );

    throw new Error(
      "A API de Evidências não retornou um JSON válido."
    );
  }


  const pacote =
    normalizarRespostaEvidenciasMobileUX1984_(
      respostaJson,
      respostaHttp.status
    );


  /*
   * ==========================================================
   * ERROS HTTP OU FUNCIONAIS
   * ==========================================================
   */

  if (!respostaHttp.ok) {
    throw new Error(
      pacote.mensagem ||
      (
        "A API de Evidências retornou HTTP " +
        respostaHttp.status +
        "."
      )
    );
  }

  if (
    pacote.status !== "OK"
  ) {
    throw new Error(
      pacote.mensagem ||
      "A API não conseguiu carregar as Evidências."
    );
  }


  /*
   * ==========================================================
   * VALIDAÇÃO DO CONTRATO
   * ==========================================================
   */

  const auditoriaContrato =
    validarDataContratoEvidenciasUX1984_(
      pacote,
      obra,
      periodo
    );

  if (!auditoriaContrato.valido) {
    console.error(
      "[UX.19.8.4] Contrato inválido:",
      auditoriaContrato
    );

    throw new Error(
      "O contrato recebido da API de Evidências é inválido."
    );
  }

  return pacote;
}


/**
 * ============================================================
 * TESTE DO CLIENTE MOBILE DE EVIDÊNCIAS
 * ============================================================
 *
 * Somente leitura.
 *
 * Não acessa:
 *
 * - TB_EVIDENCIAS;
 * - TB_SYNC_QUEUE;
 * - outras stores do IndexedDB.
 */
async function testarClienteEvidenciasMobileUX1984_() {
  console.log(
    "[UX.19.8.4] Iniciando teste do cliente Mobile de Evidências..."
  );

  const idObra =
    "OBR002";

  const periodoDias =
    30;

  const pacote =
    await obterEvidenciasOperacionaisObraMobile_(
      idObra,
      periodoDias
    );

  const auditoriaContrato =
    validarDataContratoEvidenciasUX1984_(
      pacote,
      idObra,
      periodoDias
    );

  const evidencias =
    pacote.evidencias;

  const comAtividade =
    evidencias.filter(
      function (registro) {
        return Boolean(
          normalizarTextoEvidenciaMobileUX1984_(
            registro.idAtividade
          )
        );
      }
    ).length;

  const semAtividade =
    evidencias.length -
    comAtividade;

  const primeiro =
    evidencias.length
      ? evidencias[0]
      : null;

  const validacoes = {
    codigoHttp200:
      pacote.codigoHttp === 200,

    statusOK:
      pacote.status === "OK",

    contratoVersao1:
      pacote.versaoContrato === "1.0",

    obraCorreta:
      pacote.idObra === "OBR002",

    periodoCorreto:
      pacote.periodoDias === 30,

    retornou7Evidencias:
      evidencias.length === 7,

    totalInformadoCoerente:
      pacote.totais.evidencias === 7,

    retornou4ComAtividade:
      comAtividade === 4,

    retornou3SemAtividade:
      semAtividade === 3,

    totaisVinculosCoerentes:
      pacote.totais.comAtividade === 4 &&
      pacote.totais.semAtividade === 3,

    contratoIntegralValido:
      auditoriaContrato.valido === true,

    nenhumaDuplicidade:
      auditoriaContrato.totais
        .duplicados === 0,

    nenhumLinkDuplicado:
      auditoriaContrato.totais
        .linksDuplicados === 0,

    nenhumRegistroInvalido:
      auditoriaContrato.totais
        .invalidos === 0,

    nenhumaDataInvalida:
      auditoriaContrato.totais
        .datasInvalidas === 0,

    todosLinksValidos:
      auditoriaContrato.totais
        .linksInvalidos === 0,

    nenhumCampoAusente:
      auditoriaContrato.totais
        .camposAusentes === 0,

    nenhumaMisturaDeObras:
      auditoriaContrato.totais
        .outraObra === 0,

    nenhumRegistroForaPeriodo:
      auditoriaContrato.totais
        .foraPeriodo === 0,

    todosStatusSyncCorretos:
      auditoriaContrato.totais
        .statusSyncIncorreto === 0,

    todasOrigensCorretas:
      auditoriaContrato.totais
        .origemIncorreta === 0,

    todosPossuemDataSync:
      auditoriaContrato.totais
        .dataSyncAusente === 0,

    primeiroLinkPresente:
      Boolean(
        primeiro?.linkArquivo
      ),

    primeiroLinkGoogleDrive:
      primeiro
        ? /drive\.google\.com/i.test(
            primeiro.linkArquivo
          )
        : false
  };

  const aprovado =
    Object.values(
      validacoes
    ).every(
      function (valor) {
        return valor === true;
      }
    );

  const resultado = {
    etapa:
      "UX.19.8.4",

    teste:
      "CLIENTE_MOBILE_API_EVIDENCIAS",

    status:
      aprovado
        ? "APROVADO"
        : "REPROVADO",

    codigoHttp:
      pacote.codigoHttp,

    respostaStatus:
      pacote.status,

    versaoContrato:
      pacote.versaoContrato,

    idObra:
      pacote.idObra,

    periodoDias:
      pacote.periodoDias,

    dataInicio:
      pacote.dataInicio,

    dataFim:
      pacote.dataFim,

    totais: {
      evidencias:
        evidencias.length,

      totalInformado:
        pacote.totais.evidencias,

      comAtividade:
        comAtividade,

      semAtividade:
        semAtividade,

      duplicados:
        auditoriaContrato
          .totais
          .duplicados,

      linksDuplicados:
        auditoriaContrato
          .totais
          .linksDuplicados,

      invalidos:
        auditoriaContrato
          .totais
          .invalidos,

      datasInvalidas:
        auditoriaContrato
          .totais
          .datasInvalidas,

      linksInvalidos:
        auditoriaContrato
          .totais
          .linksInvalidos,

      camposAusentes:
        auditoriaContrato
          .totais
          .camposAusentes,

      outraObra:
        auditoriaContrato
          .totais
          .outraObra,

      foraPeriodo:
        auditoriaContrato
          .totais
          .foraPeriodo,

      statusSyncIncorreto:
        auditoriaContrato
          .totais
          .statusSyncIncorreto,

      origemIncorreta:
        auditoriaContrato
          .totais
          .origemIncorreta,

      dataSyncAusente:
        auditoriaContrato
          .totais
          .dataSyncAusente
    },

    primeiroRegistro:
      primeiro
        ? {
            idEvidencia:
              primeiro.idEvidencia,

            data:
              primeiro.data,

            idObra:
              primeiro.idObra,

            idAtividade:
              primeiro.idAtividade,

            tipoEvidencia:
              primeiro.tipoEvidencia,

            descricao:
              primeiro.descricao,

            linkArquivoPresente:
              Boolean(
                primeiro.linkArquivo
              ),

            linkArquivoResumo:
              resumirLinkEvidenciaMobileUX1984_(
                primeiro.linkArquivo
              ),

            responsavel:
              primeiro.responsavel,

            statusEvidencia:
              primeiro.statusEvidencia,

            statusSync:
              primeiro.statusSync,

            dataSync:
              primeiro.dataSync,

            origemReidratacao:
              primeiro.origemReidratacao
          }
        : null,

    problemas:
      auditoriaContrato.problemas,

    validacoes:
      validacoes,

    aprovado:
      aprovado
  };

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (!aprovado) {
    throw new Error(
      "UX.19.8.4 REPROVADA. Consulte as validações no console."
    );
  }

  console.log(
    "UX.19.8.4 — CLIENTE MOBILE DA API DE EVIDÊNCIAS APROVADO."
  );

  return resultado;
}
