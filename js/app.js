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
        if (typeof carregarIndicadoresHomePremium === "function") {
          await carregarIndicadoresHomePremium();
        }
    
        if (typeof atualizarIndicadoresMobile_ === "function") {
          await atualizarIndicadoresMobile_();
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

  const bloqueado =
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
          ${bloqueado ? "disabled" : ""}
          onclick="editarDiarioOffline_('${diario.idDiario}')">
          ✏ Editar
        </button>

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
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

async function excluirDiarioOffline_(idDiario) {
  try {
    if (!idDiario) {
      throw new Error("ID do diário não informado.");
    }

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

    const confirmou = await SIGOUI.feedback.confirm({
      tipo: "danger",
      icone: "🗑️",
      titulo: "Excluir diário",
      mensagem:
        "Este diário será removido deste dispositivo.\n\n" +
        "Deseja realmente continuar?",
      textoConfirmar: "Excluir",
      textoCancelar: "Cancelar"
    });

    if (!confirmou) return;

    await removerRegistroSIGO_(
      "TB_DIARIOS",
      idDiario
    );

    // TODO UX.07.14
    // Registrar DELETE na TB_SYNC_QUEUE

    if (String(idDiarioEdicao) === String(idDiario)) {
      idDiarioEdicao = null;
      atualizarModoEdicaoDiario_();

      if (typeof limparFormularioDiario === "function") {
        limparFormularioDiario();
      }
    }

    await carregarListaDiariosOffline();

    SIGOUI.feedback.success(
      "Diário excluído",
      "Registro removido com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao excluir diário:", erro);

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro.message || "Não foi possível excluir o diário."
    );
  }
}

async function sincronizarSIGO() {

  try {

    const fila = await listarRegistrosSIGO("TB_SYNC_QUEUE");

    const pendentes = fila.filter(
      item => item.statusSync === "PENDENTE"
    );

    if (pendentes.length === 0) {

        SIGOUI.feedback.info(
            "Tudo sincronizado",
            "Não há registros pendentes para envio."
        );
    
        return;
    
    }

    const diarios = await listarRegistrosSIGO("TB_DIARIOS");

    const diariosPendentes = diarios.filter(diario =>
      pendentes.some(item => item.idRegistro === diario.idDiario)
    );

    const medicoes = await listarRegistrosSIGO("TB_MEDICOES");

    const medicoesPendentes = medicoes.filter(medicao =>
      pendentes.some(item => item.idRegistro === medicao.idMedicao)
    );

    const lotesMedicao =
      await listarRegistrosSIGO("TB_LOTES_MEDICAO");
    
    const lotesMedicaoPendentes =
      lotesMedicao.filter(lote =>
        pendentes.some(item =>
          item.idRegistro === lote.idLoteMedicao
        )
      );

    const evidencias = await listarRegistrosSIGO("TB_EVIDENCIAS");

    const evidenciasPendentes = evidencias.filter(evidencia =>
      pendentes.some(item => item.idRegistro === evidencia.idEvidencia)
    );

    const climas = await listarRegistrosSIGO("TB_CLIMA");

    const climasPendentes = climas.filter(clima =>
      pendentes.some(item => item.idRegistro === clima.idClima)
    );

    const ocorrencias = await listarRegistrosSIGO("TB_OCORRENCIAS");

    const ocorrenciasPendentes = ocorrencias.filter(ocorrencia =>
      pendentes.some(item => item.idRegistro === ocorrencia.idOcorrencia)
    );

    const diarioItens = await listarRegistrosSIGO("TB_DIARIO_ITENS");

    const diarioItensPendentes =
      diarioItens.filter(itemDiario => {
    
        const idItem =
          itemDiario.idItem ||
          itemDiario.idItemDiario;
    
        return pendentes.some(item =>
          String(item.idRegistro) ===
          String(idItem)
        );
      });

    const obraAtiva =
      localStorage.getItem("obraAtiva") || "OBR002";

    const payload = {
      token: SIGO_TOKEN_OFFLINE,
      idDispositivo: "WEB-MOBILE-001",
      idUsuario: "USUARIO_APP",
      idObra: obraAtiva,
      dataEnvio: new Date().toISOString(),
   pacote: {
      diarios: diariosPendentes,
      diarioItens: diarioItensPendentes,
      lotesMedicao: lotesMedicaoPendentes,
      medicoes: medicoesPendentes,
      ocorrencias: ocorrenciasPendentes,
      clima: climasPendentes,
      evidencias: evidenciasPendentes
    }
    };

    console.log("Enviando para API SIGO:", payload);

    const resposta = await fetch(SIGO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    console.log("Resposta API SIGO:", resultado);

    if (resultado.status !== "OK") {
      throw new Error(resultado.mensagem || "Erro na API SIGO.");
    }

    for (const item of pendentes) {
      item.statusSync = "SINCRONIZADO";
      item.dataSync = new Date().toISOString();

      await atualizarRegistroSIGO(
        "TB_SYNC_QUEUE",
        item
      );
    }

    for (const diario of diariosPendentes) {
      diario.statusSync = "SINCRONIZADO";
      diario.dataSync = new Date().toISOString();

      await atualizarRegistroSIGO(
        "TB_DIARIOS",
        diario
      );
    }

    for (const medicao of medicoesPendentes) {
        medicao.statusSync = "SINCRONIZADO";
        medicao.dataSync = new Date().toISOString();
      
        await atualizarRegistroSIGO(
          "TB_MEDICOES",
          medicao
        );
      }

    for (const lote of lotesMedicaoPendentes) {
        lote.statusSync = "SINCRONIZADO";
        lote.dataSync = new Date().toISOString();
      
        await atualizarRegistroSIGO(
          "TB_LOTES_MEDICAO",
          lote
        );
      }

    for (const evidencia of evidenciasPendentes) {
        evidencia.statusSync = "SINCRONIZADO";
        evidencia.dataSync = new Date().toISOString();
      
        await atualizarRegistroSIGO(
          "TB_EVIDENCIAS",
          evidencia
        );
      }

     for (const clima of climasPendentes) {
        clima.statusSync = "SINCRONIZADO";
        clima.dataSync = new Date().toISOString();
      
        await atualizarRegistroSIGO(
          "TB_CLIMA",
          clima
        );
      }

    for (const ocorrencia of ocorrenciasPendentes) {
        ocorrencia.statusSync = "SINCRONIZADO";
        ocorrencia.dataSync = new Date().toISOString();
      
        await atualizarRegistroSIGO(
          "TB_OCORRENCIAS",
          ocorrencia
        );
      }

    for (const itemDiario of diarioItensPendentes) {

      itemDiario.statusSync =
        "SINCRONIZADO";
    
      itemDiario.dataSync =
        new Date().toISOString();
    
      await atualizarRegistroSIGO(
        "TB_DIARIO_ITENS",
        itemDiario
      );
    
      const idItem =
        itemDiario.idItem ||
        itemDiario.idItemDiario;
    
      if (
        typeof idItemDiarioEdicao !== "undefined" &&
        idItemDiarioEdicao &&
        String(idItemDiarioEdicao) ===
        String(idItem)
      ) {
        encerrarModoEdicaoItemDiario_();
      }
    }
    await atualizarIndicadoresMobile_();
    await carregarListaDiariosOffline();
    await listarMedicoesOffline_();
    await listarEvidenciasOffline_();
    await listarClimasOffline_();
    await listarOcorrenciasOffline_();
    await listarItensDiarioOffline_();

    if (
      typeof navegarPara === "function" &&
      document.getElementById("listaMedicoesOffline")
    ) {
      navegarPara("medicoes");
    }

    localStorage.setItem(
      "SIGO_ULTIMA_SYNC",
      new Date().toLocaleString("pt-BR")
    );
   await atualizarPainelSaudeSync_();

    // =====================================================
    // RESUMO DA SINCRONIZAÇÃO
    // =====================================================
    const resumoSync = {
      total: pendentes.length,
      diarios: diariosPendentes.length,
      itensDiario: diarioItensPendentes.length,
      lotesMedicao: lotesMedicaoPendentes.length,
      medicoes: medicoesPendentes.length,
      ocorrencias: ocorrenciasPendentes.length,
      climas: climasPendentes.length,
      evidencias: evidenciasPendentes.length
    };
    
    const detalhesSync = [
      resumoSync.diarios
        ? `${resumoSync.diarios} diário(s)`
        : "",
    
      resumoSync.itensDiario
        ? `${resumoSync.itensDiario} item(ns) do diário`
        : "",
    
      resumoSync.lotesMedicao
        ? `${resumoSync.lotesMedicao} lote(s) de medição`
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
    
    // =====================================================
    // NOTIFICAÇÃO — SINCRONIZAÇÃO CONCLUÍDA
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "SYNC_CONCLUIDO",
    
        dados: {
          ...resumoSync,
    
          mensagem:
            `${resumoSync.total} registro(s) ` +
            `sincronizado(s) com sucesso` +
            (detalhesSync
              ? `: ${detalhesSync}.`
              : ".")
        }
      });
    }
    
    SIGOUI.feedback.success(
      "Sincronização concluída",
      `${resumoSync.total} registro(s) enviado(s) ao SIGO.`
    );

 } catch (erro) {

    console.error(
      "Erro ao sincronizar com API SIGO:",
      erro
    );
  
    const mensagemErro =
      erro?.message ||
      "Não foi possível sincronizar com o SIGO.";
  
    // =====================================================
    // NOTIFICAÇÃO — ERRO DE SINCRONIZAÇÃO
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "SYNC_ERRO",
  
        dados: {
          mensagem: mensagemErro,
          message: mensagemErro,
          ocorridoEm:
            new Date().toISOString()
        }
      });
    }
  
    SIGOUI.feedback.error(
      "Erro de sincronização",
      mensagemErro
    );
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
  const status = item.statusSync || "PENDENTE";
  const bloqueado =
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
          ${bloqueado ? "disabled" : ""}
          onclick="editarItemDiarioOffline_('${item.idItem || item.idItemDiario || ""}')">
          ✏ Editar
        </button>

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
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

async function editarItemDiarioOffline_(idItem) {
  try {

    const itens =
      await listarRegistrosSIGO("TB_DIARIO_ITENS");

    const item =
      itens.find(reg =>
        String(reg.idItem || reg.idItemDiario) === String(idItem)
      );

    if (!item) {
      SIGOUI.feedback.warning(
        "Item não encontrado",
        "O registro não foi localizado."
      );
      return;
    }

    idItemDiarioEdicao =
      item.idItem || item.idItemDiario;

    document.getElementById("itemDiarioData").value =
      item.data || "";

    document.getElementById("itemDiarioAtividade").value =
      item.atividade || item.eap || "";

    // Atualiza os campos automáticos
    await preencherDadosAtividadeItemDiario();

    document.getElementById("itemDiarioEap").value =
      item.eap || "";

    document.getElementById("itemDiarioServico").value =
      item.servico || "";

    document.getElementById("itemDiarioEquipe").value =
      item.equipe || "";

    document.getElementById("itemDiarioEquipamento").value =
      item.equipamento || "";

    document.getElementById("itemDiarioQtde").value =
      item.qtdeExecutada || "";

    document.getElementById("itemDiarioUnidade").value =
      item.un || "";

    document.getElementById("itemDiarioHoras").value =
      item.horasTrabalhadas || "";

    document.getElementById("itemDiarioObservacao").value =
      item.observacao || "";

    atualizarModoEdicaoItemDiario_();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (erro) {
    console.error(erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível carregar o item."
    );
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

    if (!idItemDiarioEdicao) {
      throw new Error("Nenhum item em edição.");
    }

    const itens =
      await listarRegistrosSIGO("TB_DIARIO_ITENS");

    const itemAtual =
      itens.find(item =>
        String(item.idItem || item.idItemDiario) ===
        String(idItemDiarioEdicao)
      );

    if (!itemAtual) {
      throw new Error("Registro não encontrado.");
    }

    const itemAtualizado = {

      ...itemAtual,

      data:
        document.getElementById("itemDiarioData").value,

      atividade:
        document.getElementById("itemDiarioAtividade").value,

      eap:
        document.getElementById("itemDiarioEap").value,

      servico:
        document.getElementById("itemDiarioServico").value,

      equipe:
        document.getElementById("itemDiarioEquipe").value,

      equipamento:
        document.getElementById("itemDiarioEquipamento").value,

      qtdeExecutada:
        Number(
          document.getElementById("itemDiarioQtde").value || 0
        ),

      un:
        document.getElementById("itemDiarioUnidade").value,

      horasTrabalhadas:
        Number(
          document.getElementById("itemDiarioHoras").value || 0
        ),

      observacao:
        document.getElementById("itemDiarioObservacao").value,

      atualizadoEm:
        new Date().toISOString(),

      statusSync:
        "PENDENTE"

    };

    await validarAtividadeItemDiarioOffline_(itemAtualizado);

    await salvarRegistroSIGO(
      "TB_DIARIO_ITENS",
      itemAtualizado
    );
    
    // =====================================================
    // SINCRONIZAÇÃO — UPDATE DO ITEM DO DIÁRIO
    // =====================================================
    await adicionarNaFilaSyncSIGO({
      tipo: "UPDATE",
      storeOrigem: "TB_DIARIO_ITENS",
    
      idRegistro:
        itemAtualizado.idItem ||
        itemAtualizado.idItemDiario,
    
      idObra: itemAtualizado.idObra
    });
   
   encerrarModoEdicaoItemDiario_();

    await listarItensDiarioOffline_();
    
    // =====================================================
    // NOTIFICAÇÃO — ITEM DO DIÁRIO ATUALIZADO
    // =====================================================
    if (typeof registrarEventoSIGO_ === "function") {
      await registrarEventoSIGO_({
        evento: "ITEM_DIARIO_ATUALIZADO",
        dados: itemAtualizado
      });
    }
    
    SIGOUI.feedback.success(
      "Item atualizado",
      "Registro atualizado com sucesso."
    );

  } catch (erro) {

    console.error(erro);

    SIGOUI.feedback.error(
      "Erro",
      erro.message
    );

  }

}

async function excluirItemDiarioOffline_(idItem) {
  try {
    if (!idItem) {
      throw new Error("ID do item não informado.");
    }

    const itens =
      await listarRegistrosSIGO("TB_DIARIO_ITENS");

    const item =
      itens.find(reg =>
        String(reg.idItem || reg.idItemDiario) === String(idItem)
      );

    if (!item) {
      SIGOUI.feedback.warning(
        "Item não encontrado",
        "O registro não foi localizado no banco offline."
      );
      return;
    }

    const confirmou = await SIGOUI.feedback.confirm({
      tipo: "danger",
      icone: "🗑️",
      titulo: "Excluir item",
      mensagem:
        "Este item do diário será removido deste dispositivo.\n\n" +
        "Deseja realmente continuar?",
      textoConfirmar: "Excluir",
      textoCancelar: "Cancelar"
    });

    if (!confirmou) return;

    await removerRegistroSIGO_(
      "TB_DIARIO_ITENS",
      idItem
    );

    // TODO UX.07.14
    // Registrar DELETE na TB_SYNC_QUEUE

    if (String(idItemDiarioEdicao) === String(idItem)) {
      idItemDiarioEdicao = null;
      atualizarModoEdicaoItemDiario_();

      if (typeof limparFormularioItemDiario === "function") {
        limparFormularioItemDiario();
      }
    }

    await listarItensDiarioOffline_();

    SIGOUI.feedback.success(
      "Item excluído",
      "Registro removido com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao excluir item:", erro);

    SIGOUI.feedback.error(
      "Erro ao excluir",
      erro.message || "Não foi possível excluir o item."
    );
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
