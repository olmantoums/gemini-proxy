export default async function handler(req, res) {
  // Разрешаем доступ расширению
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { key } = req.query;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`;

  try {
    // Просто пересылаем запрос в Google
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    // Получаем "сырой" ответ (текст)
    const rawText = await response.text();

    // Возвращаем этот текст в расширение как есть, со статусом от Google
    res.status(response.status).send(rawText);

  } catch (error) {
    res.status(500).send("Vercel Error: " + error.message);
  }
}
