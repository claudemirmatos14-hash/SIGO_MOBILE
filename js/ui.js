// =====================================================
// SIGO MOBILE — UI PREMIUM
// UX.07.12.2.2
// =====================================================

async function montarHomePremium() {
  const dadosDashboard =
    await obterDadosDashboardHome_();

  return SIGOUI.createScreen({
    header: true,

    hero: SIGOUI.createHeroCard({
      titulo: "OBRA ATIVA",
      nome: "Selecione uma obra offline",
      offline: "0 de 3 obras offline",
      atividades: "0 atividades offline",
      execucao: "12 em execução"
    }),

    sections: [
      criarSecaoTrabalhoCampoSIGO(dadosDashboard),
      SIGOUI.createStatus(),
      SIGOUI.createTools()
    ],

    bottom: true
  });
}

async function obterDadosDashboardHome_() {
  const obraAtiva = obterObraAtivaMobile_();

  const [
    diarios,
    itens,
    medicoes,
    ocorrencias,
    climas,
    evidencias
  ] = await Promise.all([
    listarRegistrosSIGO("TB_DIARIOS"),
    listarRegistrosSIGO("TB_DIARIO_ITENS"),
    listarRegistrosSIGO("TB_MEDICOES"),
    listarRegistrosSIGO("TB_OCORRENCIAS"),
    listarRegistrosSIGO("TB_CLIMA"),
    listarRegistrosSIGO("TB_EVIDENCIAS")
  ]);

  const filtrarObra = lista =>
    (lista || []).filter(item =>
      String(item.idObra) === String(obraAtiva)
    );

  const d = filtrarObra(diarios);
  const i = filtrarObra(itens);
  const m = filtrarObra(medicoes);
  const o = filtrarObra(ocorrencias);
  const c = filtrarObra(climas);
  const e = filtrarObra(evidencias);

  const ultimoClima = c
    .slice()
    .sort((a, b) =>
      new Date(b.criadoEm || b.data) -
      new Date(a.criadoEm || a.data)
    )[0];

  const abertas = o.filter(x =>
    String(x.status || "").toUpperCase() === "ABERTA"
  ).length;

  const criticas = o.filter(x =>
    String(x.prioridade || "").toUpperCase() === "CRÍTICA"
  ).length;

  return {
    diario: {
      badge: `${d.length} diário(s)`,
      badgeTipo: definirBadgeTipoPendencia_(d),
      descricao: contarPendentesDashboard_(d)
    },

    diarioItens: {
      badge: `${i.length} item(ns)`,
      badgeTipo: definirBadgeTipoPendencia_(i),
      descricao: contarPendentesDashboard_(i)
    },

    medicoes: {
      badge: `${m.length} medição(ões)`,
      badgeTipo: definirBadgeTipoPendencia_(m),
      descricao: contarPendentesDashboard_(m)
    },

    ocorrencias: {
      badge: `${abertas} aberta(s)`,
      badgeTipo: criticas ? "is-danger" : definirBadgeTipoPendencia_(o),
      descricao: criticas
        ? `${criticas} crítica(s)`
        : contarPendentesDashboard_(o)
    },

    clima: {
      badge: ultimoClima
        ? (ultimoClima.periodo || "Hoje")
        : "Sem registro",
      badgeTipo: definirBadgeTipoPendencia_(c),
      descricao: ultimoClima
        ? `${ultimoClima.condicao || "-"} ${ultimoClima.temperatura || ""}°C`
        : "Nenhum clima registrado"
    },

    evidencias: {
      badge: `${e.length} evidência(s)`,
      badgeTipo: definirBadgeTipoPendencia_(e),
      descricao: contarPendentesDashboard_(e)
    }
  };
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

function criarSecaoTrabalhoCampoSIGO(dados = {}) {
    dados = {
    diario: dados.diario || {
      badge: "Carregando...",
      badgeTipo: "is-info",
      descricao: "Atualizando dados..."
    },

    diarioItens: dados.diarioItens || {
      badge: "Carregando...",
      badgeTipo: "is-info",
      descricao: "Atualizando dados..."
    },

    medicoes: dados.medicoes || {
      badge: "Carregando...",
      badgeTipo: "is-info",
      descricao: "Atualizando dados..."
    },

    ocorrencias: dados.ocorrencias || {
      badge: "Carregando...",
      badgeTipo: "is-info",
      descricao: "Atualizando dados..."
    },

    clima: dados.clima || {
      badge: "Carregando...",
      badgeTipo: "is-info",
      descricao: "Atualizando dados..."
    },

    evidencias: dados.evidencias || {
      badge: "Carregando...",
      badgeTipo: "is-info",
      descricao: "Atualizando dados..."
    }
  };
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
          badge: dados.diario.badge,
          badgeTipo: dados.diario.badgeTipo,
          descricao: dados.diario.descricao
        })}
        
        ${SIGOUI.createModule({
          acao: "navegarPara('diarioItens')",
          cor: "is-orange",
          icone: "📋",
          titulo: "Itens do Diário",
          badge: dados.diarioItens.badge,
          badgeTipo: dados.diarioItens.badgeTipo,
          descricao: dados.diarioItens.descricao
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('medicoes')",
          cor: "is-purple",
          icone: "📏",
          titulo: "Medições",
          badge: dados.medicoes.badge,
          badgeTipo: dados.medicoes.badgeTipo,
          descricao: dados.medicoes.descricao,
          destaque: true
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('ocorrencias')",
          cor: "is-red",
          icone: "⚠️",
          titulo: "Ocorrências",
          badge: dados.ocorrencias.badge,
          badgeTipo: dados.ocorrencias.badgeTipo,
          descricao: dados.ocorrencias.descricao
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('clima')",
          cor: "is-blue",
          icone: "🌦️",
          titulo: "Clima",
          badge: dados.clima.badge,
          badgeTipo: dados.clima.badgeTipo,
          descricao: dados.clima.descricao
        })}

        ${SIGOUI.createModule({
          acao: "navegarPara('evidencias')",
          cor: "is-green",
          icone: "📷",
          titulo: "Evidências",
          badge: dados.evidencias.badge,
          badgeTipo: dados.evidencias.badgeTipo,
          descricao: dados.evidencias.descricao
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
        ],
        onchange: "preencherDadosAtividadeItemDiario()"
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

async function montarTelaMedicoes() {

  const heroLote =
    await criarHeroLoteMedicaoAtivo_();

  return SIGOUI.createCrudScreen({
    titulo: "📏 MEDIÇÕES",
    nome: "Registrar avanço físico",
    subtitulo: "Controle de medições offline",
    info: "Saldo, avanço físico e sincronização",
    status: "Modo offline",

    actions: [
      {
        id: "btnGerenciarMedicao",
        icone: "📦",
        texto: "Gerenciar",
        tipo: "is-primary",
        acao: "abrirDrawerLoteMedicao_()"
      },
      {
        id: "btnSalvarMedicao",
        icone: "💾",
        texto: "Salvar",
        tipo: "is-success",
        acao: "salvarMedicaoPremium()"
      }
    ],

    extraSections: [
      heroLote
    ],

    formTitle: "📋 Dados da Medição",
    formSubtitle: "Medição vinculada ao planejamento offline",

    form: montarFormularioMedicao_(),

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
  
      const percentualAcumulado =
    Number(
      medicao.percentualExecutadoAcumulado ??
      medicao.percentualExecutado ??
      0
    );
  
  const executadoAcumulado =
    Number(
      medicao.qtdeExecutadaAcumulada ??
      medicao.qtdeExecutada ??
      0
    );

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
          <small>Planejado</small>
          <strong>
            ${formatarNumeroMedicao_(medicao.qtdePlanejada)}
            ${medicao.un || ""}
          </strong>
        </div>
      
        <div>
          <small>Nesta Medição</small>
          <strong>
            ${formatarNumeroMedicao_(medicao.qtdeExecutada)}
            ${medicao.un || ""}
          </strong>
        </div>
      
        <div>
          <small>Acumulado</small>
          <strong>
            ${formatarNumeroMedicao_(executadoAcumulado)}
            ${medicao.un || ""}
          </strong>
        </div>
      
        <div>
          <small>Saldo</small>
          <strong>
            ${formatarNumeroMedicao_(medicao.saldoDisponivelDepois)}
            ${medicao.un || ""}
          </strong>
        </div>      
      </div>

      <div class="medicao-card__progress">
        <div class="medicao-card__progress-label">
          <span>Progresso da atividade</span>
          <strong>
            ${formatarNumeroMedicao_(percentualAcumulado)}%
          </strong>
        </div>

        <div class="progress">
          <div
            class="progress-fill"
             style="width:${Math.min(percentualAcumulado, 100)}%">
          </div>
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
