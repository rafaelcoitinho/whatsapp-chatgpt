const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Substitua com sua instância e token da Z-API
const ZAPI_INSTANCE_ID = 'sua-instancia';
const ZAPI_TOKEN = 'seu-token';
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`;

app.use(bodyParser.json());

// Rota de teste
app.get('/', (req, res) => {
  console.log('🔵 GET / - Servidor online');
  res.send('Servidor online');
});

// Webhook
app.post('/webhook', async (req, res) => {
  console.log('🟡 POST /webhook - Requisição recebida');

  try {
    const { event, message, phone } = req.body;

    console.log('📨 Dados recebidos:', req.body);

    if (!event || !message || !phone) {
      console.log('❌ Dados inválidos: faltando event, message ou phone');
      return res.status(400).json({ error: 'event, message e phone são obrigatórios.' });
    }

    console.log(`✅ Evento: ${event} | Telefone: ${phone} | Mensagem: ${message}`);

    // Mensagem de resposta fixa para teste
    const fixedReply = "Recebemos sua mensagem com sucesso! 🟢";

    // Envia a resposta via Z-API
    const response = await axios.post(ZAPI_URL, {
      phone,
      message: fixedReply
    });

    console.log('📤 Mensagem enviada com sucesso:', response.data);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('🔥 Erro ao enviar mensagem via Z-API:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
