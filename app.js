/* Base SPA + PWA sem framework */
const $ = (sel) => document.querySelector(sel);

function hideLoader() {
  const loader = $("#container-loader");
  if (!loader) return;
  loader.style.opacity = "0";
  loader.style.pointerEvents = "none";
  setTimeout(() => loader.remove(), 250);
  document.documentElement.classList.remove("_fixed");
}

function setBadge(text) {
  const el = $("#pwaBadge");
  if (el) el.textContent = text;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function route() {
  const hash = (location.hash || "#/").replace("#", "");
  const path = hash.startsWith("/") ? hash : "/" + hash;

  const routes = {
    "/": renderHome,
    "/produtos": renderProdutos,
    "/carrinho": renderCarrinho,
  };

  (routes[path] || renderNotFound)();
  setActiveNav(path);
}

function setActiveNav(path) {
  document.querySelectorAll("[data-route]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-route") === path);
  });
}

function mountAppShell() {
  const app = $("#app");
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <strong>Vendizap</strong>
        <span>Base PWA (para evoluir)</span>
      </div>
      <div id="pwaBadge" class="badge">online</div>
    </header>

    <main class="content" id="view"></main>

    <nav class="navbar" aria-label="Navegação">
      <button class="navitem" data-route="/" type="button">🏠 <span>Início</span></button>
      <button class="navitem" data-route="/produtos" type="button">🧾 <span>Produtos</span></button>
      <button class="navitem" data-route="/carrinho" type="button">🛒 <span>Carrinho</span></button>
    </nav>
  `;

  document.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = "#" + btn.getAttribute("data-route");
    });
  });
}

function renderHome() {
  $("#view").innerHTML = `
    <section class="grid">
      <div class="card">
        <h1 class="h1">Bem-vindo 👋</h1>
        <p class="p">
          Esta é uma base PWA simples para você usar como ponto de partida.
          Mantém experiência de “app”, com navegação e offline.
        </p>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h1 class="h1">Vitrine</h1>
          <p class="p">Aqui entra a listagem de categorias e destaques.</p>
        </div>
        <div class="card">
          <h1 class="h1">Atendimento</h1>
          <p class="p">Aqui entra o fluxo do WhatsApp / chat / pedido rápido.</p>
        </div>
      </div>

      <div class="card">
        <h1 class="h1">Instalar no celular</h1>
        <p class="p">
          ${isStandalone() ? "Você já está no modo instalado." : "No navegador, toque em “Instalar app” / “Adicionar à tela inicial”."}
        </p>
        <div style="height:12px"></div>
        <button class="btn secondary" id="btnTestCache" type="button">Testar offline</button>
        <div class="small" id="offlineHint" style="margin-top:10px"></div>
      </div>
    </section>
  `;

  const btn = $("#btnTestCache");
  const hint = $("#offlineHint");
  if (btn && hint) {
    btn.addEventListener("click", async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        hint.textContent = reg ? "Service Worker ativo. Desligue a internet e recarregue a página." : "Service Worker ainda não registrou.";
      } catch {
        hint.textContent = "Não foi possível verificar o Service Worker.";
      }
    });
  }
}

const demoProducts = [
  { id: 1, name: "Película 3D", price: 29.9 },
  { id: 2, name: "Cabo USB-C Reforçado", price: 19.9 },
  { id: 3, name: "Carregador Turbo 20W", price: 49.9 },
  { id: 4, name: "Capinha Antishock", price: 35.0 },
];

function readCart() {
  try { return JSON.parse(localStorage.getItem("cart_v1") || "[]"); }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem("cart_v1", JSON.stringify(cart));
}
function addToCart(productId) {
  const cart = readCart();
  cart.push(productId);
  writeCart(cart);
}

function renderProdutos() {
  const cards = demoProducts.map((p) => `
      <div class="card">
        <h1 class="h1">${p.name}</h1>
        <p class="p">R$ ${p.price.toFixed(2).replace(".", ",")}</p>
        <div style="height:12px"></div>
        <button class="btn" data-add="${p.id}" type="button">Adicionar</button>
      </div>
    `).join("");

  $("#view").innerHTML = `
    <section class="grid">
      <div class="card">
        <h1 class="h1">Produtos</h1>
        <p class="p">Lista demo. Depois ligamos em API / banco.</p>
      </div>
      ${cards}
    </section>
  `;

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.getAttribute("data-add")));
      location.hash = "#/carrinho";
    });
  });
}

function renderCarrinho() {
  const cart = readCart();
  const items = cart.map((id) => demoProducts.find((p) => p.id === id)).filter(Boolean);
  const total = items.reduce((sum, p) => sum + p.price, 0);

  $("#view").innerHTML = `
    <section class="grid">
      <div class="card">
        <h1 class="h1">Carrinho</h1>
        <p class="p">Itens: ${items.length} • Total: R$ ${total.toFixed(2).replace(".", ",")}</p>
        <div style="height:12px"></div>
        <button class="btn secondary" id="btnClear" type="button">Limpar</button>
      </div>

      ${items.length ? items.map((p) => `
        <div class="card">
          <h1 class="h1">${p.name}</h1>
          <p class="p">R$ ${p.price.toFixed(2).replace(".", ",")}</p>
        </div>
      `).join("") : `<div class="card"><p class="p">Seu carrinho está vazio.</p></div>`}

      <div class="card">
        <h1 class="h1">Finalizar</h1>
        <p class="p">Depois criamos o fluxo real de pedido (WhatsApp / checkout).</p>
        <div style="height:12px"></div>
        <button class="btn" id="btnCheckout" type="button">Continuar</button>
        <div class="small" id="checkoutHint" style="margin-top:10px"></div>
      </div>
    </section>
  `;

  $("#btnClear")?.addEventListener("click", () => {
    writeCart([]);
    renderCarrinho();
  });

  $("#btnCheckout")?.addEventListener("click", () => {
    $("#checkoutHint").textContent = "Checkout demo. Próximo passo: integrar pedido real.";
  });
}

function renderNotFound() {
  $("#view").innerHTML = `
    <div class="card">
      <h1 class="h1">Página não encontrada</h1>
      <p class="p">Volte para o início.</p>
      <div style="height:12px"></div>
      <button class="btn secondary" type="button" onclick="location.hash='#/'">Ir para início</button>
    </div>
  `;
}

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    try { await navigator.serviceWorker.register("./sw.js"); } catch {}
  });
}

function setupOnlineBadge() {
  const update = () => setBadge(navigator.onLine ? "online" : "offline");
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

(function main() {
  mountAppShell();
  setupOnlineBadge();
  registerSW();

  window.addEventListener("hashchange", route);

  setTimeout(() => {
    hideLoader();
    route();
  }, 350);
})();
