class Line {
  constructor() {
    this.texts = [];
  }

  addTextFont(line) {
    this.texts.push(line);
  }

  getLastFontText() {
    return this.texts.length > 0 ? this.texts[this.texts.length - 1] : null;
  }

  printText() {}

  getText() {
    return this.texts.slice();
  }
}

module.exports = Line;
