// Front-end da Biblioteca: conversa com a API usando fetch.

const form = document.getElementById("form-livro");
const campos = {
  id: document.getElementById("id"),
  titulo: document.getElementById("titulo"),
  autor: document.getElementById("autor"),
  ano: document.getElementById("ano"),
};
const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const mensagem = document.getElementById("mensagem");

let livros = []; // guarda a última lista recebida da API

// Faz uma requisição à API e devolve o JSON (ou lança um erro com a mensagem da API)
async function api(caminho, opcoes = {}) {
  const resposta = await fetch(API_URL + caminho, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || `Erro ${resposta.status}`);
  return dados;
}

// Mostra um aviso rápido no canto da tela
function avisar(texto, tipo = "ok") {
  const aviso = document.getElementById("aviso");
  aviso.textContent = texto;
  aviso.className = `aviso ${tipo}`;
  aviso.hidden = false;
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => (aviso.hidden = true), 3000);
}

// Verifica se a API está no ar (rota /health)
async function verificarApi() {
  const status = document.getElementById("status");
  try {
    const dados = await api("/health");
    status.textContent = "● " + (dados.status || "API online");
    status.className = "status online";
  } catch {
    status.textContent = "● API offline";
    status.className = "status offline";
  }
}

// Busca os livros na API e desenha a tabela
async function carregarLivros() {
  mensagem.textContent = "Carregando…";
  try {
    livros = await api("/api/livros");
    desenharLista();
  } catch (erro) {
    livros = [];
    desenharLista();
    mensagem.textContent =
      "Não foi possível falar com a API. Confira a URL em config.js. (" + erro.message + ")";
  }
}

function desenharLista() {
  const termo = busca.value.trim().toLowerCase();
  const filtrados = livros.filter(
    (l) =>
      l.titulo.toLowerCase().includes(termo) ||
      l.autor.toLowerCase().includes(termo)
  );

  document.getElementById("total").textContent = `(${livros.length})`;
  mensagem.textContent =
    livros.length === 0 ? "Nenhum livro cadastrado ainda."
    : filtrados.length === 0 ? "Nenhum livro encontrado."
    : "";

  lista.innerHTML = "";
  for (const livro of filtrados) {
    const tr = document.createElement("tr");
    // textContent evita que o texto do livro seja interpretado como HTML
    for (const valor of [livro.id, livro.titulo, livro.autor, livro.ano ?? "—"]) {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    }
    const acoes = document.createElement("td");
    acoes.className = "acoes";
    acoes.append(
      botao("Editar", "secundario", () => editar(livro)),
      botao("Excluir", "perigo", () => excluir(livro))
    );
    tr.appendChild(acoes);
    lista.appendChild(tr);
  }
}

function botao(texto, classe, aoClicar) {
  const b = document.createElement("button");
  b.textContent = texto;
  b.className = classe;
  b.addEventListener("click", aoClicar);
  return b;
}

// Preenche o formulário com o livro para editar
function editar(livro) {
  campos.id.value = livro.id;
  campos.titulo.value = livro.titulo;
  campos.autor.value = livro.autor;
  campos.ano.value = livro.ano ?? "";
  document.getElementById("form-titulo").textContent = `Editar livro #${livro.id}`;
  document.getElementById("btn-salvar").textContent = "Salvar";
  document.getElementById("btn-cancelar").hidden = false;
  campos.titulo.focus();
}

// Volta o formulário para o modo "cadastrar"
function limparFormulario() {
  form.reset();
  campos.id.value = "";
  document.getElementById("form-titulo").textContent = "Cadastrar livro";
  document.getElementById("btn-salvar").textContent = "Cadastrar";
  document.getElementById("btn-cancelar").hidden = true;
}

async function excluir(livro) {
  if (!confirm(`Excluir "${livro.titulo}"?`)) return;
  try {
    await api(`/api/livros/${livro.id}`, { method: "DELETE" });
    avisar("Livro excluído");
    if (campos.id.value == livro.id) limparFormulario();
    carregarLivros();
  } catch (erro) {
    avisar(erro.message, "erro");
  }
}

// Envio do formulário: POST (novo) ou PUT (edição)
form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const corpo = {
    titulo: campos.titulo.value.trim(),
    autor: campos.autor.value.trim(),
    ano: campos.ano.value ? Number(campos.ano.value) : null,
  };
  const id = campos.id.value;

  try {
    if (id) {
      await api(`/api/livros/${id}`, { method: "PUT", body: JSON.stringify(corpo) });
      avisar("Livro atualizado");
    } else {
      await api("/api/livros", { method: "POST", body: JSON.stringify(corpo) });
      avisar("Livro cadastrado");
    }
    limparFormulario();
    carregarLivros();
  } catch (erro) {
    avisar(erro.message, "erro");
  }
});

document.getElementById("btn-cancelar").addEventListener("click", limparFormulario);
busca.addEventListener("input", desenharLista);

verificarApi();
carregarLivros();
