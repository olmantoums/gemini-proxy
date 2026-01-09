export default async function handler(req, res) {
  // 1. Ставим CORS заголовки (чтобы расширение не ругалось)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. Если браузер просто "стучится" проверить доступ
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Получаем ключ
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ error: "Error: API Key is missing in URL parameters" });
    }

    // 3. САМОЕ ВАЖНОЕ: Обработка тела запроса
    // Vercel иногда сам делает JSON.parse, а иногда нет.
    // Если req.body это уже объект -> превращаем в строку.
    // Если req.body это строка -> оставляем как есть.
    const bodyToSend = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;

    // 4. Отправляем в Google
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyToSend,
    });

    // 5. Получаем ответ
    const data = await googleResponse.json();
    
    // Возвращаем ответ расширению
    res.status(googleResponse.status).json(data);

  } catch (error) {
    console.error(error);
    // Возвращаем JSON с ошибкой, чтобы расширение не падало с "End of JSON input"
    res.status(500).json({ 
      error: "Internal Proxy Error", 
      details: error.message 
    });
  }
}
