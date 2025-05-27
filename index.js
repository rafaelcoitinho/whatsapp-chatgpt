const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rota de teste para ver se o servidor está online
app.get('/', (req, res) => {
  console.log('🔵 GET / - Servidor online');
  res.send('Servidor online');
});

// Rota do Webhook
app.post('/webhook', (req, res) => {
  console.log('🟡 POST /webhook - Requisição recebida');

  try {
    const { event, message, phone } = req.body;

    console.log('📨 Dados recebidos no corpo da requisição:', req.body);

    if (!event || !message || !phone) {
      console.log('❌ Dados inválidos: faltando event, message ou phone');
      return res.status(400).json({ error: 'event, message e phone são obrigatórios.' });
    }

    console.log(`✅ Evento: ${event} | Telefone: ${phone} | Mensagem: ${message}`);

    // Aqui você pode futuramente colocar a lógica de envio de mensagem via API externa
    // Por enquanto, só retorna um OK para evitar loops ou erro 429
    res.status(200).json({ success: true, received: { event, message, phone } });

  } catch (err) {
    console.error('🔥 Erro interno no /webhook:', err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado na porta ${PORT}`);
});
