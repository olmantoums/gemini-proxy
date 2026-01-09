export default async function handler(req, res) {
  // CORS (доступы)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: "Нет ключа" });

    // --- ШАГ 1: АВТО-ПОИСК МОДЕЛИ ---
    // Мы спрашиваем у Google список всех доступных моделей
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const listData = await listResponse.json();

    if (listData.error) {
      throw new Error("Ошибка получения списка моделей: " + listData.error.message);
    }

    // Ищем любую модель, в названии которой есть 'gemini' 
    // и которая умеет генерировать контент (generateContent)
    const validModel = listData.models?.find(m => 
      m.name.toLowerCase().includes('gemini') && 
      m.supportedGenerationMethods?.includes('generateContent')
    );

    if (!validModel) {
      throw new Error("Не найдено ни одной доступной модели Gemini для этого ключа!");
    }

    // Берем имя найденной модели (например, 'models/gemini-3.0-pro')
    const modelName = validModel.name; 
    
    // --- ШАГ 2: ОТПРАВКА ЗАПРОСА ---
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${key}`;

    const bodyToSend = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;

    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyToSend
    });

    const data = await response.json();
    
    // Добавляем в ответ инфу, какая модель в итоге ответила (для интереса)
    if (!data.error) {
      res.setHeader('X-Model-Used', modelName);
    }

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
