document.addEventListener("DOMContentLoaded", () => {
  iniciarSeletorObra();
});

function iniciarSeletorObra() {
  const seletor = document.getElementById("obraAtiva");
  const nomeObra = document.getElementById("nomeObra");

  if (!seletor) return;

  const obraSalva = localStorage.getItem("obraAtiva");

  if (obraSalva) {
    seletor.value = obraSalva;
  }

  atualizarNomeObra_(seletor, nomeObra);

  seletor.addEventListener("change", () => {
    localStorage.setItem("obraAtiva", seletor.value);
    atualizarNomeObra_(seletor, nomeObra);

    console.log("Obra ativa:", seletor.value);
  });
}

function atualizarNomeObra_(seletor, nomeObra) {
  if (!nomeObra) return;

  const textoSelecionado =
    seletor.options[seletor.selectedIndex].textContent.trim();

  const partes = textoSelecionado.split(" - ");

  nomeObra.textContent = partes[1] || textoSelecionado;
}
