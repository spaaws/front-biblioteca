# Front Biblioteca

Site simples para usar a [API Biblioteca](https://github.com/spaaws/biblioteca): lista, cadastra, edita, exclui e busca livros.
Feito só com **HTML, CSS e JavaScript** (sem build), publicado no **Cloudflare Pages**.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página |
| `style.css` | Visual (tem modo escuro automático) |
| `app.js` | Chama a API com `fetch` e monta a tela |
| `config.js` | **URL da API** — é o único arquivo que você precisa alterar |

## Como o front usa a API

| Ação na tela | Requisição |
|---|---|
| Indicador "API online" | `GET /health` |
| Carregar a lista | `GET /api/livros` |
| Cadastrar | `POST /api/livros` |
| Salvar edição | `PUT /api/livros/:id` |
| Excluir | `DELETE /api/livros/:id` |

## 1. Configurar a URL da API

Publique a API primeiro (veja o README do repo `biblioteca`). No final do `npm run deploy` aparece uma URL como
`https://api-biblioteca.SEU-USUARIO.workers.dev`. Cole essa URL no `config.js`:

```js
const API_URL = "https://api-biblioteca.SEU-USUARIO.workers.dev";
```

> A API já libera CORS (`Access-Control-Allow-Origin: *`), então o site pode chamá-la de qualquer domínio.

## 2. Rodar no seu computador

Não precisa instalar nada. Basta servir a pasta:

```bash
npx serve .          # ou: python3 -m http.server 8080
```

Para usar a API local, coloque `http://localhost:8787` no `config.js` e rode `npm run dev` no repo da API.

## 3. Publicar no Cloudflare Pages

### Opção A — pelo painel, ligado ao GitHub (recomendado)

Cada `git push` publica o site sozinho.

1. Acesse https://dash.cloudflare.com → **Workers & Pages** → **Create** → aba **Pages** → **Connect to Git**.
2. Escolha o repositório `front-biblioteca`.
3. Configure o build:
   - **Framework preset:** `None`
   - **Build command:** *(deixe vazio)*
   - **Build output directory:** `/`
4. Clique em **Save and Deploy**.

O site fica em `https://front-biblioteca.pages.dev` (ou parecido).

### Opção B — pelo terminal, com o Wrangler

```bash
npx wrangler login
npx wrangler pages deploy . --project-name front-biblioteca
```

Na primeira vez o Wrangler pergunta qual branch é a de produção — responda `main`.
