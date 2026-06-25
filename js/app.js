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
        medicoes: medicoesPendentes,
        ocorrencias: [],
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

    await atualizarIndicadoresMobile_();
    await carregarListaDiariosOffline();
    await listarMedicoesOffline_();
    await listarEvidenciasOffline_();
    await listarClimasOffline_();

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
          <option value="3.1.1" data-servico="Escavação manual de vala" data-qtde="100" data-un="m³">
            3.1.1 - Escavação manual de vala
          </option>
          <option value="2.1" data-servico="Locação e gabarito" data-qtde="50" data-un="m">
            2.1 - Locação e gabarito
          </option>
          <option value="1.1" data-servico="Administração da obra" data-qtde="160" data-un="H">
            1.1 - Administração da obra
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
        document.getElementById(
          "evidenciaObra"
        ).value,

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
    idObra: document.getElementById("climaObra").value,
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
