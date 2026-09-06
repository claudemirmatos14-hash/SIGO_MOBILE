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

function assinarLocalStorageIdentidadeUX211_() {
  const entradas = [];

  for (
    let indice = 0;
    indice < localStorage.length;
    indice++
  ) {
    const chave =
      localStorage.key(indice);

    if (!chave) {
      continue;
    }

    if (
      !/usuario|user|dispositivo|device|identidade|sessao|session|auth|token|perfil|permiss|revog|bloque/i
        .test(chave)
    ) {
      continue;
    }

    entradas.push([
      chave,
      localStorage.getItem(chave)
    ]);
  }

  entradas.sort(
    function (a, b) {
      return a[0]
        .localeCompare(b[0]);
    }
  );

  return gerarHashIdentidadeUX211_(
    JSON.stringify(
      entradas
    )
  );
}

function normalizarSnapshotAutoriaUX216_(
  autoria
) {
  return {
    versaoContrato:
      textoUX216_(
        autoria?.versaoContrato
      ),

    idUsuario:
      textoUX216_(
        autoria?.idUsuario
      ),

    nomeUsuario:
      textoUX216_(
        autoria?.nomeUsuario
      ),

    emailUsuario:
      textoUX216_(
        autoria?.emailUsuario
      ),

    idDispositivo:
      textoUX216_(
        autoria?.idDispositivo
      ),

    idSessao:
      textoUX216_(
        autoria?.idSessao
      ),

    idObra:
      textoUX216_(
        autoria?.idObra
      ),

    perfil:
      textoUX216_(
        autoria?.perfil
      ),

    modoConexao:
      textoUX216_(
        autoria?.modoConexao
      ),

    ocorridoEm:
      textoUX216_(
        autoria?.ocorridoEm
      ),

    origem:
      textoUX216_(
        autoria?.origem
      )
  };
}

function valoresUnicosIdentidadeUX211_(
  ocorrencias
) {
  const valores =
    [];

  (
    Array.isArray(ocorrencias)
      ? ocorrencias
      : []
  ).forEach(
    function (ocorrencia) {
      const valor =
        ocorrencia?.valor;

      if (Array.isArray(valor)) {
        valor.forEach(
          function (item) {
            const texto =
              textoUX211_(item);

            if (texto) {
              valores.push(texto);
            }
          }
        );

        return;
      }

      const texto =
        textoUX211_(valor);

      if (
        texto &&
        texto !==
          "[PRESENTE]"
      ) {
        valores.push(texto);
      }
    }
  );

  return Array.from(
    new Set(valores)
  );
}

function gerarHashIdentidadeUX211_(
  valor
) {
  if (
    typeof gerarHashUX202_ ===
    "function"
  ) {
    return gerarHashUX202_(
      valor
    );
  }

  const texto =
    String(valor);

  let hash =
    2166136261;

  for (
    let indice = 0;
    indice < texto.length;
    indice++
  ) {
    hash ^=
      texto.charCodeAt(indice);

    hash +=
      (
        hash << 1
      ) +
      (
        hash << 4
      ) +
      (
        hash << 7
      ) +
      (
        hash << 8
      ) +
      (
        hash << 24
      );
  }

  return (
    hash >>> 0
  )
    .toString(16)
    .padStart(8, "0");
}

function criarEventoAuditoriaIdentidadeUX213_({
  tipoEvento,
  tipoEntidade,
  idEntidade,
  idUsuario = "",
  idDispositivo = "",
  idSessao = "",
  resultado = "SUCESSO",
  origem = "APP_MOBILE",
  detalhes = {}
} = {}) {
  const evento = {
    versaoContrato:
      VERSAO_CONTRATO_IDENTIDADE_UX212,

    tipoRegistro:
      "AUDITORIA_IDENTIDADE",

    idEvento:
      gerarIdEventoIdentidadeUX213_(),

    tipoEvento:
      textoUX213_(
        tipoEvento
      ),

    tipoEntidade:
      textoUX213_(
        tipoEntidade
      ),

    idEntidade:
      textoUX213_(
        idEntidade
      ),

    idUsuario:
      textoUX213_(
        idUsuario
      ),

    idDispositivo:
      textoUX213_(
        idDispositivo
      ),

    idSessao:
      textoUX213_(
        idSessao
      ),

    resultado:
      textoUX213_(
        resultado
      ),

    origem:
      textoUX213_(
        origem
      ),

    ocorridoEm:
      new Date().toISOString(),

    detalhes:
      clonarUX213_(
        detalhes || {}
      )
  };

  validarAusenciaSegredosUX213_(
    evento
  );

  return evento;
}
