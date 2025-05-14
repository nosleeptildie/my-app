import { PDFDocument, cmyk, degrees } from "pdf-lib";

export async function copyPdf(bufferState, setBufferState){

const pdfDoc = await PDFDocument.load(bufferState);
const newPdfDoc = await PDFDocument.create();
const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());

for (let i = 0; i < 50; i++) {
  pages.forEach((pag) => newPdfDoc.addPage(pag));
}

const file = await newPdfDoc.save();
setBufferState(file)
console.log(file)
return file;

}