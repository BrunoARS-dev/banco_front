import { listarContas, transferir } from "./api.js";

export async function renderTransferencia(app) {
  app.innerHTML = `
    <div class="transfer-wrapper">
      <div class="transfer-card">
        
        <div class="transfer-header">
          <h1>Transferência</h1>
          <p>Envie valores entre contas cadastradas</p>
        </div>

        <form id="formTransferencia" class="transfer-form">

          <div class="form-group">
            <label>Conta de origem</label>
            <select id="origem" required></select>
            <div id="saldoOrigem" class="saldo-box"></div>
          </div>

          <div class="form-group">
            <label>Conta de destino</label>
            <select id="destino" required></select>
          </div>

          <div class="form-group">
            <label>Valor</label>
            <input 
              type="number" 
              id="valor" 
              placeholder="0,00"
              step="0.01"
              required
            />
          </div>

          <button type="submit" class="btn-primary">
            Transferir
          </button>

          <p id="mensagem" class="feedback"></p>

        </form>
      </div>
    </div>
  `;

  await configurarTransferencia();
}

async function configurarTransferencia() {
  const contas = await listarContas();
  const origem = document.getElementById("origem");
  const destino = document.getElementById("destino");

  contas.forEach(c => {
    origem.innerHTML += `<option value="${c.numero}">${c.numero}</option>`;
    destino.innerHTML += `<option value="${c.numero}">${c.numero}</option>`;
  });

  document
    .getElementById("formTransferencia")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const mensagem = document.getElementById("mensagem");

      try {
        await transferir({
          contaOrigem: Number(origem.value),
          contaDestino: Number(destino.value),
          valor: Number(document.getElementById("valor").value),
        });
        
        // Recarrega contas para atualizar saldo
        const contasAtualizadas = await listarContas();
        
        // Atualiza array local
        contas.length = 0;
        contas.push(...contasAtualizadas);
        
        atualizarSaldoVisual();

        mensagem.textContent = "Transferência realizada com sucesso!";
        mensagem.className = "mensagem sucesso";
      } catch (error) {
        mensagem.textContent = "Erro ao realizar transferência.";
        mensagem.className = "mensagem erro";
      }
    });

    const saldoBox = document.getElementById("saldoOrigem");

function atualizarSaldoVisual() {
  const contaSelecionada = contas.find(
    c => c.numero == origem.value
  );

  if (contaSelecionada) {
    saldoBox.textContent =
      "Saldo atual: R$ " + contaSelecionada.saldo.toFixed(2);
  }
}

origem.addEventListener("change", atualizarSaldoVisual);

// já mostrar saldo inicial
atualizarSaldoVisual();
}

