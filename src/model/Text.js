const Line = require('./Line');

class Text {
  constructor() {
    this.textMatrix = [1, 0, 0, 1, 0, 0];
    this.lineMatrix = [1, 0, 0, 1, 0, 0];
    this.textMatrixScale = 1;
    this.lines = [];
  }

  newLine() {
    const t = new Line();
    this.lines.push(t);
    return t;
  }

  getLastLine() {
    return this.lines[this.lines.length - 1];
  }

  getLines() {
    return this.lines.slice();
  }
}

module.exports = Text;
