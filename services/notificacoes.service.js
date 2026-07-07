// =====================================================
// UX.08.2 — NOTIFICAÇÕES SIGO
// =====================================================

window.criarNotificacaoSIGO_ = async function (dados = {}) {
  const notificacao = {
    idNotificacao: crypto.randomUUID(),

    idObra: obterObraAtivaMobile_(),

    tipo: dados.tipo || "INFO",

    titulo: dados.titulo || "",

    mensagem: dados.mensagem || "",

    icone: dados.icone || "🔔",

    lida: false,

    criadaEm: new Date().toISOString()
  };

  await salvarRegistroSIGO(
    "TB_NOTIFICACOES",
    notificacao
  );

  if (typeof window.atualizarBadgeNotificacoes_ === "function") {
    await window.atualizarBadgeNotificacoes_();
  }

  return notificacao;
};

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

    badge.style.display =
      total > 0 ? "inline-flex" : "none";

  } catch (erro) {
    console.error(
      "Erro ao atualizar badge de notificações:",
      erro
    );
  }
};
