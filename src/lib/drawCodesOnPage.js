import { drawCode } from "./drawCode";
import { generateDataMatrixSvg } from "./generateDataMatrixSvg";

export async function drawCodesOnPage(
  floods,
  lines,
  page,
  scale,
  x,
  y,
  repeatRigth,
  repeatTop,
  dmtx_size,
  cycle,
  rotate
) {
  let curX = x;
  let curY = y;
  let index = 0;

  for (let i = 1; i <= cycle; i++) {
    let curFlood = 1;

      while (curFlood <= floods) {
        const dataMatrixSvg = await generateDataMatrixSvg(
          String(lines[curFlood - 1 + index]), String(rotate)
        );

        await drawCode(page, dataMatrixSvg, curX, curY, scale, dmtx_size);

        curFlood += 1;
        curX += repeatRigth;
      }

    curX = x;
    curY += repeatTop;
    index += floods;
  }
}
