// =====================================================
// UX.08.2
// SERVICE DE NOTIFICAÇÕES
// =====================================================

async function criarNotificacaoSIGO_(dados) {

  const notificacao = {

    idNotificacao:
      crypto.randomUUID(),

    idObra:
      obterObraAtivaMobile_(),

    tipo:
      dados.tipo || "INFO",

    titulo:
      dados.titulo || "",

    mensagem:
      dados.mensagem || "",

    icone:
      dados.icone || "🔔",

    lida:
      false,

    criadaEm:
      new Date().toISOString()

  };

  await salvarRegistroSIGO(
    "TB_NOTIFICACOES",
    notificacao
  );

  return notificacao;

}
