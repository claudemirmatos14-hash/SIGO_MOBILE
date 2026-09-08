  function obterChaveObraF1624H_() {
    const bruto = localStorage.getItem('obraAtiva');
    if (!bruto) return null;
    try {
      const valor = JSON.parse(bruto);
      return String(typeof valor === 'string' ? valor : (valor && (valor.idObra || valor.id)) || bruto).trim().toUpperCase();
    } catch (_) {
      return String(bruto).trim().toUpperCase();
    }
  }
