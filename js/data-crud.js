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

  const dados =
    getFormData(config.fields || []);

  const registro = {
    [config.idKey]:
      config.prefix + "-" + Date.now(),

    ...dados,

    idObra:
      typeof obterObraAtivaMobile_ === "function"
        ? obterObraAtivaMobile_()
        : "",

    statusSync: "PENDENTE",
    origem: "APP_OFFLINE",
    criadoEm: new Date().toISOString(),

    ...(config.extra || {})
  };

  // ==========================================
  // 1. Salvar registro no IndexedDB
  // ==========================================

  const registroSalvo =
    await salvarRegistroSIGO(
      config.storeName,
      registro
    );

  // ==========================================
  // 2. Manter integração atual com a fila
  // ==========================================

  if (
    config.syncTipo &&
    typeof adicionarNaFilaSyncSIGO === "function"
  ) {
    await adicionarNaFilaSyncSIGO({
      tipo: config.syncTipo,
      storeOrigem: config.storeName,
      idRegistro: registroSalvo[config.idKey],
      idObra: registroSalvo.idObra
    });
  }

  // ==========================================
  // 3. Gerar notificação automática
  // ==========================================

  const eventoSucesso =
    config.eventoSucesso ||
    window.SIGO_EVENTO_SUCESSO_POR_STORE?.[
      config.storeName
    ];

  if (
    eventoSucesso &&
    typeof registrarEventoSIGO_ === "function"
  ) {
    await registrarEventoSIGO_({
      evento: eventoSucesso,
      dados: registroSalvo
    });
  }

  // ==========================================
  // 4. Pós-processamento específico
  // ==========================================

  if (typeof config.afterSave === "function") {
    await config.afterSave(registroSalvo);
  }

  return registroSalvo;
}
