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

async function salvarDiarioPremium() {
  try {
    await SIGOCRUD.saveOffline(SIGOEntities.diario);
    alert("Diário salvo offline com sucesso.");
  } catch (erro) {
    console.error("Erro ao salvar diário premium:", erro);
    alert("Erro ao salvar diário offline.");
  }
}
