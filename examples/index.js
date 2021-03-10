const PdfJuice = require('../src/pdf-juice');

const pdfName = './The Complete Works of H.P. Lovecraft.pdf';

(async () => {
  const juice = new PdfJuice({ formats: ['json', 'txt', 'html']});
  await juice.processFile(pdfName);
})();
