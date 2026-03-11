import {
  listarContas,
  criarConta,
  deletarConta,
  depositar,
  sacar
} from "./api.js";

let contas = [];
let paginaAtual = 1;
const itensPorPagina = 5;

function mostrarLoading() {
  const container = document.getElementById("tabelaContainer");

  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>
        Conectando com a API...<br>
        A primeira requisição pode demorar alguns segundos
        pois o servidor gratuito entra em modo de espera.
      </p>
    </div>
  `;
}

export async function renderDashboard(app) {
  app.innerHTML = `
    <header class="topbar">
      <h1>Dashboard</h1>
    </header>

    <div class="metrics" id="metrics"></div>

    <div class="card">
      <div class="card-header">
        <h3>Contas</h3>
        <button id="btnNovaConta">Nova Conta</button>
      </div>

      <form id="formConta" class="form hidden">
        <div class="form-row">
          <input type="text" id="numero" placeholder="Número da Conta" required />
          <input type="number" id="saldo" placeholder="Saldo Inicial" required />
        </div>

        <div class="form-actions">
          <button type="submit" id="btnCriarConta">Criar</button>
          <button type="button" id="btnCancelar" class="btn-secondary">Cancelar</button>
        </div>
      </form>

      <div id="tabelaContainer"></div>
    </div>
  `;

  await carregar();
  configurarEventos();
}

async function carregar() {
  mostrarLoading(); 
  contas = await listarContas();
  renderMetrics();
  renderTabela();
}

function configurarEventos() {
  const form = document.getElementById("formConta");
  const btnNova = document.getElementById("btnNovaConta");
  const btnCancelar = document.getElementById("btnCancelar");

  const numeroInput = document.getElementById("numero");
  const saldoInput = document.getElementById("saldo");

  // Abrir formulário
  btnNova.addEventListener("click", () => {
    form.classList.remove("hidden");
    btnNova.classList.add("hidden"); // esconde botão antigo
  });

  // Cancelar pelo botão interno
  btnCancelar.addEventListener("click", () => {
    form.classList.add("hidden");
    form.reset();
    btnNova.classList.remove("hidden"); // volta botão antigo
  });

  // Criar conta
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!/^\d{5,}$/.test(numeroInput.value)) {
      alert("Número da conta deve ter no mínimo 5 dígitos.");
      return;
    }

    await criarConta({
      numero: Number(numeroInput.value),
      saldo: Number(saldoInput.value),
      titular: ""
    });

    form.reset();
    form.classList.add("hidden");
    btnNova.classList.remove("hidden");

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
    <div class="table-wrapper" id="tableWrapper">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Saldo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${contasPaginadas.map(c => `
            <tr>
              <td>#${c.numero}</td>
              <td>R$ ${c.saldo.toFixed(2)}</td>
              <td class="acoes">
                <button class="btn-depositar" data-id="${c.numero}">
                  Depositar
                </button>
                <button class="btn-sacar" data-id="${c.numero}">
                  Sacar
                </button>
                <button class="btn-delete" data-id="${c.numero}">
                  Excluir
                </button>
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

  const wrapper = document.getElementById("tableWrapper");

  wrapper.onclick = async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const numero = Number(btn.dataset.id);
    if (!numero) return;

    try {
      if (btn.classList.contains("btn-delete")) {
        if (!confirm(`Excluir conta #${numero}?`)) return;
        await deletarConta(numero);
      }

      if (btn.classList.contains("btn-depositar")) {
        const valor = Number(prompt("Valor para depósito:"));
        if (!valor || valor <= 0) return;
        await depositar(numero, valor);
      }

      if (btn.classList.contains("btn-sacar")) {
        const valor = Number(prompt("Valor para saque:"));
        if (!valor || valor <= 0) return;
        await sacar(numero, valor);
      }

      await carregar();
    } catch (error) {
      console.error(error);
      alert("Erro na operação.");
    }
  };
}

function gerarProximoNumero() {
  if (!contas.length) return 100000; // primeiro padrão

  const maior = Math.max(...contas.map(c => c.numero));
  return maior + 1;
}