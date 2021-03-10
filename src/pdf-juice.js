const path = require('path');
const PersistanceFs = require('./persistance-fs');
const PdfExtract = require('./pdf-extract');
const ImageSaver = require('./image-saver');
const Formatter = require('./Formatter');

class PdfJuice {
  constructor(config = {}) {
    this.config = config;
    this.inputDir = this.config.inputDir || './';
    this.outputDir = this.config.outputDir || './output';
    this.persistance = this.config.persistance || new PersistanceFs();
  }

  async processData(data, slug) {
    const formats = this.config.formats || ['html'];
    const config = {
      data,
      outputDir: path.join(this.outputDir, slug),
      formats: Array.isArray(formats) ? formats : [formats],
      persistance: this.persistance,
    };
    await config.persistance.mkdir(config.outputDir);
    const pdf = new PdfExtract(config);
    const extracted = await pdf.extract();
    const imageSaver = new ImageSaver(config);
    await imageSaver.process(extracted);
    const formatter = this.config.formatter || new Formatter(config);
    formatter.start(extracted.doc, extracted.metadata.info);
    for (let i = 0; i < extracted.pages.length; i += 1) {
      const page = extracted.pages[i];
      formatter.format(page.data, page.page.objectList, i === extracted.pages.length - 1);
    }
    formatter.end();
    for (let i = 0; i < config.formats.length; i += 1) {
      const fileName = path.join(config.outputDir, `data.${config.formats[i]}`);
      await config.persistance.saveFile(fileName, formatter.data[config.formats[i]]);
    }
  }

  async processFile(fileName, srcSlug) {
    const data = await this.persistance.loadFile(
      path.join(this.inputDir, fileName)
    );
    let slug = srcSlug;
    if (slug === undefined) {
      const extension = path.extname(fileName);
      slug = path.basename(fileName, extension);
    }
    return this.processData(data, slug);
  }
}

module.exports = PdfJuice;
