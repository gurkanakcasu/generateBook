const express = require("express");
const path = require("path");
const { generateImage } = require("./server/imageGenerator");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

let isGenerating = false;
let lastGeneratedAt = 0;
const MIN_INTERVAL_MS = 5000;

app.post("/api/generate", async (req, res) => {
  if (isGenerating) {
    return res.status(429).json({ error: "Bir görsel zaten oluşturuluyor. Lütfen bekleyin." });
  }

  const sinceLast = Date.now() - lastGeneratedAt;
  if (sinceLast < MIN_INTERVAL_MS) {
    const waitSec = Math.ceil((MIN_INTERVAL_MS - sinceLast) / 1000);
    return res.status(429).json({ error: `Çok hızlı istek. ${waitSec} saniye bekleyin.` });
  }

  try {
    const prompt = String(req.body?.prompt || "").trim();
    const apiKey = String(req.body?.apiKey || process.env.OPENAI_API_KEY || "").trim();

    if (!prompt) {
      return res.status(400).json({ error: "Prompt boş olamaz." });
    }

    isGenerating = true;
    const result = await generateImage(prompt, apiKey);
    lastGeneratedAt = Date.now();
    res.json(result);
  } catch (err) {
    const status = err.status === 429 ? 429 : 500;
    res.status(status).json({ error: err.message || "Görsel oluşturulamadı." });
  } finally {
    isGenerating = false;
  }
});

app.listen(PORT, () => {
  console.log(`Boyama kitabı uygulaması: http://localhost:${PORT}`);
  if (process.env.OPENAI_API_KEY) {
    console.log("OpenAI API anahtarı yüklü (DALL-E 3 kullanılacak).");
  } else {
    console.log("OpenAI anahtarı yok — ücretsiz görsel servisi kullanılacak.");
  }
});
