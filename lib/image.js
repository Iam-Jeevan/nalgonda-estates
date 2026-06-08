'use client';

// Convert an uploaded image File to a compressed Base64 data URL.
// - Auto-resizes so the longest edge is <= MAX_DIMENSION
// - Iteratively reduces JPEG quality until the encoded payload < MAX_BYTES
// - Returns a data:image/jpeg;base64,... string safe for LocalStorage

const MAX_DIMENSION = 1600;
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB after Base64 decoding

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = src;
  });
}

// Rough byte size of a base64 data URL (Base64 ≈ 4/3 of raw bytes).
function dataUrlByteSize(dataUrl) {
  const commaIdx = dataUrl.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  // every 4 chars of base64 ≈ 3 bytes; ignore padding for an estimate
  return Math.floor((b64.length * 3) / 4);
}

export async function fileToCompressedBase64(file) {
  if (!file) throw new Error('No file provided');
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Only image files are supported');
  }

  const originalDataUrl = await readAsDataURL(file);
  const img = await loadImage(originalDataUrl);

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // flatten transparency for JPEG
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Try decreasing quality until we fit under 2 MB
  let quality = 0.85;
  let result = canvas.toDataURL('image/jpeg', quality);
  while (dataUrlByteSize(result) > MAX_BYTES && quality > 0.3) {
    quality -= 0.1;
    result = canvas.toDataURL('image/jpeg', quality);
  }

  // Final safety: if still too large, do one more downscale pass
  if (dataUrlByteSize(result) > MAX_BYTES) {
    const c2 = document.createElement('canvas');
    c2.width = Math.round(width * 0.75);
    c2.height = Math.round(height * 0.75);
    const ctx2 = c2.getContext('2d');
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(0, 0, c2.width, c2.height);
    ctx2.drawImage(img, 0, 0, c2.width, c2.height);
    result = c2.toDataURL('image/jpeg', 0.6);
  }

  return result;
}

// Process a list of files, skipping anything that errors.
export async function filesToCompressedBase64(files) {
  const arr = Array.from(files || []);
  const results = [];
  for (const f of arr) {
    try {
      results.push(await fileToCompressedBase64(f));
    } catch (e) {
      console.warn('Skipping file', f?.name, e);
    }
  }
  return results;
}