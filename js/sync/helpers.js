function formatarDataObraOffline_(dataISO) {
  if (!dataISO) return "--";

  try {
    return new Date(dataISO).toLocaleString("pt-BR");
  } catch (erro) {
    return "--";
  }
}

