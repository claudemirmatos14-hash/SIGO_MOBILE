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
