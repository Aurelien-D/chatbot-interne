const express = require('express');
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();
const port = 3000;

// Middleware pour parser le JSON et servir les fichiers statiques du dossier 'public'
app.use(express.json());
app.use(express.static('public'));

// Initialiser le client OpenAI avec la clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Le point de terminaison (endpoint) que notre frontend va appeler
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Le message est requis.' });
    }

    // ID de votre modèle fine-tuné. Remplacez-le par le vôtre une fois le fine-tuning terminé.
    // Pour commencer, vous pouvez utiliser un modèle standard comme "gpt-3.5-turbo" ou "gpt-4".
    const fineTunedModelId = 'ft:gpt-3.5-turbo:my-org::XXXXXXX'; // <-- REMPLACEZ PAR VOTRE ID DE MODÈLE
    const modelToUse = process.env.FINE_TUNED_MODEL_ID || 'gpt-3.5-turbo';


    // Message système pour donner le contexte et la personnalité au bot. C'est CRUCIAL.
    const systemMessage = {
      role: 'system',
      content: `Tu es "Alex", l'assistant virtuel interne de l'entreprise 'MaBoîte'. Ton rôle est de répondre aux questions des employés sur les procédures internes, les outils et les politiques de l'entreprise.
      - Ton ton doit être professionnel, amical et serviable.
      - Ne réponds qu'aux questions relatives à l'entreprise. Si on te pose une question hors sujet (météo, politique, etc.), réponds gentiment que ce n'est pas dans ton domaine de compétence.
      - Base tes réponses UNIQUEMENT sur les informations pour lesquelles tu as été entraîné. Si tu ne connais pas la réponse, dis-le clairement. N'invente jamais d'informations. Dis par exemple : "Je n'ai pas l'information sur ce sujet. Je vous suggère de contacter le service RH/IT."
      - Sois concis et clair.`
    };
    
    // Construire le message à envoyer, en incluant l'historique
    const messagesToSend = [
        systemMessage,
        ...history, // L'historique des messages précédents
        { role: 'user', content: message }
    ];


    const completion = await openai.chat.completions.create({
      messages: messagesToSend,
      model: modelToUse, // Utilise le modèle fine-tuné
      temperature: 0.5, // Contrôle le degré de "créativité". Plus bas = plus déterministe.
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API OpenAI:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la communication avec l\'assistant.' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});