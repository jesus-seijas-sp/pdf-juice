const fs = require('fs');
const zlib = require('zlib');

const PNG_HEADER = new Uint8Array([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a,
]);
const CHUNK_WRAPPER_SIZE = 12;

const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i += 1) {
  let c = i;
  for (let h = 0; h < 8; h += 1) {
    c = c & 1 ? 0xedb88320 ^ ((c >> 1) & 0x7fffffff) : (c >> 1) & 0x7fffffff;
  }
  crcTable[i] = c;
}

function crc32(data, start, end) {
  let crc = -1;
  for (let i = start; i < end; i += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return crc ^ -1;
}

function write4(input, p, a, b, c, d) {
  const data = input;
  data[p] = a & 0xff;
  data[p + 1] = b & 0xff;
  data[p + 2] = c & 0xff;
  data[p + 3] = d & 0xff;
  return p + 4;
}

function writeNumber(data, p, num) {
  return write4(data, p, num >> 24, num >> 16, num >> 8, num);
}

function writeChars(data, p, str) {
  return write4(
    data,
    p,
    str.charCodeAt(0),
    str.charCodeAt(1),
    str.charCodeAt(2),
    str.charCodeAt(3)
  );
}

function writePngChunk(type, body, data, offset) {
  let p = offset;
  const len = body.length;
  p = writeNumber(data, p, len);
  p = writeChars(data, p, type);
  data.set(body, p);
  p += body.length;
  const crc = crc32(data, offset + 4, p);
  p = writeNumber(data, p, crc);
}

function deflateSync(literals) {
  const output = zlib.deflateSync(literals, { level: 9 });
  return output instanceof Uint8Array ? output : new Uint8Array(output);
}

function getKindParams(kind, width) {
  switch (kind) {
    case 2:
      return { colorType: 2, bitDepth: 8, lineSize: width * 3 };
    case 3:
      return { colorType: 6, bitDepth: 8, lineSize: width * 4 };
    default:
      return { colorType: 0, bitDepth: 1, lineSize: (width + 7) >> 3 };
  }
}

function convertImgDataToPng(imgData, isMask) {
  const kind = imgData.kind || 1;
  const { width, height } = imgData;
  const bytes = imgData.data;
  const { bitDepth, colorType, lineSize } = getKindParams(kind, width);
  const literals = new Uint8Array((1 + lineSize) * height);
  let offsetLiterals = 0;
  let offsetBytes = 0;
  for (let y = 0; y < height; y += 1) {
    literals[offsetLiterals] = 0;
    offsetLiterals += 1;
    literals.set(
      bytes.subarray(offsetBytes, offsetBytes + lineSize),
      offsetLiterals
    );
    offsetBytes += lineSize;
    offsetLiterals += lineSize;
  }
  if (kind === 1 && isMask) {
    offsetLiterals = 0;
    for (let y = 0; y < height; y += 1) {
      offsetLiterals += 1;
      for (let i = 0; i < lineSize; i += 1) {
        literals[offsetLiterals] ^= 0xff;
        offsetLiterals += 1;
      }
    }
  }

  const ihdr = new Uint8Array(13);
  writeNumber(ihdr, 0, width);
  writeNumber(ihdr, 4, height);
  ihdr[8] = bitDepth;
  ihdr[9] = colorType;
  const idat = deflateSync(literals);
  const pngLength =
    PNG_HEADER.length + CHUNK_WRAPPER_SIZE * 3 + ihdr.length + idat.length;
  const data = new Uint8Array(pngLength);
  let offset = 0;
  data.set(PNG_HEADER, offset);
  offset += PNG_HEADER.length;
  writePngChunk('IHDR', ihdr, data, offset);
  offset += CHUNK_WRAPPER_SIZE + ihdr.length;
  writePngChunk('IDATA', idat, data, offset);
  offset += CHUNK_WRAPPER_SIZE + idat.length;
  writePngChunk('IEND', new Uint8Array(0), data, offset);
  return data;
}

module.exports = {
  convertImgDataToPng,
};
