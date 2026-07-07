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

  if (typeof atualizarBadgeNotificacoes_ === "function") {
    await atualizarBadgeNotificacoes_();
  }

  return notificacao;

}

window.atualizarBadgeNotificacoes_ = async function () {
  const badge = document.getElementById("badgeNotificacoes");

  if (!badge) return;

  try {
    const obraAtiva = obterObraAtivaMobile_();

    const notificacoes =
      await listarRegistrosSIGO("TB_NOTIFICACOES");

    const naoLidas =
      notificacoes.filter(item =>
        String(item.idObra) === String(obraAtiva) &&
        item.lida === false
      );

    const total = naoLidas.length;

    badge.textContent = total;

    if (total > 0) {
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }

  } catch (erro) {
    console.error("Erro ao atualizar badge de notificações:", erro);
  }
};
