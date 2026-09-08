/* SIGO MOBILE V2 - W4 FIELD OPERATIONS / DIARIO */

function obterIdDiarioUX1956_(registro) {
  return normalizarTextoUX1956_(
    registro && (
      registro.idDiario ||
      registro.id ||
      registro.chave
    )
  );
}
