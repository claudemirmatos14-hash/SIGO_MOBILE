/* SIGO MOBILE V2 - W4 FIELD OPERATIONS / OCORRENCIAS */

function atualizarModoEdicaoOcorrencia_() {
  const botao =
    document.querySelector(".is-success");

  if (!botao) return;

  if (idOcorrenciaEdicao) {
    botao.innerHTML = "💾 Atualizar";

    botao.setAttribute(
      "onclick",
      "atualizarOcorrenciaOffline_()"
    );

  } else {
    botao.innerHTML = "💾 Salvar";

    botao.setAttribute(
      "onclick",
      "salvarOcorrenciaPremium()"
    );
  }
}
