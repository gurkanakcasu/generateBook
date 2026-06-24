async function generateWithOpenAI(prompt, apiKey) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt.slice(0, 4000),
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "standard",
    }),
  });

  if (!res.ok) {
    const err = new Error(
      res.status === 429
        ? "Görsel servisi meşgul (429). Birkaç saniye bekleyip tekrar deneyin."
        : `OpenAI hatası: ${(await res.text()).slice(0, 300)}`
    );
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const imageBase64 = data?.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("OpenAI görsel döndürmedi.");
  }

  return { imageBase64, mimeType: "image/png", provider: "openai" };
}

async function generateWithPollinations(prompt) {
  const safePrompt = prompt.length > 900 ? `${prompt.slice(0, 900)}...` : prompt;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=1024&height=1024&nologo=true&enhance=false&seed=${Date.now()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);

  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const err = new Error(
      res.status === 429
        ? "Ücretsiz görsel servisi limit aştı (429). Birkaç saniye bekleyin."
        : `Ücretsiz görsel servisi yanıt vermedi (${res.status}).`
    );
    err.status = res.status;
    throw err;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";

  return {
    imageBase64: buffer.toString("base64"),
    mimeType,
    provider: "pollinations",
  };
}

async function generateImage(prompt, apiKey) {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error("Prompt boş olamaz.");
  }

  if (apiKey) {
    try {
      return await generateWithOpenAI(trimmed, apiKey);
    } catch (err) {
      console.warn("OpenAI başarısız, yedek servise geçiliyor:", err.message);
    }
  }

  return generateWithPollinations(trimmed);
}

module.exports = { generateImage };
