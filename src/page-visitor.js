const { PdfPage, Text, Image, Span, Font } = require('./model');
const { convertImgDataToPng } = require('./helpers');

class PageVisitor {
  constructor(config, data, dependencies) {
    this.config = config;
    this.page = new PdfPage(data, dependencies);
  }

  innerShowText(glyphs, srcPage) {
    const page = srcPage;
    let lines = page.currentObject.getLastLine();
    const lastline = lines.getLastFontText();
    const line = new Span();
    line.font = page.currentFont;
    if (lastline) {
      line.wordSpacing = lastline.wordSpacing;
      line.charSpacing = lastline.charSpacing;
    }
    const startY = page.y;
    let partial = '';
    let x = 0;
    for (let i = 0; i < glyphs.length; i += 1) {
      const glyph = glyphs[i];
      if (glyph === null || glyph === undefined) {
        x += line.font.direction * line.wordSpacing;
      } else if (typeof glyph === 'number') {
        x += -glyph * line.font.size * 0.001;
        if (!line.font.spaceWidthIsSet && line.isSpace(glyph)) {
          partial += ' ';
        }
      } else {
        const spacing =
          (glyph.isSpace ? line.wordSpacing : 0) + line.charSpacing;
        partial += glyph.unicode;
        x +=
          glyph.width * line.font.size * 0.001 + spacing * line.font.direction;
      }
    }
    line.x = page.x;
    line.y = page.y;
    if (line.font.vertical) {
      page.y -= x * page.textHScale;
      line.end = page.y;
    } else {
      page.x += x * page.textHScale;
      line.end = page.x;
    }
    line.setText(partial);
    if (lines.y !== 0 && Math.abs(line.y - lines.y) > line.font.size) {
      lines = page.currentObject.newLine();
    }
    lines.y = startY;
    lines.addTextFont(line);
  }

  getFontFamily(name, dependencies) {
    for (let i = 0; i < dependencies.length; i += 1) {
      if (dependencies[i].loadedName === name) {
        return dependencies[i];
      }
    }
    return null;
  }

  addPageFont(fontObj, srcPage) {
    const page = srcPage;
    if (!page.fonts[fontObj.name]) {
      page.fonts[fontObj.name] = {
        fname: `${fontObj.name}.ttf`,
        name: fontObj.name,
        missingFile: fontObj.missingFile,
        data: fontObj.data,
        type: fontObj.type,
        mimetype: fontObj.mimetype,
        loadedName: fontObj.loadedName,
      };
    }
  }

  innerSetFont(details, srcPage) {
    const page = srcPage;
    const fontObj = page.data.commonObjs.get(details[0]);
    this.addPageFont(fontObj, page);
    const font = new Font();
    font.loadedName = fontObj.loadedName;
    font.setSize(details[1]);
    if (fontObj.black) {
      font.weight = fontObj.bold ? 'bolder' : 'bold';
    } else {
      font.weight = fontObj.bold ? 'bold' : 'normal';
    }
    font.style = fontObj.italic ? 'italic' : 'normal';
    const family = this.getFontFamily(fontObj.loadedName, page.dependencies);
    font.family = family ? family.name : fontObj.loadedName;
    font.vertical = fontObj.vertical || false;
    font.obj = fontObj;
    page.currentFont = font;
  }

  visit(fname, args) {
    if (this[fname]) {
      this[fname](args);
    }
  }

  beginText() {
    if (
      !this.page.currentObject ||
      this.page.currentObject.textMatrixScale === undefined
    ) {
      this.page.setCurrentObject(new Text());
      this.page.currentObject.newLine();
    }
  }

  setLeading(args) {
    this.page.leading = -args[0];
  }

  moveText(args) {
    [this.page.x] = args;
    this.page.y += args[1];
  }

  setLeadingMoveText(args) {
    this.page.leading = -args[1];
    this.moveText(args);
  }

  setFont(args) {
    this.innerSetFont(args, this.page);
  }

  showText(args) {
    this.innerShowText(args[0], this.page);
  }

  showSpacedText(args) {
    this.innerShowText(args[0], this.page);
  }

  setCharSpacing(args) {
    [this.page.charSpacing] = args;
  }

  setWordSpacing(args) {
    [this.page.wordSpacing] = args;
  }

  setHScale(args) {
    this.page.textHScale = args[0] / 100;
  }

  setTextMatrix(args) {
    this.page.currentObject.textMatrix = args;
    this.page.currentObject.lineMatrix = args;
    [, , , , this.page.x, this.page.y] = args;
  }

  setTextRise(args) {
    [this.page.textRise] = args;
  }

  setTextRenderingMode(args) {
    [this.page.textRenderingMode] = args;
  }

  paintImageXObject(args) {
    this.paintInlineImageXObject([this.page.data.objs.get(args[0]), args[0]]);
  }

  paintImageMaskXObject(args) {
    this.paintInlineImageXObject(args[0]);
  }

  paintInlineImageXObject(args) {
    const imgData = args[0];
    const imgBinary = convertImgDataToPng(imgData, false);
    const fileName = `page.${this.page.data.pageNumber}.${args[1]}.png`;
    const image = new Image(
      fileName,
      this.page.x,
      this.page.y,
      imgData.width,
      imgData.height,
      imgBinary
    );
    this.page.addImage(image);
  }
}

module.exports = PageVisitor;
