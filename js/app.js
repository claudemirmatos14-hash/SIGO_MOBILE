const SIGO_API_URL = "https://script.google.com/macros/s/AKfycbzVE7tdTSwHvKgLkrdcaQtGAm_muqNPo6n0wQZBDpmRwtAJuySfWyh6gdef0R6g_drKRw/exec";
const SIGO_TOKEN_OFFLINE = "SIGO_TOKEN_OFFLINE";

document.addEventListener("DOMContentLoaded", () => {
  iniciarSeletorObra();
});

function iniciarSeletorObra() {
  const seletor = document.getElementById("obraAtiva");
  const nomeObra = document.getElementById("nomeObra");

  if (!seletor) return;

  const obraSalva = localStorage.getItem("obraAtiva");

  if (obraSalva) {
    seletor.value = obraSalva;
  }

  atualizarNomeObra_(seletor, nomeObra);

  seletor.addEventListener("change", () => {
    localStorage.setItem("obraAtiva", seletor.value);
    atualizarNomeObra_(seletor, nomeObra);

    console.log("Obra ativa:", seletor.value);
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

  setTimeout(() => {
    listarMedicoesOffline_();
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
      document.getElementById("diarioObra").value,

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
        diarioItens: [],
        medicoes: [],
        ocorrencias: [],
        clima: [],
        evidencias: []
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

    await atualizarIndicadoresMobile_();
    await carregarListaDiariosOffline();

    alert("Sincronização enviada ao SIGO com sucesso.");

  } catch (erro) {

    console.error("Erro ao sincronizar com API SIGO:", erro);

    alert("Erro ao sincronizar com o SIGO.");

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
          <option value="1.1.1" data-servico="Escavação manual de vala" data-qtde="100" data-un="m³">
            1.1.1 - Escavação manual de vala
          </option>
          <option value="2.1" data-servico="Locação e gabarito" data-qtde="50" data-un="m">
            2.1 - Locação e gabarito
          </option>
          <option value="3.1.1" data-servico="Administração da obra" data-qtde="160" data-un="H">
            3.1.1 - Administração da obra
          </option>
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

function preencherDadosAtividadeMedicao() {
  const select = document.getElementById("medicaoAtividade");
  const opcao = select.options[select.selectedIndex];

  if (!opcao || !opcao.value) return;

  document.getElementById("medicaoServico").value =
    opcao.dataset.servico || "";

  document.getElementById("medicaoQtdePlanejada").value =
    opcao.dataset.qtde || "";

  document.getElementById("medicaoUnidade").value =
    opcao.dataset.un || "";

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


async function salvarMedicaoOffline(event) {
  event.preventDefault();

  const medicao = {
    idMedicao: "MED-" + Date.now(),
    data: document.getElementById("medicaoData").value,
    idObra: document.getElementById("medicaoObra").value,
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
    criadoEm: new Date().toISOString()
  };

  try {
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
    alert("Erro ao salvar medição offline.");
  }
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
