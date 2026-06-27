const SIGO_API_URL = "https://script.google.com/macros/s/AKfycbzVE7tdTSwHvKgLkrdcaQtGAm_muqNPo6n0wQZBDpmRwtAJuySfWyh6gdef0R6g_drKRw/exec";
const SIGO_TOKEN_OFFLINE = "SIGO_TOKEN_OFFLINE";

document.addEventListener("DOMContentLoaded", async () => {
  await atualizarHomeMobile_();
    iniciarSeletorObra();
});

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
  const area = document.getElementById("telaApp");

  if (!area) return;

 area.innerHTML = montarTela(tela);

  if (tela === "diario") {
  setTimeout(carregarListaDiariosOffline, 100);
}

 if (tela === "medicoes") {

  setTimeout(async () => {
    await carregarAtividadesMedicaoOffline_();
    await listarMedicoesOffline_();
  }, 100);

}
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

  if (tela === "diarioItens") {

  setTimeout(async () => {
    await carregarAtividadesItemDiarioOffline_();
    await listarItensDiarioOffline_();
  }, 100);

}

  window.scrollTo({
    top: area.offsetTop,
    behavior: "smooth"
  });
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
  const obraAtiva = localStorage.getItem("obraAtiva") || "OBR002";

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

  event.preventDefault();

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

    alert(
      "Diário salvo offline no banco local."
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

    alert(
      "Erro ao salvar diário offline."
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

    const diarios =
      await listarRegistrosSIGO("TB_DIARIOS");

    if (!diarios || diarios.length === 0) {
      areaLista.innerHTML =
        "<p class='lista-vazia'>Nenhum diário salvo offline.</p>";
      return;
    }

    areaLista.innerHTML = diarios
      .sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)))
      .map(diario => `
        <div class="diario-item">
          <strong>${diario.idObra}</strong>
          <span>${diario.data}</span>
          <p>${diario.responsavel || "Sem responsável"}</p>
          <small>${diario.statusSync}</small>
        </div>
      `)
      .join("");

  } catch (erro) {

    console.error("Erro ao carregar diários offline:", erro);

    areaLista.innerHTML =
      "<p class='lista-vazia'>Erro ao carregar diários.</p>";
  }
}

async function sincronizarSIGO() {

  try {

    const fila = await listarRegistrosSIGO("TB_SYNC_QUEUE");

    const pendentes = fila.filter(
      item => item.statusSync === "PENDENTE"
    );

    if (pendentes.length === 0) {
      alert("Não existem registros pendentes.");
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

    alert("Sincronização enviada ao SIGO com sucesso.");

  } catch (erro) {

    console.error("Erro ao sincronizar com API SIGO:", erro);

    alert("Erro ao sincronizar com o SIGO.");

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
    
    alert(
      "Dados-base atualizados com sucesso. Atividades: " +
      atividades.length
    );

  } catch (erro) {

    console.error("Erro ao sincronizar dados-base:", erro);

    alert("Erro ao sincronizar dados-base da obra.");

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
    alert("Atividade não encontrada nos dados-base offline. Atualize os dados-base da obra.");
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
    eap: document.getElementById("medicaoAtividade").value,
    servico: document.getElementById("medicaoServico").value,
    qtdePlanejada: Number(document.getElementById("medicaoQtdePlanejada").value || 0),
    qtdeExecutada: Number(document.getElementById("medicaoQtdeExecutada").value || 0),
    un: document.getElementById("medicaoUnidade").value,
    percentualExecutado: Number(document.getElementById("medicaoPercentual").value || 0),
    responsavel: document.getElementById("medicaoResponsavel").value,
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

    alert("Medição salva offline no banco local.");

    console.log("Medição salva no IndexedDB:", medicao);

  } catch (erro) {
    console.error("Erro ao salvar medição:", erro);
    alert(erro.message || "Erro ao salvar medição offline.");
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

  const saldoBase = Number(atividadeBase.saldoDisponivel || 0);
  const saldoDisponivelAtual = saldoBase - totalJaMedidoOffline;
  const qtdeExecutada = Number(medicao.qtdeExecutada || 0);

  if (qtdeExecutada <= 0) {
    throw new Error("Informe uma quantidade executada maior que zero.");
  }

  medicao.qtdePlanejada = Number(atividadeBase.qtdePlanejada || 0);
  medicao.un = atividadeBase.unidade || medicao.un;
  medicao.servico = atividadeBase.servico || medicao.servico;

  medicao.saldoBaseOffline = saldoBase;
  medicao.totalJaMedidoOffline = totalJaMedidoOffline;
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

    const justificativa = prompt(
      "⚠ EXCESSO DETECTADO NA MEDIÇÃO\n\n" +
      "Atividade: " + atividadeBase.servico + "\n" +
      "Saldo base: " + saldoBase + " " + atividadeBase.unidade + "\n" +
      "Já medido offline: " + totalJaMedidoOffline + " " + atividadeBase.unidade + "\n" +
      "Saldo disponível atual: " + saldoDisponivelAtual + " " + atividadeBase.unidade + "\n" +
      "Quantidade informada: " + qtdeExecutada + " " + atividadeBase.unidade + "\n\n" +
      "Informe a justificativa para continuar:"
    );

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

async function listarMedicoesOffline_() {

  const container =
    document.getElementById("listaMedicoesOffline");

  if (!container) return;

  try {

    const medicoes =
      await listarRegistrosSIGO("TB_MEDICOES");

    if (!medicoes.length) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhuma medição salva.
        </div>
      `;

      return;
    }

    container.innerHTML =
      medicoes
        .sort((a,b) =>
          new Date(b.criadoEm) -
          new Date(a.criadoEm)
        )
        .map(medicao => `

          <div class="item-offline">

            <strong>
              ${medicao.atividade}
            </strong>

            <small>
              ${medicao.servico}
            </small>

            <br>

            <small>
              ${medicao.qtdeExecutada}
              /
              ${medicao.qtdePlanejada}
              ${medicao.un}
            </small>

            <br>

            <small>
              ${medicao.percentualExecutado}%
            </small>

            <br>

            <span class="
              badge-sync
              ${medicao.statusSync === 'SINCRONIZADO'
                ? 'ok'
                : 'pendente'}
            ">
              ${medicao.statusSync}
            </span>

          </div>

        `)
        .join("");

  } catch (erro) {

    console.error(
      "Erro ao listar medições:",
      erro
    );

    container.innerHTML =
      "Erro ao carregar.";

  }

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

      alert(
        "Selecione um arquivo."
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

    alert(
      "Evidência salva offline."
    );

    console.log(
      "Evidência:",
      evidencia
    );

  } catch (erro) {

    console.error(erro);

    alert(
      "Erro ao salvar evidência."
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

    alert("Clima salvo offline no banco local.");

    console.log("Clima salvo no IndexedDB:", clima);

  } catch (erro) {
    console.error("Erro ao salvar clima:", erro);
    alert("Erro ao salvar clima offline.");
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

function montarTelaOcorrencias_() {

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

    alert(
      "Ocorrência salva offline."
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

    alert(
      "Erro ao salvar ocorrência."
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

function montarTelaDiarioItens_() {
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
}

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
    alert("Atividade não encontrada nos dados-base offline. Atualize os dados-base da obra.");
    return;
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

    alert("Item do diário salvo offline no banco local.");

    console.log("Item diário salvo no IndexedDB:", item);

  } catch (erro) {
    console.error("Erro ao salvar item do diário:", erro);
    alert(erro.message || "Erro ao salvar item do diário offline.");
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

  const justificativa = prompt(
    "⚠ EXCESSO DETECTADO\n\n" +
    "Atividade: " + atividadeBase.servico + "\n" +
    "Saldo base: " + saldoBase + " " + atividadeBase.unidade + "\n" +
    "Já executado offline: " + totalJaExecutadoOffline + " " + atividadeBase.unidade + "\n" +
    "Saldo disponível atual: " + saldoAtual + " " + atividadeBase.unidade + "\n" +
    "Quantidade informada: " + qtdeExecutada + " " + atividadeBase.unidade + "\n\n" +
    "Informe a justificativa:"
  );

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
    document.getElementById(
      "listaItensDiarioOffline"
    );

  if (!container) return;

  try {

    const itens =
      await listarRegistrosSIGO(
        "TB_DIARIO_ITENS"
      );

    if (!itens.length) {

      container.innerHTML = `
        <div class="card-vazio">
          Nenhum item registrado.
        </div>
      `;

      return;
    }

    container.innerHTML =
      itens
        .sort((a,b)=>
          new Date(b.criadoEm) -
          new Date(a.criadoEm)
        )
        .map(item => `
          <div class="item-offline">

            <strong>
              ${item.atividade}
            </strong>

            <small>
              ${item.servico}
            </small>

            <small>
              ${item.qtdeExecutada}
              ${item.un}
            </small>

            <small>
              ${item.equipe}
            </small>

            <small>
              ${item.horasTrabalhadas} h
            </small>

            <span class="
              badge-sync
              ${
                item.statusSync === "SINCRONIZADO"
                ? "ok"
                : "pendente"
              }
            ">
              ${item.statusSync}
            </span>

          </div>
        `)
        .join("");

  } catch (erro) {

    console.error(
      "Erro ao listar itens:",
      erro
    );

  }
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

    alert(
      "Obra ativa alterada para " +
      obra.idObra +
      " - " +
      (obra.nomeObra || obra.idObra)
    );

  } catch (erro) {
    console.error("Erro ao definir obra ativa:", erro);
    alert(erro.message || "Erro ao definir obra ativa.");
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
      alert("Esta obra já está baixada neste dispositivo.");
      return;
    }

    if (obrasLocais.length >= 3) {
      alert("Limite de 3 obras offline atingido. Remova uma obra antes de baixar outra.");
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

    alert("Obra baixada com sucesso.");

  } catch (erro) {
    console.error("Erro ao baixar obra offline:", erro);
    alert(erro.message || "Erro ao baixar obra offline.");
  }
}

async function removerObraOfflineMobile_(idObra) {
  try {
    if (!idObra) {
      throw new Error("ID da obra não informado.");
    }

    const confirmar = confirm(
      "Deseja remover a obra " + idObra + " deste dispositivo?\n\n" +
      "Os dados locais desta obra serão apagados."
    );

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

    alert("Obra removida deste dispositivo.");

  } catch (erro) {
    console.error("Erro ao remover obra offline:", erro);
    alert(erro.message || "Erro ao remover obra offline.");
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
