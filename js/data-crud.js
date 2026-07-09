// =====================================================
// SIGO MOBILE — DATA CRUD FRAMEWORK
// UX.07.13.0.4
// =====================================================

const SIGOCRUD = {
  getFormData,
  clearForm,
  saveOffline
};

function getFormData(fields = []) {
  const data = {};

  fields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;

    let value = el.value;

    if (field.type === "number") {
      value = Number(value || 0);
    }

    data[field.key] = value;
  });

  return data;
}

function clearForm(fields = []) {
  fields.forEach(field => {
    const el = document.getElementById(field.id);
    if (el) el.value = field.defaultValue || "";
  });
}

// =====================================================
// UX.14 — EVENTO AUTOMÁTICO POR STORE
// =====================================================

window.SIGO_EVENTO_SUCESSO_POR_STORE = Object.freeze({
  TB_DIARIOS: "DIARIO_SALVO",
  TB_DIARIO_ITENS: "ITEM_DIARIO_SALVO",
  TB_MEDICOES: "MEDICAO_SALVA",
  TB_LOTES_MEDICAO: "LOTE_MEDICAO_CRIADO",
  TB_OCORRENCIAS: "OCORRENCIA_CRIADA",
  TB_EVIDENCIAS: "EVIDENCIA_ANEXADA"
});

async function saveOffline(config = {}) {

  // ==========================================
  // 0. LER DADOS DO FORMULÁRIO
  // ==========================================

  const dadosFormulario =
    getFormData(
      config.fields || []
    );

  let dados = {
    ...dadosFormulario
  };

  // ==========================================
  // 0.1. VALIDAÇÃO ESPECÍFICA DA ENTIDADE
  // ==========================================
  /*
   * A validação é opcional.
   *
   * A própria entidade poderá lançar um erro:
   *
   * validate: async function (dados) {
   *   if (!dados.data) {
   *     throw new Error("Informe a data.");
   *   }
   * }
   */

  if (
    typeof config.validate ===
    "function"
  ) {
    const resultadoValidacao =
      await config.validate({
        ...dados
      });

    if (
      resultadoValidacao === false
    ) {
      throw new Error(
        config.validationMessage ||
        "Os dados informados são inválidos."
      );
    }
  }

  // ==========================================
  // 0.2. COMPLEMENTAR DADOS ANTES DE SALVAR
  // ==========================================
  /*
   * O beforeSave é opcional e poderá incluir
   * dados que não vêm diretamente de campos
   * do formulário.
   *
   * Exemplo:
   *
   * beforeSave: async function () {
   *   return {
   *     idDiario:
   *       window.SIGO_DIARIO_ATIVO_ID
   *   };
   * }
   */

  if (
    typeof config.beforeSave ===
    "function"
  ) {
    const dadosComplementares =
      await config.beforeSave({
        ...dados
      });

    if (
      dadosComplementares !== null &&
      dadosComplementares !== undefined &&
      typeof dadosComplementares !==
        "object"
    ) {
      throw new Error(
        "beforeSave deve retornar " +
        "um objeto de dados."
      );
    }

    dados = {
      ...dados,
      ...(dadosComplementares || {})
    };
  }

  // ==========================================
  // 0.3. IDENTIFICAR OBRA ATIVA
  // ==========================================

  const idObra =
    typeof obterObraAtivaMobile_ ===
      "function"
      ? obterObraAtivaMobile_()
      : "";

  if (!idObra) {
    throw new Error(
      "Nenhuma obra ativa foi identificada."
    );
  }

  // ==========================================
  // MONTAR REGISTRO OFFLINE
  // ==========================================

  const registro = {
    [config.idKey]:
      config.prefix +
      "-" +
      Date.now(),

    ...dados,

    idObra,

    statusSync: "PENDENTE",
    origem: "APP_OFFLINE",
    criadoEm:
      new Date().toISOString(),

    ...(config.extra || {})
  };

  // ==========================================
  // 1. SALVAR REGISTRO NO INDEXEDDB
  // ==========================================

  const registroSalvo =
    await salvarRegistroSIGO(
      config.storeName,
      registro
    );

  // ==========================================
  // 2. MANTER INTEGRAÇÃO COM A FILA
  // ==========================================

  if (
    config.syncTipo &&
    typeof adicionarNaFilaSyncSIGO ===
      "function"
  ) {
    await adicionarNaFilaSyncSIGO({
      tipo:
        config.syncTipo,

      storeOrigem:
        config.storeName,

      idRegistro:
        registroSalvo[
          config.idKey
        ],

      idObra:
        registroSalvo.idObra
    });
  }

  // ==========================================
  // 3. GERAR NOTIFICAÇÃO AUTOMÁTICA
  // ==========================================

  const eventoSucesso =
    config.eventoSucesso ||
    window
      .SIGO_EVENTO_SUCESSO_POR_STORE?.[
        config.storeName
      ];

  if (
    eventoSucesso &&
    typeof registrarEventoSIGO_ ===
      "function"
  ) {
    await registrarEventoSIGO_({
      evento:
        eventoSucesso,

      dados:
        registroSalvo
    });
  }

  // ==========================================
  // 4. PÓS-PROCESSAMENTO ESPECÍFICO
  // ==========================================

  if (
    typeof config.afterSave ===
    "function"
  ) {
    await config.afterSave(
      registroSalvo
    );
  }

  return registroSalvo;
}
