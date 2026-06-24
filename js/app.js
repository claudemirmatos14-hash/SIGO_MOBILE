document.addEventListener("DOMContentLoaded", () => {

  const seletor = document.getElementById("obraAtiva");

  if (!seletor) return;

  const obraSalva = localStorage.getItem("obraAtiva");

  if (obraSalva) {
    seletor.value = obraSalva;
  }

  seletor.addEventListener("change", () => {

    localStorage.setItem("obraAtiva", seletor.value);

    console.log("Obra ativa:", seletor.value);

  });

});
