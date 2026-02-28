import { renderDashboard } from "./dashboard.js";
import { renderTransferencia } from "./transferencia.js";

export function initRouter() {
  window.addEventListener("hashchange", router);
  router();
}

function router() {
  const app = document.getElementById("app");
  const hash = window.location.hash || "#dashboard";

  if (hash === "#transferencia") {
    renderTransferencia(app);
  } else {
    renderDashboard(app);
  }

  ativarMenuAtual();
}

function ativarMenuAtual() {
  const links = document.querySelectorAll(".menu a");
  const hash = window.location.hash || "#dashboard";

  links.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === hash
    );
  });
}