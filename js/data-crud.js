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

async function saveOffline(config = {}) {
  const dados = getFormData(config.fields || []);

  const registro = {
    [config.idKey]: config.prefix + "-" + Date.now(),
    ...dados,
    idObra: typeof obterObraAtivaMobile_ === "function"
      ? obterObraAtivaMobile_()
      : "",
    statusSync: "PENDENTE",
    origem: "APP_OFFLINE",
    criadoEm: new Date().toISOString(),
    ...(config.extra || {})
  };

  await salvarRegistroSIGO(config.storeName, registro);

  if (config.syncTipo) {
    await adicionarNaFilaSyncSIGO({
      tipo: config.syncTipo,
      storeOrigem: config.storeName,
      idRegistro: registro[config.idKey],
      idObra: registro.idObra
    });
  }

  if (typeof config.afterSave === "function") {
    await config.afterSave(registro);
  }

  return registro;
}
