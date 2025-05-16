import { PDFDocument } from 'pdf-lib';

export async function getFirstPage(buffer){
    const pdfDoc = await PDFDocument.load(buffer);

    const newPdf = await PDFDocument.create();
    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
    newPdf.addPage(firstPage);

    const pdfBytes = await newPdf.save();  

    return pdfBytes;

}