require('dotenv').config(); // ✅ Garantido no topo para carregar as variáveis antes de usá-las

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  console.log('🟡 POST /webhook - Requisição recebida');

  console.log('📨 Dados recebidos:', req.body);

  const phone  = req.body.phone;
  const message = req.body.text.message;

  console.log('📨 phone: ', phone);
  console.log('📨 message: ', message);

  if (!message || !phone) {
    console.warn('⚠️ Campos obrigatórios ausentes');
    return res.status(400).json({ error: 'message e phone são obrigatórios.' });
  }

  try {
    console.log('🤖 Enviando mensagem para o ChatGPT...');
    const respostaGPT = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de atendimento de uma imobiliária. Seja claro e objetivo.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resposta = respostaGPT.data.choices[0].message.content;
    console.log('✅ Resposta recebida do ChatGPT:', resposta);

    const zapiUrl = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-messages`;

    console.log(`📤 Enviando resposta para o WhatsApp via Z-API (${zapiUrl})...`);
    await axios.post(
      zapiUrl,
      {
        phone: phone,
        message: resposta
      },
      {
        headers: {
          'Client-Token': process.env.ZAPI_CLIENT_TOKEN
        }
      }
    );

    console.log('✅ Mensagem enviada com sucesso!');
    res.status(200).json({ status: 'ok', resposta });
  } catch (err) {
    console.error('🔥 Erro ao processar mensagem:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  console.log('🔵 GET / - Servidor online');
  res.send('Bot funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
