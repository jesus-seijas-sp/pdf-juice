class Span {
  constructor() {
    this.font = null;
    this.text = '';
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.tolerance = 5;
    this.end = 0;
  }

  setText(text) {
    this.text += text;
  }

  isSpace(glyph) {
    return (
      -glyph >= this.font.spaceWidth ||
      (this.font.size < 10 &&
        -glyph >=
          this.font.spaceWidth -
            10 * Math.round(this.font.size) -
            this.tolerance)
    );
  }

  getText() {
    return this.text;
  }
}

module.exports = Span;
