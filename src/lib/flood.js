 import { drawCode } from "./drawCode";
 import { generateDataMatrixSvg } from "./generateDataMatrixSvg";
 
 export async function flood(floods, lines, page, scale, x, y, repeatRigth, repeatTop, dmtx_size) {
    
    let curX = x;
    let curY = y;
    
 // Идем по строкам, изменяя позицию начала строки
 for (let code of lines) {
    let curFlood = 0;
    
    // Идем по колонкам строки, по каждому ручью, изменяя позицию отрисовки следующего элемента
    while (curFlood <= floods) {
      const dataMatrixSvg = await generateDataMatrixSvg(code);
      await drawCode(page, dataMatrixSvg, curX, curY, scale, dmtx_size);
      
      curFlood += 1;
      curX += repeatRigth;
    }

    curX = x;
    curY += repeatTop;
  }
}