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
