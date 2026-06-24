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
          <option value="">Selecione</option>
          <option value="ENSOLARADO">Ensolarado</option>
          <option value="NUBLADO">Nublado</option>
          <option value="CHUVA">Chuva</option>
          <option value="CHUVA FORTE">Chuva forte</option>
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

    const diarios = await listarRegistrosSIGO(
      "TB_DIARIOS"
    );

    const total = diarios.length;

    const cardRegistros =
      document.querySelector(".resumo .card strong");

    if (cardRegistros) {
      cardRegistros.textContent = total;
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
