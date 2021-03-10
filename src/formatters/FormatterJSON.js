const { Text, Image } = require('../model');

class FormatterJSON {
  constructor(config = {}) {
    this.config = config;
  }

  start(doc, metadata) {
    return `{\n  "pages_count": ${
      doc.numPages
    },\n  "metadata": ${JSON.stringify(metadata)},\n  "pages": {`;
  }

  formatTextObject(textObject) {
    return {
      lines: textObject
        .getLines()
        .map((x) => this.formatTextLine(x))
        .sort((a, b) => b.y - a.y),
      x: textObject.x,
      y: textObject.y,
      textMatrix: textObject.textMatrix,
    };
  }

  formatImageObject(imageObject) {
    return {
      x: imageObject.x,
      y: imageObject.y,
      width: imageObject.width,
      height: imageObject.height,
      name: imageObject.name,
    };
  }

  formatTextLine(textLine) {
    return {
      text: textLine.getText().map((x) => this.formatTextFont(x)),
      y: textLine.y,
    };
  }

  formatTextFont(textFont) {
    const result = {
      x: textFont.x,
      y: textFont.y,
      end: textFont.end,
      text: textFont.getText(),
      charSpacing: textFont.charSpacing,
      wordSpacing: textFont.wordSpacing,
    };
    if (this.config.saveFonts) {
      const { font } = textFont;
      result.font = {
        size: font.size,
        direction: font.direction,
        family: font.family,
        style: font.style,
        weight: font.weight,
        vertical: font.vertical,
      };
    }
    return result;
  }

  format(page, data, last) {
    const txtData = [];
    data.forEach((pdfObject) => {
      if (pdfObject instanceof Text) {
        txtData.push(this.formatTextObject(pdfObject));
      } else if (pdfObject instanceof Image) {
        txtData.push(this.formatImageObject(pdfObject));
      }
    });
    const out = JSON.stringify(
      {
        data: txtData,
      },
      null,
      2
    );
    return `"${page.pageNumber}": ${out}${last ? '}\n' : ','}`;
  }

  formatFont(fontData) {
    let out = ',"fonts":{';
    Object.values(fontData).forEach((fontObj) => {
      const { font } = fontObj;
      const fontJSON = JSON.stringify({
        family: font.family,
        style: font.style,
        weight: font.weight,
        file: `font/${font.file}`,
      });
      out += `"${font.family}": ${fontJSON},`;
    });
    out = `${out.substring(0, out.length - 1)}}`;
    return out;
  }

  end() {
    return `\n}`;
  }
}

module.exports = FormatterJSON;
