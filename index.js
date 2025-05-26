const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const { message, phone } = req.body;

  if (!message || !phone) {
    return res.status(400).json({ error: 'message e phone são obrigatórios.' });
  }

  try {
    // Chamada para o ChatGPT
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

    // Envia resposta para o WhatsApp via Z-API
    await axios.post(
      `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-messages`,
      {
        phone: phone,
        message: resposta
      }
    );

    res.status(200).json({ status: 'ok', resposta });
  } catch (err) {
    console.error('Erro:', err.message);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Bot funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
