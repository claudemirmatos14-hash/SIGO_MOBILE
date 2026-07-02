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

function iniciarSeletorObra() {
  const seletor =
    document.getElementById("obraAtiva");

  const nomeObra =
    document.getElementById("nomeObra");

  if (!seletor) return;

  seletor.addEventListener("change", async function () {
    const idObra = seletor.value;

    if (!idObra) return;

    const obras =
      await listarRegistrosSIGO("TB_OBRAS");

    const obra =
      obras.find(item =>
        String(item.idObra) === String(idObra)
      );

    localStorage.setItem("obraAtiva", idObra);

    await atualizarHomeMobile_();

    if (nomeObra && obra) {
      nomeObra.textContent =
        obra.nomeObra || obra.idObra;
    }

    await atualizarPainelSaudeSync_();

    console.log(
      "Obra ativa alterada pelo seletor:",
      idObra
    );
  });
}

function atualizarNomeObra_(seletor, nomeObra) {
  if (!nomeObra) return;

  const textoSelecionado =
    seletor.options[seletor.selectedIndex].textContent.trim();

  const partes = textoSelecionado.split(" - ");

  nomeObra.textContent = partes[1] || textoSelecionado;
}

function navegarPara(tela) {
  const app = document.querySelector(".app-premium");
  const area = document.getElementById("telaApp");

  const telasPremium = {
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
        if (typeof carregarListaDiariosOffline === "function") {
          await carregarListaDiariosOffline();
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

    ocorrencias: {
      montar: montarTelaOcorrencias,
      depois: async function () {
        if (typeof listarOcorrenciasOffline_ === "function") {
          await listarOcorrenciasOffline_();
        }
      }
    }
  };

  if (app && telasPremium[tela]) {
    SIGOUI.render(".app-premium", telasPremium[tela].montar());

    setTimeout(async () => {
      if (typeof carregarObrasMobile_ === "function") {
        await carregarObrasMobile_();
      }

      await telasPremium[tela].depois();
    }, 100);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    return;
  }

  if (tela === "medicoes") {
    SIGOUI.render(".app-premium", montarTelaMedicoes());

    setTimeout(async () => {
      if (typeof carregarObrasMobile_ === "function") {
        await carregarObrasMobile_();
      }

      await carregarAtividadesMedicaoOffline_();
      await listarMedicoesOffline_();
    }, 100);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

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
  const area = document.getElementById("telaApp");
  document.getElementById("homeApp").style.display = "block";
  document.getElementById("telaApp").innerHTML = "";

  if (!area) return;

  area.innerHTML = "";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
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

    criadoEm: new Date().toISOString()

  };

  try {

    await salvarRegistroSIGO(
      "TB_DIARIOS",
      diario
    );

    await adicionarNaFilaSyncSIGO({
      tipo: "DIARIO_OBRA",
      storeOrigem: "TB_DIARIOS",
      idRegistro: diario.idDiario,
      idObra: diario.idObra
    });

    SIGOUI.feedback.success(
      "Diário salvo",
      "Registro salvo offline."
    );

    console.log(
      "Diário salvo no IndexedDB:",
      diario
    );

    atualizarIndicadoresMobile_();
    carregarListaDiariosOffline();

  } catch (erro) {

    console.error(
      "Erro ao salvar diário:",
      erro
    );

   SIGOUI.feedback.error(
    "Erro ao salvar",
    "Não foi possível salvar diário."
);

  }
}

async function atualizarIndicadoresMobile_() {

  try {

    const diarios =
      await listarRegistrosSIGO("TB_DIARIOS");

    const fila =
      await listarRegistrosSIGO("TB_SYNC_QUEUE");

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

document.addEventListener(
  "DOMContentLoaded",
  atualizarIndicadoresMobile_
);

document.addEventListener("DOMContentLoaded", async () => {

  try {

    await abrirBancoLocalSIGO();

    console.log("SIGO Mobile inicializado.");

  } catch (erro) {

    console.error(
      "Falha ao inicializar banco local.",
      erro
    );

  }

});

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

async function editarDiarioOffline_(idDiario) {

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
        "O registro não foi localizado."
      );

      return;
    }

    idDiarioEdicao = idDiario;

    document.getElementById("diarioData").value =
      diario.data || "";

    document.getElementById("diarioResponsavel").value =
      diario.responsavel || "";

    document.getElementById("diarioEquipe").value =
      diario.equipe || "";

    document.getElementById("diarioHoras").value =
      diario.horasDia || diario.horas || "";

    document.getElementById("diarioClima").value =
      diario.clima || "";

    document.getElementById("diarioOcorrencias").value =
      diario.ocorrencias || "";

    document.getElementById("diarioObservacoes").value =
      diario.observacoes || "";

    atualizarModoEdicaoDiario_();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (erro) {

    console.error(erro);

    SIGOUI.feedback.error(
      "Erro",
      "Não foi possível carregar o diário."
    );

  }

}

function atualizarModoEdicaoDiario_() {

  const botao =
    document.querySelector(
      ".is-success"
    );

  if (!botao) return;

  if (idDiarioEdicao) {

    botao.innerHTML =
      "💾 Atualizar";

    botao.setAttribute(
      "onclick",
      "atualizarDiarioOffline_()"
    );

  } else {

    botao.innerHTML =
      "💾 Salvar";

    botao.setAttribute(
      "onclick",
      "salvarDiarioPremium()"
    );

  }

}

async function atualizarDiarioOffline_() {
  try {
    if (!idDiarioEdicao) {
      throw new Error("Nenhum diário em edição.");
    }

    const diarios = await listarRegistrosSIGO("TB_DIARIOS");

    const diarioAtual = diarios.find(item =>
      String(item.idDiario) === String(idDiarioEdicao)
    );

    if (!diarioAtual) {
      throw new Error("Diário não encontrado.");
    }

    const diarioAtualizado = {
      ...diarioAtual,

      data: document.getElementById("diarioData").value,
      responsavel: document.getElementById("diarioResponsavel").value,
      equipe: document.getElementById("diarioEquipe").value,
      horasDia: Number(document.getElementById("diarioHoras").value || 0),
      clima: document.getElementById("diarioClima").value,
      ocorrencias: document.getElementById("diarioOcorrencias").value,
      observacoes: document.getElementById("diarioObservacoes").value,

      atualizadoEm: new Date().toISOString(),
      statusSync: "PENDENTE"
    };

    await salvarRegistroSIGO(
      "TB_DIARIOS",
      diarioAtualizado
    );

    // TODO UX.07.14
    // Registrar UPDATE na TB_SYNC_QUEUE

    idDiarioEdicao = null;
    atualizarModoEdicaoDiario_();

    if (typeof limparFormularioDiario === "function") {
      limparFormularioDiario();
    }

    await carregarListaDiariosOffline();

    SIGOUI.feedback.success(
      "Diário atualizado",
      "Registro atualizado com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao atualizar diário:", erro);

    SIGOUI.feedback.error(
      "Erro ao atualizar",
      erro.message || "Não foi possível atualizar o diário."
    );
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

    const diarioItensPendentes = diarioItens.filter(itemDiario =>
      pendentes.some(item => item.idRegistro === itemDiario.idItemDiario)
    );

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
      itemDiario.statusSync = "SINCRONIZADO";
      itemDiario.dataSync = new Date().toISOString();
    
      await atualizarRegistroSIGO(
        "TB_DIARIO_ITENS",
        itemDiario
      );
    
      const idItem =
        itemDiario.idItem || itemDiario.idItemDiario;
    
     if (
        idItemDiarioEdicao &&
        String(idItemDiarioEdicao) === String(idItem)
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

    localStorage.setItem(
      "SIGO_ULTIMA_SYNC",
      new Date().toLocaleString("pt-BR")
    );
    await atualizarPainelSaudeSync_();

    SIGOUI.feedback.success(
        "Sincronização concluída",
        "Dados enviados ao SIGO com sucesso."
    );

  } catch (erro) {

    console.error("Erro ao sincronizar com API SIGO:", erro);

    SIGOUI.feedback.error(
    "Erro de sincronização",
    "Não foi possível sincronizar com o SIGO."
);
  }
}

async function sincronizarDadosBaseObraMobile() {

  try {

    const obraAtiva =
      localStorage.getItem("obraAtiva") || "OBR002";

    const payload = {
      token: SIGO_TOKEN_OFFLINE,
      acao: "OBTER_DADOS_BASE_OBRA",
      idDispositivo: "WEB-MOBILE-001",
      idUsuario: "USUARIO_APP",
      idObra: obraAtiva,
      dataSolicitacao: new Date().toISOString()
    };

    console.log("Solicitando dados-base da obra:", payload);

    const resposta = await fetch(SIGO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    console.log("Dados-base recebidos:", resultado);

    if (resultado.status !== "OK") {
      throw new Error(resultado.mensagem || "Erro ao buscar dados-base.");
    }

    const atividades =
      resultado.atividades ||
      resultado.detalhes?.atividades ||
      [];

    if (!Array.isArray(atividades)) {
      throw new Error("A API não retornou uma lista de atividades válida.");
    }

    console.log("Primeira atividade:", atividades[0]);
    console.log("Total de atividades recebidas:", atividades.length);

    const obrasLocais =
      await listarRegistrosSIGO("TB_OBRAS");
    
    const jaExiste =
      obrasLocais.some(obra =>
        String(obra.idObra) === String(obraAtiva)
      );
    
    if (!jaExiste && obrasLocais.length >= 3) {
      throw new Error(
        "Limite de 3 obras offline atingido. Remova uma obra antes de baixar outra."
      );
    }
      console.log("Nome obra recebido direto:", resultado.nomeObra);
      console.log("Nome obra recebido em detalhes:", resultado.detalhes?.nomeObra);
    
      await salvarRegistroSIGO("TB_OBRAS", {
        idObra: obraAtiva,
        nomeObra:
          resultado.detalhes?.nomeObra ||
          resultado.nomeObra ||
          obraAtiva,
        status: "ATIVA",
        dataSync: new Date().toISOString()
      });

   await removerAtividadesPorObraSIGO_(obraAtiva);

    for (const atividade of atividades) {
      console.log("Salvando atividade:", atividade);
      await salvarRegistroSIGO(
        "TB_ATIVIDADES_OBRA",
        atividade
      );
    }

    await carregarObrasMobile_();
    
    SIGOUI.feedback.success(
        "Base atualizada",
        `${atividades.length} atividades sincronizadas para o dispositivo.`
    );

  } catch (erro) {

    console.error("Erro ao sincronizar dados-base:", erro);

    SIGOUI.feedback.error(
        "Erro na atualização",
        "Não foi possível atualizar os dados-base da obra."
    );

  }
}

function montarTelaMedicoes_() {
  const obraAtiva = localStorage.getItem("obraAtiva") || "OBR002";
  const hoje = new Date().toISOString().split("T")[0];

  return `
    <div class="tela-card">

      <button class="btn-voltar" onclick="voltarHome()">← Voltar</button>

      <h2>📏 Medições</h2>

      <p>Registrar avanço físico executado em campo.</p>

      <form class="formulario" onsubmit="salvarMedicaoOffline(event)">

        <label>Data</label>
        <input type="date" id="medicaoData" value="${hoje}">

        <label>Obra</label>
        <input type="text" id="medicaoObra" value="${obraAtiva}" readonly>

        <label>Atividade</label>
        <select id="medicaoAtividade" onchange="preencherDadosAtividadeMedicao()">
          <option value="">Selecione uma atividade</option>
        </select>

        <label>Serviço</label>
        <input type="text" id="medicaoServico" readonly>

        <label>Quantidade planejada</label>
        <input type="number" id="medicaoQtdePlanejada" readonly>

        <label>Quantidade executada</label>
        <input type="number" id="medicaoQtdeExecutada" step="0.01" oninput="calcularPercentualMedicao()">

        <label>Unidade</label>
        <input type="text" id="medicaoUnidade" readonly>

        <label>% Executado</label>
        <input type="number" id="medicaoPercentual" readonly>

        <label>Responsável</label>
        <input type="text" id="medicaoResponsavel" placeholder="Nome do responsável">

        <label>Observação</label>
        <textarea id="medicaoObservacao" rows="3" placeholder="Observações da medição"></textarea>

        <button type="submit" class="btn-salvar">
          Salvar Medição Offline
        </button>

        <div class="lista-offline">

          <h3>Medições salvas offline</h3>
        
          <div id="listaMedicoesOffline">
            Carregando...
          </div>
        
        </div>

      </form>

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

  const medicao = {
    idMedicao: "MED-" + Date.now(),
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

async function salvarEvidenciaOffline(event) {

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
}

function montarTelaClima_() {
  const obraAtiva = localStorage.getItem("obraAtiva") || "OBR002";
  const hoje = new Date().toISOString().split("T")[0];

  return `
    <div class="tela-card">

      <button class="btn-voltar" onclick="voltarHome()">← Voltar</button>

      <h2>🌦️ Clima</h2>

      <p>Registrar condições climáticas da obra.</p>

      <form class="formulario" onsubmit="salvarClimaOffline(event)">

        <label>Data</label>
        <input type="date" id="climaData" value="${hoje}">

        <label>Obra</label>
        <input type="text" id="climaObra" value="${obraAtiva}" readonly>

        <label>Período</label>
        <select id="climaPeriodo">
          <option value="MANHÃ">Manhã</option>
          <option value="TARDE">Tarde</option>
          <option value="NOITE">Noite</option>
          <option value="DIA INTEIRO">Dia inteiro</option>
        </select>

        <label>Condição climática</label>
        <select id="climaCondicao">
          <option value="☀️ ENSOLARADO">☀️ Ensolarado</option>
          <option value="⛅ PARCIALMENTE NUBLADO">⛅ Parcialmente Nublado</option>
          <option value="☁️ NUBLADO">☁️ Nublado</option>
          <option value="🌧️ CHUVOSO">🌧️ Chuvoso</option>
          <option value="⛈️ TEMPESTADE">⛈️ Tempestade</option>
        </select>

        <label>Intensidade</label>
        <select id="climaIntensidade">
          <option value="BAIXA">Baixa</option>
          <option value="MÉDIA">Média</option>
          <option value="ALTA">Alta</option>
          <option value="CRÍTICA">Crítica</option>
        </select>

        <label>Impacto na execução</label>
        <select id="climaImpacto">
          <option value="SEM IMPACTO">Sem impacto</option>
          <option value="REDUZIU PRODUTIVIDADE">Reduziu Produtividade</option>
          <option value="PARALISOU ATIVIDADE">Paralisou Atividade</option>
          <option value="PARALISOU OBRA">Paralisou Obra</option>
        </select>

        <label>Atividade afetada</label>
        <input type="text" id="climaAtividadeAfetada" placeholder="Ex.: 3.7.1">

        <label>Observação</label>
        <textarea id="climaObservacao" rows="3" placeholder="Observações sobre o clima"></textarea>

        <button type="submit" class="btn-salvar">
          Salvar Clima Offline
        </button>

        <div class="lista-offline">
          <h3>Climas salvos offline</h3>
        
          <div id="listaClimasOffline">
            Carregando...
          </div>
        </div>

      </form>

    </div>
  `;
}

async function salvarClimaOffline(event) {
  event.preventDefault();

  const clima = {
    idClima: "CLI-" + Date.now(),
    data: document.getElementById("climaData").value,
   idObra: obterObraAtivaMobile_(),
    periodo: document.getElementById("climaPeriodo").value,
    condicaoClimatica: document.getElementById("climaCondicao").value,
    intensidade: document.getElementById("climaIntensidade").value,
    impactoExecucao: document.getElementById("climaImpacto").value,
    atividadeAfetada: document.getElementById("climaAtividadeAfetada").value,
    observacao: document.getElementById("climaObservacao").value,
    statusClima: "REGISTRADO",
    statusSync: "PENDENTE",
    origem: "APP_OFFLINE",
    criadoEm: new Date().toISOString()
  };

  try {
    await salvarRegistroSIGO("TB_CLIMA", clima);

    await adicionarNaFilaSyncSIGO({
      tipo: "CLIMA_OBRA",
      storeOrigem: "TB_CLIMA",
      idRegistro: clima.idClima,
      idObra: clima.idObra
    });

    await atualizarIndicadoresMobile_();
    await listarClimasOffline_();

   SIGOUI.feedback.success(
      "Clima salvo",
      "Registro climático salvo offline."
    );
    
    console.log("Clima salvo no IndexedDB:", clima);
    
    } catch (erro) {
      console.error("Erro ao salvar clima:", erro);
    
      SIGOUI.feedback.error(
        "Erro ao salvar clima",
        "Não foi possível salvar o registro climático offline."
      );
    }
}

async function listarClimasOffline_() {

  const container =
    document.getElementById("listaClimasOffline");

  if (!container) return;

  try {

    const climas =
      await listarRegistrosSIGO("TB_CLIMA");

    if (!climas.length) {
      container.innerHTML = `
        <div class="card-vazio">
          Nenhum registro de clima salvo.
        </div>
      `;
      return;
    }

    container.innerHTML =
      climas
        .sort((a, b) =>
          new Date(b.criadoEm) - new Date(a.criadoEm)
        )
        .map(clima => `
          <div class="item-offline">

            <strong>
              ${clima.condicaoClimatica || "Clima"}
            </strong>

            <small>
              ${clima.data || "-"} • ${clima.periodo || "-"}
            </small>

            <small>
              Intensidade: ${clima.intensidade || "-"}
            </small>

            <small>
              Impacto: ${clima.impactoExecucao || "-"}
            </small>

            <small>
              Atividade: ${clima.atividadeAfetada || "-"}
            </small>

            <span class="
              badge-sync
              ${clima.statusSync === "SINCRONIZADO" ? "ok" : "pendente"}
            ">
              ${clima.statusSync}
            </span>

          </div>
        `)
        .join("");

  } catch (erro) {

    console.error("Erro ao listar climas:", erro);

    container.innerHTML =
      "Erro ao carregar registros de clima.";
  }
}

/*function montarTelaOcorrencias_() {

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

      <h2>⚠️ Ocorrências</h2>

      <p>
        Registrar ocorrências operacionais.
      </p>

      <form
        class="formulario"
        onsubmit="salvarOcorrenciaOffline(event)">

        <label>Data</label>

        <input
          type="date"
          id="ocorrenciaData"
          value="${hoje}">

        <label>Obra</label>

        <input
          type="text"
          id="ocorrenciaObra"
          value="${obraAtiva}"
          readonly>

        <label>Tipo</label>

          <select id="ocorrenciaTipo">
          
            <option value="🌧️ Clima">🌧️ Clima</option>
            <option value="📦 Material">📦 Material</option>
            <option value="👷 Mão de Obra">👷 Mão de Obra</option>
            <option value="🔧 Equipamento">🔧 Equipamento</option>
            <option value="📐 Projeto">📐 Projeto</option>
            <option value="🚨 Segurança">🚨 Segurança</option>
            <option value="📋 Qualidade">📋 Qualidade</option>
            <option value="🔄 Retrabalho">🔄 Retrabalho</option>
            <option value="🤝 Cliente">🤝 Cliente</option>
            <option value="🏗️ Terceiros">🏗️ Terceiros</option>
            <option value="⚠️ Outros">⚠️ Outros</option>
          
          </select>

        <label>Severidade</label>

        <select id="ocorrenciaSeveridade">

          <option value="BAIXA">
            🟢 Baixa
          </option>

          <option value="MÉDIA">
            🟡 Média
          </option>

          <option value="ALTA">
            🟠 Alta
          </option>

          <option value="CRITICA">
            🔴 Crítica
          </option>

        </select>

        <label>Atividade afetada</label>

        <select id="ocorrenciaAtividade">
          <option value="">Selecione uma atividade</option>
        
          <option value="3.7.1">
            3.7.1 - REATERRO MANUAL DE VALA
          </option>
        
          <option value="2.1">
            2.1 - LOCAÇÃO E GABARITO
          </option>
        
          <option value="3.1.2">
            3.1.2 - ESCAVAÇÃO MANUAL
          </option>
        </select>
        <label>Responsável</label>

        <input
          type="text"
          id="ocorrenciaResponsavel"
          placeholder="Responsável">

        <label>Descrição</label>

        <textarea
          id="ocorrenciaDescricao"
          rows="4"
          placeholder="Descreva a ocorrência">
        </textarea>

        <button
          type="submit"
          class="btn-salvar">

          Salvar Ocorrência Offline

        </button>

        <div class="lista-offline">

          <h3>
            Ocorrências salvas offline
          </h3>
        
          <div id="listaOcorrenciasOffline">
        
            Carregando...
        
          </div>
        
        </div>

      </form>

    </div>

  `;
}*/

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

async function salvarOcorrenciaOffline(event) {

  event.preventDefault();

  const ocorrencia = {

    idOcorrencia:
      "OCR-" + Date.now(),

    idDiario:
      "DIA-REF-" + document.getElementById("ocorrenciaData").value,

    data:
      document.getElementById("ocorrenciaData").value,

    idObra:
      obterObraAtivaMobile_(),

    tipo:
      document.getElementById("ocorrenciaTipo").value,

    severidade:
      document.getElementById("ocorrenciaSeveridade").value,

    atividadeAfetada:
      document.getElementById("ocorrenciaAtividade").value,

    responsavel:
      document.getElementById("ocorrenciaResponsavel").value,

    descricao:
      document.getElementById("ocorrenciaDescricao").value,

    statusOcorrencia:
      "ABERTA",

    statusSync:
      "PENDENTE",

    origem:
      "APP_OFFLINE",

    criadoEm:
      new Date().toISOString()

  };

  try {

    await salvarRegistroSIGO(
      "TB_OCORRENCIAS",
      ocorrencia
    );

    await adicionarNaFilaSyncSIGO({

      tipo: "OCORRENCIA",

      storeOrigem:
        "TB_OCORRENCIAS",

      idRegistro:
        ocorrencia.idOcorrencia,

      idObra:
        ocorrencia.idObra

    });

    await atualizarIndicadoresMobile_();
    await listarOcorrenciasOffline_();

  SIGOUI.feedback.success(
  "Ocorrência salva",
  "Registro salvo offline."
);

    console.log(
      "Ocorrência offline:",
      ocorrencia
    );

  } catch (erro) {

    console.error(
      "Erro ao salvar ocorrência:",
      erro
    );

   SIGOUI.feedback.error(
    "Erro ao salvar evidência",
    "Não foi possível salvar evidência offline."
  );

  }

}

async function listarOcorrenciasOffline_() {

  const container =
    document.getElementById(
      "listaOcorrenciasOffline"
    );

  if (!container) return;

  try {

    const ocorrencias =
      await listarRegistrosSIGO(
        "TB_OCORRENCIAS"
      );

    if (!ocorrencias.length) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma ocorrência registrada.
        </div>
      `;

      return;
    }

    container.innerHTML =
      ocorrencias
        .sort((a, b) =>
          new Date(b.criadoEm) -
          new Date(a.criadoEm)
        )
        .map(ocorrencia => `

          <div class="item-offline">

            <strong>
              ${ocorrencia.tipo}
            </strong>

            <small>
              ${ocorrencia.data}
            </small>

            <small>
              sincronizarSIGO:
              ${ocorrencia.severidade}
            </small>

            <small>
              Atividade:
              ${ocorrencia.atividadeAfetada || "-"}
            </small>

            <small>
              ${ocorrencia.descricao || ""}
            </small>

            <span class="
              badge-sync
              ${
                ocorrencia.statusSync === "SINCRONIZADO"
                  ? "ok"
                  : "pendente"
              }
            ">
              ${ocorrencia.statusSync}
            </span>

          </div>

        `)
        .join("");

  } catch (erro) {

    console.error(
      "Erro ao listar ocorrências:",
      erro
    );

    container.innerHTML =
      "Erro ao carregar ocorrências.";

  }

}

/*function montarTelaDiarioItens_() {
  const obraAtiva = localStorage.getItem("obraAtiva") || "OBR002";
  const hoje = new Date().toISOString().split("T")[0];

  setTimeout(
    listarItensDiarioOffline_,
    100
  );

  return `
    <div class="tela-card">

      <button class="btn-voltar" onclick="voltarHome()">
         ← Voltar</button>
      <h2>📋 Itens do Diário</h2>

      <p>Registrar atividades executadas no dia.</p>

      <form class="formulario" onsubmit="salvarItemDiarioOffline(event)">

        <label>Data</label>
        <input type="date" id="itemDiarioData" value="${hoje}">

        <label>Obra</label>
        <input type="text" id="itemDiarioObra" value="${obraAtiva}" readonly>

        <label>ID Diário</label>
        <input type="text" id="itemDiarioIdDiario" placeholder="Ex.: DIA-LOCAL-...">

        <label>Atividade</label>
        <select id="itemDiarioAtividade" onchange="preencherDadosAtividadeItemDiario()">
          <option value="">Selecione uma atividade</option>
        </select>

        <label>Serviço</label>
        <input type="text" id="itemDiarioServico" readonly>

        <label>Quantidade executada</label>
        <input type="number" id="itemDiarioQtdeExecutada" step="0.01">

        <label>Unidade</label>
        <input type="text" id="itemDiarioUnidade" readonly>

        <label>Equipe</label>
        <input type="text" id="itemDiarioEquipe" placeholder="Ex.: Equipe A">

        <label>Equipamento</label>
        <input type="text" id="itemDiarioEquipamento" placeholder="Ex.: Escavadeira CAT 320">

        <label>Horas trabalhadas</label>
        <input type="number" id="itemDiarioHoras" step="0.5">

        <label>Observação</label>
        <textarea id="itemDiarioObservacao" rows="3" placeholder="Observações do item"></textarea>

        <button type="submit" class="btn-salvar">
          Salvar Item Offline
        </button>

        <div class="secao-offline">

          <h3>
            📋 Itens salvos offline
          </h3>
        
          <div id="listaItensDiarioOffline">
          </div>
        
        </div>

      </form>

    </div>
  `;
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

async function listarItensDiarioOffline_() {
  const container =
    document.getElementById("listaItensDiarioOffline");

  if (!container) return;

  try {
    const obraAtiva =
      obterObraAtivaMobile_();

    const itens =
      await listarRegistrosSIGO("TB_DIARIO_ITENS");

    const itensObra =
      itens
        .filter(item =>
          String(item.idObra) === String(obraAtiva)
        )
        .sort((a, b) =>
          new Date(b.criadoEm) - new Date(a.criadoEm)
        );

    if (!itensObra.length) {
      container.innerHTML = `
        <div class="card-vazio">
          Nenhum item registrado.
        </div>
      `;
      return;
    }

    container.innerHTML =
      itensObra
        .map(item => criarCardItemDiarioOffline_(item))
        .join("");

  } catch (erro) {
    console.error("Erro ao listar itens:", erro);

    container.innerHTML = `
      <div class="card-vazio">
        Erro ao carregar itens do diário.
      </div>
    `;
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

  const botao =
    document.querySelector(".is-success");

  if (!botao) return;

  if (idItemDiarioEdicao) {

    botao.innerHTML = "💾 Atualizar";

    botao.setAttribute(
      "onclick",
      "atualizarItemDiarioOffline_()"
    );

  } else {

    botao.innerHTML = "💾 Salvar";

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

    // TODO UX.07.14
    // Registrar UPDATE na TB_SYNC_QUEUE

    encerrarModoEdicaoItemDiario_();

    await listarItensDiarioOffline_();

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
      throw new Error("ID da obra não informado.");
    }

    const obras =
      await listarRegistrosSIGO("TB_OBRAS");

    const obra =
      obras.find(item =>
        String(item.idObra) === String(idObra)
      );

    if (!obra) {
      throw new Error(
        "Obra não encontrada no banco offline."
      );
    }

    localStorage.setItem("obraAtiva", idObra);

    await atualizarHomeMobile_();
    await listarObrasOfflineMobile_();

    const nomeObra =
      document.getElementById("nomeObra");

    if (nomeObra) {
      nomeObra.textContent =
        obra.nomeObra || obra.idObra;
    }

   SIGOUI.feedback.success(
      "Obra ativa alterada",
      `Agora você está trabalhando na obra "${obra.nomeObra || obra.idObra}".`
    );

  } catch (erro) {
    console.error("Erro ao definir obra ativa:", erro);
    SIGOUI.feedback.error(
      "Erro ao definir obra ativa",
      erro.message || "Não foi possível alterar a obra ativa."
    );
  }
}

async function baixarObraOfflineMobile_(idObra) {
  try {
    if (!idObra) {
      throw new Error("ID da obra não informado.");
    }

    const obrasLocais =
      await listarRegistrosSIGO("TB_OBRAS");

    const jaExiste =
      obrasLocais.some(obra =>
        String(obra.idObra) === String(idObra)
      );

    if (jaExiste) {
      SIGOUI.feedback.warning(
        "Obra já baixada",
        "Esta obra já está disponível neste dispositivo."
      );

      return;
    }

    if (obrasLocais.length >= 3) {
      SIGOUI.feedback.warning(
        "Limite atingido",
        "Remova uma obra antes de baixar outra. O limite é de 3 obras offline."
      );

      return;
    }

    const obraAnterior =
      localStorage.getItem("obraAtiva");

    localStorage.setItem("obraAtiva", idObra);

    await sincronizarDadosBaseObraMobile();

    if (obraAnterior) {
      localStorage.setItem("obraAtiva", obraAnterior);
    } else {
      localStorage.setItem("obraAtiva", idObra);
    }

    await atualizarHomeMobile_();
    await listarObrasOfflineMobile_();
    await listarObrasDisponiveisMobile_();

    SIGOUI.feedback.success(
      "Obra baixada",
      "A obra foi disponibilizada para uso offline."
    );

  } catch (erro) {
    console.error("Erro ao baixar obra offline:", erro);

    SIGOUI.feedback.error(
      "Erro ao baixar obra",
      erro.message || "Não foi possível baixar a obra para uso offline."
    );
  }
}

async function removerObraOfflineMobile_(idObra) {
  try {
    if (!idObra) {
      throw new Error("ID da obra não informado.");
    }

    const confirmar = await SIGOUI.feedback.confirm({
      tipo: "warning",
      icone: "🗑️",
      titulo: "Remover obra",
      mensagem:
        `Deseja remover a obra ${idObra} deste dispositivo?\n\n` +
        "Todos os dados offline desta obra serão apagados.",
      textoConfirmar: "Remover",
      textoCancelar: "Cancelar"
    });
    
    if (!confirmar) return;

    await removerRegistrosPorObraSIGO_("TB_ATIVIDADES_OBRA", idObra);
    await removerRegistrosPorObraSIGO_("TB_DIARIOS", idObra);
    await removerRegistrosPorObraSIGO_("TB_DIARIO_ITENS", idObra);
    await removerRegistrosPorObraSIGO_("TB_MEDICOES", idObra);
    await removerRegistrosPorObraSIGO_("TB_OCORRENCIAS", idObra);
    await removerRegistrosPorObraSIGO_("TB_CLIMA", idObra);
    await removerRegistrosPorObraSIGO_("TB_EVIDENCIAS", idObra);

    await removerRegistroPorChaveSIGO_("TB_OBRAS", idObra);

    const obraAtiva = localStorage.getItem("obraAtiva");

    if (String(obraAtiva) === String(idObra)) {
      const obrasRestantes = await listarRegistrosSIGO("TB_OBRAS");

      if (obrasRestantes.length) {
        localStorage.setItem("obraAtiva", obrasRestantes[0].idObra);
      } else {
        localStorage.removeItem("obraAtiva");
      }
    }

   await atualizarHomeMobile_();
   await listarObrasOfflineMobile_();
   await listarObrasDisponiveisMobile_();

    SIGOUI.feedback.success(
      "Obra removida",
      "A obra foi removida deste dispositivo."
    );
    
    } catch (erro) {
    
      console.error(
        "Erro ao remover obra offline:",
        erro
      );
    
      SIGOUI.feedback.error(
        "Erro ao remover obra",
        erro.message || "Não foi possível remover a obra deste dispositivo."
      );
    
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

    const medicoes =
      await listarRegistrosSIGO("TB_MEDICOES");

    const medicoesObra =
      medicoes
        .filter(item =>
          String(item.idObra) === String(obraAtiva)
        )
        .sort((a, b) =>
          new Date(b.criadoEm) - new Date(a.criadoEm)
        );

    if (!medicoesObra.length) {
      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma medição salva.
        </div>
      `;
      return;
    }

    container.innerHTML =
      medicoesObra
        .map(medicao => criarCardMedicaoOffline_(medicao))
        .join("");

  } catch (erro) {
    console.error(
      "Erro ao listar medições:",
      erro
    );

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
