const path = require('path');
const PersistanceFs = require('./persistance-fs');

class ImageSaver {
  constructor(config = {}) {
    this.config = config;
    if (!this.config.imageDir) {
      const outputDir = this.config.outputDir || './output';
      const imgFolder = this.config.imgFolder || 'img';
      this.imageDir = path.join(outputDir, imgFolder);
    } else {
      this.imageDir = this.config.imageDir;
    }
    this.persistance = this.config.persistance || new PersistanceFs();
  }

  async process(input) {
    await this.persistance.mkdir(this.imageDir);
    for (let i = 0; i < input.pages.length; i += 1) {
      const objects = input.pages[i].page.objectList.filter((x) => x.png);
      /* eslint-disable no-await-in-loop */
      for (let j = 0; j < objects.length; j += 1) {
        const filePath = path.join(this.imageDir, objects[j].name);
        await this.persistance.saveFile(filePath, objects[j].png);
      }
    }
  }
}

module.exports = ImageSaver;
