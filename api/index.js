export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Увеличиваем лимит для PDF файлов
    },
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: "No API Key" });

    // 1. Авто-выбор модели (Предпочитаем Pro для задач с файлами, Flash для скорости)
    // Но для простоты берем 1.5 Flash, так как Pro часто падает с 404 без привязки карты.
    // Если у вас есть доступ к Pro - поменяйте на 'gemini-1.5-pro'
    let model = 'gemini-1.5-flash'; 

    // Если клиент явно просит модель через заголовок (мы это добавим в расширение)
    if (req.headers['x-force-model']) {
      model = req.headers['x-force-model'];
    }

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body) // Пересылаем всё как есть: картинки, PDF, системные промпты
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
