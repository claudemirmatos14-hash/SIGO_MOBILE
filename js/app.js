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

function navegarPara(tela) {
  const area = document.getElementById("telaApp");

  alert("Clique funcionando: " + tela);

  if (!area) return;

 area.innerHTML = montarTela(tela);

  window.scrollTo({
    top: area.offsetTop,
    behavior: "smooth"
  });
}

function montarTela(tela) {
  const titulos = {
    diario: "📘 Diário de Obra",
    medicoes: "📏 Medições",
    ocorrencias: "⚠️ Ocorrências",
    clima: "🌦️ Clima",
    evidencias: "📎 Evidências"
  };

  const descricoes = {
    diario: "Registrar informações diárias da obra.",
    medicoes: "Atualizar avanço físico das atividades.",
    ocorrencias: "Registrar problemas e impactos da obra.",
    clima: "Registrar condições climáticas do período.",
    evidencias: "Registrar fotos, documentos e anexos."
  };

  return `
    <div class="tela-card">
      <button class="btn-voltar" onclick="voltarHome()">← Voltar</button>
      <h2>${titulos[tela] || "Tela"}</h2>
      <p>${descricoes[tela] || ""}</p>
      <div class="placeholder">
        Tela em construção.
      </div>
    </div>
  `;
}

function voltarHome() {
  const area = document.getElementById("telaApp");

  if (!area) return;

  area.innerHTML = "";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
