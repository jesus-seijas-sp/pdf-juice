class PdfPage {
  constructor(data, dependencies) {
    this.data = data;
    this.dependencies = dependencies;
    this.objectList = [];
    this.leading = 0;
    this.textMatrixScale = 1;
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRise = 0;
    this.textRenderingMode = 0;
    this.currentObject = null;
    this.currentFont = null;
    this.fonts = {};
  }

  addImage(image) {
    this.objectList.push(image);
  }

  setCurrentObject(obj) {
    this.currentObject = obj;
    this.objectList.push(obj);
  }
}

module.exports = PdfPage;
