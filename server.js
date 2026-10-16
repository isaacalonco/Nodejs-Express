const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

const feedbacks = [];
let proximoId = 1;

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pagina(titulo, conteudo) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; color: #222; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,.1); }
    h1 { margin-top: 0; }
    label { display: block; margin: 12px 0 4px; font-weight: bold; }
    input[type="text"], textarea { width: 100%; padding: 8px; border: 1px solid #bbb; border-radius: 4px; box-sizing: border-box; font-size: 1rem; }
    button { margin-top: 12px; padding: 8px 16px; border: none; border-radius: 4px; background: #2563eb; color: #fff; font-size: 1rem; cursor: pointer; }
    button:hover { opacity: .9; }
    button.remover { background: #dc2626; margin-top: 0; padding: 6px 12px; font-size: .9rem; }
    ul { list-style: none; padding: 0; }
    li { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
    li p { margin: 6px 0 10px; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    ${conteudo}
  </div>
</body>
</html>`;
}

app.get('/', (req, res) => {
  const html = pagina('Enviar Feedback', `
    <h1>Feedback do Curso</h1>
    <form action="/feedbacks/enviar" method="POST">
      <label for="nome">Nome:</label>
      <input type="text" id="nome" name="nome" required>

      <label for="comentario">Comentário:</label>
      <textarea id="comentario" name="comentario" rows="5" required></textarea>

      <button type="submit">Enviar feedback</button>
    </form>
    <p><a href="/feedbacks/lista">Ver feedbacks enviados</a></p>
  `);
  res.send(html);
});

app.post('/feedbacks/enviar', (req, res) => {
  const nome = (req.body.nome || '').trim();
  const comentario = (req.body.comentario || '').trim();

  if (nome && comentario) {
    feedbacks.push({ id: proximoId++, nome, comentario });
  }

  res.redirect('/feedbacks/lista');
});

app.get('/feedbacks/lista', (req, res) => {
  let itens;

  if (feedbacks.length === 0) {
    itens = '<p>Nenhum feedback enviado ainda.</p>';
  } else {
    itens = '<ul>' + feedbacks.map((f) => `
      <li>
        <strong>${escapar(f.nome)}</strong>
        <p>${escapar(f.comentario)}</p>
        <form action="/feedbacks/remover" method="POST">
          <input type="hidden" name="id" value="${f.id}">
          <button type="submit" class="remover">Remover</button>
        </form>
      </li>`).join('') + '</ul>';
  }

  const html = pagina('Lista de Feedbacks', `
    <h1>Feedbacks recebidos</h1>
    ${itens}
    <p><a href="/">Enviar novo feedback</a></p>
  `);
  res.send(html);
});

app.post('/feedbacks/remover', (req, res) => {
  const id = Number(req.body.id);
  const indice = feedbacks.findIndex((f) => f.id === id);

  if (indice !== -1) {
    feedbacks.splice(indice, 1);
  }

  res.redirect('/feedbacks/lista');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});