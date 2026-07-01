function formatarDataHoraMedicao_(valor) {
  if (!valor) return "--";

  try {
    return new Date(valor).toLocaleString("pt-BR");
  } catch (erro) {
    return valor;
  }
}
