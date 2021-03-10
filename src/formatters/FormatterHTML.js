const { Text, Image } = require('../model');

class FormatterHTML {
  start(doc, metadata) {
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${
      metadata.Title ? metadata.Title : 'pdf to html'
    }</title>\n</head>\n<body>\n`;
  }

  formatTextObject(textObject) {
    const text = textObject
      .getLines()
      .sort((a, b) => b.y - a.y)
      .map((x) => this.formatTextLine(x))
      .join('');
    return `<div>\n${text}</div>\n`;
  }

  formatImageObject(imageObject) {
    return `<img width="${imageObject.width}px" height="${imageObject.height}px" src="img/${imageObject.name}"/>\n`;
  }

  formatTextLine(textLine) {
    const text = textLine
      .getText()
      .map((x) => this.formatTextFont(x))
      .join('');
    return `<p>${text}</p>\n`;
  }

  formatTextFont(textFont) {
    const { font } = textFont;
    return `<span style="font-family: ${font.family};font-size:${
      font.size
    }pt;font-style:${font.style};font-weight:${
      font.weight
    };">${textFont.getText()}</span>`;
  }

  format(page, data) {
    const text = data
      .map((x) => {
        if (x instanceof Text) {
          return this.formatTextObject(x);
        }
        if (x instanceof Image) {
          return this.formatImageObject(x);
        }
        return '';
      })
      .join('');
    return `<div>${text}</div>`;
  }

  formatFont() {
    return '';
  }

  end() {
    return `</body>\n</html>`;
  }
}

module.exports = FormatterHTML;
