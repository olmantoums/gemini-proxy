export default async function handler(req, res) {
  // Настройка CORS (разрешаем расширению доступ к серверу)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Формируем URL к Google API
    // Мы берем путь запроса (например /v1beta/models...) и добавляем к домену Google
    const targetUrl = 'https://generativelanguage.googleapis.com' + req.url;

    // Подготовка тела запроса
    const body = req.method === 'POST' ? JSON.stringify(req.body) : null;

    // Запрос к Google
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
