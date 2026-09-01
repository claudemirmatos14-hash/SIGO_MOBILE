function feedbackSIGOCompat_(tipo, titulo, mensagem) {
  const feedback =
    globalThis.SIGOUI &&
    SIGOUI.feedback &&
    SIGOUI.feedback[tipo];

  if (typeof feedback === "function") {
    feedback(titulo, mensagem);
    return;
  }

  console[tipo === "error" ? "error" : "log"](
    titulo,
    mensagem || ""
  );
}
