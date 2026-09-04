function formatarDataObraOffline_(dataISO) {
  if (!dataISO) return "--";

  try {
    return new Date(dataISO).toLocaleString("pt-BR");
  } catch (erro) {
    return "--";
  }
}


function obterStoreFilaMedicoesUX1995_(registroFila) {
  return normalizarMaiusculoMedicoesUX1995_(
    registroFila?.storeOrigem ??
    registroFila?.store ??
    registroFila?.tabela ??
    registroFila?.payload?.storeOrigem ??
    registroFila?.dados?.storeOrigem
  );
}


/**
 * Obtém o ID referenciado por uma entrada da fila.
 */

function obterIdFilaMedicoesUX1995_(registroFila) {
  return normalizarTextoMedicoesUX1995_(
    registroFila?.idRegistro ??
    registroFila?.registroId ??
    registroFila?.idMedicao ??
    registroFila?.payload?.idRegistro ??
    registroFila?.payload?.idMedicao ??
    registroFila?.dados?.idRegistro ??
    registroFila?.dados?.idMedicao
  );
}


/**
 * Identifica a operação da fila.
 */

function filaClimaEstaPendenteUX1975_(
  registroFila
) {
  const status =
    normalizarMaiusculoClimaUX1975_(
      registroFila?.statusSync ||
      registroFila?.status
    );

  return (
    status === "PENDENTE" ||
    status === "ERRO" ||
    status === "FALHA"
  );
}


/**
 * Determina a operação da fila.
 */

function filaMedicaoConcluidaUX1995_(registroFila) {
  const status =
    normalizarMaiusculoMedicoesUX1995_(
      registroFila?.statusSync ??
      registroFila?.status ??
      registroFila?.situacao
    );

  return [
    "SINCRONIZADO",
    "CONCLUIDO",
    "PROCESSADO",
    "ENVIADO",
    "SUCESSO",
    "OK",
    "CANCELADO"
  ].includes(status);
}


/**
 * Obtém a store referenciada por uma entrada da fila.
 */
