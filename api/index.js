export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Лимит для больших файлов
    },
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-force-model');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: "No API Key" });

    // === ГЛАВНОЕ ИЗМЕНЕНИЕ ===
    // Читаем параметр endpoint. Если его нет — по умолчанию идем генерировать текст
    // Это позволяет боту самому решать: запросить список моделей или сгенерировать текст
    let endpoint = req.query.endpoint || 'models/gemini-1.5-flash:generateContent';
    
    // Собираем URL
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/${endpoint}?key=${key}`;

    const fetchOptions = {
      method: req.method, // GET для списка, POST для генерации
      headers: { 'Content-Type': 'application/json' }
    };

    // Если есть тело запроса (для POST), добавляем его
    if (req.method !== 'GET' && req.body) {
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await axios(googleUrl, fetchOptions); // Используем стандартный fetch ниже
    // (Примечание: в Vercel лучше использовать native fetch)
    
    const googleRes = await fetch(googleUrl, fetchOptions);
    const data = await googleRes.json();

    res.status(googleRes.status).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
