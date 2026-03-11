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
              min="0.01"
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
  let contas = await listarContas();

  const origem = document.getElementById("origem");
  const destino = document.getElementById("destino");
  const saldoBox = document.getElementById("saldoOrigem");
  const mensagem = document.getElementById("mensagem");
  const form = document.getElementById("formTransferencia");

  // Preencher selects
  contas.forEach(c => {
    origem.innerHTML += `<option value="${c.numero}">${c.numero}</option>`;
    destino.innerHTML += `<option value="${c.numero}">${c.numero}</option>`;
  });

  // Atualiza saldo exibido
  function atualizarSaldoVisual() {
    const contaSelecionada = contas.find(
      c => c.numero == origem.value
    );

    if (contaSelecionada) {
      saldoBox.textContent =
        "Saldo atual: R$ " + contaSelecionada.saldo.toFixed(2);
    } else {
      saldoBox.textContent = "";
    }
  }

  origem.addEventListener("change", atualizarSaldoVisual);
  atualizarSaldoVisual();

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    mensagem.textContent = "";
    mensagem.className = "feedback";

    const valor = Number(document.getElementById("valor").value);

    if (!valor || valor <= 0) {
      mensagem.textContent = "Informe um valor válido.";
      mensagem.className = "feedback erro";
      return;
    }

    if (origem.value === destino.value) {
      mensagem.textContent = "Não é possível transferir para a mesma conta.";
      mensagem.className = "feedback erro";
      return;
    }

    try {
      await transferir({
        origem: Number(origem.value),
        destino: Number(destino.value),
        valor: valor,
      });

      // Atualiza dados após transferência
      contas = await listarContas();
      atualizarSaldoVisual();

      
      atualizarSaldoVisual();

      mensagem.textContent = "Transferência realizada com sucesso!";
      mensagem.className = "feedback sucesso";

    } catch (error) {
      console.error(error);
      mensagem.textContent = "Erro ao realizar transferência.";
      mensagem.className = "feedback erro";
    }
  });
}