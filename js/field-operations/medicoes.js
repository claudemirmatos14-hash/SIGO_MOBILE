/* SIGO MOBILE V2 - W4 FIELD OPERATIONS / MEDICOES */

function atualizarModoEdicaoMedicao_() {
  const botao =
    document.getElementById("btnSalvarMedicao");

  if (!botao) return;

  const texto =
    botao.querySelector("strong");

  if (!texto) return;

  if (idMedicaoEdicao) {
    texto.textContent = "Atualizar";
  } else {
    texto.textContent = "Salvar";
  }
}
