function gerarIdEventoIdentidadeUX213_() {
  return (
    "AUD-ID-" +
    Date.now() +
    "-" +
    gerarUuidUX213_()
  );
}

function snapshotsMesmaIdentidadeUX216A_(
  a,
  b
) {
  if (!a || !b) {
    return false;
  }

  return (
    a.idUsuario === b.idUsuario &&
    a.idDispositivo === b.idDispositivo &&
    a.idSessao === b.idSessao &&
    a.idObra === b.idObra &&
    a.perfil === b.perfil
  );
}


/**
 * ETAPA 1 — Captura o estado antes da criação pela interface.
 */

function gerarIdSessaoTransicaoUX214_(
  idDispositivo
) {
  return (
    "SES-TRANSICAO-" +
    hashUX214_(
      idDispositivo
    ) +
    "-" +
    Date.now()
      .toString(36)
      .toUpperCase()
  );
}

function idUsuarioValidoUX212_(
  idUsuario
) {
  return /^USR-[A-Z0-9][A-Z0-9_-]{5,}$/i.test(
    textoUX212_(idUsuario)
  );
}

function obterIdentidadeAtualUX214_() {
  return window.SIGO_IDENTIDADE_ATUAL
    ? clonarUX214_(
        window.SIGO_IDENTIDADE_ATUAL
      )
    : null;
}

function idSessaoValidoUX212_(
  idSessao
) {
  return /^SES-[A-Z0-9][A-Z0-9_-]{5,}$/i.test(
    textoUX212_(idSessao)
  );
}

function normalizarValorIdentidadeUX211_(
  valor
) {
  return textoUX211_(valor)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toUpperCase();
}

function obterEstadoInternoIdentidadeUX215_() {
  window.SIGO_UX215 =
    window.SIGO_UX215 || {};

  if (
    !window.SIGO_UX215.estado
  ) {
    window.SIGO_UX215.estado =
      ESTADOS_IDENTIDADE_UX215
        .naoIniciada;
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      window.SIGO_UX215,
      "promessa"
    )
  ) {
    window.SIGO_UX215.promessa =
      null;
  }

  window.SIGO_UX215.erro =
    window.SIGO_UX215.erro ||
    null;

  window.SIGO_UX215.resultado =
    window.SIGO_UX215.resultado ||
    null;

  window.SIGO_UX215.iniciadoEm =
    window.SIGO_UX215.iniciadoEm ||
    "";

  window.SIGO_UX215.concluidoEm =
    window.SIGO_UX215.concluidoEm ||
    "";

  return window.SIGO_UX215;
}

function idDispositivoValidoUX212_(
  idDispositivo
) {
  return /^DISP-[A-Z0-9][A-Z0-9_-]{5,}$/i.test(
    textoUX212_(idDispositivo)
  );
}

function adicionarCandidatoIdentidadeUX211_(
  mapa,
  valor,
  origem
) {
  const texto =
    textoUX211_(valor);

  if (!texto) {
    return;
  }

  if (!mapa.has(texto)) {
    mapa.set(
      texto,
      new Set()
    );
  }

  mapa
    .get(texto)
    .add(origem);
}

function normalizarPerfilUX212_(
  perfil
) {
  const normalizado =
    maiusculoUX212_(perfil);

  return PERFIS_USUARIO_UX212.includes(
    normalizado
  )
    ? normalizado
    : "";
}
