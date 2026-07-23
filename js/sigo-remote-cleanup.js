(function (global) {

  "use strict";


  /* =========================================================
   * SIGO REMOTE CLEANUP
   * Versão: 1.0.0
   * Origem: UX.21.9.7.7K.3C
   * =========================================================
   */


  const VERSAO_MODULO =
    "1.0.0";


  const BANCO_OFICIAL =
    "SIGO_OFFLINE_DB";


  const CHAVE_DISPOSITIVO =
    "SIGO_ID_DISPOSITIVO";


  const CHAVE_COMPROVANTE =
    "SIGO_LIMPEZA_REMOTA_COMPROVANTE_V1";


  const ACOES = Object.freeze({

    CONSULTAR:
      "VERIFICAR_IDENTIDADE_E_COMANDO_REMOTO",

    INICIAR:
      "INICIAR_EXECUCAO_COMANDO_REMOTO",

    CONFIRMAR:
      "CONFIRMAR_EXECUCAO_COMANDO_REMOTO"
  });


  const STORES_OPERACIONAIS =
    Object.freeze([

      "TB_OBRAS",
      "TB_ATIVIDADES_OBRA",
      "TB_DIARIOS",
      "TB_DIARIO_ITENS",
      "TB_MEDICOES",
      "TB_OCORRENCIAS",
      "TB_CLIMA",
      "TB_EVIDENCIAS",
      "TB_LOTES_MEDICAO",
      "TB_NOTIFICACOES",
      "TB_SYNC_QUEUE",
      "TB_PARAMETROS_OBRA"
    ]);


  const STORES_IDENTIDADE =
    Object.freeze([

      "TB_USUARIOS",
      "TB_DISPOSITIVOS",
      "TB_SESSAO",
      "TB_AUDITORIA_IDENTIDADE"
    ]);


  const TODAS_STORES =
    Object.freeze([

      ...STORES_OPERACIONAIS,
      ...STORES_IDENTIDADE
    ]);


  const CHAVE_PUBLICA_PEM =
    Object.freeze(["-----BEGIN PUBLIC KEY-----","MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvS46zq4Ai+Q5LyXzvlWQ","p5mVNtUJuYNzGDB1Zsy0WDAR4Uc0i+V0o5/hEjnDVNYTYB5mQvGR5VWlUgbtmNUI","KapJ+hXy83z6FYl06ode9ijt+DYi4TyphZ5YjW7C9kwYdm1mzVYlFaGN9EEULBaO","vESbRohFhetFh8gy172HMlD0CDr8hWpWAlvKRV5AWotMPlVd+0plBdNQRu9lrW+n","32taJmgY046yeSCmBlY+Jn1IIg/sokuBYX9vVI4EF21tD28Pweb9cX17c/DJBRYT","R9t+50hn+42X2YrkxyKvpY/plmjCy55R4tdalIEXqT1uTab+E1K9DjwJca+bLbXR","ZwIDAQAB","-----END PUBLIC KEY-----"])
      .join("\n");


  const CONFIG_CRIPTO =
    Object.freeze({
    validadeMs:
      900000,


      dominio:
        "SIGO_COMANDO_REMOTO_ASSINADO",

      versaoEnvelope:
        "1.0",

      acaoAutorizada:
        "AUTORIZAR_LIMPEZA_LOCAL",

      tipoComando:
        "LIMPAR_DADOS",

      tipoComandoPermitido:
        "LIMPAR_DADOS",

      algoritmoServidor:
        "RSA-SHA256",

      algoritmoAssinatura:
        "RSA-SHA256",

      algoritmoWebCrypto:
        "RSASSA-PKCS1-v1_5",

      algoritmoHash:
        "SHA-256",

      idChave:
        "SIGO-REMOTE-KEY-01",

      fingerprint:
        "a7c28365de4c7e9bad6b568eb91394834094db26097708f50ad3e1094c055c1d",

      fingerprintEsperado:
        "a7c28365de4c7e9bad6b568eb91394834094db26097708f50ad3e1094c055c1d",

      chavePublicaPem:
        CHAVE_PUBLICA_PEM,

      publicKeyPem:
        CHAVE_PUBLICA_PEM
    });


  const EVENTOS =
    Object.freeze({

      AUTORIZADO:
        "sigo:remote-cleanup-command-authorized",

      INICIADO:
        "sigo:remote-cleanup-started",

      CONCLUIDO:
        "sigo:remote-cleanup-completed",

      REVOGADO:
        "sigo:dispositivo-revogado",

      CONFIRMADO:
        "sigo:remote-cleanup-confirmed"
    });



  /* =========================================================
   * UX.21.9.7.7K.3C.8I.7.R1 — CONTRATOS NOMINAIS
   * Manifesto do fluxo e funções privadas obrigatórias.
   * =========================================================
   */


  const ORDEM_FLUXO_REMOTO =
    Object.freeze([

      "RESOLVER_CONTEXTO_IDENTIDADE",

      "CONSULTAR_COMANDO_REMOTO",

      "NORMALIZAR_RESPOSTA",

      "ENCERRAR_SEM_COMANDO",

      "VALIDAR_COMANDO_ASSINADO_PELO_SERVIDOR",

      "BLOQUEAR_OPERACOES_LOCAIS",

      "SUSPENDER_SYNC_E_RETRY",

      "REGISTRAR_COMANDO_RECEBIDO",

      "INICIAR_EXECUCAO_NO_SERVIDOR",

      "LIMPAR_STORES_OPERACIONAIS",

      "LIMPAR_FILA_DE_SINCRONIZACAO",

      "SANITIZAR_IDENTIDADE_LOCAL",

      "GRAVAR_COMPROVANTE_MINIMO",

      "LIMPAR_LOCAL_E_SESSION_STORAGE",

      "LIMPAR_CACHE_DE_MEMORIA",

      "EXIBIR_TELA_DE_DISPOSITIVO_REVOGADO",

      "CONFIRMAR_EXECUCAO_AO_SERVIDOR"
    ]);


  function validarTemporalidadeEnvelope_(
    comando
  ) {

    const assinadoEmTexto =
      texto_(
        primeiroCampo_(
          comando,
          [
            "assinadoEm",
            "ASSINADO_EM"
          ]
        )
      );


    const expiraAssinaturaTexto =
      texto_(
        primeiroCampo_(
          comando,
          [
            "expiraAssinaturaEm",
            "EXPIRA_ASSINATURA_EM"
          ]
        )
      );


    const expiraComandoTexto =
      texto_(
        primeiroCampo_(
          comando,
          [
            "EXPIRA_EM",
            "expiraEm"
          ]
        )
      );


    if (
      !assinadoEmTexto ||
      !expiraAssinaturaTexto
    ) {

      throw new Error(
        "SIGO_REMOTE_TEMPORALIDADE_INCOMPLETA"
      );
    }


    const assinadoEm =
      Date.parse(
        assinadoEmTexto
      );


    const expiraAssinaturaEm =
      Date.parse(
        expiraAssinaturaTexto
      );


    const expiraComandoEm =
      expiraComandoTexto
        ? Date.parse(
            expiraComandoTexto
          )
        : null;


    if (
      !Number.isFinite(assinadoEm) ||
      !Number.isFinite(
        expiraAssinaturaEm
      ) ||
      (
        expiraComandoTexto &&
        !Number.isFinite(
          expiraComandoEm
        )
      )
    ) {

      throw new Error(
        "SIGO_REMOTE_TEMPORALIDADE_INVALIDA"
      );
    }


    const agora =
      Date.now();


    const toleranciaRelogioMs =
      5 * 60 * 1000;


    if (
      assinadoEm >
      agora + toleranciaRelogioMs
    ) {

      throw new Error(
        "SIGO_REMOTE_ASSINATURA_NO_FUTURO"
      );
    }


    if (
      expiraAssinaturaEm <=
      assinadoEm
    ) {

      throw new Error(
        "SIGO_REMOTE_JANELA_ASSINATURA_INVALIDA"
      );
    }


    if (
      expiraAssinaturaEm <=
      agora
    ) {

      throw new Error(
        "SIGO_REMOTE_ASSINATURA_EXPIRADA"
      );
    }


    if (
      expiraComandoEm !== null &&
      expiraComandoEm <=
      agora
    ) {

      throw new Error(
        "SIGO_REMOTE_COMANDO_EXPIRADO"
      );
    }


    return {

      valido:
        true,

      assinadoEm:
        new Date(
          assinadoEm
        ).toISOString(),

      expiraAssinaturaEm:
        new Date(
          expiraAssinaturaEm
        ).toISOString(),

      expiraComandoEm:
        expiraComandoEm === null
          ? ""
          : new Date(
              expiraComandoEm
            ).toISOString()
    };
  }


  function validarVinculosIdentidade_(
    usuario,
    dispositivo,
    sessao
  ) {

    const idUsuario =
      texto_(
        primeiroCampo_(
          usuario,
          [
            "idUsuario",
            "ID_USUARIO",
            "usuarioId"
          ]
        )
      );


    const idDispositivo =
      texto_(
        primeiroCampo_(
          dispositivo,
          [
            "idDispositivo",
            "ID_DISPOSITIVO",
            "dispositivoId"
          ]
        )
      );


    const idSessao =
      texto_(
        primeiroCampo_(
          sessao,
          [
            "idSessao",
            "ID_SESSAO",
            "sessaoId"
          ]
        )
      );


    const usuarioDoDispositivo =
      texto_(
        primeiroCampo_(
          dispositivo,
          [
            "idUsuarioVinculado",
            "ID_USUARIO_VINCULADO",
            "idUsuario",
            "ID_USUARIO"
          ]
        )
      );


    const usuarioDaSessao =
      texto_(
        primeiroCampo_(
          sessao,
          [
            "idUsuario",
            "ID_USUARIO"
          ]
        )
      );


    const dispositivoDaSessao =
      texto_(
        primeiroCampo_(
          sessao,
          [
            "idDispositivo",
            "ID_DISPOSITIVO"
          ]
        )
      );


    const dispositivoStorage =
      texto_(
        localStorage.getItem(
          CHAVE_DISPOSITIVO
        )
      );


    if (
      !idUsuario ||
      !idDispositivo ||
      !idSessao
    ) {

      throw new Error(
        "SIGO_REMOTE_IDENTIDADE_INCOMPLETA"
      );
    }


    if (
      usuarioDoDispositivo !==
      idUsuario
    ) {

      throw new Error(
        "SIGO_REMOTE_DISPOSITIVO_USUARIO_DIVERGENTE"
      );
    }


    if (
      usuarioDaSessao !==
      idUsuario
    ) {

      throw new Error(
        "SIGO_REMOTE_SESSAO_USUARIO_DIVERGENTE"
      );
    }


    if (
      dispositivoDaSessao !==
      idDispositivo
    ) {

      throw new Error(
        "SIGO_REMOTE_SESSAO_DISPOSITIVO_DIVERGENTE"
      );
    }


    if (
      dispositivoStorage !==
      idDispositivo
    ) {

      throw new Error(
        "SIGO_REMOTE_DISPOSITIVO_STORAGE_DIVERGENTE"
      );
    }


    return {

      valido:
        true,

      idUsuario:
        idUsuario,

      idDispositivo:
        idDispositivo,

      idSessao:
        idSessao
    };
  }


  function limparStoresOperacionais_(
    transacao
  ) {

    if (
      !transacao ||
      typeof transacao.objectStore !==
        "function"
    ) {

      throw new Error(
        "SIGO_REMOTE_TRANSACAO_LIMPEZA_INVALIDA"
      );
    }


    return STORES_OPERACIONAIS
      .map(function (nomeStore) {

        return requisicaoIdb_(
          transacao
            .objectStore(
              nomeStore
            )
            .clear()
        );
      });
  }


  function sanitizarIdentidadeNaTransacao_(
    transacao,
    comando,
    contexto
  ) {

    if (
      !transacao ||
      typeof transacao.objectStore !==
        "function"
    ) {

      throw new Error(
        "SIGO_REMOTE_TRANSACAO_IDENTIDADE_INVALIDA"
      );
    }


    const momento =
      agoraIso_();


    const idComando =
      texto_(
        primeiroCampo_(
          comando,
          [
            "ID_COMANDO",
            "idComando"
          ]
        )
      );


    const motivo =
      texto_(
        primeiroCampo_(
          comando,
          [
            "MOTIVO",
            "motivo"
          ]
        )
      ) ||
      "LIMPEZA_REMOTA_AUTORIZADA";


    const storeUsuarios =
      transacao.objectStore(
        "TB_USUARIOS"
      );


    const storeDispositivos =
      transacao.objectStore(
        "TB_DISPOSITIVOS"
      );


    const storeSessoes =
      transacao.objectStore(
        "TB_SESSAO"
      );


    const usuarioSanitizado =
      preencherKeyPath_(
        storeUsuarios,
        {
          idUsuario:
            contexto.idUsuario,

          ID_USUARIO:
            contexto.idUsuario,

          status:
            "REVOGADO",

          statusUsuario:
            "REVOGADO",

          STATUS_USUARIO:
            "REVOGADO",

          revogadoEm:
            momento,

          motivoRevogacao:
            motivo,

          idComandoRevogacao:
            idComando
        },
        contexto.idUsuario ||
        "USR-REVOGADO"
      );


    const dispositivoSanitizado =
      preencherKeyPath_(
        storeDispositivos,
        {
          idDispositivo:
            contexto.idDispositivo,

          ID_DISPOSITIVO:
            contexto.idDispositivo,

          idUsuario:
            contexto.idUsuario,

          ID_USUARIO:
            contexto.idUsuario,

          status:
            "REVOGADO",

          statusDispositivo:
            "REVOGADO",

          STATUS_DISPOSITIVO:
            "REVOGADO",

          revogadoEm:
            momento,

          motivoRevogacao:
            motivo,

          idComandoRevogacao:
            idComando
        },
        contexto.idDispositivo ||
        "DISP-REVOGADO"
      );


    const sessaoSanitizada =
      preencherKeyPath_(
        storeSessoes,
        {
          idSessao:
            contexto.idSessao,

          ID_SESSAO:
            contexto.idSessao,

          idUsuario:
            contexto.idUsuario,

          ID_USUARIO:
            contexto.idUsuario,

          idDispositivo:
            contexto.idDispositivo,

          ID_DISPOSITIVO:
            contexto.idDispositivo,

          status:
            "ENCERRADA",

          statusSessao:
            "ENCERRADA",

          STATUS_SESSAO:
            "ENCERRADA",

          encerradaEm:
            momento,

          motivoEncerramento:
            motivo,

          idComandoEncerramento:
            idComando
        },
        contexto.idSessao ||
        "SES-ENCERRADA"
      );


    return [

      requisicaoIdb_(
        storeUsuarios.clear()
      ),

      requisicaoIdb_(
        storeDispositivos.clear()
      ),

      requisicaoIdb_(
        storeSessoes.clear()
      ),

      requisicaoIdb_(
        storeUsuarios.put(
          usuarioSanitizado
        )
      ),

      requisicaoIdb_(
        storeDispositivos.put(
          dispositivoSanitizado
        )
      ),

      requisicaoIdb_(
        storeSessoes.put(
          sessaoSanitizada
        )
      )
    ];
  }


  function gravarAuditoriaMinimaNaTransacao_(
    transacao,
    comando,
    contexto
  ) {

    if (
      !transacao ||
      typeof transacao.objectStore !==
        "function"
    ) {

      throw new Error(
        "SIGO_REMOTE_TRANSACAO_AUDITORIA_INVALIDA"
      );
    }


    const storeAuditoria =
      transacao.objectStore(
        "TB_AUDITORIA_IDENTIDADE"
      );


    const momento =
      agoraIso_();


    const idComando =
      texto_(
        primeiroCampo_(
          comando,
          [
            "ID_COMANDO",
            "idComando"
          ]
        )
      );


    const idAuditoria =
      "AUD-LIMPEZA-" +
      String(
        Date.now()
      );


    const auditoria =
      preencherKeyPath_(
        storeAuditoria,
        {
          idAuditoria:
            idAuditoria,

          tipo:
            "LIMPEZA_REMOTA_EXECUTADA",

          status:
            "EXECUTADA",

          idComando:
            idComando,

          idUsuario:
            contexto.idUsuario,

          idDispositivo:
            contexto.idDispositivo,

          idSessao:
            contexto.idSessao,

          registradoEm:
            momento
        },
        idAuditoria
      );


    return [

      requisicaoIdb_(
        storeAuditoria.clear()
      ),

      requisicaoIdb_(
        storeAuditoria.put(
          auditoria
        )
      )
    ];
  }


  function texto_(valor) {

    return String(
      valor == null
        ? ""
        : valor
    ).trim();
  }


  function maiusculo_(valor) {

    return texto_(valor)
      .toUpperCase();
  }


  function primeiroCampo_(
    registro,
    campos
  ) {

    const dados =
      registro &&
      typeof registro === "object"
        ? registro
        : {};


    for (
      const campo of campos
    ) {

      if (
        Object.prototype
          .hasOwnProperty
          .call(
            dados,
            campo
          )
      ) {

        const valor =
          dados[campo];


        if (
          valor !== undefined &&
          valor !== null &&
          texto_(valor)
        ) {

          return valor;
        }
      }
    }


    return "";
  }


  function canonizar_(valor) {

    if (valor === undefined) {

      return "__UNDEFINED__";
    }


    if (valor === null) {

      return null;
    }


    if (valor instanceof Date) {

      return {

        __tipo:
          "Date",

        valor:
          valor.toISOString()
      };
    }


    if (Array.isArray(valor)) {

      return valor.map(
        canonizar_
      );
    }


    if (
      typeof valor === "object"
    ) {

      const resultado = {};


      Object.keys(valor)
        .sort()
        .forEach(
          function (chave) {

            resultado[chave] =
              canonizar_(
                valor[chave]
              );
          }
        );


      return resultado;
    }


    return valor;
  }


  function serializarEstavel_(valor) {

    return JSON.stringify(
      canonizar_(valor)
    );
  }


  function base64ParaBytes_(valor) {

    const binario =
      atob(
        texto_(valor)
      );


    const bytes =
      new Uint8Array(
        binario.length
      );


    for (
      let indice = 0;
      indice < binario.length;
      indice++
    ) {

      bytes[indice] =
        binario.charCodeAt(indice);
    }


    return bytes;
  }


  function bytesParaBase64_(bytes) {

    const dados =
      bytes instanceof Uint8Array
        ? bytes
        : new Uint8Array(bytes);


    let binario = "";


    for (
      let indice = 0;
      indice < dados.length;
      indice++
    ) {

      binario +=
        String.fromCharCode(
          dados[indice]
        );
    }


    return btoa(binario);
  }


  function bytesParaHex_(bytes) {

    return Array.from(
      bytes instanceof Uint8Array
        ? bytes
        : new Uint8Array(bytes)
    )
      .map(
        function (byte) {

          return byte
            .toString(16)
            .padStart(2, "0");
        }
      )
      .join("");
  }


  async function sha256Bytes_(valor) {

    const bytes =
      valor instanceof Uint8Array
        ? valor
        : new TextEncoder()
            .encode(
              typeof valor === "string"
                ? valor
                : serializarEstavel_(valor)
            );


    return new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        bytes
      )
    );
  }


  async function sha256Hex_(valor) {

    return bytesParaHex_(
      await sha256Bytes_(valor)
    );
  }


  function agoraIso_() {

    return new Date()
      .toISOString();
  }


  function erroSeguro_(
    codigo,
    erro
  ) {

    return {

      codigo:
        texto_(codigo) ||
        "ERRO_CONTROLADO",

      nome:
        texto_(
          erro?.name
        ) ||
        "Error",

      mensagem:
        texto_(
          erro?.message
        ) ||
        "Falha controlada no módulo remoto."
    };
  }


  function emitirEventoSeguro_(
    nome,
    detalhes
  ) {

    try {

      global.dispatchEvent(
        new CustomEvent(
          nome,
          {
            detail: {

              status:
                texto_(
                  detalhes?.status
                ),

              codigo:
                texto_(
                  detalhes?.codigo
                ),

              resultado:
                texto_(
                  detalhes?.resultado
                ),

              data:
                agoraIso_()
            }
          }
        )
      );

    } catch (erro) {

      console.warn(
        "SIGO Remote Cleanup: evento não emitido.",
        texto_(nome)
      );
    }
  }


  function requisicaoIdb_(requisicao) {

    return new Promise(
      function (resolve, reject) {

        requisicao.onsuccess =
          function () {

            resolve(
              requisicao.result
            );
          };


        requisicao.onerror =
          function () {

            reject(
              requisicao.error ||
              new Error(
                "FALHA_REQUISICAO_INDEXEDDB"
              )
            );
          };
      }
    );
  }


  function transacaoIdb_(transacao) {

    return new Promise(
      function (resolve, reject) {

        transacao.oncomplete =
          function () {

            resolve(true);
          };


        transacao.onabort =
          function () {

            reject(
              transacao.error ||
              new Error(
                "TRANSACAO_INDEXEDDB_ABORTADA"
              )
            );
          };


        transacao.onerror =
          function () {

            reject(
              transacao.error ||
              new Error(
                "TRANSACAO_INDEXEDDB_FALHOU"
              )
            );
          };
      }
    );
  }


  function preencherKeyPath_(
    store,
    registro,
    valorPadrao
  ) {

    const resultado = {
      ...(registro || {})
    };


    const keyPath =
      store.keyPath;


    function definirCaminho_(
      objeto,
      caminho,
      valor
    ) {

      const partes =
        String(caminho)
          .split(".")
          .filter(Boolean);


      let atual = objeto;


      partes.forEach(
        function (parte, indice) {

          if (
            indice ===
            partes.length - 1
          ) {

            if (
              atual[parte] === undefined ||
              atual[parte] === null ||
              texto_(atual[parte]) === ""
            ) {

              atual[parte] = valor;
            }


            return;
          }


          if (
            !atual[parte] ||
            typeof atual[parte] !==
              "object"
          ) {

            atual[parte] = {};
          }


          atual =
            atual[parte];
        }
      );
    }


    if (
      typeof keyPath === "string" &&
      keyPath
    ) {

      definirCaminho_(
        resultado,
        keyPath,
        valorPadrao
      );
    }


    if (
      Array.isArray(keyPath)
    ) {

      keyPath.forEach(
        function (caminho, indice) {

          definirCaminho_(
            resultado,
            caminho,
            valorPadrao +
            "-" +
            String(indice + 1)
          );
        }
      );
    }


    return resultado;
  }


  function resolverBindingApiUrl_() {

    try {

      if (
        typeof SIGO_API_URL !==
        "undefined"
      ) {

        return texto_(
          SIGO_API_URL
        );
      }

    } catch (erro) {

      return "";
    }


    return texto_(
      global.SIGO_API_URL
    );
  }


  function resolverBindingToken_() {

    try {

      if (
        typeof SIGO_TOKEN_OFFLINE !==
        "undefined"
      ) {

        return texto_(
          SIGO_TOKEN_OFFLINE
        );
      }

    } catch (erro) {

      return "";
    }


    return texto_(
      global.SIGO_TOKEN_OFFLINE
    );
  }


  function criarModuloCriptografico_() {

    const ETAPA =
      "UX.21.9.7.7K.3C";


    const CONFIG = {

      ...CONFIG_CRIPTO
    };


    async function importarChavePublica_() {

      const pem =
        texto_(
          CONFIG.chavePublicaPem
        )
          .replace(
            "-----BEGIN PUBLIC KEY-----",
            ""
          )
          .replace(
            "-----END PUBLIC KEY-----",
            ""
          )
          .replace(
            /\s+/g,
            ""
          );


      const der =
        base64ParaBytes_(pem);


      const fingerprint =
        bytesParaHex_(
          await sha256Bytes_(der)
        );


      if (
        fingerprint !==
        CONFIG.fingerprintEsperado
      ) {

        throw new Error(
          "SIGO_REMOTE_FINGERPRINT_CHAVE_DIVERGENTE"
        );
      }


      return crypto.subtle.importKey(
        "spki",
        der,
        {
          name:
            "RSASSA-PKCS1-v1_5",

          hash:
            "SHA-256"
        },
        false,
        [
          "verify"
        ]
      );
    }


    const montarMatrizCanonica =
      (function montarMatrizCanonica_(
    comando,
    envelope
  ) {

    return [

      texto_(
        envelope.dominio
      ),

      texto_(
        envelope.versaoEnvelope
      ),

      texto_(
        envelope.acaoAutorizada
      ),

      texto_(
        comando.ID_COMANDO
      ),

      texto_(
        comando.ID_OPERACAO_REVOGACAO
      ),

      texto_(
        comando.VERSAO_CONTRATO
      ),

      texto_(
        comando.TIPO_COMANDO
      ).toUpperCase(),

      texto_(
        comando.ID_USUARIO
      ),

      texto_(
        comando.ID_DISPOSITIVO
      ),

      texto_(
        envelope.idSessao
      ),

      texto_(
        comando.MOTIVO
      ),

      texto_(
        comando.EMITIDO_EM
      ),

      texto_(
        comando.EMITIDO_POR
      ),

      texto_(
        comando.ORIGEM
      ),

      texto_(
        comando.EXPIRA_EM
      ),

      texto_(
        envelope.nonce
      ),

      texto_(
        envelope.assinadoEm
      ),

      texto_(
        envelope.expiraAssinaturaEm
      ),

      texto_(
        envelope.idChaveAssinatura
      ),

      texto_(
        envelope.algoritmoAssinatura
      )
    ];
  });


    const obterConfiguracaoPublica =
      (function () {

          return {

            idChave:
              CONFIG.idChave,

            fingerprint:
              CONFIG.fingerprint,

            algoritmoServidor:
              CONFIG.algoritmoServidor,

            algoritmoWebCrypto:
              CONFIG.algoritmoWebCrypto,

            algoritmoHash:
              CONFIG.algoritmoHash
          };
        });


    const verificarEnvelope =
      (async function verificarEnvelope_(
    vetor,
    agoraInformado
  ) {

    const origem =
      vetor ||
      {};


    const comando =
      origem.comando ||
      {};


    const envelope =
      origem.envelope ||
      {};


    const agoraMs =
      Number.isFinite(
        Number(
          agoraInformado
        )
      )
        ? Number(
            agoraInformado
          )
        : Date.now();


    const chavePublica =
      await importarChavePublica_();

    /*
     * O fingerprint já foi calculado sobre os bytes
     * DER/SPKI originais e comparado com o valor
     * esperado dentro de importarChavePublica_().
     * A CryptoKey permanece não extraível.
     */
    const fingerprint =
      CONFIG.fingerprintEsperado;


    const matriz =
      montarMatrizCanonica(
        comando,
        envelope
      );


    const payload =
      JSON.stringify(
        matriz
      );


    const payloadBytes =
      new TextEncoder()
        .encode(
          payload
        );


    const hashBuffer =
      await crypto.subtle.digest(
        CONFIG.algoritmoHash,
        payloadBytes
      );


    const hashBase64 =
      bytesParaBase64_(
        hashBuffer
      );


    const assinaturaBytes =
      base64ParaBytes_(
        envelope.assinaturaServidor
      );


    const assinaturaValida =
      await crypto.subtle.verify(
        {
          name:
            CONFIG.algoritmoWebCrypto
        },
        chavePublica,
        assinaturaBytes,
        payloadBytes
      );


    const assinadoEmMs =
      Date.parse(
        envelope.assinadoEm
      );


    const expiraEmMs =
      Date.parse(
        envelope.expiraAssinaturaEm
      );


    const datasValidas =
      Number.isFinite(
        assinadoEmMs
      ) &&
      Number.isFinite(
        expiraEmMs
      );


    const validacoesCriptograficas = {

      fingerprintCorreto:
        fingerprint ===
        CONFIG.fingerprint,

      idChaveCorreto:
        texto_(
          envelope.idChaveAssinatura
        ) ===
        CONFIG.idChave,

      algoritmoServidorCorreto:
        texto_(
          envelope.algoritmoAssinatura
        ) ===
        CONFIG.algoritmoServidor,

      algoritmoWebCryptoCorreto:
        texto_(
          envelope.algoritmoWebCrypto
        ) ===
        CONFIG.algoritmoWebCrypto,

      algoritmoHashCorreto:
        texto_(
          envelope.algoritmoHash
        ) ===
        CONFIG.algoritmoHash,

      dominioCorreto:
        texto_(
          envelope.dominio
        ) ===
        CONFIG.dominio,

      versaoCorreta:
        texto_(
          envelope.versaoEnvelope
        ) ===
        CONFIG.versaoEnvelope,

      acaoAutorizadaCorreta:
        texto_(
          envelope.acaoAutorizada
        ) ===
        CONFIG.acaoAutorizada,

      tipoComandoCorreto:
        texto_(
          comando.TIPO_COMANDO
        ).toUpperCase() ===
        CONFIG.tipoComando,

      sessaoVinculada:
        texto_(
          comando.ID_SESSAO
        ) ===
        texto_(
          envelope.idSessao
        ),

      matrizCom20Posicoes:
        matriz.length ===
        20,

      payloadCorreto:
        payload ===
        texto_(
          envelope.payloadCanonicoAssinado
        ),

      hashCorreto:
        hashBase64 ===
        texto_(
          envelope.hashPayloadAssinado
        ),

      assinaturaCom256Bytes:
        assinaturaBytes.length ===
        256,

      assinaturaValida:
        assinaturaValida ===
        true
    };


    const integridadeCriptografica =
      Object.values(
        validacoesCriptograficas
      ).every(
        function (
          valor
        ) {

          return valor ===
            true;
        }
      );


    const validacoesTemporais = {

      datasValidas:
        datasValidas,

      expiracaoPosterior:
        datasValidas &&
        expiraEmMs >
          assinadoEmMs,

      validadeExatamente15Minutos:
        datasValidas &&
        (
          expiraEmMs -
          assinadoEmMs
        ) ===
          CONFIG.validadeMs,

      assinaturaJaVigente:
        datasValidas &&
        agoraMs >=
          assinadoEmMs,

      assinaturaNaoExpirada:
        datasValidas &&
        agoraMs <=
          expiraEmMs
    };


    const janelaTemporalValida =
      Object.values(
        validacoesTemporais
      ).every(
        function (
          valor
        ) {

          return valor ===
            true;
        }
      );


    const autorizadoParaLimpeza =
      integridadeCriptografica &&
      janelaTemporalValida;


    let motivo =
      "ENVELOPE_AUTORIZADO";


    if (
      !integridadeCriptografica
    ) {

      motivo =
        "ENVELOPE_CRIPTOGRAFICAMENTE_INVALIDO";

    } else if (
      !validacoesTemporais
        .datasValidas
    ) {

      motivo =
        "DATAS_ENVELOPE_INVALIDAS";

    } else if (
      agoraMs <
      assinadoEmMs
    ) {

      motivo =
        "ENVELOPE_AINDA_NAO_VALIDO";

    } else if (
      agoraMs >
      expiraEmMs
    ) {

      motivo =
        "ENVELOPE_EXPIRADO";

    } else if (
      !validacoesTemporais
        .validadeExatamente15Minutos
    ) {

      motivo =
        "VALIDADE_ENVELOPE_DIVERGENTE";
    }


    return {

      integridadeCriptografica:
        integridadeCriptografica,

      janelaTemporalValida:
        janelaTemporalValida,

      autorizadoParaLimpeza:
        autorizadoParaLimpeza,

      motivo:
        motivo,

      validacoesCriptograficas:
        validacoesCriptograficas,

      validacoesTemporais:
        validacoesTemporais,

      assinaturaValida:
        assinaturaValida,

      fingerprint:
        fingerprint,

      totalPosicoesMatriz:
        matriz.length,

      totalBytesAssinatura:
        assinaturaBytes.length
    };
  });


    return Object.freeze({

      montarMatrizCanonica:
        montarMatrizCanonica,

      obterConfiguracaoPublica:
        obterConfiguracaoPublica,

      verificarEnvelope:
        verificarEnvelope
    });
  }


  function criarAdaptadorIdentidade_() {

    async function lerStoreCompleta_(
      nomeStore
    ) {

      if (
        typeof global
          .listarRegistrosSIGO !==
        "function"
      ) {

        throw new Error(
          "SIGO_REMOTE_LISTAR_REGISTROS_AUSENTE"
        );
      }


      const registros =
        await global
          .listarRegistrosSIGO(
            nomeStore
          );


      if (!Array.isArray(registros)) {

        throw new Error(
          "SIGO_REMOTE_STORE_IDENTIDADE_INVALIDA_" +
          nomeStore
        );
      }


      return registros;
    }


    function statusUsuario_(registro) {

      return maiusculo_(
        primeiroCampo_(
          registro,
          [
            "statusUsuario",
            "STATUS_USUARIO",
            "status"
          ]
        )
      );
    }


    function statusDispositivo_(
      registro
    ) {

      return maiusculo_(
        primeiroCampo_(
          registro,
          [
            "statusDispositivo",
            "STATUS_DISPOSITIVO",
            "status"
          ]
        )
      );
    }


    function statusSessao_(registro) {

      return maiusculo_(
        primeiroCampo_(
          registro,
          [
            "statusSessao",
            "STATUS_SESSAO",
            "status"
          ]
        )
      );
    }


    async function resolverContextoIdentidade_() {

      const [
        usuarios,
        dispositivos,
        sessoes
      ] =
        await Promise.all([

          lerStoreCompleta_(
            "TB_USUARIOS"
          ),

          lerStoreCompleta_(
            "TB_DISPOSITIVOS"
          ),

          lerStoreCompleta_(
            "TB_SESSAO"
          )
        ]);


      const usuariosAtivos =
        usuarios.filter(
          function (registro) {

            return (
              statusUsuario_(registro) ===
              "ATIVO"
            );
          }
        );


      const dispositivosAtivos =
        dispositivos.filter(
          function (registro) {

            return (
              statusDispositivo_(
                registro
              ) ===
              "ATIVO"
            );
          }
        );


      const sessoesAtivas =
        sessoes.filter(
          function (registro) {

            return (
              statusSessao_(registro) ===
              "ATIVA"
            );
          }
        );


      if (
        usuariosAtivos.length !== 1 ||
        dispositivosAtivos.length !== 1 ||
        sessoesAtivas.length !== 1
      ) {

        throw new Error(
          "SIGO_REMOTE_IDENTIDADE_ATIVA_NAO_UNICA"
        );
      }


      const usuario =
        usuariosAtivos[0];


      const dispositivo =
        dispositivosAtivos[0];


      const sessao =
        sessoesAtivas[0];


      const idUsuario =
        texto_(
          primeiroCampo_(
            usuario,
            [
              "idUsuario",
              "ID_USUARIO",
              "usuarioId"
            ]
          )
        );


      const idDispositivo =
        texto_(
          primeiroCampo_(
            dispositivo,
            [
              "idDispositivo",
              "ID_DISPOSITIVO",
              "dispositivoId"
            ]
          )
        );


      const idSessao =
        texto_(
          primeiroCampo_(
            sessao,
            [
              "idSessao",
              "ID_SESSAO",
              "sessaoId"
            ]
          )
        );


      const usuarioDispositivo =
        texto_(
          primeiroCampo_(
            dispositivo,
            [
              "idUsuarioVinculado",
              "ID_USUARIO_VINCULADO",
              "idUsuario",
              "ID_USUARIO"
            ]
          )
        );


      const usuarioSessao =
        texto_(
          primeiroCampo_(
            sessao,
            [
              "idUsuario",
              "ID_USUARIO"
            ]
          )
        );


      const dispositivoSessao =
        texto_(
          primeiroCampo_(
            sessao,
            [
              "idDispositivo",
              "ID_DISPOSITIVO"
            ]
          )
        );


      const dispositivoStorage =
        texto_(
          localStorage.getItem(
            CHAVE_DISPOSITIVO
          )
        );


      if (
        !idUsuario ||
        !idDispositivo ||
        !idSessao
      ) {

        throw new Error(
          "SIGO_REMOTE_IDENTIDADE_INCOMPLETA"
        );
      }


      if (
        usuarioDispositivo !==
        idUsuario
      ) {

        throw new Error(
          "SIGO_REMOTE_DISPOSITIVO_USUARIO_DIVERGENTE"
        );
      }


      if (
        usuarioSessao !==
        idUsuario
      ) {

        throw new Error(
          "SIGO_REMOTE_SESSAO_USUARIO_DIVERGENTE"
        );
      }


      if (
        dispositivoSessao !==
        idDispositivo
      ) {

        throw new Error(
          "SIGO_REMOTE_SESSAO_DISPOSITIVO_DIVERGENTE"
        );
      }


      if (
        dispositivoStorage !==
        idDispositivo
      ) {

        throw new Error(
          "SIGO_REMOTE_DISPOSITIVO_STORAGE_DIVERGENTE"
        );
      }


      return {

        idUsuario:
          idUsuario,

        idDispositivo:
          idDispositivo,

        idSessao:
          idSessao
      };
    }


    return Object.freeze({

      resolver:
        resolverContextoIdentidade_
    });
  }


  function criarClienteComandoRemoto_() {

    function resolverBindingsApi_() {

      const url =
        resolverBindingApiUrl_();


      const token =
        resolverBindingToken_();


      if (!url || !token) {

        throw new Error(
          "SIGO_REMOTE_BINDINGS_API_AUSENTES"
        );
      }


      const endpoint =
        new URL(url);


      if (
        endpoint.protocol !==
          "https:" ||
        !endpoint.pathname
          .endsWith("/exec")
      ) {

        throw new Error(
          "SIGO_REMOTE_ENDPOINT_API_INVALIDO"
        );
      }


      return {

        url:
          url,

        token:
          token
      };
    }


    async function executarPostApi_(
      payload
    ) {

      const bindings =
        resolverBindingsApi_();


      const controlador =
        new AbortController();


      const timeout =
        setTimeout(
          function () {

            controlador.abort();

          },
          20000
        );


      try {

        const resposta =
          await fetch(
            bindings.url,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "text/plain;charset=UTF-8"
              },

              body:
                JSON.stringify({
                  ...payload,
                  token:
                    bindings.token
                }),

              cache:
                "no-store",

              credentials:
                "omit",

              redirect:
                "follow",

              signal:
                controlador.signal
            }
          );


        const corpo =
          await resposta.text();


        let json;


        try {

          json =
            JSON.parse(corpo);

        } catch (erroJson) {

          throw new Error(
            "SIGO_REMOTE_RESPOSTA_NAO_JSON"
          );
        }


        return {

          resposta:
            resposta,

          json:
            json
        };

      } finally {

        clearTimeout(timeout);
      }
    }


    function normalizarRespostaApi_(
      respostaHttp,
      json
    ) {

      const detalhes =
        json &&
        typeof json.detalhes ===
          "object"
          ? json.detalhes
          : {};


      return {

        httpStatus:
          respostaHttp.status,

        httpOk:
          respostaHttp.ok,

        status:
          maiusculo_(json?.status),

        mensagem:
          texto_(json?.mensagem),

        dataResposta:
          texto_(json?.dataResposta),

        acao:
          maiusculo_(detalhes.acao),

        resultado:
          maiusculo_(
            detalhes.resultado
          ),

        codigo:
          maiusculo_(
            detalhes.codigo
          ),

        comando:
          detalhes.comando ?? null,

        identidade:
          detalhes.identidade || null,

        detalhes:
          detalhes
      };
    }


    async function consultarComandoRemoto_(
      contexto
    ) {

      const retorno =
        await executarPostApi_({

          acao:
            ACOES.CONSULTAR,

          idUsuario:
            contexto.idUsuario,

          idDispositivo:
            contexto.idDispositivo,

          idSessao:
            contexto.idSessao
        });


      const normalizada =
        normalizarRespostaApi_(
          retorno.resposta,
          retorno.json
        );


      if (
        !normalizada.httpOk ||
        normalizada.httpStatus !==
          200 ||
        normalizada.status !==
          "OK" ||
        normalizada.acao !==
          ACOES.CONSULTAR
      ) {

        throw new Error(
          "SIGO_REMOTE_CONSULTA_CONTRATO_INVALIDO"
        );
      }


      if (
        normalizada.resultado ===
          "SEM_COMANDO_REMOTO" &&
        normalizada.codigo ===
          "SEM_COMANDO_REMOTO" &&
        normalizada.comando ===
          null
      ) {

        return {

          status:
            "OK",

          resultado:
            "SEM_COMANDO_REMOTO",

          codigo:
            "SEM_COMANDO_REMOTO",

          comando:
            null
        };
      }


      const comandoValido =
        normalizada.comando &&
        typeof normalizada.comando ===
          "object" &&
        Object.keys(
          normalizada.comando
        ).length >
        0;


      if (!comandoValido) {

        throw new Error(
          "SIGO_REMOTE_COMANDO_ENTREGUE_INVALIDO"
        );
      }


      return {

        status:
          "OK",

        resultado:
          normalizada.resultado,

        codigo:
          normalizada.codigo,

        comando:
          normalizada.comando
      };
    }


    async function iniciarExecucaoComando_(
      comando,
      contexto
    ) {

      const pacoteNormalizado =
        normalizarPacoteCriptografico_(
          comando
        );


      const comandoOperacional =
        pacoteNormalizado.comando;


      const idComando =
        texto_(
          primeiroCampo_(
            comandoOperacional,
            [
              "ID_COMANDO",
              "idComando"
            ]
          )
        );


      if (!idComando) {

        throw new Error(
          "SIGO_REMOTE_ID_COMANDO_INICIO_AUSENTE"
        );
      }


      const retorno =
        await executarPostApi_({

          acao:
            ACOES.INICIAR,

          idComando:
            idComando,

          idUsuario:
            contexto.idUsuario,

          idDispositivo:
            contexto.idDispositivo,

          idSessao:
            contexto.idSessao
        });


      const normalizada =
        normalizarRespostaApi_(
          retorno.resposta,
          retorno.json
        );


      if (
        !normalizada.httpOk ||
        normalizada.httpStatus !==
          200 ||
        normalizada.status !==
          "OK" ||
        normalizada.acao !==
          ACOES.INICIAR ||
        normalizada.resultado !==
          "EXECUCAO_INICIADA" ||
        normalizada.codigo !==
          "COMANDO_MARCADO_EM_EXECUCAO"
      ) {

        throw new Error(
          "SIGO_REMOTE_INICIO_EXECUCAO_REJEITADO"
        );
      }


      return normalizada;
    }


    async function confirmarExecucaoComando_(
      comando,
      contexto,
      comprovante
    ) {

      const idComando =
        texto_(
          primeiroCampo_(
            comando,
            [
              "ID_COMANDO",
              "idComando"
            ]
          ) ||
          primeiroCampo_(
            comprovante,
            [
              "ID_COMANDO",
              "idComando"
            ]
          )
        );


      if (!idComando) {

        throw new Error(
          "SIGO_REMOTE_ID_COMANDO_CONFIRMACAO_AUSENTE"
        );
      }


      const retorno =
        await executarPostApi_({

          acao:
            ACOES.CONFIRMAR,

          idComando:
            idComando,

          idUsuario:
            contexto.idUsuario,

          idDispositivo:
            contexto.idDispositivo,

          idSessao:
            contexto.idSessao,

          comprovante:
            comprovante
        });


      const normalizada =
        normalizarRespostaApi_(
          retorno.resposta,
          retorno.json
        );


      if (
        !normalizada.httpOk ||
        normalizada.httpStatus !==
          200 ||
        normalizada.status !==
          "OK" ||
        normalizada.acao !==
          ACOES.CONFIRMAR ||
        normalizada.resultado !==
          "EXECUCAO_CONFIRMADA" ||
        normalizada.codigo !==
          "COMANDO_MARCADO_EXECUTADO"
      ) {

        throw new Error(
          "SIGO_REMOTE_CONFIRMACAO_REJEITADA"
        );
      }


      return normalizada;
    }


    return Object.freeze({

      consultar:
        consultarComandoRemoto_,

      iniciar:
        iniciarExecucaoComando_,

      confirmar:
        confirmarExecucaoComando_
    });
  }


  function criarBloqueioOperacional_() {

    const ETAPA =
      "UX.21.9.7.7K.3C";


    const estadoInterno = {

      ativo:
        false,

      bloqueado:
        false,

      codigo:
        "",

      motivo:
        "",

      idComando:
        "",

      ativadoEm:
        "",

      totalAtivacoes:
        0
    };


    const ativar =
      (function ativarBloqueio_(
    dados = {}
  ) {

    const idComando =
      texto_(
        dados.idComando
      );


    if (
      !idComando
    ) {

      throw new Error(
        "UX21977K3C4A_ID_COMANDO_AUSENTE"
      );
    }


    /*
     * Uma segunda ativação para o mesmo comando deve ser
     * idempotente: não altera a data nem recria o estado.
     */
    if (
      estadoInterno.ativo
    ) {

      const mesmoComando =
        estadoInterno.idComando ===
        idComando;


      return {

        status:
          mesmoComando
            ? "BLOQUEIO_JA_ATIVO_MESMO_COMANDO"
            : "BLOQUEIO_JA_ATIVO_OUTRO_COMANDO",

        idempotente:
          mesmoComando,

        estado:
          obterEstado()
      };
    }


    estadoInterno.ativo =
      true;

    estadoInterno.idComando =
      idComando;

    estadoInterno.motivo =
      texto_(
        dados.motivo
      ) ||
      "COMANDO_REMOTO_AUTORIZADO";

    estadoInterno.origem =
      texto_(
        dados.origem
      ) ||
      ETAPA;

    estadoInterno.ativadoEm =
      new Date()
        .toISOString();

    estadoInterno.syncSuspenso =
      true;

    estadoInterno.retrySuspenso =
      true;


    return {

      status:
        "BLOQUEIO_ATIVADO",

      idempotente:
        false,

      estado:
        obterEstado()
    };
  });


    const executarOperacaoProtegida =
      (async function executarOperacaoProtegida_(
    operacao,
    executor
  ) {

    const controle =
      verificarOperacao_(
        operacao
      );


    if (
      !controle.permitido
    ) {

      return {

        executada:
          false,

        controle:
          controle,

        resultado:
          null
      };
    }


    if (
      typeof executor !==
      "function"
    ) {

      throw new Error(
        "UX21977K3C4A_EXECUTOR_INVALIDO"
      );
    }


    const resultado =
      await executor();


    return {

      executada:
        true,

      controle:
        controle,

      resultado:
        resultado
    };
  });


    const obterEstado =
      (function obterEstado_() {

    return Object.freeze({

      ativo:
        estadoInterno.ativo,

      idComando:
        estadoInterno.idComando,

      motivo:
        estadoInterno.motivo,

      origem:
        estadoInterno.origem,

      ativadoEm:
        estadoInterno.ativadoEm,

      syncSuspenso:
        estadoInterno.syncSuspenso,

      retrySuspenso:
        estadoInterno.retrySuspenso
    });
  });


    const verificarOperacao =
      (function verificarOperacao_(
    operacao
  ) {

    const nomeOperacao =
      texto_(
        operacao
      ) ||
      "OPERACAO_NAO_INFORMADA";


    if (
      !estadoInterno.ativo
    ) {

      return {

        permitido:
          true,

        status:
          "LIBERADO",

        operacao:
          nomeOperacao,

        codigo:
          ""
      };
    }


    return {

      permitido:
        false,

      status:
        "BLOQUEADO",

      operacao:
        nomeOperacao,

      codigo:
        "BLOQUEIO_REMOTO_EM_MEMORIA",

      idComando:
        estadoInterno.idComando,

      motivo:
        estadoInterno.motivo
    };
  });


    return Object.freeze({

      ativar:
        ativar,

      executarOperacaoProtegida:
        executarOperacaoProtegida,

      obterEstado:
        obterEstado,

      verificarOperacao:
        verificarOperacao
    });
  }


  function criarPonteOperacional_(
    bloqueador
  ) {

    const executar =
      (async function (
          operacao,
          executor
        ) {

          return bloqueador
            .executarOperacaoProtegida(
              operacao,
              executor
            );
        });


    const obterEstado =
      (function () {

          return bloqueador
            .obterEstado();
        });


    const verificar =
      (function (
          operacao
        ) {

          return bloqueador
            .verificarOperacao(
              operacao
            );
        });


    return Object.freeze({

      executar:
        executar,

      obterEstado:
        obterEstado,

      verificar:
        verificar
    });
  }


  function criarExecutorTransacional_() {

    function sanitizarUsuario_(
      registro,
      comando
    ) {

      return {

        ...registro,

        status:
          "REVOGADO",

        statusUsuario:
          "REVOGADO",

        STATUS_USUARIO:
          "REVOGADO",

        revogadoEm:
          agoraIso_(),

        motivoRevogacao:
          texto_(
            primeiroCampo_(
              comando,
              [
                "MOTIVO",
                "motivo"
              ]
            )
          ) ||
          "LIMPEZA_REMOTA_AUTORIZADA"
      };
    }


    function sanitizarDispositivo_(
      registro,
      comando
    ) {

      return {

        ...registro,

        status:
          "REVOGADO",

        statusDispositivo:
          "REVOGADO",

        STATUS_DISPOSITIVO:
          "REVOGADO",

        revogadoEm:
          agoraIso_(),

        idComandoRevogacao:
          texto_(
            primeiroCampo_(
              comando,
              [
                "ID_COMANDO",
                "idComando"
              ]
            )
          )
      };
    }


    function sanitizarSessao_(
      registro,
      comando
    ) {

      return {

        ...registro,

        status:
          "ENCERRADA",

        statusSessao:
          "ENCERRADA",

        STATUS_SESSAO:
          "ENCERRADA",

        encerradaEm:
          agoraIso_(),

        idComandoEncerramento:
          texto_(
            primeiroCampo_(
              comando,
              [
                "ID_COMANDO",
                "idComando"
              ]
            )
          )
      };
    }


    async function executarTransacaoAtomica_(
      banco,
      comando,
      contexto
    ) {

      if (
        !(banco instanceof IDBDatabase)
      ) {

        throw new Error(
          "SIGO_REMOTE_BANCO_INDEXEDDB_INVALIDO"
        );
      }


      if (
        banco.name !==
        BANCO_OFICIAL
      ) {

        throw new Error(
          "SIGO_REMOTE_BANCO_OFICIAL_DIVERGENTE"
        );
      }


      const nomesDisponiveis =
        new Set(
          Array.from(
            banco.objectStoreNames
          )
        );


      const ausentes =
        TODAS_STORES.filter(
          function (nome) {

            return !nomesDisponiveis
              .has(nome);
          }
        );


      if (ausentes.length) {

        throw new Error(
          "SIGO_REMOTE_STORES_AUSENTES"
        );
      }


      const [
        usuarios,
        dispositivos,
        sessoes
      ] =
        await Promise.all([

          global.listarRegistrosSIGO(
            "TB_USUARIOS"
          ),

          global.listarRegistrosSIGO(
            "TB_DISPOSITIVOS"
          ),

          global.listarRegistrosSIGO(
            "TB_SESSAO"
          )
        ]);


      const transacao =
        banco.transaction(
          TODAS_STORES,
          "readwrite"
        );


      const conclusao =
        transacaoIdb_(transacao);


      try {

        const requisicoes = [];


        STORES_OPERACIONAIS
          .forEach(
            function (nome) {

              requisicoes.push(
                requisicaoIdb_(
                  transacao
                    .objectStore(nome)
                    .clear()
                )
              );
            }
          );


        const storeUsuarios =
          transacao.objectStore(
            "TB_USUARIOS"
          );


        const storeDispositivos =
          transacao.objectStore(
            "TB_DISPOSITIVOS"
          );


        const storeSessoes =
          transacao.objectStore(
            "TB_SESSAO"
          );


        const storeAuditoria =
          transacao.objectStore(
            "TB_AUDITORIA_IDENTIDADE"
          );


        requisicoes.push(
          requisicaoIdb_(
            storeUsuarios.clear()
          )
        );


        requisicoes.push(
          requisicaoIdb_(
            storeDispositivos.clear()
          )
        );


        requisicoes.push(
          requisicaoIdb_(
            storeSessoes.clear()
          )
        );


        requisicoes.push(
          requisicaoIdb_(
            storeAuditoria.clear()
          )
        );


        (
          Array.isArray(usuarios)
            ? usuarios
            : []
        )
          .forEach(
            function (registro, indice) {

              const sanitizado =
                preencherKeyPath_(
                  storeUsuarios,
                  sanitizarUsuario_(
                    registro,
                    comando
                  ),
                  "USR-REVOGADO-" +
                  String(indice + 1)
                );


              requisicoes.push(
                requisicaoIdb_(
                  storeUsuarios.put(
                    sanitizado
                  )
                )
              );
            }
          );


        (
          Array.isArray(dispositivos)
            ? dispositivos
            : []
        )
          .forEach(
            function (registro, indice) {

              const sanitizado =
                preencherKeyPath_(
                  storeDispositivos,
                  sanitizarDispositivo_(
                    registro,
                    comando
                  ),
                  "DISP-REVOGADO-" +
                  String(indice + 1)
                );


              requisicoes.push(
                requisicaoIdb_(
                  storeDispositivos.put(
                    sanitizado
                  )
                )
              );
            }
          );


        (
          Array.isArray(sessoes)
            ? sessoes
            : []
        )
          .forEach(
            function (registro, indice) {

              const sanitizado =
                preencherKeyPath_(
                  storeSessoes,
                  sanitizarSessao_(
                    registro,
                    comando
                  ),
                  "SES-ENCERRADA-" +
                  String(indice + 1)
                );


              requisicoes.push(
                requisicaoIdb_(
                  storeSessoes.put(
                    sanitizado
                  )
                )
              );
            }
          );


        const idComando =
          texto_(
            primeiroCampo_(
              comando,
              [
                "ID_COMANDO",
                "idComando"
              ]
            )
          );


        const auditoria =
          preencherKeyPath_(
            storeAuditoria,
            {
              idAuditoria:
                "AUD-LIMPEZA-" +
                Date.now(),

              tipo:
                "LIMPEZA_REMOTA_EXECUTADA",

              status:
                "EXECUTADA",

              idComando:
                idComando,

              idUsuario:
                contexto.idUsuario,

              idDispositivo:
                contexto.idDispositivo,

              idSessao:
                contexto.idSessao,

              registradoEm:
                agoraIso_()
            },
            "AUD-LIMPEZA-" +
            Date.now()
          );


        requisicoes.push(
          requisicaoIdb_(
            storeAuditoria.put(
              auditoria
            )
          )
        );


        await Promise.all(
          requisicoes
        );


        await conclusao;


        return {

          status:
            "OK",

          resultado:
            "TRANSACAO_COMMITADA",

          totalStores:
            TODAS_STORES.length,

          totalStoresOperacionais:
            STORES_OPERACIONAIS.length,

          filaLimpa:
            true,

          identidadeSanitizada:
            true
        };

      } catch (erro) {

        try {

          transacao.abort();

        } catch (erroAbort) {

          console.warn(
            "SIGO Remote Cleanup: transação já encerrada."
          );
        }


        throw erro;
      }
    }


    return Object.freeze({

      executar:
        executarTransacaoAtomica_
    });
  }


  function criarModuloComprovante_() {

    const ETAPA =
      "UX.21.9.7.7K.3C";


    const CONFIG = {

      chave:
        CHAVE_COMPROVANTE,

      versao:
        "1.0",

      tipo:
        "COMPROVANTE_LIMPEZA_REMOTA",

      algoritmo:
        "SHA-256"
    };


    async function calcularHashComprovante_(
      comprovante
    ) {

      const copia = {
        ...(comprovante || {})
      };


      delete copia.hash;
      delete copia.hashIntegridade;


      if (
        copia.integridade &&
        typeof copia.integridade ===
          "object"
      ) {

        copia.integridade = {
          ...copia.integridade
        };


        delete copia.integridade.hash;
      }


      delete copia.hashIntegridadeLocal;


      return sha256Hex_(
        serializarEstavel_(copia)
      );
    }


    const criar =
      (async function criarComprovante_(
    referencias,
    executadoEm
  ) {

    const dataExecucao =
      texto_(
        executadoEm
      ) ||
      new Date()
        .toISOString();

    const vinculoCriptograficoEntrada =
      referencias
        ?.vinculoCriptografico &&
      typeof referencias
        .vinculoCriptografico ===
        "object"
        ? referencias
            .vinculoCriptografico
        : {};


    const comprovante = {

      versaoComprovante:
        "1.0",

      tipoRegistro:
        "COMPROVANTE_LIMPEZA_REMOTA",

      status:
        "CONCLUIDA",

      resultado:
        "LIMPEZA_REMOTA_EXECUTADA",

      idComando:
        referencias.idComando,

      idOperacaoRevogacao:
        referencias
          .idOperacaoRevogacao,

      idUsuario:
        referencias.idUsuario,

      idDispositivo:
        referencias.idDispositivo,

      idSessao:
        referencias.idSessao,

      executadoEm:
        dataExecucao,

      storesOperacionaisLimpas:
        true,

      filaSincronizacaoLimpa:
        true,

      identidadeSanitizada:
        true,

      localStorageSanitizado:
        true,

      sessionStorageLimpo:
        true,

      cacheMemoriaLimpo:
        true,

      cacheStoragePreservado:
        true,

      serviceWorkerPreservado:
        true,

      bancoLocalPreservado:
        true,

      vinculoCriptografico: {

        nonce:
          vinculoCriptograficoEntrada.nonce,

        hashPayloadAssinado:
          vinculoCriptograficoEntrada.hashPayloadAssinado,

        idChaveAssinatura:
          vinculoCriptograficoEntrada.idChaveAssinatura,

        assinaturaServidorValidada:
          true
      },

      algoritmoHashLocal:
        "SHA-256",

      origem:
        ETAPA
    };


    comprovante.hashIntegridadeLocal =
      await calcularHashComprovante_(
        comprovante
      );


    return comprovante;
  });


    const desserializar =
      (function desserializarComprovante_(
    valor
  ) {

    const texto =
      String(
        valor || ""
      );


    if (
      !texto
    ) {

      return null;
    }


    try {

      return JSON.parse(
        texto
      );

    } catch (
      erro
    ) {

      return null;
    }
  });


    const serializar =
      (function serializarComprovante_(
    comprovante
  ) {

    return JSON.stringify(
      comprovante
    );
  });


    const validar =
      (async function validarComprovante_(
    comprovante,
    referencias
  ) {

    const CAMPOS_RESULTADO_LIMPEZA =
      Object.freeze([

        "storesOperacionaisLimpas",
        "filaSincronizacaoLimpa",
        "identidadeSanitizada",
        "bancoLocalPreservado",
        "localStorageSanitizado",
        "sessionStorageLimpo",
        "cacheMemoriaLimpo",
        "cacheStoragePreservado",
        "serviceWorkerPreservado"

      ]);


    const resultado = {

      valido:
        false,

      motivo:
        "",

      estruturaCompleta:
        false,

      resultadoLimpezaCompleto:
        false,

      vinculoCriptograficoCompleto:
        false,

      identidadeCorreta:
        false,

      vinculoCriptograficoCorreto:
        false,

      hashIntegridadeLocalValido:
        false,

      dataExecucaoValida:
        false
    };


    if (
      !comprovante ||
      typeof comprovante !==
        "object"
    ) {

      resultado.motivo =
        "COMPROVANTE_AUSENTE";

      return resultado;
    }


    const camposEstruturais = [

      "versaoComprovante",
      "tipoRegistro",
      "status",
      "resultado",
      "idComando",
      "idOperacaoRevogacao",
      "idUsuario",
      "idDispositivo",
      "idSessao",
      "executadoEm",
      "algoritmoHashLocal",
      "hashIntegridadeLocal",
      "origem"
    ];


    resultado.estruturaCompleta =
      camposEstruturais.every(
        function (
          campo
        ) {

          return Boolean(
            texto_(
              comprovante[campo]
            )
          );
        }
      );


    if (
      !resultado
        .estruturaCompleta
    ) {

      resultado.motivo =
        "COMPROVANTE_ESTRUTURA_INCOMPLETA";

      return resultado;
    }


    const vinculo =
      comprovante
        .vinculoCriptografico;


    resultado
      .vinculoCriptograficoCompleto =
      Boolean(
        vinculo &&
        texto_(
          vinculo.nonce
        ) &&
        texto_(
          vinculo
            .hashPayloadAssinado
        ) &&
        texto_(
          vinculo
            .idChaveAssinatura
        ) &&
        vinculo
          .assinaturaServidorValidada ===
        true
      );


    if (
      !resultado
        .vinculoCriptograficoCompleto
    ) {

      resultado.motivo =
        "COMPROVANTE_VINCULO_CRIPTO_INCOMPLETO";

      return resultado;
    }


    resultado
      .resultadoLimpezaCompleto =
      CAMPOS_RESULTADO_LIMPEZA
        .every(
          function (
            campo
          ) {

            return comprovante[campo] ===
              true;
          }
        );


    if (
      !resultado
        .resultadoLimpezaCompleto
    ) {

      resultado.motivo =
        "COMPROVANTE_RESULTADO_LIMPEZA_INCOMPLETO";

      return resultado;
    }


    resultado.identidadeCorreta =
      comprovante.idComando ===
        referencias.idComando &&
      comprovante
        .idOperacaoRevogacao ===
        referencias
          .idOperacaoRevogacao &&
      comprovante.idUsuario ===
        referencias.idUsuario &&
      comprovante.idDispositivo ===
        referencias.idDispositivo &&
      comprovante.idSessao ===
        referencias.idSessao;


    if (
      !resultado.identidadeCorreta
    ) {

      resultado.motivo =
        "COMPROVANTE_IDENTIDADE_DIVERGENTE";

      return resultado;
    }


    resultado
      .vinculoCriptograficoCorreto =
      vinculo.nonce ===
        referencias.nonce &&
      vinculo.hashPayloadAssinado ===
        referencias
          .hashPayloadAssinado &&
      vinculo.idChaveAssinatura ===
        referencias
          .idChaveAssinatura &&
      vinculo.assinaturaServidorValidada ===
        true;


    if (
      !resultado
        .vinculoCriptograficoCorreto
    ) {

      resultado.motivo =
        "COMPROVANTE_VINCULO_CRIPTO_DIVERGENTE";

      return resultado;
    }


    const dataExecucao =
      new Date(
        comprovante.executadoEm
      );


    resultado.dataExecucaoValida =
      Number.isFinite(
        dataExecucao.getTime()
      );


    if (
      !resultado
        .dataExecucaoValida
    ) {

      resultado.motivo =
        "COMPROVANTE_DATA_EXECUCAO_INVALIDA";

      return resultado;
    }


    const hashCalculado =
      await calcularHashComprovante_(
        comprovante
      );


    resultado
      .hashIntegridadeLocalValido =
      comprovante
        .algoritmoHashLocal ===
        "SHA-256" &&
      texto_(
        comprovante
          .hashIntegridadeLocal
      ) ===
      hashCalculado;


    if (
      !resultado
        .hashIntegridadeLocalValido
    ) {

      resultado.motivo =
        "COMPROVANTE_HASH_LOCAL_DIVERGENTE";

      return resultado;
    }


    resultado.valido =
      true;

    resultado.motivo =
      "COMPROVANTE_LOCAL_VALIDADO";


    return resultado;
  });


    return Object.freeze({

      chave:
        CHAVE_COMPROVANTE,

      criar:
        criar,

      desserializar:
        desserializar,

      serializar:
        serializar,

      validar:
        validar
    });
  }


  function criarGateComprovante_(
    executor,
    moduloComprovante
  ) {

    async function executarFluxoComComprovante_(
      banco,
      comando,
      contexto,
      verificacaoCriptografica
    ) {

      const pacoteNormalizado =
        normalizarPacoteCriptografico_(
          comando
        );


      const comandoOperacional =
        pacoteNormalizado.comando;


      const envelopeCriptografico =
        pacoteNormalizado.envelope;


      const transacao =
        await executor.executar(
          banco,
          comandoOperacional,
          contexto
        );


      if (
        transacao?.resultado !==
        "TRANSACAO_COMMITADA"
      ) {

        throw new Error(
          "SIGO_REMOTE_COMMIT_NAO_CONFIRMADO"
        );
      }


      const comprovante =
        await moduloComprovante.criar({

          versao:
            "1.0",

          tipo:
            "COMPROVANTE_LIMPEZA_REMOTA",

          idComando:
            texto_(
              primeiroCampo_(
                comandoOperacional,
                [
                  "ID_COMANDO",
                  "idComando"
                ]
              )
            ),

          idOperacaoRevogacao:
            texto_(
              primeiroCampo_(
                comandoOperacional,
                [
                  "ID_OPERACAO_REVOGACAO",
                  "idOperacaoRevogacao"
                ]
              )
            ),

          idUsuario:
            contexto.idUsuario,

          idDispositivo:
            contexto.idDispositivo,

          idSessao:
            contexto.idSessao,

          executadoEm:
            agoraIso_(),

          transacao:
            transacao,

          vinculoCriptografico: {

            nonce:
              texto_(
                primeiroCampo_(
                  envelopeCriptografico,
                  [
                    "nonce",
                    "NONCE"
                  ]
                )
              ),

            hashPayloadAssinado:
              texto_(
                primeiroCampo_(
                  envelopeCriptografico,
                  [
                    "hashPayloadAssinado",
                    "HASH_PAYLOAD_ASSINADO"
                  ]
                )
              ),

            idChaveAssinatura:
              texto_(
                primeiroCampo_(
                  envelopeCriptografico,
                  [
                    "idChaveAssinatura",
                    "ID_CHAVE_ASSINATURA"
                  ]
                )
              ),

            assinaturaServidorValidada:
              verificacaoCriptografica ===
                true ||
              verificacaoCriptografica
                ?.valido === true ||
              verificacaoCriptografica
                ?.autorizado === true ||
              verificacaoCriptografica
                ?.comandoAutorizado ===
                true ||
              verificacaoCriptografica
                ?.autorizadoParaLimpeza ===
                true
          }
        });


      const comprovanteValido =
        await moduloComprovante.validar(
          comprovante,
          {
            idComando:
              texto_(
                primeiroCampo_(
                  comandoOperacional,
                  [
                    "ID_COMANDO",
                    "idComando"
                  ]
                )
              ),

            idOperacaoRevogacao:
              texto_(
                primeiroCampo_(
                  comandoOperacional,
                  [
                    "ID_OPERACAO_REVOGACAO",
                    "idOperacaoRevogacao"
                  ]
                )
              ),

            idUsuario:
              contexto.idUsuario,

            idDispositivo:
              contexto.idDispositivo,

            idSessao:
              contexto.idSessao,

            nonce:
              texto_(
                primeiroCampo_(
                  envelopeCriptografico,
                  [
                    "nonce",
                    "NONCE"
                  ]
                )
              ),

            hashPayloadAssinado:
              texto_(
                primeiroCampo_(
                  envelopeCriptografico,
                  [
                    "hashPayloadAssinado",
                    "HASH_PAYLOAD_ASSINADO"
                  ]
                )
              ),

            idChaveAssinatura:
              texto_(
                primeiroCampo_(
                  envelopeCriptografico,
                  [
                    "idChaveAssinatura",
                    "ID_CHAVE_ASSINATURA"
                  ]
                )
              )
          }
        );


      if (
        comprovanteValido !== true &&
        comprovanteValido?.valido !==
          true
      ) {

        throw new Error(
          "SIGO_REMOTE_COMPROVANTE_LOCAL_INVALIDO"
        );
      }


      return {

        transacao:
          transacao,

        comprovante:
          comprovante
      };
    }


    return Object.freeze({

      executar:
        executarFluxoComComprovante_
    });
  }


  function criarExecutorCicloRemoto_(
    dependencias
  ) {

    const cliente =
      dependencias.cliente;


    const criptografia =
      dependencias.criptografia;


    const bloqueador =
      dependencias.bloqueador;


    const gate =
      dependencias.gate;


    const comprovanteModulo =
      dependencias.comprovante;


    let limpezaEmCurso =
      null;


    let confirmacaoPendente =
      false;


    function limparStoragesPosCommit_(
      comprovante,
      idDispositivo
    ) {

      const serializado =
        comprovanteModulo
          .serializar(
            comprovante
          );


      const chaves =
        [];


      for (
        let indice = 0;
        indice < localStorage.length;
        indice++
      ) {

        const chave =
          localStorage.key(indice);


        if (chave) {

          chaves.push(chave);
        }
      }


      chaves.forEach(
        function (chave) {

          if (
            chave !==
              CHAVE_DISPOSITIVO &&
            chave !==
              CHAVE_COMPROVANTE
          ) {

            localStorage.removeItem(
              chave
            );
          }
        }
      );


      localStorage.setItem(
        CHAVE_DISPOSITIVO,
        idDispositivo
      );


      localStorage.setItem(
        CHAVE_COMPROVANTE,
        serializado
      );


      sessionStorage.clear();
    }


    function limparCacheMemoria_() {

      try {

        if (
          typeof SIGODataCache ===
          "undefined"
        ) {

          return false;
        }


        if (
          SIGODataCache &&
          typeof SIGODataCache.clear ===
            "function"
        ) {

          SIGODataCache.clear();

          return true;
        }


        if (
          SIGODataCache &&
          typeof SIGODataCache ===
            "object"
        ) {

          Object.keys(
            SIGODataCache
          )
            .forEach(
              function (chave) {

                delete SIGODataCache[
                  chave
                ];
              }
            );


          return true;
        }

      } catch (erro) {

        return false;
      }


      return false;
    }


    function registrarComandoRecebidoEmMemoria_(
      comando
    ) {

      const pacoteNormalizado =
        normalizarPacoteCriptografico_(
          comando
        );


      const comandoOperacional =
        pacoteNormalizado.comando;


      return {

        presente:
          Boolean(
            comandoOperacional
          ),

        idComando:
          texto_(
            primeiroCampo_(
              comandoOperacional,
              [
                "ID_COMANDO",
                "idComando"
              ]
            )
          ),

        tipoComando:
          maiusculo_(
            primeiroCampo_(
              comandoOperacional,
              [
                "TIPO_COMANDO",
                "tipoComando"
              ]
            )
          ),

        recebidoEm:
          agoraIso_()
      };
    }


    function notificarDispositivoRevogado_(
      comprovante
    ) {

      emitirEventoSeguro_(
        EVENTOS.REVOGADO,
        {
          status:
            "BLOQUEADO",

          codigo:
            "DISPOSITIVO_REVOGADO",

          resultado:
            comprovante
              ? "LIMPEZA_REMOTA_CONCLUIDA"
              : "REVOGACAO_LOCAL_CONFIRMADA"
        }
      );
    }


    async function executarComandoAutorizado_(
      comando,
      contexto
    ) {

      if (limpezaEmCurso) {

        return limpezaEmCurso;
      }


      limpezaEmCurso =
        (async function () {

          const registro =
            registrarComandoRecebidoEmMemoria_(
              comando
            );


          const verificacao =
            await criptografia
              .verificarEnvelope(
          normalizarPacoteCriptografico_(comando),
          Date.now()
        );


          const autorizado =
            verificacao === true ||
            verificacao?.valido === true ||
            verificacao?.autorizado ===
              true ||
            verificacao
              ?.comandoAutorizado ===
              true ||
            verificacao?.autorizadoParaLimpeza === true;


          if (!autorizado) {

            throw new Error(
              "SIGO_REMOTE_ENVELOPE_NAO_AUTORIZADO"
            );
          }


          bloqueador.ativar({
            codigo:
              "COMANDO_REMOTO_AUTORIZADO",

            motivo:
              "LIMPEZA_REMOTA",

            idComando:
              registro.idComando
          });


          emitirEventoSeguro_(
            EVENTOS.AUTORIZADO,
            {
              status:
                "BLOQUEADO",

              codigo:
                "COMANDO_REMOTO_AUTORIZADO",

              resultado:
                "VALIDACAO_CRIPTOGRAFICA_APROVADA"
            }
          );


          await cliente.iniciar(
            comando,
            contexto
          );


          emitirEventoSeguro_(
            EVENTOS.INICIADO,
            {
              status:
                "OK",

              codigo:
                "COMANDO_MARCADO_EM_EXECUCAO",

              resultado:
                "EXECUCAO_INICIADA"
            }
          );


          if (
            typeof global
              .abrirBancoLocalSIGO !==
            "function"
          ) {

            throw new Error(
              "SIGO_REMOTE_ABRIR_BANCO_AUSENTE"
            );
          }


          const banco =
            await global
              .abrirBancoLocalSIGO();


          const resultadoGate =
            await gate.executar(
              banco,
              comando,
              contexto,
              verificacao
            );


          limparStoragesPosCommit_(
            resultadoGate.comprovante,
            contexto.idDispositivo
          );


          limparCacheMemoria_();


          emitirEventoSeguro_(
            EVENTOS.CONCLUIDO,
            {
              status:
                "OK",

              codigo:
                "LIMPEZA_LOCAL_CONCLUIDA",

              resultado:
                "TRANSACAO_COMMITADA"
            }
          );


          notificarDispositivoRevogado_(
            resultadoGate.comprovante
          );


          try {

            await cliente.confirmar(
              comando,
              contexto,
              resultadoGate.comprovante
            );


            confirmacaoPendente =
              false;


            emitirEventoSeguro_(
              EVENTOS.CONFIRMADO,
              {
                status:
                  "OK",

                codigo:
                  "COMANDO_MARCADO_EXECUTADO",

                resultado:
                  "EXECUCAO_CONFIRMADA"
              }
            );

          } catch (erroConfirmacao) {

            confirmacaoPendente =
              true;


            throw erroConfirmacao;
          }


          return {

            status:
              "EXECUTADO",

            codigo:
              "LIMPEZA_REMOTA_EXECUTADA",

            bloqueado:
              true,

            permitido:
              false,

            confirmacaoPendente:
              confirmacaoPendente
          };

        })();


      try {

        return await limpezaEmCurso;

      } finally {

        limpezaEmCurso =
          null;
      }
    }


    return Object.freeze({

      executar:
        executarComandoAutorizado_,

      obterEstado:
        function () {

          return {

            limpezaEmCurso:
              Boolean(limpezaEmCurso),

            confirmacaoPendente:
              confirmacaoPendente
          };
        },

      notificarRevogado:
        notificarDispositivoRevogado_
    });
  }


  /* =========================================================
   * UX.21.9.7.7K.3C.8I.9.R2 — CLOSURE DO COORDENADOR
   * =========================================================
   */


  const ORIGENS =
    Object.freeze({

      BOOT:
        "BOOT",

      ONLINE:
        "ONLINE",

      PRE_SYNC:
        "PRE_SYNC",

      RETRY:
        "RETRY"
    });


  const RESULTADOS =
    Object.freeze({

      SEM_COMANDO:
        "SEM_COMANDO_REMOTO",

      COMANDO_AUTORIZADO:
        "COMANDO_AUTORIZADO"
    });

  /* =========================================================
   * UX.21.9.7.7K.3C.8I.10B.3 — ADAPTADOR CRIPTOGRAFICO
   * =========================================================
   */


  function normalizarPacoteCriptografico_(entrada) {

    if (
      !entrada ||
      typeof entrada !== "object"
    ) {

      throw new Error(
        "SIGO_REMOTE_PACOTE_CRIPTOGRAFICO_INVALIDO"
      );
    }


    const comando =
      entrada.comando;


    const envelope =
      entrada.envelope;


    if (
      !comando ||
      typeof comando !== "object"
    ) {

      throw new Error(
        "SIGO_REMOTE_COMANDO_ASSINADO_AUSENTE"
      );
    }


    if (
      !envelope ||
      typeof envelope !== "object"
    ) {

      throw new Error(
        "SIGO_REMOTE_ENVELOPE_CRIPTOGRAFICO_AUSENTE"
      );
    }


    return entrada;
  }

  const criarCoordenadorBase_ =
    (function criarCoordenador_(
    dependencias
  ) {

    if (
      !dependencias ||
      typeof dependencias
        .estaOnline !==
        "function" ||
      typeof dependencias
        .obterContexto !==
        "function" ||
      typeof dependencias
        .verificarComando !==
        "function" ||
      typeof dependencias
        .ativarBloqueio !==
        "function"
    ) {

      throw new Error(
        "UX21977K3C8C_DEPENDENCIAS_INVALIDAS"
      );
    }


    const estado = {

      preparado:
        false,

      verificacaoEmCurso:
        null,

      bloqueio:
        null,

      totalSolicitacoes:
        0,

      totalVerificacoesIniciadas:
        0,

      totalSolicitacoesCoalescidas:
        0,

      totalOffline:
        0,

      totalPermitidas:
        0,

      totalBloqueadas:
        0,

      ultimaOrigem:
        "",

      ultimaDecisao:
        null
    };


    function criarDecisao_(
      dados
    ) {

      const decisao = {

        origem:
          texto_(
            dados.origem
          ),

        executado:
          dados.executado ===
          true,

        permitido:
          dados.permitido ===
          true,

        bloqueado:
          dados.bloqueado ===
          true,

        requerLimpeza:
          dados.requerLimpeza ===
          true,

        codigo:
          texto_(
            dados.codigo
          ),

        resultado:
          texto_(
            dados.resultado
          ),

        coalescido:
          dados.coalescido ===
          true,

        comando: {

          presente:
            Boolean(
              dados
                .comando
                ?.idComando
            ),

          idComando:
            texto_(
              dados
                .comando
                ?.idComando
            ),

          tipoComando:
            texto_(
              dados
                .comando
                ?.tipoComando
            )
        }
      };


      estado.ultimaOrigem =
        decisao.origem;


      estado.ultimaDecisao =
        decisao;


      if (
        decisao.permitido
      ) {

        estado.totalPermitidas++;
      }


      if (
        decisao.bloqueado
      ) {

        estado.totalBloqueadas++;
      }


      return decisao;
    }


    function preparar() {

      if (
        estado.preparado
      ) {

        return {

          preparadoAgora:
            false,

          jaPreparado:
            true
        };
      }


      estado.preparado =
        true;


      return {

        preparadoAgora:
          true,

        jaPreparado:
          false
      };
    }


    function avaliar(
      origem
    ) {

      const origemNormalizada =
        maiusculo_(
          origem
        );


      if (
        !Object.values(
          ORIGENS
        ).includes(
          origemNormalizada
        )
      ) {

        return Promise.reject(
          new Error(
            "UX21977K3C8C_ORIGEM_INVALIDA"
          )
        );
      }


      estado.totalSolicitacoes++;


      /*
       * Bloqueio em memória já estabelecido.
       * Não consulta novamente o adaptador.
       */
      if (
        estado.bloqueio
      ) {

        return Promise.resolve(
          criarDecisao_({

            origem:
              origemNormalizada,

            executado:
              false,

            permitido:
              false,

            bloqueado:
              true,

            requerLimpeza:
              true,

            codigo:
              "BLOQUEIO_REMOTO_JA_ATIVO",

            resultado:
              RESULTADOS
                .COMANDO_AUTORIZADO,

            comando:
              estado
                .bloqueio
                .comando
          })
        );
      }


      /*
       * Sem conexão:
       *
       * - boot e online apenas não executam a consulta;
       * - pre-sync e retry não recebem autorização para
       *   iniciar uma operação de rede.
       */
      if (
        dependencias
          .estaOnline() !==
        true
      ) {

        estado.totalOffline++;


        return Promise.resolve(
          criarDecisao_({

            origem:
              origemNormalizada,

            executado:
              false,

            permitido:
              false,

            bloqueado:
              false,

            requerLimpeza:
              false,

            codigo:
              "SEM_CONEXAO",

            resultado:
              "CONSULTA_NAO_EXECUTADA"
          })
        );
      }


      /*
       * Coalescência:
       *
       * chamadas simultâneas compartilham exatamente
       * a mesma Promise de verificação.
       */
      if (
        estado.verificacaoEmCurso
      ) {

        estado
          .totalSolicitacoesCoalescidas++;


        return estado
          .verificacaoEmCurso;
      }


      estado
        .totalVerificacoesIniciadas++;


      const verificacao =
        Promise.resolve()
          .then(
            function () {

              return dependencias
                .obterContexto();
            }
          )
          .then(
            function (contexto) {

              return dependencias
                .verificarComando(
                  contexto,
                  origemNormalizada
                );
            }
          )
          .then(
            function (resposta) {

              const comandoAutorizado =
                resposta
                  ?.comandoAutorizado ===
                  true ||
                maiusculo_(
                  resposta?.resultado
                ) ===
                  RESULTADOS
                    .COMANDO_AUTORIZADO;


              if (
                comandoAutorizado
              ) {

                const comando = {

                  idComando:
                    texto_(
                      resposta
                        ?.comando
                        ?.idComando
                    ),

                  tipoComando:
                    maiusculo_(
                      resposta
                        ?.comando
                        ?.tipoComando
                    )
                };


                estado.bloqueio = {

                  origem:
                    origemNormalizada,

                  ativadoEm:
                    new Date()
                      .toISOString(),

                  comando:
                    comando
                };


                dependencias
                  .ativarBloqueio({

                    origem:
                      origemNormalizada,

                    comando:
                      comando
                  });


                return criarDecisao_({

                  origem:
                    origemNormalizada,

                  executado:
                    true,

                  permitido:
                    false,

                  bloqueado:
                    true,

                  requerLimpeza:
                    true,

                  codigo:
                    "COMANDO_REMOTO_AUTORIZADO",

                  resultado:
                    RESULTADOS
                      .COMANDO_AUTORIZADO,

                  comando:
                    comando
                });
              }


              return criarDecisao_({

                origem:
                  origemNormalizada,

                executado:
                  true,

                permitido:
                  true,

                bloqueado:
                  false,

                requerLimpeza:
                  false,

                codigo:
                  "SEM_COMANDO_REMOTO",

                resultado:
                  RESULTADOS
                    .SEM_COMANDO
              });
            }
          )
          .catch(
            function (erro) {

              const origemCritica =
                origemNormalizada ===
                  ORIGENS.PRE_SYNC ||
                origemNormalizada ===
                  ORIGENS.RETRY;


              return criarDecisao_({

                origem:
                  origemNormalizada,

                executado:
                  true,

                permitido:
                  !origemCritica,

                bloqueado:
                  origemCritica,

                requerLimpeza:
                  false,

                codigo:
                  origemCritica
                    ? "VERIFICACAO_REMOTA_FALHOU_OPERACAO_SUSPENSA"
                    : "VERIFICACAO_REMOTA_FALHOU",

                resultado:
                  "ERRO_CONTROLADO",

                erro:
                  texto_(
                    erro &&
                    erro.message
                      ? erro.message
                      : erro
                  )
              });
            }
          )
          .finally(
            function () {

              estado.verificacaoEmCurso =
                null;
            }
          );


      estado.verificacaoEmCurso =
        verificacao;


      return verificacao;
    }


    function obterEstado() {

      return {

        preparado:
          estado.preparado,

        verificacaoEmCurso:
          Boolean(
            estado.verificacaoEmCurso
          ),

        bloqueioAtivo:
          Boolean(
            estado.bloqueio
          ),

        totalSolicitacoes:
          estado.totalSolicitacoes,

        totalVerificacoesIniciadas:
          estado
            .totalVerificacoesIniciadas,

        totalSolicitacoesCoalescidas:
          estado
            .totalSolicitacoesCoalescidas,

        totalOffline:
          estado.totalOffline,

        totalPermitidas:
          estado.totalPermitidas,

        totalBloqueadas:
          estado.totalBloqueadas,

        ultimaOrigem:
          estado.ultimaOrigem,

        ultimaDecisao:
          estado.ultimaDecisao
      };
    }


    return Object.freeze({

      preparar:
        preparar,

      boot:
        function () {

          return avaliar(
            ORIGENS.BOOT
          );
        },

      online:
        function () {

          return avaliar(
            ORIGENS.ONLINE
          );
        },

      preSync:
        function () {

          return avaliar(
            ORIGENS.PRE_SYNC
          );
        },

      retry:
        function () {

          return avaliar(
            ORIGENS.RETRY
          );
        },

      obterEstado:
        obterEstado
    });
  });


  function criarCoordenador_(
    dependencias
  ) {

    const cliente =
      dependencias.cliente;


    const identidade =
      dependencias.identidade;


    const criptografia =
      dependencias.criptografia;


    const bloqueador =
      dependencias.bloqueador;


    const executorCiclo =
      dependencias.executorCiclo;


    let comandoAutorizado =
      null;


    let contextoAutorizado =
      null;


    let limpezaPromise =
      null;


    const base =
      criarCoordenadorBase_({

        estaOnline:
          function () {

            return (
              navigator.onLine !==
              false
            );
          },


        obterContexto:
          async function () {

            return identidade.resolver();
          },


        verificarComando:
          async function (contexto) {

            const consulta =
              await cliente.consultar(
                contexto
              );


            if (
              consulta.resultado ===
                "SEM_COMANDO_REMOTO" &&
              consulta.comando ===
                null
            ) {

              return {

                status:
                  "OK",

                resultado:
                  "SEM_COMANDO_REMOTO",

                codigo:
                  "SEM_COMANDO_REMOTO",

                comandoAutorizado:
                  false,

                comando:
                  null
              };
            }


            const comando =
              consulta.comando;


            const verificacao =
              await criptografia
                .verificarEnvelope(
          normalizarPacoteCriptografico_(comando),
          Date.now()
        );


            const autorizado =
              verificacao === true ||
              verificacao?.valido ===
                true ||
              verificacao?.autorizado ===
                true ||
              verificacao
                ?.comandoAutorizado ===
                true ||
              verificacao?.autorizadoParaLimpeza === true;


            if (!autorizado) {

              throw new Error(
                "SIGO_REMOTE_COMANDO_NAO_AUTORIZADO"
              );
            }


            comandoAutorizado =
              comando;


            contextoAutorizado =
              contexto;


            return {

              status:
                "OK",

              resultado:
                "COMANDO_AUTORIZADO",

              codigo:
                "COMANDO_CRIPTOGRAFICAMENTE_AUTORIZADO",

              comandoAutorizado:
                true,

              comando:
                comando
            };
          },


        ativarBloqueio:
          function () {

            const pacoteAutorizado =
              normalizarPacoteCriptografico_(
                comandoAutorizado
              );


            const idComando =
              texto_(
                primeiroCampo_(
                  pacoteAutorizado.comando,
                  [
                    "ID_COMANDO",
                    "idComando"
                  ]
                )
              );


            return bloqueador.ativar({
              codigo:
                "COMANDO_REMOTO_AUTORIZADO",

              motivo:
                "LIMPEZA_REMOTA",

              idComando:
                idComando
            });
          },


        executarLimpeza:
          async function () {

            if (
              !comandoAutorizado ||
              !contextoAutorizado
            ) {

              throw new Error(
                "SIGO_REMOTE_COMANDO_AUTORIZADO_AUSENTE"
              );
            }


            return executorCiclo
              .executar(
                comandoAutorizado,
                contextoAutorizado
              );
          }
      });


    async function concluirSeNecessario_(
      decisao
    ) {

      if (
        !decisao?.requerLimpeza
      ) {

        return decisao;
      }


      if (!limpezaPromise) {

        limpezaPromise =
          executorCiclo.executar(
            comandoAutorizado,
            contextoAutorizado
          );
      }


      try {

        const limpeza =
          await limpezaPromise;


        return {

          ...decisao,

          permitido:
            false,

          bloqueado:
            true,

          limpeza:
            limpeza
        };

      } finally {

        limpezaPromise =
          null;
      }
    }


    async function executarOrigem_(
      metodo
    ) {

      const decisao =
        await base[metodo]();


      return concluirSeNecessario_(
        decisao
      );
    }


    return Object.freeze({

      preparar:
        base.preparar,


      boot:
        function () {

          return executarOrigem_(
            "boot"
          );
        },


      online:
        function () {

          return executarOrigem_(
            "online"
          );
        },


      preSync:
        function () {

          return executarOrigem_(
            "preSync"
          );
        },


      retry:
        function () {

          return executarOrigem_(
            "retry"
          );
        },


      obterEstado:
        function () {

          return {

            coordenador:
              base.obterEstado(),

            bloqueio:
              bloqueador
                .obterEstado(),

            ciclo:
              executorCiclo
                .obterEstado(),

            comandoAutorizado:
              Boolean(
                comandoAutorizado
              ),

            limpezaEmCurso:
              Boolean(
                limpezaPromise
              )
          };
        }
    });
  }


  function criarIntegracaoPwa_(
    coordenador,
    bloqueador,
    comprovanteModulo,
    executorCiclo
  ) {

    const estado = {

      preparado:
        false,

      wrapperSyncInstalado:
        false,

      wrapperRetryInstalado:
        false,

      listenerOnlineInstalado:
        false,

      autobootInstalado:
        false,

      funcaoSyncOriginal:
        null,

      funcaoRetryOriginal:
        null,

      wrapperSync:
        null,

      wrapperRetry:
        null,

      listenerOnline:
        null,

      listenerDom:
        null,

      restauracaoLocalPromise:
        null
    };


    async function restaurarBloqueioLocal_() {

      const serializado =
        localStorage.getItem(
          CHAVE_COMPROVANTE
        );


      if (!serializado) {

        return false;
      }


      try {

        const comprovante =
          comprovanteModulo
            .desserializar(
              serializado
            );


        const valido =
          await comprovanteModulo
            .validar(
              comprovante,
              {
                idComando:
                  comprovante?.idComando ||
                  "",

                idOperacaoRevogacao:
                  comprovante
                    ?.idOperacaoRevogacao ||
                  "",

                idUsuario:
                  comprovante?.idUsuario ||
                  "",

                idDispositivo:
                  comprovante
                    ?.idDispositivo ||
                  "",

                idSessao:
                  comprovante?.idSessao ||
                  "",

                nonce:
                  comprovante
                    ?.vinculoCriptografico
                    ?.nonce ||
                  "",

                hashPayloadAssinado:
                  comprovante
                    ?.vinculoCriptografico
                    ?.hashPayloadAssinado ||
                  "",

                idChaveAssinatura:
                  comprovante
                    ?.vinculoCriptografico
                    ?.idChaveAssinatura ||
                  ""
              }
            );


        if (
          valido !== true &&
          valido?.valido !== true
        ) {

          return false;
        }


        bloqueador.ativar({
          codigo:
            "DISPOSITIVO_REVOGADO",

          motivo:
            "COMPROVANTE_LOCAL_VALIDO",

          idComando:
            comprovante.idComando
        });


        executorCiclo
          .notificarRevogado(
            comprovante
          );


        return true;

      } catch (erro) {

        return false;
      }
    }


    function obterRestauracaoLocal_() {

      if (
        !estado.restauracaoLocalPromise
      ) {

        estado.restauracaoLocalPromise =
          restaurarBloqueioLocal_();
      }


      return estado
        .restauracaoLocalPromise;
    }


    function instalarWrapperSincronizacao_() {

      if (
        estado.wrapperSyncInstalado
      ) {

        return false;
      }


      if (
        typeof global
          .sincronizarSIGO !==
        "function"
      ) {

        return false;
      }


      estado.funcaoSyncOriginal =
        global.sincronizarSIGO;


      const original =
        estado.funcaoSyncOriginal;


      async function wrapperSync_(
        ...argumentos
      ) {

        const revogado =
          await obterRestauracaoLocal_();


        if (revogado) {

          return {

            status:
              "BLOQUEADO",

            codigo:
              "DISPOSITIVO_REVOGADO",

            permitido:
              false,

            bloqueado:
              true
          };
        }


        const decisao =
          await coordenador.preSync();


        if (
          decisao?.permitido ===
            true &&
          decisao?.bloqueado !==
            true
        ) {

          return Reflect.apply(
            original,
            this,
            argumentos
          );
        }


        return decisao;
      }


      Object.defineProperty(
        wrapperSync_,
        "__sigoRemoteCleanupWrapper",
        {
          value:
            "PRE_SYNC",

          configurable:
            false,

          enumerable:
            false,

          writable:
            false
        }
      );


      estado.wrapperSync =
        wrapperSync_;


      global.sincronizarSIGO =
        wrapperSync_;


      estado.wrapperSyncInstalado =
        true;


      return true;
    }


    function instalarWrapperRetry_() {

      if (
        estado.wrapperRetryInstalado
      ) {

        return false;
      }


      if (
        typeof global
          .executarRetrySyncUX21963_ !==
        "function"
      ) {

        return false;
      }


      estado.funcaoRetryOriginal =
        global
          .executarRetrySyncUX21963_;


      const original =
        estado.funcaoRetryOriginal;


      async function wrapperRetry_(
        ...argumentos
      ) {

        const revogado =
          await obterRestauracaoLocal_();


        if (revogado) {

          return {

            status:
              "BLOQUEADO",

            codigo:
              "DISPOSITIVO_REVOGADO",

            permitido:
              false,

            bloqueado:
              true
          };
        }


        const decisao =
          await coordenador.retry();


        if (
          decisao?.permitido ===
            true &&
          decisao?.bloqueado !==
            true
        ) {

          return Reflect.apply(
            original,
            this,
            argumentos
          );
        }


        return decisao;
      }


      Object.defineProperty(
        wrapperRetry_,
        "__sigoRemoteCleanupWrapper",
        {
          value:
            "RETRY",

          configurable:
            false,

          enumerable:
            false,

          writable:
            false
        }
      );


      estado.wrapperRetry =
        wrapperRetry_;


      global.executarRetrySyncUX21963_ =
        wrapperRetry_;


      estado.wrapperRetryInstalado =
        true;


      return true;
    }


    function instalarListenerOnline_() {

      if (
        estado.listenerOnlineInstalado
      ) {

        return false;
      }


      estado.listenerOnline =
        async function () {

          const revogado =
            await obterRestauracaoLocal_();


          if (!revogado) {

            await coordenador.online();
          }
        };


      global.addEventListener(
        "online",
        estado.listenerOnline
      );


      estado.listenerOnlineInstalado =
        true;


      return true;
    }


    function instalarAutoboot_() {

      if (
        estado.autobootInstalado
      ) {

        return false;
      }


      const executarBoot =
        async function () {

          const revogado =
            await obterRestauracaoLocal_();


          if (!revogado) {

            await coordenador.boot();
          }
        };


      if (
        document.readyState ===
        "loading"
      ) {

        estado.listenerDom =
          executarBoot;


        document.addEventListener(
          "DOMContentLoaded",
          executarBoot,
          {
            once:
              true
          }
        );

      } else {

        queueMicrotask(
          executarBoot
        );
      }


      estado.autobootInstalado =
        true;


      return true;
    }


    function preparar_() {

      if (estado.preparado) {

        return {

          preparadoAgora:
            false,

          jaPreparado:
            true
        };
      }


      coordenador.preparar();


      instalarWrapperSincronizacao_();

      instalarWrapperRetry_();

      instalarListenerOnline_();

      instalarAutoboot_();


      estado.preparado =
        true;


      return {

        preparadoAgora:
          true,

        jaPreparado:
          false
      };
    }


    function restaurarIntegracao_() {

      if (
        estado.listenerOnlineInstalado &&
        estado.listenerOnline
      ) {

        global.removeEventListener(
          "online",
          estado.listenerOnline
        );
      }


      if (
        estado.listenerDom
      ) {

        document.removeEventListener(
          "DOMContentLoaded",
          estado.listenerDom
        );
      }


      if (
        estado.wrapperSync &&
        global.sincronizarSIGO ===
          estado.wrapperSync
      ) {

        global.sincronizarSIGO =
          estado.funcaoSyncOriginal;
      }


      if (
        estado.wrapperRetry &&
        global.executarRetrySyncUX21963_ ===
          estado.wrapperRetry
      ) {

        global.executarRetrySyncUX21963_ =
          estado.funcaoRetryOriginal;
      }


      estado.preparado =
        false;

      estado.wrapperSyncInstalado =
        false;

      estado.wrapperRetryInstalado =
        false;

      estado.listenerOnlineInstalado =
        false;

      estado.autobootInstalado =
        false;


      return true;
    }


    return Object.freeze({

      preparar:
        preparar_,

      restaurar:
        restaurarIntegracao_,

      obterEstado:
        function () {

          return {

            preparado:
              estado.preparado,

            wrapperSyncInstalado:
              estado.wrapperSyncInstalado,

            wrapperRetryInstalado:
              estado.wrapperRetryInstalado,

            listenerOnlineInstalado:
              estado.listenerOnlineInstalado,

            autobootInstalado:
              estado.autobootInstalado
          };
        }
    });
  }


  const criptografia =
    criarModuloCriptografico_();


  const identidade =
    criarAdaptadorIdentidade_();


  const cliente =
    criarClienteComandoRemoto_();


  const bloqueador =
    criarBloqueioOperacional_();


  const ponte =
    criarPonteOperacional_(
      bloqueador
    );


  const executor =
    criarExecutorTransacional_();


  const comprovante =
    criarModuloComprovante_();


  const gate =
    criarGateComprovante_(
      executor,
      comprovante
    );


  const executorCiclo =
    criarExecutorCicloRemoto_({

      cliente:
        cliente,

      criptografia:
        criptografia,

      bloqueador:
        bloqueador,

      gate:
        gate,

      comprovante:
        comprovante
    });


  const coordenador =
    criarCoordenador_({

      cliente:
        cliente,

      identidade:
        identidade,

      criptografia:
        criptografia,

      bloqueador:
        bloqueador,

      executorCiclo:
        executorCiclo
    });


  const integracao =
    criarIntegracaoPwa_(
      coordenador,
      bloqueador,
      comprovante,
      executorCiclo
    );


  const apiPrincipal =
    Object.freeze({

      __versao:
        VERSAO_MODULO,


      preparar:
        function () {

          return integracao.preparar();
        },


      verificarAgora:
        function (origem) {

          const normalizada =
            maiusculo_(
              origem ||
              "BOOT"
            );


          if (
            normalizada ===
            "ONLINE"
          ) {

            return coordenador.online();
          }


          if (
            normalizada ===
            "PRE_SYNC"
          ) {

            return coordenador.preSync();
          }


          if (
            normalizada ===
            "RETRY"
          ) {

            return coordenador.retry();
          }


          return coordenador.boot();
        },


      obterEstado:
        function () {

          return {

            versao:
              VERSAO_MODULO,

            integracao:
              integracao.obterEstado(),

            coordenador:
              coordenador.obterEstado(),

            bloqueio:
              bloqueador.obterEstado(),

            ponte:
              ponte.obterEstado(),

            ciclo:
              executorCiclo.obterEstado()
          };
        },


      obterVersao:
        function () {

          return VERSAO_MODULO;
        },


      desinstalarIntegracao:
        function () {

          return integracao.restaurar();
        }
    });


  const apiCliente =
    Object.freeze({

      consultar:
        cliente.consultar,

      iniciar:
        cliente.iniciar,

      confirmar:
        cliente.confirmar
    });


  const apiCoordenador =
    Object.freeze({

      boot:
        coordenador.boot,

      online:
        coordenador.online,

      preSync:
        coordenador.preSync,

      retry:
        coordenador.retry,

      obterEstado:
        coordenador.obterEstado
    });


  global.SIGORemoteCleanup =
    apiPrincipal;


  global.SIGORemoteCleanupClient =
    apiCliente;


  global.SIGORemoteCleanupCoordinator =
    apiCoordenador;


  integracao.preparar();


})(window);
