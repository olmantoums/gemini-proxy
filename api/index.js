export default async function handler(req, res) {
  // Настройка заголовков (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Ответ на проверку браузера
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: "Нет API ключа (key) в запросе" });
    }

    if (!req.body) {
      return res.status(400).json({ error: "Тело запроса (body) пустое" });
    }

    // URL к Gemini 1.5 Pro
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`;

    // Подготовка данных. Если Vercel уже распарсил body как объект, превращаем обратно в строку для Google.
    // Если это строка, отправляем как есть.
    const payload = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;

    // Запрос к Google
    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });

    // ВАЖНО: Сначала читаем как текст, чтобы не было ошибки "Unexpected end of JSON"
    const responseText = await response.text();

    // Пытаемся превратить ответ в JSON
    try {
      const data = JSON.parse(responseText);
      // Возвращаем ответ (даже если там ошибка от Google, она будет в JSON)
      res.status(response.status).json(data);
    } catch (parseError) {
      // Если это не JSON (например, HTML ошибка или пустой ответ), возвращаем текст как есть
      console.error("Non-JSON response:", responseText);
      res.status(500).json({ 
        error: "Google вернул не JSON", 
        rawResponse: responseText 
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
