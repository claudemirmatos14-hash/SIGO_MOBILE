// =====================================================
// SIGO MOBILE — ENTITY CONFIGURATION FRAMEWORK
// UX.07.13.0.5
// =====================================================

const SIGOEntities = {
  diario: {
    storeName: "TB_DIARIOS",
    idKey: "idDiario",
    prefix: "DIA",
    syncTipo: "DIARIO_OBRA",

    fields: [
      { id: "diarioData", key: "data" },
      { id: "diarioResponsavel", key: "responsavel" },
      { id: "diarioEquipe", key: "equipe" },
      { id: "diarioHoras", key: "horasDia", type: "number" },
      { id: "diarioClima", key: "clima" },
      { id: "diarioOcorrencias", key: "ocorrencias" },
      { id: "diarioObservacoes", key: "observacoes" }
    ],

    extra: {
      statusDiario: "ABERTO"
    },

    afterSave: async function () {
      if (typeof atualizarIndicadoresMobile_ === "function") {
        atualizarIndicadoresMobile_();
      }

      if (typeof carregarListaDiariosOffline === "function") {
        carregarListaDiariosOffline();
      }
    }
  }

    diarioItem: {
    storeName: "TB_DIARIO_ITENS",
    idKey: "idItemDiario",
    prefix: "DIT",
    syncTipo: "DIARIO_ITEM",
  
    fields: [
      { id: "itemDiarioData", key: "data" },
      { id: "itemDiarioAtividade", key: "idAtividade" },
      { id: "itemDiarioEap", key: "eap" },
      { id: "itemDiarioServico", key: "servico" },
      { id: "itemDiarioEquipe", key: "equipe" },
      { id: "itemDiarioEquipamento", key: "equipamento" },
      { id: "itemDiarioQtde", key: "qtdeExecutada", type: "number" },
      { id: "itemDiarioUnidade", key: "unidade" },
      { id: "itemDiarioHoras", key: "horasTrabalhadas", type: "number" },
      { id: "itemDiarioObservacao", key: "observacao" }
    ],
  
    extra: {
      statusItem: "ABERTO"
    },
  
    afterSave: async function () {
      if (typeof atualizarIndicadoresMobile_ === "function") {
        atualizarIndicadoresMobile_();
      }
  
      if (typeof listarItensDiarioOffline_ === "function") {
        await listarItensDiarioOffline_();
      }
    }
  }
};


