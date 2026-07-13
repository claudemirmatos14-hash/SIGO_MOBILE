// =====================================================
// SIGO MOBILE — SERVICE WORKER
// App Shell Offline
// =====================================================

const SIGO_CACHE_VERSION =
  "sigo-mobile-v39";

const SIGO_BASE_URL =
  new URL("./", self.location.href);

const SIGO_HOME_URL =
  new URL(
    "home-premium.html",
    SIGO_BASE_URL
  ).href;

// =====================================================
// ARQUIVOS ESSENCIAIS DO APLICATIVO
// =====================================================
const SIGO_APP_SHELL = [
  "home-premium.html",
  "manifest.json",

  "css/premium.css",

  "js/db.js",
  "js/sigo-ui.js",
  "js/entities.js",
  "js/data-crud.js",
  "js/ui.js",
  "js/app.js",

  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png"
]
  .map(caminho =>
  new URL(
    caminho,
    SIGO_BASE_URL
  ).href
);

// =====================================================
// INSTALAÇÃO
// Baixa os arquivos necessários para funcionamento
// offline.
// =====================================================
self.addEventListener(
  "install",
  event => {

    console.log(
      "[SIGO SW] Instalando:",
      SIGO_CACHE_VERSION
    );

    event.waitUntil(
      (async () => {

        const cache =
          await caches.open(
            SIGO_CACHE_VERSION
          );

        const requisicoes =
          SIGO_APP_SHELL.map(url =>
            new Request(
              url,
              {
                cache: "reload"
              }
            )
          );

        await cache.addAll(
          requisicoes
        );

        console.log(
          "[SIGO SW] App Shell armazenado:",
          SIGO_APP_SHELL.length,
          "arquivo(s)"
        );

        await self.skipWaiting();

      })()
    );
  }
);

// =====================================================
// ATIVAÇÃO
// Remove caches antigos e assume o controle.
// =====================================================
self.addEventListener(
  "activate",
  event => {

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
              caches.delete(
                nomeCache
              )
          )
        );

        console.log(
          "[SIGO SW] Caches antigos removidos:",
          cachesAntigos
        );

        await self.clients.claim();

      })()
    );
  }
);

// =====================================================
// FETCH
// 1. Tenta buscar a versão atual pela internet.
// 2. Em falha, utiliza o cache offline.
// 3. Para navegação, retorna home-premium.html.
// =====================================================
self.addEventListener(
  "fetch",
  event => {

    const requisicao =
      event.request;

    if (
      requisicao.method !== "GET"
    ) {
      return;
    }

    const url =
      new URL(
        requisicao.url
      );

    // Não interfere em recursos externos.
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    event.respondWith(
      (async () => {

        try {

          const respostaRede =
            await fetch(
              requisicao
            );

          if (
            respostaRede &&
            respostaRede.ok
          ) {
            return respostaRede;
          }

          const respostaCache =
            await caches.match(
              requisicao,
              {
                ignoreSearch: true
              }
            );

          if (respostaCache) {
            return respostaCache;
          }

          if (
            requisicao.mode ===
            "navigate"
          ) {
            const cache =
              await caches.open(
                SIGO_CACHE_VERSION
              );

            const paginaInicial =
              await cache.match(
                SIGO_HOME_URL
              );

            if (paginaInicial) {
              return paginaInicial;
            }
          }

          return respostaRede;

        } catch (erro) {

          console.warn(
            "[SIGO SW] Rede indisponível:",
            requisicao.url
          );

          const respostaCache =
            await caches.match(
              requisicao,
              {
                ignoreSearch: true
              }
            );

          if (respostaCache) {
            return respostaCache;
          }

          if (
            requisicao.mode ===
            "navigate"
          ) {
            const cache =
              await caches.open(
                SIGO_CACHE_VERSION
              );

            const paginaInicial =
              await cache.match(
                SIGO_HOME_URL
              );

            if (paginaInicial) {
              return paginaInicial;
            }
          }

          return new Response(
            "SIGO Mobile indisponível offline. " +
            "O recurso solicitado ainda não está armazenado.",
            {
              status: 503,

              headers: {
                "Content-Type":
                  "text/plain; charset=utf-8"
              }
            }
          );
        }

      })()
    );
  }
);
