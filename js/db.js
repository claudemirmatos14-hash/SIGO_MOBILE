const SIGO_DB_NAME = "SIGO_OFFLINE_DB";
const SIGO_DB_VERSION = 1;

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
