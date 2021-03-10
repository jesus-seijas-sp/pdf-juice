const { Text } = require('../model');

class FormatterText {
  start() {
    return '';
  }

  formatTextObject(textObject) {
    return textObject
      .getLines()
      .sort((a, b) => b.y - a.y)
      .map((x) => `${this.formatTextLine(x)}\n`)
      .join('');
  }

  formatTextLine(textLine) {
    return textLine
      .getText()
      .map((x) => this.formatTextFont(x))
      .join('');
  }

  formatTextFont(textFont) {
    return textFont.getText();
  }

  format(page, data) {
    let output = '';
    data.forEach((pdfObject) => {
      if (pdfObject instanceof Text) {
        output += this.formatTextObject(pdfObject);
      }
    });
    return output;
  }

  formatFont() {
    return '';
  }

  end() {
    return '';
  }
}

module.exports = FormatterText;
