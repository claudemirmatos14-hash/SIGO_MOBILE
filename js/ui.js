// =====================================================
// SIGO MOBILE — UI PREMIUM
// UX.07.12.2.2
// =====================================================

function montarHomePremium() {

  const tela = SIGOUI.createScreen({

    header: true,

    hero: SIGOUI.createHeroCard({

      titulo: "OBRA ATIVA",

      nome: "Selecione uma obra offline",

      offline: "0 de 3 obras offline",

      atividades: "0 atividades offline",

      execucao: "12 em execução"

    }),

    
    sections: [

      SIGOUI.createFieldSection(),

      SIGOUI.createStatus(),

      SIGOUI.createTools()

    ],

    bottom: true

  });

  SIGOUI.render(".app-premium", tela);

  setTimeout(async () => {
    if (typeof carregarObrasMobile_ === "function") {
      await carregarObrasMobile_();
    }
  
    if (typeof atualizarIndicadoresMobile_ === "function") {
      atualizarIndicadoresMobile_();
    }
  }, 100);

}

function criarCardObraAtivaSIGO() {
  return `
    <section class="sigo-card sigo-card--hero obra-card">
      <div class="section-title">
        <span>🏗</span>
        <h2>OBRA ATIVA</h2>
      </div>

      <select id="obraAtiva">
        <option value="">Carregando obras...</option>
      </select>

      <div class="obra-content">
        <div>
          <h3 id="nomeObra">Selecione uma obra offline</h3>

          <div class="obra-meta">
            <small id="contadorObrasOffline">0 de 3 obras offline</small>
            <small id="contadorAtividadesOffline">0 atividades offline</small>
            <small>12 em execução</small>
          </div>
        </div>

        <div class="obra-image-placeholder"></div>
      </div>
    </section>
  `;
}

function criarSecaoTrabalhoCampoSIGO() {
  return `
    <section class="sigo-card sigo-card--section field-card">
      <div class="section-header">
        <div>
          <h2>👷 Trabalho de Campo</h2>
          <span>Acompanhe a execução da obra</span>
        </div>
      </div>

      <div class="sigo-grid">
        ${SIGOUI.createModule({
          acao: "navegarPara('diario')",
          cor: "is-blue",
          icone: "📘",
          titulo: "Diário de Obra",
          badge: "Hoje concluído",
          badgeTipo: "is-success",
          descricao: "Registrar produção diária"
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('diarioItens')",
          cor: "is-orange",
          icone: "📋",
          titulo: "Itens do Diário",
          badge: "14 itens",
          badgeTipo: "is-warning",
          descricao: "Atividades executadas"
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('medicoes')",
          cor: "is-purple",
          icone: "📏",
          titulo: "Medições",
          badge: "MED.05",
          badgeTipo: "is-warning",
          descricao: "6 serviços pendentes",
          destaque: true
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('ocorrencias')",
          cor: "is-red",
          icone: "⚠️",
          titulo: "Ocorrências",
          badge: "3 abertas",
          badgeTipo: "is-danger",
          descricao: "2 críticas"
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('clima')",
          cor: "is-blue",
          icone: "🌦️",
          titulo: "Clima",
          badge: "Hoje",
          badgeTipo: "is-info",
          descricao: "Ensolarado 28°C"
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('evidencias')",
          cor: "is-green",
          icone: "📷",
          titulo: "Evidências",
          badge: "12 fotos",
          badgeTipo: "is-success",
          descricao: "Hoje"
        })}
      </div>
    </section>
  `;
}

function criarCardSituacaoObraSIGO() {
  return `
    <section class="sigo-card sigo-card--status status-card">
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

      <div id="syncStatus" class="operation-status success">
        🟢 OPERAÇÃO NORMAL
      </div>
    </section>
  `;
}

function criarSecaoFerramentasSIGO() {
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

function montarTelaDiarioObra() {
  const formDiario = `
    <div class="sigo-form">
      ${SIGOUI.createDate({
        id: "diarioData",
        label: "Data"
      })}

      ${SIGOUI.createInput({
        id: "diarioResponsavel",
        label: "Responsável",
        placeholder: "Nome do responsável"
      })}

      ${SIGOUI.createInput({
        id: "diarioEquipe",
        label: "Equipe",
        placeholder: "Equipe em campo"
      })}

      ${SIGOUI.createNumber({
        id: "diarioHoras",
        label: "Horas do Dia",
        placeholder: "Ex.: 8"
      })}

      ${SIGOUI.createSelect({
        id: "diarioClima",
        label: "Clima",
        options: [
          { value: "", label: "Selecione" },
          { value: "☀️ ENSOLARADO", label: "☀️ Ensolarado" },
          { value: "⛅ PARCIALMENTE NUBLADO", label: "⛅ Parcialmente Nublado" },
          { value: "☁️ NUBLADO", label: "☁️ Nublado" },
          { value: "🌧️ CHUVOSO", label: "🌧️ Chuvoso" },
          { value: "⛈️ TEMPESTADE", label: "⛈️ Tempestade" }
        ]
      })}

      ${SIGOUI.createTextarea({
        id: "diarioOcorrencias",
        label: "Ocorrências Gerais",
        rows: 3,
        placeholder: "Descreva ocorrências gerais"
      })}

      ${SIGOUI.createTextarea({
        id: "diarioObservacoes",
        label: "Observações Gerais",
        rows: 3,
        placeholder: "Observações do dia"
      })}
    </div>
  `;

  const listaDiarios = `
    <div id="listaDiariosOffline" class="sigo-list">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Nenhum diário carregado</h3>
        <p>Os registros aparecerão aqui após carregar a lista.</p>
      </div>
    </div>
  `;

  return SIGOUI.createCrudScreen({
    titulo: "📘 DIÁRIO DE OBRA",
    nome: "Relatório diário da obra",
    subtitulo: "Registro operacional",
    info: "Produção, equipe e observações",
    status: "Modo offline",

    actions: [
      {
        icone: "➕",
        texto: "Novo Diário",
        tipo: "is-primary",
        acao: "limparFormularioDiario()"
      },
      {
        icone: "💾",
        texto: "Salvar",
        tipo: "is-success",
        acao: "salvarDiarioPremium()"
      }
    ],

    formTitle: "📋 Dados do Diário",
    formSubtitle: "Informações principais do relatório",
    form: formDiario,

    listTitle: "📚 Diários Registrados",
    listSubtitle: "Histórico offline da obra ativa",
    list: listaDiarios,

    bottom: true
  });
}

function criarSecaoDadosDiarioObra_() {
  return SIGOUI.createSection(
    "📋 Dados do Diário",
    "Informações principais do relatório",
    `
      <div class="sigo-form">
        ${SIGOUI.createDate({
          id: "diarioData",
          label: "Data"
        })}

        ${SIGOUI.createInput({
          id: "diarioResponsavel",
          label: "Responsável",
          placeholder: "Nome do responsável"
        })}

        ${SIGOUI.createInput({
          id: "diarioEquipe",
          label: "Equipe",
          placeholder: "Equipe em campo"
        })}

        ${SIGOUI.createNumber({
          id: "diarioHoras",
          label: "Horas do Dia",
          placeholder: "Ex.: 8"
        })}
      </div>
    `
  );
}

function criarSecaoCondicoesDiarioObra_() {
  return SIGOUI.createSection(
    "🌦 Condições do Dia",
    "Clima e situação operacional",
    `
      <div class="sigo-form">
        ${SIGOUI.createSelect({
          id: "diarioClima",
          label: "Clima",
          options: [
            { value: "", label: "Selecione" },
            { value: "ENSOLARADO", label: "Ensolarado" },
            { value: "NUBLADO", label: "Nublado" },
            { value: "CHUVA", label: "Chuva" },
            { value: "VENTO", label: "Vento" }
          ]
        })}

        ${SIGOUI.createTextarea({
          id: "diarioOcorrencias",
          label: "Ocorrências Gerais",
          rows: 3,
          placeholder: "Descreva ocorrências gerais"
        })}
      </div>
    `
  );
}

function criarSecaoObservacoesDiarioObra_() {
  return SIGOUI.createSection(
    "📝 Observações",
    "Anotações adicionais do dia",
    `
      <div class="sigo-form">
        ${SIGOUI.createTextarea({
          id: "diarioObservacoes",
          label: "Observações",
          rows: 4,
          placeholder: "Observações do diário"
        })}
      </div>
    `
  );
}

function criarSecaoListaDiariosObra_() {
  return SIGOUI.createSection(
    "📚 Diários Registrados",
    "Histórico offline da obra ativa",
    `
      <div id="listaDiariosOffline" class="sigo-list">
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>Nenhum diário carregado</h3>
          <p>Os registros aparecerão aqui após carregar a lista.</p>
        </div>
      </div>
    `
  );
}

function limparFormularioDiario() {
  ["diarioData", "diarioResponsavel", "diarioEquipe", "diarioHoras", "diarioClima", "diarioOcorrencias", "diarioObservacoes"]
    .forEach(id => {
      const campo = document.getElementById(id);
      if (campo) campo.value = "";
    });

  const data = document.getElementById("diarioData");
  if (data) data.value = new Date().toISOString().split("T")[0];
}



function montarTelaItensDiario() {
  const formItemDiario = `
    <div class="sigo-form">

      ${SIGOUI.createDate({
        id: "itemDiarioData",
        label: "Data"
      })}

      ${SIGOUI.createSelect({
        id: "itemDiarioAtividade",
        label: "Atividade",
        options: [
          { value: "", label: "Carregando atividades..." }
        ]
      })}

      ${SIGOUI.createInput({
        id: "itemDiarioEap",
        label: "EAP",
        placeholder: "EAP da atividade",
        readonly: true
      })}

      ${SIGOUI.createInput({
        id: "itemDiarioServico",
        label: "Serviço",
        placeholder: "Serviço selecionado",
        readonly: true
      })}

      ${SIGOUI.createInput({
        id: "itemDiarioEquipe",
        label: "Equipe",
        placeholder: "Equipe executora"
      })}

      ${SIGOUI.createInput({
        id: "itemDiarioEquipamento",
        label: "Equipamento",
        placeholder: "Equipamento utilizado"
      })}

      ${SIGOUI.createNumber({
        id: "itemDiarioQtde",
        label: "Quantidade Executada",
        placeholder: "Ex.: 12.50"
      })}

      ${SIGOUI.createInput({
        id: "itemDiarioUnidade",
        label: "Unidade",
        placeholder: "m², m³, h, un...",
        readonly: true
      })}

      ${SIGOUI.createNumber({
        id: "itemDiarioHoras",
        label: "Horas Trabalhadas",
        placeholder: "Ex.: 8"
      })}

      ${SIGOUI.createTextarea({
        id: "itemDiarioObservacao",
        label: "Observação",
        rows: 3,
        placeholder: "Observações do item executado"
      })}

    </div>
  `;

  const listaItens = `
    <div id="listaItensDiarioOffline" class="sigo-list">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Nenhum item carregado</h3>
        <p>Os itens do diário aparecerão aqui.</p>
      </div>
    </div>
  `;

  return SIGOUI.createCrudScreen({
    titulo: "📋 ITENS DO DIÁRIO",
    nome: "Produção diária observada",
    subtitulo: "Registro operacional",
    info: "Atividade, quantidade, equipe e horas",
    status: "Modo offline",

    actions: [
      {
        icone: "➕",
        texto: "Novo Item",
        tipo: "is-primary",
        acao: "limparFormularioItemDiario()"
      },
      {
        icone: "💾",
        texto: "Salvar",
        tipo: "is-success",
        acao: "salvarItemDiarioPremium()"
      }
    ],

    formTitle: "📋 Dados do Item",
    formSubtitle: "Produção registrada em campo",
    form: formItemDiario,

    listTitle: "📚 Itens Registrados",
    listSubtitle: "Histórico offline da obra ativa",
    list: listaItens,

    bottom: true
  });
}

function limparFormularioItemDiario() {
  [
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
  ].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  const data = document.getElementById("itemDiarioData");
  if (data) data.value = new Date().toISOString().split("T")[0];
}

async function salvarDiarioPremium() {
  try {
    await SIGOCRUD.saveOffline(SIGOEntities.diario);

    SIGOUI.feedback.success(
      "Diário salvo",
      "Registro salvo offline."
    );

  } catch (erro) {
    console.error("Erro ao salvar diário premium:", erro);

    SIGOUI.feedback.error(
      "Erro",
      erro.message
    );
  }
}

async function salvarItemDiarioPremium() {
  try {
    await SIGOCRUD.saveOffline(SIGOEntities.diarioItem);

    SIGOUI.feedback.success(
      "Item salvo",
      "Item do diário salvo offline com sucesso."
    );

  } catch (erro) {
    console.error("Erro ao salvar item do diário:", erro);

    SIGOUI.feedback.error(
      "Erro ao salvar",
      "Não foi possível salvar o item do diário."
    );
  }
}

function montarTelaObrasOffline() {
  return SIGOUI.createScreen({
    header: true,

    hero: SIGOUI.createHeroCard({
      titulo: "🏗 OBRAS OFFLINE",
      nome: "Gerenciador de obras",
      offline: "Baixar, selecionar e atualizar",
      atividades: "Dados-base da obra",
      execucao: "Modo offline"
    }),

    actions: [
      {
        icone: "⬇",
        texto: "Baixar Obra",
        tipo: "is-primary",
        acao: "listarObrasDisponiveisMobile_()"
      },
      {
        icone: "🔄",
        texto: "Atualizar Base",
        tipo: "is-secondary",
        acao: "sincronizarDadosBaseObraMobile()"
      }
    ],

    sections: [
      SIGOUI.createSection(
        "📦 Obras Baixadas",
        "Obras disponíveis neste dispositivo",
        `
          <div id="listaObrasOffline" class="sigo-list">
            <div class="empty-state">
              <div class="empty-icon">🏗</div>
              <h3>Carregando obras offline...</h3>
              <p>As obras baixadas aparecerão aqui.</p>
            </div>
          </div>
        `
      ),

      SIGOUI.createSection(
        "☁ Obras Disponíveis",
        "Obras disponíveis para download",
        `
          <div id="listaObrasDisponiveis" class="sigo-list">
            <div class="empty-state">
              <div class="empty-icon">☁</div>
              <h3>Carregando obras disponíveis...</h3>
              <p>As obras disponíveis aparecerão aqui.</p>
            </div>
          </div>
        `
      )
    ],

    bottom: true,
    activeNav: "obras"
  });
}

function montarTelaMedicoes() {
  return SIGOUI.createCrudScreen({
    titulo: "📏 MEDIÇÕES",
    nome: "Registrar avanço físico",
    subtitulo: "Controle de medições offline",
    info: "Saldo, avanço físico e sincronização",
    status: "Modo offline",

    actions: [
      {
        icone: "➕",
        texto: "Nova",
        tipo: "is-primary",
        acao: "novaMedicaoPremium()"
      },
      {
        icone: "💾",
        texto: "Salvar",
        tipo: "is-success",
        acao: "salvarMedicaoPremium()"
      }
    ],

    formTitle: "📋 Dados da Medição",
    formSubtitle: "Medição vinculada ao planejamento offline",
    form: montarFormularioMedicao(),

    listTitle: "📚 Histórico Offline",
    listSubtitle: "Medições registradas neste dispositivo",
    list: `
      <div id="listaMedicoesOffline" class="sigo-list">
        Nenhuma medição salva.
      </div>
    `,

    bottom: true
  });
}

function novaMedicaoPremium() {
  [
    "medicaoData",
    "medicaoAtividade",
    "medicaoServico",
    "medicaoQtdePlanejada",
    "medicaoUnidade",
    "medicaoQtdeExecutada",
    "medicaoPercentual",
    "medicaoObservacao"
  ].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  const data = document.getElementById("medicaoData");
  if (data) data.value = new Date().toISOString().split("T")[0];
}

function montarFormularioMedicao() {
  const obraAtiva = obterObraAtivaMobile_();

  return `
    ${SIGOUI.createDate({
      id: "medicaoData",
      label: "Data",
      value: new Date().toISOString().split("T")[0]
    })}

    ${SIGOUI.createInput({
      id: "medicaoObra",
      label: "Obra Ativa",
      value: obraAtiva,
      readonly: true
    })}

    ${SIGOUI.createSelect({
      id: "medicaoAtividade",
      label: "Atividade",
      options: [],
      onchange: "preencherDadosAtividadeMedicaoOficial()"
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

    ${SIGOUI.createInput({
      id: "medicaoUnidade",
      label: "Unidade",
      readonly: true
    })}

    ${SIGOUI.createNumber({
      id: "medicaoQtdePlanejada",
      label: "Quantidade Planejada",
      readonly: true
    })}

    ${SIGOUI.createNumber({
      id: "medicaoJaMedido",
      label: "Já Medido Offline",
      readonly: true
    })}

    ${SIGOUI.createNumber({
      id: "medicaoSaldoDisponivel",
      label: "Saldo Disponível",
      readonly: true
    })}

    ${SIGOUI.createNumber({
      id: "medicaoQtdeExecutada",
      label: "Quantidade Executada",
      oninput: "calcularPercentualMedicaoOficial()"
    })}

    ${SIGOUI.createNumber({
      id: "medicaoPercentual",
      label: "% Executado",
      readonly: true
    })}

    ${SIGOUI.createTextarea({
      id: "medicaoObservacao",
      label: "Observação",
      rows: 3,
      placeholder: "Observações da medição"
    })}
  `;
}


function voltarHome() {
  if (typeof montarHomePremium === "function") {
    montarHomePremium();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
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
  await salvarMedicaoOffline({
    preventDefault: function () {}
  });
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

function criarCardMedicaoOffline_(medicao) {
  const status =
    medicao.statusSync || "PENDENTE";
  
  let badge = "";
  let classeStatus = "";
  
  switch (status) {
  
    case "SINCRONIZADO":
      badge = "🟢 SINCRONIZADO";
      classeStatus = "success";
      break;
  
    case "ERRO":
      badge = "🔴 ERRO";
      classeStatus = "danger";
      break;
  
    default:
      badge = "🟡 PENDENTE";
      classeStatus = "warning";
  }

  const bloqueado =
    status !== "PENDENTE";

  const excesso =
    medicao.excessoDetectado === "SIM";

  return `
    <article class="medicao-card">

      <div class="medicao-card__header">
        <div>
          <strong>
            📏 ${medicao.eap || medicao.atividade || "-"}
          </strong>

          <span>
            ${medicao.servico || "Serviço não informado"}
          </span>
        </div>

        <span class="badge-sync badge-${classeStatus}">
            ${badge}
        </span>
      </div>

      <div class="medicao-card__grid">

        <div>
          <small>Data</small>
          <strong>${formatarDataMedicao_(medicao.data)}</strong>
        </div>

        <div>
          <small>Quantidade</small>
          <strong>
            ${formatarNumeroMedicao_(medicao.qtdeExecutada)}
            ${medicao.un || ""}
          </strong>
        </div>

        <div>
          <small>% Executado</small>
          <strong>
            ${formatarNumeroMedicao_(medicao.percentualExecutado)}%
          </strong>
        </div>

        <div>
          <small>Saldo Restante</small>
          <strong>
            ${formatarNumeroMedicao_(medicao.saldoDisponivelDepois)}
            ${medicao.un || ""}
          </strong>
        </div>

      </div>

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
          : ""
      }

      <div class="medicao-card__actions">

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="editarMedicaoOffline_('${medicao.idMedicao}')">
          ✏ Editar
        </button>

        <button
          type="button"
          ${bloqueado ? "disabled" : ""}
          onclick="excluirMedicaoOffline_('${medicao.idMedicao}')">
          🗑 Excluir
        </button>

        <button
          type="button"
          onclick="detalharMedicaoOffline_('${medicao.idMedicao}')">
          👁 Detalhes
        </button>

      </div>

    </article>
  `;
}

function formatarNumeroMedicao_(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatarDataMedicao_(data) {
  if (!data) return "--";

  try {
    return new Date(data + "T00:00:00")
      .toLocaleDateString("pt-BR");
  } catch (erro) {
    return data;
  }
}
