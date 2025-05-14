import bwipjs from "bwip-js";


export async function generateDataMatrixSvg(code, rot) {
  
  return await bwipjs.toSVG({
    bcid: "datamatrix", // Тип кода
    text: code, // Ваше сообщение
    includetext: false, // Если нужен человекочитаемый текст
    scale: 0.5,
    rotate: rot,
  });
}
