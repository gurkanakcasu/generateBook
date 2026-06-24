# Boyama Kitabı

Boyama kitabı sayfaları için prompt yazıp görsel oluşturan, önizleyen ve indirmenize izin veren yerel web uygulaması.

## Render.com deploy

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** (veya **Web Service**)
2. GitHub repo: `gurkanakcasu/generateBook`
3. **Runtime:** Docker
4. **Dockerfile Path:** `./Dockerfile` (repo kökünde)
5. **Environment Variables** (isteğe bağlı):
   - `OPENAI_API_KEY` = `sk-...` (DALL-E 3 için)

`render.yaml` dosyası ile Blueprint deploy otomatik yapılandırılır.

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
npm start
```

Tarayıcıda açın: http://localhost:3000

## Görsel oluşturma

- **Ücretsiz mod**: API anahtarı olmadan otomatik yedek servis kullanılır.
- **OpenAI (önerilen)**: Ayarlara `sk-...` anahtarınızı girin veya ortam değişkeni olarak tanımlayın:

```bash
set OPENAI_API_KEY=sk-...
npm start
```

DALL-E 3 ile boyama kitabı tarzında daha tutarlı görseller üretir.

## Kullanım

1. Kitap başlığı ve stil önekini ayarlayın
2. Her sayfa için prompt yazın
3. **Görsel Oluştur** ile önizleme alın
4. **İndir** ile PNG/JPEG kaydedin
5. **Tümünü Oluştur** ile tüm sayfaları sırayla üretin

Promptlar tarayıcıda otomatik kaydedilir. Görseller oturum boyunca önizlenir; kalıcı kayıt için indirin.
