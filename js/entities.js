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
};
