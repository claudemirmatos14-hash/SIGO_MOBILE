const SIGO_DB_NAME = "SIGO_OFFLINE_DB";
const SIGO_DB_VERSION = 7;

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

      request.onsuccess = () => {
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

      const db = SIGO_DB || await abrirBancoLocalSIGO();

      const transaction = db.transaction(
        [storeName],
        "readonly"
      );

      const store = transaction.objectStore(storeName);

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject("Erro ao listar registros de " + storeName);
      };

    } catch (erro) {
      reject(erro);
    }

  });
}

function adicionarNaFilaSyncSIGO(registro) {

  return new Promise(async (resolve, reject) => {

    try {

      const db = SIGO_DB || await abrirBancoLocalSIGO();

      const transaction = db.transaction(
        ["TB_SYNC_QUEUE"],
        "readwrite"
      );

      const store = transaction.objectStore("TB_SYNC_QUEUE");

      const itemFila = {
        idSyncLocal: "SYNC-LOCAL-" + Date.now(),
        tipo: registro.tipo,
        storeOrigem: registro.storeOrigem,
        idRegistro: registro.idRegistro,
        idObra: registro.idObra,
        statusSync: "PENDENTE",
        tentativas: 0,
        criadoEm: new Date().toISOString()
      };

      const request = store.put(itemFila);

      request.onsuccess = () => {
        resolve(itemFila);
      };

      request.onerror = () => {
        reject("Erro ao adicionar item na fila de sincronização.");
      };

    } catch (erro) {
      reject(erro);
    }

  });
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
    transaction.oncomplete = () => resolve(true);
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

    request.onsuccess = () => resolve(true);

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
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}
