#!/usr/bin/env node

/**
 * Asset Placeholder Generator
 *
 * Generates minimal placeholder .png and .mp3 files for all words
 * referenced in levels_config.json.
 *
 * Usage: node scripts/generate_assets.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'public', 'assets', 'images');
const AUDIO_DIR = path.join(ROOT, 'public', 'assets', 'audio');

// All words that need assets (extracted from levels_config.json)
const WORDS = {
  // Animals
  dog:    { r: 194, g: 154, b:  89 },  // amber-ish
  cat:    { r: 234, g: 162, b:  89 },  // orange-ish
  bird:   { r: 125, g: 196, b: 232 },  // sky blue
  cow:    { r: 148, g: 210, b: 117 },  // lime green
  // Colors
  red:    { r: 239, g:  68, b:  68 },  // red
  blue:   { r:  59, g: 130, b: 246 },  // blue
  green:  { r:  34, g: 197, b:  94 },  // green
  yellow: { r: 250, g: 204, b:  21 },  // yellow
  // Numbers
  one:    { r: 168, g: 130, b: 214 },  // purple-ish
  two:    { r: 244, g: 114, b: 182 },  // pink-ish
  three:  { r:  45, g: 212, b: 191 },  // teal
  four:   { r: 251, g: 146, b:  60 },  // orange
};

/**
 * Creates a minimal valid PNG file (1x1 pixel) with the given RGB color.
 * Uses raw IHDR + IDAT + IEND chunks — no external dependencies.
 */
function createPng(r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: 1x1, 8-bit RGB
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0);   // width
  ihdrData.writeUInt32BE(1, 4);   // height
  ihdrData[8] = 8;                // bit depth
  ihdrData[9] = 2;                // color type: RGB
  ihdrData[10] = 0;               // compression
  ihdrData[11] = 0;               // filter
  ihdrData[12] = 0;               // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk: zlib-compressed scanline (filter byte 0 + RGB)
  // Minimal zlib: header(78 01) + deflate block + adler32
  const rawScanline = Buffer.from([0, r, g, b]); // filter=None + RGB
  const deflateBlock = Buffer.alloc(rawScanline.length + 5);
  deflateBlock[0] = 0x01; // BFINAL=1, BTYPE=00 (no compression)
  deflateBlock.writeUInt16LE(rawScanline.length, 1);
  deflateBlock.writeUInt16LE(rawScanline.length ^ 0xffff, 3);
  rawScanline.copy(deflateBlock, 5);

  const adler = adler32(rawScanline);
  const zlibData = Buffer.concat([
    Buffer.from([0x78, 0x01]), // zlib header (deflate, no dict)
    deflateBlock,
    adler,
  ]);
  const idat = makeChunk('IDAT', zlibData);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  const result = Buffer.alloc(4);
  result.writeUInt32BE(((b << 16) | a) >>> 0, 0);
  return result;
}

/**
 * Creates a minimal valid MP3 file.
 * Single silent MPEG Audio Layer 3 frame (MPEG1, 128kbps, 44100Hz, stereo).
 */
function createMp3() {
  // MPEG1, Layer 3, 128kbps, 44100Hz, stereo — frame size = 417 bytes
  const frameSize = 417;
  const frame = Buffer.alloc(frameSize, 0);
  // Frame header: 0xFFFB9004
  // FF FB = sync + MPEG1, Layer3, no CRC
  // 90 = 128kbps, 44100Hz
  // 04 = stereo, no padding
  frame[0] = 0xff;
  frame[1] = 0xfb;
  frame[2] = 0x90;
  frame[3] = 0x04;
  return frame;
}

// --- Main ---

function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  let createdImages = 0;
  let createdAudio = 0;

  for (const [word, color] of Object.entries(WORDS)) {
    const pngPath = path.join(IMAGES_DIR, `${word}.png`);
    const mp3Path = path.join(AUDIO_DIR, `${word}.mp3`);

    fs.writeFileSync(pngPath, createPng(color.r, color.g, color.b));
    createdImages++;

    fs.writeFileSync(mp3Path, createMp3());
    createdAudio++;
  }

  console.log(`Generated ${createdImages} placeholder images in ${IMAGES_DIR}`);
  console.log(`Generated ${createdAudio} placeholder audio files in ${AUDIO_DIR}`);
  console.log('Done!');
}

main();
