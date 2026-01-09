export default async function handler(req, res) {
  // 1. Настройка CORS (чтобы браузер разрешил расширению доступ)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Если браузер просто проверяет доступ (OPTIONS), отвечаем "ОК"
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. Формируем URL для Google
    // req.url содержит путь, например /v1beta/models/...
    const targetUrl = 'https://generativelanguage.googleapis.com' + req.url;

    // 3. Делаем запрос к Google от имени сервера Vercel
    // Если есть тело запроса (body), передаем его, иначе null
    const body = req.body ? JSON.stringify(req.body) : null;

    const googleResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? body : undefined,
    });

    const data = await googleResponse.json();

    // 4. Возвращаем ответ обратно в расширение
    res.status(googleResponse.status).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
