// =====================================================
// UX.19.3 — CONTEXTO DO DIÁRIO ATIVO
// =====================================================

window.obterChaveDiarioAtivoSIGO_ =
  function (idObra = "") {

    const obra =
      idObra ||
      (
        typeof obterObraAtivaMobile_ ===
        "function"
          ? obterObraAtivaMobile_()
          : ""
      );

    if (!obra) {
      return "";
    }

    return `SIGO_DIARIO_ATIVO::${obra}`;
  };


window.definirDiarioAtivoSIGO_ =
  function (
    idDiario,
    idObra = ""
  ) {

    const obra =
      idObra ||
      (
        typeof obterObraAtivaMobile_ ===
        "function"
          ? obterObraAtivaMobile_()
          : ""
      );

    if (!obra) {
      throw new Error(
        "Nenhuma obra ativa foi identificada."
      );
    }

    if (!idDiario) {
      throw new Error(
        "O identificador do diário não foi informado."
      );
    }

    const chave =
      obterChaveDiarioAtivoSIGO_(
        obra
      );

    window.SIGO_DIARIO_ATIVO_ID =
      String(idDiario);

    window.SIGO_DIARIO_ATIVO_OBRA_ID =
      String(obra);

    localStorage.setItem(
      chave,
      String(idDiario)
    );

    console.log(
      "Diário ativo definido:",
      {
        idObra: obra,
        idDiario
      }
    );

    return String(idDiario);
  };


window.obterDiarioAtivoSIGO_ =
  function (idObra = "") {

    const obra =
      idObra ||
      (
        typeof obterObraAtivaMobile_ ===
        "function"
          ? obterObraAtivaMobile_()
          : ""
      );

    if (!obra) {
      return "";
    }

    const chave =
      obterChaveDiarioAtivoSIGO_(
        obra
      );

    const idSalvo =
      localStorage.getItem(
        chave
      );

    if (idSalvo) {

      window.SIGO_DIARIO_ATIVO_ID =
        idSalvo;

      window.SIGO_DIARIO_ATIVO_OBRA_ID =
        String(obra);

      return idSalvo;
    }

    if (
      String(
        window
          .SIGO_DIARIO_ATIVO_OBRA_ID ||
        ""
      ) === String(obra)
    ) {
      return String(
        window.SIGO_DIARIO_ATIVO_ID ||
        ""
      );
    }

    return "";
  };


window.limparDiarioAtivoSIGO_ =
  function (idObra = "") {

    const obra =
      idObra ||
      (
        typeof obterObraAtivaMobile_ ===
        "function"
          ? obterObraAtivaMobile_()
          : ""
      );

    if (obra) {

      const chave =
        obterChaveDiarioAtivoSIGO_(
          obra
        );

      localStorage.removeItem(
        chave
      );
    }

    if (
      !obra ||
      String(
        window
          .SIGO_DIARIO_ATIVO_OBRA_ID ||
        ""
      ) === String(obra)
    ) {
      window.SIGO_DIARIO_ATIVO_ID =
        "";

      window.SIGO_DIARIO_ATIVO_OBRA_ID =
        "";
    }

    return true;
  };

const SIGOEntities = {

  // ===================================================
  // DIÁRIO — CABEÇALHO
  // ===================================================
  diario: {

    storeName:
      "TB_DIARIOS",

    idKey:
      "idDiario",

    prefix:
      "DIA",

    syncTipo:
      "DIARIO_OBRA",

    fields: [
      {
        id: "diarioData",
        key: "data"
      },
      {
        id: "diarioResponsavel",
        key: "responsavel"
      },
      {
        id: "diarioEquipe",
        key: "equipe"
      },
      {
        id: "diarioHoras",
        key: "horasDia",
        type: "number"
      },
      {
        id: "diarioClima",
        key: "clima"
      },
      {
        id: "diarioOcorrencias",
        key: "ocorrencias"
      },
      {
        id: "diarioObservacoes",
        key: "observacoes"
      }
    ],

    extra: {
      statusDiario: "ABERTO"
    },

    // ===============================================
    // VALIDAÇÃO DO CABEÇALHO
    // ===============================================
    validate:
      async function (dados) {

        const data =
          String(
            dados.data || ""
          ).trim();

        const responsavel =
          String(
            dados.responsavel || ""
          ).trim();

        const horasDia =
          Number(
            dados.horasDia || 0
          );

        if (!data) {
          throw new Error(
            "Informe a data do diário."
          );
        }

        if (!responsavel) {
          throw new Error(
            "Informe o responsável pelo diário."
          );
        }

        if (
          !Number.isFinite(horasDia) ||
          horasDia < 0
        ) {
          throw new Error(
            "Informe uma quantidade válida de horas."
          );
        }

        return true;
      },

    // ===============================================
    // APÓS SALVAR, TORNA O DIÁRIO ATIVO
    // ===============================================
    afterSave: async function (
        registroSalvo
      ) {
      
        // ==========================================
        // 1. DEFINIR O NOVO DIÁRIO COMO ATIVO
        // ==========================================
      
        if (
          typeof definirDiarioAtivoSIGO_ ===
            "function"
        ) {
          definirDiarioAtivoSIGO_(
            registroSalvo.idDiario,
            registroSalvo.idObra
          );
        }
      
        // ==========================================
        // 2. CARREGAR ITENS DO NOVO DIÁRIO
        // ==========================================
      
        if (
          document.getElementById(
            "listaItensDiarioOffline"
          ) &&
          typeof listarItensDiarioOffline_ ===
            "function"
        ) {
          await listarItensDiarioOffline_(
            registroSalvo.idDiario
          );
        }
      
        // ==========================================
        // 3. ATUALIZAR O CONTEXTO VISUAL
        // ==========================================
      
        if (
          typeof atualizarContextoDiarioAtivoUX19_ ===
            "function"
        ) {
          await atualizarContextoDiarioAtivoUX19_();
        }
      
        // ==========================================
        // 4. ATUALIZAR HISTÓRICO DOS DIÁRIOS
        // ==========================================
      
        if (
          document.getElementById(
            "listaDiariosOffline"
          ) &&
          typeof carregarListaDiariosOffline ===
            "function"
        ) {
          await carregarListaDiariosOffline();
        }
      
        // ==========================================
        // 5. ATUALIZAR INDICADORES
        // ==========================================
      
        if (
          typeof atualizarIndicadoresMobile_ ===
            "function"
        ) {
          await atualizarIndicadoresMobile_();
        }
      
        return registroSalvo;
      }
  },


  // ===================================================
  // ITEM DO DIÁRIO
  // ===================================================
  diarioItem: {

    storeName:
      "TB_DIARIO_ITENS",

    idKey:
      "idItemDiario",

    prefix:
      "DIT",

    syncTipo:
      "DIARIO_ITEM",

    fields: [
      {
        id: "itemDiarioData",
        key: "data"
      },
      {
        id: "itemDiarioAtividade",
        key: "idAtividade"
      },
      {
        id: "itemDiarioEap",
        key: "eap"
      },
      {
        id: "itemDiarioServico",
        key: "servico"
      },
      {
        id: "itemDiarioEquipe",
        key: "equipe"
      },
      {
        id: "itemDiarioEquipamento",
        key: "equipamento"
      },
      {
        id: "itemDiarioQtde",
        key: "qtdeExecutada",
        type: "number"
      },
      {
        id: "itemDiarioUnidade",
        key: "unidade"
      },
      {
        id: "itemDiarioHoras",
        key: "horasTrabalhadas",
        type: "number"
      },
      {
        id: "itemDiarioObservacao",
        key: "observacao"
      }
    ],

    extra: {
      statusItem: "ABERTO"
    },

    // ===============================================
    // VALIDAÇÃO DOS DADOS OPERACIONAIS
    // ===============================================
    validate:
      async function (dados) {

        const idAtividade =
          String(
            dados.idAtividade || ""
          ).trim();

        const quantidade =
          Number(
            dados.qtdeExecutada || 0
          );

        const horas =
          Number(
            dados.horasTrabalhadas || 0
          );

        if (!idAtividade) {
          throw new Error(
            "Selecione uma atividade."
          );
        }

        if (
          !Number.isFinite(quantidade) ||
          quantidade <= 0
        ) {
          throw new Error(
            "Informe uma quantidade executada maior que zero."
          );
        }

        if (
          !Number.isFinite(horas) ||
          horas < 0
        ) {
          throw new Error(
            "Informe uma quantidade válida de horas trabalhadas."
          );
        }

        return true;
      },

    // ===============================================
    // VINCULAR AO DIÁRIO ATIVO
    // ===============================================
    beforeSave:
      async function (dados) {

        const idObra =
          typeof obterObraAtivaMobile_ ===
            "function"
            ? obterObraAtivaMobile_()
            : "";

        const idDiario =
          obterDiarioAtivoSIGO_(
            idObra
          );

        if (!idDiario) {
          throw new Error(
            "Abra ou crie um Diário de Obra antes de adicionar atividades."
          );
        }

        const diarios =
          await listarRegistrosSIGO(
            "TB_DIARIOS"
          );

        const diario =
          diarios.find(item =>
            String(item.idDiario) ===
              String(idDiario) &&
            String(item.idObra) ===
              String(idObra)
          );

        if (!diario) {

          limparDiarioAtivoSIGO_(
            idObra
          );

          throw new Error(
            "O Diário de Obra selecionado não foi localizado neste aparelho."
          );
        }

        const statusDiario =
          String(
            diario.statusDiario ||
            diario.status ||
            "ABERTO"
          )
            .trim()
            .toUpperCase();

        if (
          statusDiario !== "ABERTO"
        ) {
          throw new Error(
            "O Diário de Obra não está aberto para receber novas atividades."
          );
        }

        if (!diario.data) {
          throw new Error(
            "O Diário de Obra selecionado não possui uma data válida."
          );
        }

        return {
          idDiario:
            diario.idDiario,

          // A data do item passa a seguir
          // obrigatoriamente a data do cabeçalho.
          data:
            diario.data
        };
      },

    afterSave:
      async function () {

        if (
          typeof atualizarIndicadoresMobile_ ===
          "function"
        ) {
          await atualizarIndicadoresMobile_();
        }

        if (
          typeof listarItensDiarioOffline_ ===
          "function"
        ) {
          await listarItensDiarioOffline_();
        }
      }
  }
};


