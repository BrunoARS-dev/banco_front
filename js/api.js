const API_URL = 
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://banco-api-4ii0.onrender.com";


export async function listarContas() {
  const response = await fetch(`${API_URL}/contas`);
  if (!response.ok) throw new Error("Erro ao buscar contas");
  return response.json();
}

export async function criarConta(conta) {
  const response = await fetch(`${API_URL}/contas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conta),
  });

  if (!response.ok) throw new Error("Erro ao criar conta");
}

export async function transferir(dados) {
  const response = await fetch(`${API_URL}/contas/transferencia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) throw new Error("Erro na transferência");
}