const STORAGE_KEY = "coloringBook_v4";

const stylePrefix = document.getElementById("stylePrefix");
const promptInput = document.getElementById("promptInput");
const previewText = document.getElementById("previewText");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const imagePanel = document.getElementById("imagePanel");
const imageStatus = document.getElementById("imageStatus");
const previewImage = document.getElementById("previewImage");
const imageActions = document.getElementById("imageActions");
const downloadBtn = document.getElementById("downloadBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const toast = document.getElementById("toast");

let currentImage = null;
let isGenerating = false;
let saveTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function buildFullPrompt() {
  const prefix = stylePrefix.value.trim();
  const body = promptInput.value.trim();
  if (!prefix) return body;
  if (!body) return prefix;
  return `${prefix} ${body}`;
}

function updatePreview() {
  previewText.textContent = buildFullPrompt() || "(Prompt yazın...)";
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveToStorage, 400);
}

function saveToStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      stylePrefix: stylePrefix.value,
      prompt: promptInput.value,
    })
  );
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("coloringBook_v3");
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    stylePrefix.value =
      data.stylePrefix ||
      "Black and white coloring book line art, clean outlines, white background, no shading, kid-friendly:";
    promptInput.value = data.prompt || "";
  } catch {
    // ignore
  }
}

function setLoading(loading) {
  isGenerating = loading;
  generateBtn.disabled = loading;
  regenerateBtn.disabled = loading;
  generateBtn.textContent = loading ? "Oluşturuluyor..." : "Görsel Oluştur";

  imagePanel.hidden = false;
  imageStatus.hidden = !loading;
  previewImage.hidden = loading || !currentImage;
  imageActions.hidden = loading || !currentImage;
}

function showImage(image) {
  currentImage = image;
  imagePanel.hidden = false;
  imageStatus.hidden = true;
  previewImage.hidden = false;
  imageActions.hidden = false;
  previewImage.src = `data:${image.mimeType};base64,${image.imageBase64}`;
}

function clearImage() {
  currentImage = null;
  previewImage.removeAttribute("src");
  previewImage.hidden = true;
  imageActions.hidden = true;
  imageStatus.hidden = true;
  imagePanel.hidden = true;
}

function getDownloadFilename() {
  const ext = currentImage?.mimeType === "image/png" ? "png" : "jpg";
  return `boyama-kitabi-${Date.now()}.${ext}`;
}

function downloadImage() {
  if (!currentImage) {
    showToast("İndirilecek görsel yok");
    return;
  }

  const a = document.createElement("a");
  a.href = `data:${currentImage.mimeType};base64,${currentImage.imageBase64}`;
  a.download = getDownloadFilename();
  a.click();
  showToast("Görsel indirildi");
}

async function generateImage() {
  if (isGenerating) {
    showToast("Zaten bir görsel oluşturuluyor");
    return;
  }

  const fullPrompt = buildFullPrompt();
  if (!fullPrompt.trim()) {
    showToast("Önce bir prompt yazın");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    const data = await res.json();
    if (!res.ok) {
      const message =
        res.status === 429
          ? "Çok hızlı istek (429). Birkaç saniye bekleyip tekrar deneyin."
          : data.error || "Görsel oluşturulamadı";
      throw new Error(message);
    }

    showImage({
      imageBase64: data.imageBase64,
      mimeType: data.mimeType || "image/png",
      provider: data.provider,
    });

    showToast(`Görsel hazır (${data.provider})`);
  } catch (err) {
    if (!currentImage) clearImage();
    showToast(err.message || "Görsel oluşturulamadı");
  } finally {
    setLoading(false);
    if (currentImage) {
      imageStatus.hidden = true;
      previewImage.hidden = false;
      imageActions.hidden = false;
    }
  }
}

function clearForm() {
  if (!confirm("Prompt ve önizleme temizlensin mi?")) return;
  promptInput.value = "";
  clearImage();
  updatePreview();
  scheduleSave();
  showToast("Temizlendi");
}

[stylePrefix, promptInput].forEach((el) => {
  el.addEventListener("input", () => {
    updatePreview();
    scheduleSave();
  });
});

generateBtn.addEventListener("click", generateImage);
regenerateBtn.addEventListener("click", generateImage);
downloadBtn.addEventListener("click", downloadImage);
clearBtn.addEventListener("click", clearForm);

loadFromStorage();
updatePreview();
