import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/webhook', async (req, res) => {
  const incomingMsg = req.body.Body;
  const fromNumber = req.body.From;

  const twiml = new twilio.twiml.MessagingResponse();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: "Eres Fernanda, una asistente cálida y profesional de Nova Prime Accounting. Responde de forma natural y clara a preguntas sobre contabilidad, taxes, etc." },
        { role: 'user', content: incomingMsg }
      ],
    });

    const gptReply = completion.choices[0].message.content;
    twiml.message(gptReply);
  } catch (error) {
    console.error('Error con OpenAI:', error);
    twiml.message("Lo siento, hubo un error procesando tu mensaje. ¿Puedes intentarlo de nuevo?");
  }

  res.type('text/xml').send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
