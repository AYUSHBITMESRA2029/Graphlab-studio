const fs = require('fs');
const { execSync } = require('child_process');

// We'll create a simple PNG from the SVG using a canvas approach via a lightweight package
// But first, let's try using electron-builder's built-in icon support
// electron-builder can use .png files directly

// Create a simple but striking icon as a 256x256 PNG using pure Node.js Buffer manipulation
// We'll create a BMP-style uncompressed image embedded in an ICO

const size = 256;
const pixels = Buffer.alloc(size * size * 4); // RGBA

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const idx = (y * size + x) * 4;
  // Alpha blend
  const srcA = a / 255;
  const dstA = pixels[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) return;
  pixels[idx + 0] = Math.round((r * srcA + pixels[idx + 0] * dstA * (1 - srcA)) / outA);
  pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA);
  pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA);
  pixels[idx + 3] = Math.round(outA * 255);
}

function fillCircle(cx, cy, radius, r, g, b, a) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(Math.round(cx + dx), Math.round(cy + dy), r, g, b, a);
      }
    }
  }
}

function drawThickLine(x0, y0, x1, y1, thickness, r, g, b, a) {
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(len * 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x0 + dx * t;
    const cy = y0 + dy * t;
    fillCircle(Math.round(cx), Math.round(cy), Math.ceil(thickness / 2), r, g, b, a);
  }
}

// Background: dark navy rounded rectangle
const cornerRadius = 48;
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    // Check if inside rounded rect
    let inside = true;
    // Top-left corner
    if (x < cornerRadius && y < cornerRadius) {
      inside = (x - cornerRadius) ** 2 + (y - cornerRadius) ** 2 <= cornerRadius ** 2;
    }
    // Top-right
    if (x >= size - cornerRadius && y < cornerRadius) {
      inside = (x - (size - cornerRadius - 1)) ** 2 + (y - cornerRadius) ** 2 <= cornerRadius ** 2;
    }
    // Bottom-left
    if (x < cornerRadius && y >= size - cornerRadius) {
      inside = (x - cornerRadius) ** 2 + (y - (size - cornerRadius - 1)) ** 2 <= cornerRadius ** 2;
    }
    // Bottom-right
    if (x >= size - cornerRadius && y >= size - cornerRadius) {
      inside = (x - (size - cornerRadius - 1)) ** 2 + (y - (size - cornerRadius - 1)) ** 2 <= cornerRadius ** 2;
    }
    if (inside) {
      // Gradient: top-left darker, bottom-right slightly lighter
      const grad = (x + y) / (size * 2);
      const br = Math.round(15 + grad * 15);
      const bg = Math.round(23 + grad * 10);
      const bb = Math.round(42 + grad * 15);
      setPixel(x, y, br, bg, bb, 255);
    }
  }
}

// Grid lines
const gridPositions = [64, 102, 140, 178, 216];
const margin = 38;
for (const pos of gridPositions) {
  // Horizontal
  drawThickLine(margin, pos, size - margin, pos, 1, 51, 65, 85, 100);
  // Vertical
  drawThickLine(pos, margin, pos, size - margin, 1, 51, 65, 85, 100);
}

// Axes
const axisY = 140; // x-axis at center-ish
const axisX = 102; // y-axis
drawThickLine(margin, axisY, size - margin - 5, axisY, 2, 100, 116, 139, 200);
drawThickLine(axisX, margin, axisX, size - margin - 5, 2, 100, 116, 139, 200);

// Sine wave with gradient color (teal -> blue -> purple)
const wavePoints = [];
for (let i = 0; i <= 200; i++) {
  const t = i / 200;
  const x = margin + t * (size - 2 * margin);
  const y = axisY - Math.sin(t * Math.PI * 2.5) * 55;
  wavePoints.push({ x, y });
}

for (let i = 1; i < wavePoints.length; i++) {
  const t = i / wavePoints.length;
  // Gradient: teal(6,182,212) -> blue(59,130,246) -> purple(139,92,246)
  let r, g, b;
  if (t < 0.5) {
    const s = t * 2;
    r = Math.round(6 + (59 - 6) * s);
    g = Math.round(182 + (130 - 182) * s);
    b = Math.round(212 + (246 - 212) * s);
  } else {
    const s = (t - 0.5) * 2;
    r = Math.round(59 + (139 - 59) * s);
    g = Math.round(130 + (92 - 130) * s);
    b = 246;
  }
  drawThickLine(wavePoints[i - 1].x, wavePoints[i - 1].y, wavePoints[i].x, wavePoints[i].y, 4, r, g, b, 240);
}

// Glow effect - draw the curve again with larger thickness and lower opacity
for (let i = 1; i < wavePoints.length; i++) {
  const t = i / wavePoints.length;
  let r, g, b;
  if (t < 0.5) {
    const s = t * 2;
    r = Math.round(6 + (59 - 6) * s);
    g = Math.round(182 + (130 - 182) * s);
    b = Math.round(212 + (246 - 212) * s);
  } else {
    const s = (t - 0.5) * 2;
    r = Math.round(59 + (139 - 59) * s);
    g = Math.round(130 + (92 - 130) * s);
    b = 246;
  }
  drawThickLine(wavePoints[i - 1].x, wavePoints[i - 1].y, wavePoints[i].x, wavePoints[i].y, 10, r, g, b, 50);
}

// Secondary dashed curve (orange-red parabola)
for (let i = 0; i <= 180; i++) {
  const t = i / 180;
  const x = margin + 10 + t * (size - 2 * margin - 20);
  const y = size - margin - 20 - t * t * (size - 2 * margin - 60);
  // Dashes
  const dashPhase = Math.floor(i / 12);
  if (dashPhase % 2 === 0) {
    const nextT = (i + 1) / 180;
    const nx = margin + 10 + nextT * (size - 2 * margin - 20);
    const ny = size - margin - 20 - nextT * nextT * (size - 2 * margin - 60);
    const colorT = t;
    const r = Math.round(249 + (239 - 249) * colorT);
    const g = Math.round(115 + (68 - 115) * colorT);
    const b = Math.round(22 + (68 - 22) * colorT);
    drawThickLine(x, y, nx, ny, 2, r, g, b, 140);
  }
}

// Data dots on the sine wave
const dotPositions = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
for (const dp of dotPositions) {
  const idx = Math.round(dp * (wavePoints.length - 1));
  const pt = wavePoints[idx];
  const t = dp;
  let r, g, b;
  if (t < 0.5) {
    const s = t * 2;
    r = Math.round(6 + (59 - 6) * s);
    g = Math.round(182 + (130 - 182) * s);
    b = Math.round(212 + (246 - 212) * s);
  } else {
    const s = (t - 0.5) * 2;
    r = Math.round(59 + (139 - 59) * s);
    g = Math.round(130 + (92 - 130) * s);
    b = 246;
  }
  fillCircle(Math.round(pt.x), Math.round(pt.y), 5, r, g, b, 255);
  fillCircle(Math.round(pt.x), Math.round(pt.y), 8, r, g, b, 60);
}

// --- Write PNG ---
function createPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData));
    return Buffer.concat([len, typeAndData, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT - raw pixel data with filter byte
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx + 0] = rgbaBuffer[srcIdx + 0]; // R
      rawData[dstIdx + 1] = rgbaBuffer[srcIdx + 1]; // G
      rawData[dstIdx + 2] = rgbaBuffer[srcIdx + 2]; // B
      rawData[dstIdx + 3] = rgbaBuffer[srcIdx + 3]; // A
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);

  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', iend),
  ]);
}

const png = createPNG(size, size, pixels);
fs.writeFileSync('icon.png', png);
console.log('Created icon.png (256x256)');

// Also create ICO file (single 256x256 PNG entry)
function createICO(pngBuffer) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count: 1

  // Directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry[0] = 0; // width (0 = 256)
  entry[1] = 0; // height (0 = 256)
  entry[2] = 0; // colors
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuffer.length, 8); // size
  entry.writeUInt32LE(22, 12); // offset (6 + 16)

  return Buffer.concat([header, entry, pngBuffer]);
}

const ico = createICO(png);
fs.writeFileSync('icon.ico', ico);
console.log('Created icon.ico');
