class Font {
  constructor() {
    this.size = 0;
    this.sizeScale = 1;
    this.weight = 'normal';
    this.style = null;
    this.family = null;
    this.direction = 1;
    this.vertical = false;
    this.spaceWidthIsSet = false;
    this.spaceWidth = 250;
    this.loadedName = null;
    this.obj = null;
    this.opentype = null;
  }

  setSize(size) {
    this.size = size;
    if (size < 0) {
      this.direction = -1;
    }
  }
}

module.exports = Font;
