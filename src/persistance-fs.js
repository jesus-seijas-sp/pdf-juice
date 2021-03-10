const fs = require('fs');

class PersistanceFs {
  constructor(settings = {}) {
    this.settings = settings;
  }

  loadFile(fileName) {
    return fs.readFileSync(fileName);
  }

  mkdir(dirPath, recursive = true) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive });
    }
  }

  async saveFile(fileName, data) {
    const stream = fs.createWriteStream(fileName);
    await stream.write(data);
    await stream.end();
  }
}

module.exports = PersistanceFs;
