import bwipjs from "bwip-js";

export async function generateDataMatrixSvg(code) {
  return await bwipjs.toSVG({
    bcid: "datamatrix", // Тип кода
    text: code, // Ваше сообщение
    includetext: false, // Если нужен человекочитаемый текст
    scale: 6.44,
  });
}
