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
