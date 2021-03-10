const { FormatterHTML, FormatterJSON, FormatterText } = require('./formatters');

class Formatter {
  constructor(config = {}) {
    this.formats = config.formats || ['html'];
    this.formats = Array.isArray(this.formats) ? this.formats : [this.formats];
    this.formatters = {};
    this.data = {};
    for (let i = 0; i < this.formats.length; i += 1) {
      const format = this.formats[i];
      this.formatters[format] = Formatter.getFormatter(format, config);
      this.data[format] = '';
    }
  }

  static getFormatter(format, config) {
    switch (format) {
      case 'json':
        return new FormatterJSON(config);
      case 'txt':
        return new FormatterText(config);
      default:
        return new FormatterHTML(config);
    }
  }

  start(doc, metadata) {
    for (let i = 0; i < this.formats.length; i += 1) {
      const format = this.formats[i];
      this.data[format] += this.formatters[format].start(doc, metadata);
    }
  }

  format(page, data, last) {
    for (let i = 0; i < this.formats.length; i += 1) {
      const format = this.formats[i];
      this.data[format] += this.formatters[format].format(page, data, last);
    }
  }

  formatFont(fontData) {
    for (let i = 0; i < this.formats.length; i += 1) {
      const format = this.formats[i];
      this.data[format] += this.formatters[format].formatFont(fontData);
    }
  }

  end() {
    for (let i = 0; i < this.formats.length; i += 1) {
      const format = this.formats[i];
      this.data[format] += this.formatters[format].end();
    }
  }
}

module.exports = Formatter;
