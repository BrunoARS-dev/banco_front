import { listarContas, criarConta } from "./api.js";

let contas = [];
let paginaAtual = 1;
const itensPorPagina = 5;

export async function renderDashboard(app) {
  app.innerHTML = `
    <header class="topbar">
      <h1>Dashboard</h1>
    </header>

    <div class="metrics" id="metrics"></div>

    <div class="card">
      <div class="card-header">
        <h3>Contas</h3>
        <button id="btnToggleForm">Nova Conta</button>
      </div>

      <form id="formConta" class="form hidden">
        <input type="text" id="numero" placeholder="Número da Conta" required />
        <p class="erro" id="erroNumero"></p>
        <input type="number" id="saldo" placeholder="Saldo Inicial" required />
        <button type="submit">Criar</button>
      </form>

      <div id="tabelaContainer"></div>
    </div>
  `;

  await carregar();
  configurarEventos();
}

async function carregar() {
  contas = await listarContas();
  renderMetrics();
  renderTabela();
}

function configurarEventos() {
  const form = document.getElementById("formConta");
  const btnToggle = document.getElementById("btnToggleForm");
  const numeroInput = document.getElementById("numero");
  const saldoInput = document.getElementById("saldo");
  const erroNumero = document.getElementById("erroNumero");

  let mostrarForm = false;

  btnToggle.addEventListener("click", () => {
    mostrarForm = !mostrarForm;
    form.classList.toggle("hidden");
    btnToggle.textContent = mostrarForm ? "Cancelar" : "Nova Conta";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!/^\d{5,}$/.test(numeroInput.value)) {
      erroNumero.textContent =
        "Número da conta deve ter no mínimo 5 dígitos.";
      return;
    }

    await criarConta({
      numero: Number(numeroInput.value),
      saldo: Number(saldoInput.value),
      titular: ""
    });

    form.reset();
    await carregar();
  });
}

function renderMetrics() {
  const metricsEl = document.getElementById("metrics");

  const totalContas = contas.length;
  const saldoTotal = contas.reduce((acc, c) => acc + c.saldo, 0);
  const maiorSaldo =
    contas.length > 0 ? Math.max(...contas.map(c => c.saldo)) : 0;
  const menorSaldo =
    contas.length > 0 ? Math.min(...contas.map(c => c.saldo)) : 0;

  metricsEl.innerHTML = `
    <div class="metric-card">
      <p>Total de Contas</p>
      <h2>${totalContas}</h2>
    </div>

    <div class="metric-card">
      <p>Saldo Total</p>
      <h2>R$ ${saldoTotal.toFixed(2)}</h2>
    </div>

    <div class="metric-card">
      <p>Maior Saldo</p>
      <h2>R$ ${maiorSaldo.toFixed(2)}</h2>
    </div>

    <div class="metric-card">
      <p>Menor Saldo</p>
      <h2>R$ ${menorSaldo.toFixed(2)}</h2>
    </div>
  `;
}

function renderTabela() {
  const tabelaContainer = document.getElementById("tabelaContainer");

  if (!contas.length) {
    tabelaContainer.innerHTML =
      "<p class='empty'>Nenhuma conta cadastrada.</p>";
    return;
  }

  const totalPaginas = Math.ceil(contas.length / itensPorPagina);

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const contasPaginadas = contas.slice(inicio, fim);

  tabelaContainer.innerHTML = `
    <div class="table-wrapper">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Número da Conta</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          ${contasPaginadas.map(c => `
            <tr>
              <td>
                <span class="account-number">#${c.numero}</span>
              </td>
              <td>
                <span class="saldo-badge ${
                  c.saldo >= 0 ? "positivo" : "negativo"
                }">
                  R$ ${c.saldo.toFixed(2)}
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="paginacao">
        <button id="prev" ${paginaAtual === 1 ? "disabled" : ""}>
          Anterior
        </button>
        <span>Página ${paginaAtual} de ${totalPaginas}</span>
        <button id="next" ${
          paginaAtual === totalPaginas ? "disabled" : ""
        }>
          Próxima
        </button>
      </div>
    </div>
  `;

  // 🔥 EVENTOS DEVEM VIR AQUI DENTRO
  document.getElementById("prev").onclick = () => {
    if (paginaAtual > 1) {
      paginaAtual--;
      renderTabela();
    }
  };

  document.getElementById("next").onclick = () => {
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderTabela();
    }
  };
}