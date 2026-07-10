const SIGO_DB_NAME = "SIGO_OFFLINE_DB";
const SIGO_DB_VERSION = 15;

let SIGO_DB = null;

function abrirBancoLocalSIGO() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SIGO_DB_NAME, SIGO_DB_VERSION);

    request.onerror = () => {
      reject("Erro ao abrir o banco local SIGO.");
    };

    request.onsuccess = (event) => {
      SIGO_DB = event.target.result;
      resolve(SIGO_DB);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      criarStoresSIGO_(db);
    };
  });
}

function criarStoresSIGO_(db) {

  if (!db.objectStoreNames.contains("TB_OBRAS")) {
    db.createObjectStore("TB_OBRAS", {
      keyPath: "idObra"
    });
  }

  if (!db.objectStoreNames.contains("TB_DIARIOS")) {
    db.createObjectStore("TB_DIARIOS", {
      keyPath: "idDiario"
    });
  }

  if (!db.objectStoreNames.contains("TB_DIARIO_ITENS")) {
    db.createObjectStore("TB_DIARIO_ITENS", {
      keyPath: "idItemDiario"
    });
  }

  if (!db.objectStoreNames.contains("TB_LOTES_MEDICAO")) {

    const store = db.createObjectStore("TB_LOTES_MEDICAO", {
      keyPath: "idLoteMedicao"
    });
  
    store.createIndex("idObra", "idObra", { unique: false });
  
    store.createIndex("numeroMedicao", "numeroMedicao", { unique: false });
  
    store.createIndex("status", "status", { unique: false });
  
    store.createIndex("statusSync", "statusSync", { unique: false });
  
  }

  if (!db.objectStoreNames.contains("TB_MEDICOES")) {
    db.createObjectStore("TB_MEDICOES", {
      keyPath: "idMedicao"
    });
  }

  if (!db.objectStoreNames.contains("TB_OCORRENCIAS")) {
    db.createObjectStore("TB_OCORRENCIAS", {
      keyPath: "idOcorrencia"
    });
  }

  if (!db.objectStoreNames.contains("TB_CLIMA")) {
    db.createObjectStore("TB_CLIMA", {
      keyPath: "idClima"
    });
  }

  if (!db.objectStoreNames.contains("TB_EVIDENCIAS")) {
    db.createObjectStore("TB_EVIDENCIAS", {
      keyPath: "idEvidencia"
    });
  }

  if (!db.objectStoreNames.contains("TB_SYNC_QUEUE")) {
    db.createObjectStore("TB_SYNC_QUEUE", {
      keyPath: "idSyncLocal"
    });
  }

  if (!db.objectStoreNames.contains("TB_ATIVIDADES_OBRA")) {

    const store = db.createObjectStore(
      "TB_ATIVIDADES_OBRA",
      {
        keyPath: "idRegistro"
      }
    );
  
    store.createIndex(
      "idObra",
      "idObra",
      { unique: false }
    );
  
    store.createIndex(
      "eap",
      "eap",
      { unique: false }
    );
  
    store.createIndex(
      "status",
      "status",
      { unique: false }
    );
  }

if (!db.objectStoreNames.contains("TB_PARAMETROS_OBRA")) {
  db.createObjectStore("TB_PARAMETROS_OBRA", {
    keyPath: "idObra"
  });
}

  if (!db.objectStoreNames.contains("TB_NOTIFICACOES")) {

  const store = db.createObjectStore("TB_NOTIFICACOES", {
    keyPath: "idNotificacao"
  });

  store.createIndex("idObra", "idObra", { unique: false });

  store.createIndex("tipo", "tipo", { unique: false });

  store.createIndex("lida", "lida", { unique: false });

  store.createIndex("criadaEm", "criadaEm", { unique: false });
}
}

function salvarRegistroSIGO(storeName, registro) {

  return new Promise(async (resolve, reject) => {

    try {

      const db = SIGO_DB || await abrirBancoLocalSIGO();

      const transaction = db.transaction(
        [storeName],
        "readwrite"
      );

      const store = transaction.objectStore(storeName);

      const request = store.put(registro);

      request.onsuccess = async () => {

        if (window.SIGODataCache) {
          SIGODataCache.invalidate(storeName);
        
          if (registro && registro.idObra) {
            invalidarCacheObraSIGO_(
              storeName,
              registro.idObra
            );
          }
        }

        if (window.SIGODataBinding) {
          await SIGODataBinding.notify(storeName, {
            acao: "UPDATE",
            store: storeName,
            registro: registro
          });
        }

      // ==========================================
      // FILA DE SINCRONIZAÇÃO
      // ==========================================
      /*
       * A fila oficial é criada explicitamente por
       * adicionarNaFilaSyncSIGO().
       *
       * Não registrar alterações automaticamente
       * dentro de salvarRegistroSIGO(), pois isso
       * criaria dois itens para a mesma operação.
       */

        resolve(registro);
      };

      request.onerror = () => {
        reject("Erro ao salvar registro em " + storeName);
      };

    } catch (erro) {
      reject(erro);
    }

  });
}

function listarRegistrosSIGO(storeName) {

  return new Promise(async (resolve, reject) => {

    try {

      if (
        window.SIGODataCache &&
        SIGODataCache.has(storeName)
      ) {
        return resolve(
          SIGODataCache.get(storeName)
        );
      }

      const db = SIGO_DB || await abrirBancoLocalSIGO();

      const transaction = db.transaction(
        [storeName],
        "readonly"
      );

      const store = transaction.objectStore(storeName);

      const request = store.getAll();

      request.onsuccess = () => {
        const dados =
          request.result || [];

        if (window.SIGODataCache) {
          SIGODataCache.set(storeName, dados);
        }

        resolve(dados);
      };

      request.onerror = () => {
        reject("Erro ao listar registros de " + storeName);
      };

    } catch (erro) {
      reject(erro);
    }

  });
}

// =====================================================
// IDENTIFICAR PENDÊNCIA DE EXCLUSÃO
// =====================================================
function ehPendenciaDeleteSIGO_(
  pendencia
) {

  const operacao =
    String(
      pendencia?.operacao ||
      pendencia?.tipo ||
      ""
    )
      .trim()
      .toUpperCase();

  return operacao === "DELETE";
}


// =====================================================
// CONVERTER PENDÊNCIA EM TOMBSTONE
// =====================================================
function montarTombstoneFilaSIGO_(
  pendencia
) {

  const origem =
    pendencia?.payloadExclusao ||
    pendencia?.exclusao ||
    {};

  const storeOrigem =
    String(
      origem.storeOrigem ||
      pendencia?.storeOrigem ||
      ""
    ).trim();

  const idRegistro =
    String(
      origem.idRegistro ||
      origem.idItemDiario ||
      pendencia?.idRegistro ||
      ""
    ).trim();

  const entidade =
    String(
      origem.entidade ||
      pendencia?.entidade ||
      (
        storeOrigem ===
        "TB_DIARIO_ITENS"
          ? "DIARIO_ITEM"
          : storeOrigem
      )
    ).trim();

  return {
    entidade,

    storeOrigem,

    idRegistro,

    idItemDiario:
      String(
        origem.idItemDiario ||
        (
          storeOrigem ===
          "TB_DIARIO_ITENS"
            ? idRegistro
            : ""
        )
      ).trim(),

    idDiario:
      String(
        origem.idDiario ||
        pendencia?.idDiario ||
        ""
      ).trim(),

    idObra:
      String(
        origem.idObra ||
        pendencia?.idObra ||
        ""
      ).trim()
  };
}


// =====================================================
// CRIAR CHAVE STORE + ID
// =====================================================
function criarChavePendenciaSyncSIGO_(
  storeOrigem,
  idRegistro
) {

  return (
    String(storeOrigem || "").trim() +
    "::" +
    String(idRegistro || "").trim()
  );
}

function adicionarNaFilaSyncSIGO(
  registro
) {

  return new Promise(
    async (
      resolve,
      reject
    ) => {

      try {

        if (
          !registro ||
          typeof registro !== "object"
        ) {
          throw new Error(
            "Registro da fila não informado."
          );
        }

        const db =
          SIGO_DB ||
          await abrirBancoLocalSIGO();

        const transaction =
          db.transaction(
            ["TB_SYNC_QUEUE"],
            "readwrite"
          );

        const store =
          transaction.objectStore(
            "TB_SYNC_QUEUE"
          );

        const tipo =
          String(
            registro.tipo ||
            registro.entidade ||
            ""
          ).trim();

        const operacao =
          String(
            registro.operacao ||
            (
              tipo.toUpperCase() ===
              "DELETE"
                ? "DELETE"
                : "UPSERT"
            )
          )
            .trim()
            .toUpperCase();

        const itemFila = {
          idSyncLocal:
            "SYNC-LOCAL-" +
            Date.now(),

          tipo,

          operacao,

          entidade:
            String(
              registro.entidade || ""
            ).trim(),

          storeOrigem:
            String(
              registro.storeOrigem || ""
            ).trim(),

          idRegistro:
            String(
              registro.idRegistro || ""
            ).trim(),

          idObra:
            String(
              registro.idObra || ""
            ).trim(),

          idDiario:
            String(
              registro.idDiario || ""
            ).trim(),

          payloadExclusao:
            registro.payloadExclusao ||
            registro.exclusao ||
            null,

          statusSync:
            "PENDENTE",

          tentativas: 0,

          criadoEm:
            new Date().toISOString()
        };

        if (!itemFila.storeOrigem) {
          throw new Error(
            "Store de origem não informada."
          );
        }

        if (!itemFila.idRegistro) {
          throw new Error(
            "ID do registro não informado."
          );
        }

        if (!itemFila.idObra) {
          throw new Error(
            "ID da obra não informado."
          );
        }

        if (
          itemFila.operacao ===
            "DELETE" &&
          !itemFila.payloadExclusao
        ) {
          throw new Error(
            "Payload da exclusão não informado."
          );
        }

        const request =
          store.put(
            itemFila
          );

        request.onsuccess =
          async () => {

            try {

              if (
                window.SIGODataCache
              ) {

                SIGODataCache.invalidate(
                  "TB_SYNC_QUEUE"
                );

                if (
                  itemFila.idObra &&
                  typeof invalidarCacheObraSIGO_ ===
                    "function"
                ) {

                  invalidarCacheObraSIGO_(
                    "TB_SYNC_QUEUE",
                    itemFila.idObra
                  );
                }
              }

              if (
                window.SIGODataBinding &&
                typeof SIGODataBinding.notify ===
                  "function"
              ) {

                await SIGODataBinding.notify(
                  "TB_SYNC_QUEUE",
                  {
                    acao:
                      itemFila.operacao,

                    store:
                      "TB_SYNC_QUEUE",

                    registro:
                      itemFila
                  }
                );
              }

            } catch (
              erroAtualizacaoFila
            ) {

              console.warn(
                "Pendência criada, mas não foi possível " +
                "atualizar o cache da fila:",
                erroAtualizacaoFila
              );
            }

            resolve(
              itemFila
            );
          };

        request.onerror = () => {

          reject(
            request.error ||
            new Error(
              "Erro ao adicionar item na fila."
            )
          );
        };

      } catch (erro) {
        reject(erro);
      }
    }
  );
}

function atualizarRegistroSIGO(storeName, registro) {

  return new Promise(async (resolve, reject) => {

    try {

      const db = SIGO_DB || await abrirBancoLocalSIGO();

      const transaction =
        db.transaction([storeName], "readwrite");

      const store =
        transaction.objectStore(storeName);

      const request =
        store.put(registro);

      request.onsuccess = () => {
        resolve(registro);
      };

      request.onerror = () => {
        reject("Erro ao atualizar registro.");
      };

    } catch (erro) {

      reject(erro);

    }

  });
}

function limparTabelaSIGO_(nomeStore) {
  return new Promise(async (resolve, reject) => {

    try {

      const db = SIGO_DB || await abrirBancoLocalSIGO();

      const tx = db.transaction(nomeStore, "readwrite");
      const store = tx.objectStore(nomeStore);

      store.clear();

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = () => {
        reject(tx.error);
      };

    } catch (erro) {
      reject(erro);
    }

  });
}

async function removerAtividadesPorObraSIGO_(idObra) {
  const atividades = await listarRegistrosSIGO("TB_ATIVIDADES_OBRA");

  const db = SIGO_DB || await abrirBancoLocalSIGO();

  const transaction = db.transaction(
    ["TB_ATIVIDADES_OBRA"],
    "readwrite"
  );

  const store = transaction.objectStore("TB_ATIVIDADES_OBRA");

  atividades
    .filter(item => String(item.idObra) === String(idObra))
    .forEach(item => {
      store.delete(item.idRegistro);
    });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}

async function removerRegistrosPorObraSIGO_(storeName, idObra) {
  const registros = await listarRegistrosSIGO(storeName);
  const db = SIGO_DB || await abrirBancoLocalSIGO();

  const transaction = db.transaction(
    [storeName],
    "readwrite"
  );

  const store = transaction.objectStore(storeName);

  registros
    .filter(registro =>
      String(registro.idObra) === String(idObra)
    )
    .forEach(registro => {
      const keyPath = store.keyPath;
      const chave = registro[keyPath];

      if (chave !== undefined) {
        store.delete(chave);
      }
    });

  return new Promise((resolve, reject) => {
   transaction.oncomplete = async () => {
     
      if (window.SIGODataCache) {
        SIGODataCache.invalidate(storeName);
      }
    
      if (window.SIGODataBinding) {
    
        await SIGODataBinding.notify(storeName, {
    
          acao: "DELETE_MANY",
    
          store: storeName,
    
          idObra
    
        });
    
      }

      resolve(true);
    
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function removerRegistroSIGO_(storeName, idRegistro) {

  const db =
    SIGO_DB || await abrirBancoLocalSIGO();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction([storeName], "readwrite");

    const store =
      transaction.objectStore(storeName);

    const request =
      store.delete(idRegistro);

    request.onsuccess = async () => {

      if (window.SIGODataCache) {
        SIGODataCache.invalidate(storeName);
      }
    
      if (window.SIGODataBinding) {
    
        await SIGODataBinding.notify(storeName, {
    
          acao: "DELETE",
    
          store: storeName,
    
          chave: idRegistro
    
        });
    
      }

       resolve(true);
    
    };

    request.onerror = () => reject(request.error);

  });

}

async function removerRegistroPorChaveSIGO_(storeName, chave) {
  const db = SIGO_DB || await abrirBancoLocalSIGO();

  const transaction = db.transaction(
    [storeName],
    "readwrite"
  );

  const store = transaction.objectStore(storeName);

  store.delete(chave);

  return new Promise((resolve, reject) => {
   transaction.oncomplete = async () => {

     if (window.SIGODataCache) {
        SIGODataCache.invalidate(storeName);
      }
    
      if (window.SIGODataBinding) {
    
        await SIGODataBinding.notify(storeName, {
    
          acao: "DELETE",
    
          store: storeName,
    
          chave
    
        });
    
      }
     
      resolve(true);
     
    };
    transaction.onerror = () => reject(transaction.error);
  });
}
