import { PDFDocument } from "pdf-lib";

export async function copyPdf(bufferState, setBufferState, pageValue, startIndex = 0) {
  const srcDoc = await PDFDocument.load(bufferState);
  const newDoc = await PDFDocument.create();

  const srcPages = srcDoc.getPages();
  const embeddedPages = await Promise.all(
    srcPages.map((page) => newDoc.embedPage(page))
  );
  
  let pageValueCalc = (pageValue >= 300 ? 300 : pageValue)

  for (let i = startIndex; i < pageValueCalc; i++) {
    embeddedPages.forEach((embPage) => {
      const { width, height } = embPage;
      const page = newDoc.addPage([width, height]);
      page.drawPage(embPage);
    });
  }

  const file = await newDoc.save({ useObjectStreams: true });
  setBufferState(file);
  return file;
}
