// =====================================================
// SIGO MOBILE — SERVICE WORKER
// Etapa inicial: registro e controle da aplicação
// =====================================================

const SIGO_CACHE_VERSION = "sigo-mobile-v1";

// =====================================================
// INSTALAÇÃO
// =====================================================
self.addEventListener("install", event => {
  console.log(
    "[SIGO SW] Instalando:",
    SIGO_CACHE_VERSION
  );

  self.skipWaiting();
});

// =====================================================
// ATIVAÇÃO
// =====================================================
self.addEventListener("activate", event => {
  console.log(
    "[SIGO SW] Ativando:",
    SIGO_CACHE_VERSION
  );

  event.waitUntil(
    (async () => {
      const cachesExistentes =
        await caches.keys();

      const cachesAntigos =
        cachesExistentes.filter(
          nomeCache =>
            nomeCache.startsWith(
              "sigo-mobile-"
            ) &&
            nomeCache !==
              SIGO_CACHE_VERSION
        );

      await Promise.all(
        cachesAntigos.map(
          nomeCache =>
            caches.delete(nomeCache)
        )
      );

      await self.clients.claim();
    })()
  );
});

// =====================================================
// REQUISIÇÕES
// Nesta primeira etapa apenas mantém a navegação normal.
// O cache offline será configurado depois da validação.
// =====================================================
self.addEventListener("fetch", event => {
  if (
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(async () => {
        const respostaCache =
          await caches.match(
            event.request
          );

        if (respostaCache) {
          return respostaCache;
        }

        throw new Error(
          "Recurso indisponível offline."
        );
      })
  );
});
