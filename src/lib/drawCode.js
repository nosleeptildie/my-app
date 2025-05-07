import { PDFDocument, cmyk } from "pdf-lib";

export async function drawCode(page, svgCode, x, y, size, dmtx_size) {
  // Генерируем SVG DataMatrix <svg><path .../></svg>

  // Извлекаем все <path d="..."/> из SVG Простейший RegExp, предполагающий что SVG состоит только из <svg><path .../></svg>
  const pathRegexp = /<path\s+[^>]*d="([^"]+)"[^>]*\/>/g;
  let match;
  while ((match = pathRegexp.exec(svgCode)) !== null) {
    const d = match[1];

    // Рисуем каждый путь в PDF как вектор
    page.drawSvgPath(d, {
      x, // смещение по X
      y: y + dmtx_size, // PDF-координаты «снизу»; смещение на размер
      scale: size,
      color: cmyk(0, 0, 0, 1), // 100% черный
      borderWidth: 0,
      opacity: 1,
      blendMode: "Darken",
    });
  }
}
