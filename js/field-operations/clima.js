/* SIGO MOBILE V2 - W4 FIELD OPERATIONS / CLIMA */

function atualizarModoEdicaoClima_() {
  const botao =
    document.querySelector(".is-success");

  if (!botao) return;

  if (idClimaEdicao) {
    botao.innerHTML = "💾 Atualizar";

    botao.setAttribute(
      "onclick",
      "atualizarClimaOffline_()"
    );

  } else {
    botao.innerHTML = "💾 Salvar";

    botao.setAttribute(
      "onclick",
      "salvarClimaPremium()"
    );
  }
}
