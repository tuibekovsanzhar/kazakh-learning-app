/**
 * scripts/generate-audio.js
 *
 * Generates MP3 pronunciation files for all Kazakh vocabulary words
 * using OpenAI Text-to-Speech API (tts-1 model, multilingual).
 *
 * After generation it also:
 *   1. Updates each data file with an audioFile field per word
 *   2. Writes utils/vocabAudio.js with static require() mappings for Expo
 *
 * Usage: node scripts/generate-audio.js
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ─── Load .env ────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌  .env file not found at project root.');
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (key) process.env[key] = val;
    }
  }
}

loadEnv();

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('❌  OPENAI_API_KEY not found in .env');
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const OUTPUT_BASE  = path.join(__dirname, '..', 'assets', 'sounds', 'vocabulary');
const DATA_DIR     = path.join(__dirname, '..', 'data');
const UTILS_DIR    = path.join(__dirname, '..', 'utils');
const MODEL        = 'tts-1';   // tts-1 = fast + cheap; tts-1-hd = higher quality
const VOICE        = 'nova';    // nova: clear female, great for multilingual content
const DELAY_MS     = 300;       // ms between requests

// cyrillicField = field containing Kazakh Cyrillic text sent to TTS
// latinField    = field used only for deriving the output filename (never sent to TTS)
const SECTIONS = [
  { name: 'greetings', file: 'greetings.js', cyrillicField: 'kazakh',   latinField: 'latin' },
  { name: 'numbers',   file: 'numbers.js',   cyrillicField: 'cyrillic', latinField: 'latin' },
  { name: 'colors',    file: 'colors.js',    cyrillicField: 'cyrillic', latinField: 'latin' },
  { name: 'family',    file: 'family.js',    cyrillicField: 'kazakh',   latinField: 'latin' },
  { name: 'food',      file: 'food.js',      cyrillicField: 'kazakh',   latinField: 'latin' },
  { name: 'animals',   file: 'animals.js',   cyrillicField: 'kazakh',   latinField: 'latin' },
];

// ─── Slug helper ──────────────────────────────────────────────────────────────
// Converts latin transliteration like "Sälemetsiz be" → "salemetsiz_be"

const LATIN_MAP = { ä: 'a', ö: 'o', ü: 'u', ñ: 'n', ń: 'n', ġ: 'g', ı: 'i', İ: 'i' };

function latinToSlug(latin) {
  return latin
    .replace(/[äöüñńġıİ]/g, c => LATIN_MAP[c] || c)
    .toLowerCase()
    .replace(/\.\.\./g, '')
    .replace(/[?!.,]/g, '')
    .replace(/[\s\-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// ─── Extract (cyrillic, latin) pairs from a data file ────────────────────────
// cyrillicField: the field containing Kazakh Cyrillic text (sent to TTS)
// latinField:    the field containing Latin transliteration (used for filenames only)

function extractWordPairs(filePath, cyrillicField, latinField) {
  const src        = fs.readFileSync(filePath, 'utf8');
  const cyrillicRe = new RegExp(`\\b${cyrillicField}:\\s*["'\`]([^"'\`]+)["'\`]`, 'g');
  const latinRe    = new RegExp(`\\b${latinField}:\\s*["'\`]([^"'\`]+)["'\`]`, 'g');

  const cyrillics = [];
  const latins    = [];
  let m;

  while ((m = cyrillicRe.exec(src)) !== null) cyrillics.push(m[1]);
  while ((m = latinRe.exec(src))    !== null) latins.push(m[1]);

  if (cyrillics.length !== latins.length) {
    console.warn(`   ⚠️  Field count mismatch in ${path.basename(filePath)}: ` +
      `${cyrillics.length} ${cyrillicField} vs ${latins.length} ${latinField}`);
  }
  const count = Math.min(cyrillics.length, latins.length);
  // Returns { cyrillic, latin } — cyrillic is what gets sent to OpenAI TTS
  return Array.from({ length: count }, (_, i) => ({ cyrillic: cyrillics[i], latin: latins[i] }));
}

// ─── HTTPS helper ─────────────────────────────────────────────────────────────

function httpsPost(options, bodyStr, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs / 1000}s`));
    });
    req.write(bodyStr);
    req.end();
  });
}

// ─── OpenAI TTS call ──────────────────────────────────────────────────────────

async function synthesize(text, outPath) {
  const bodyStr = JSON.stringify({ model: MODEL, input: text, voice: VOICE });

  const res = await httpsPost({
    hostname: 'api.openai.com',
    path:     '/v1/audio/speech',
    method:   'POST',
    headers:  {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
    },
  }, bodyStr);

  if (res.statusCode !== 200) {
    let msg = `HTTP ${res.statusCode}`;
    try { msg += ': ' + JSON.parse(res.body.toString())?.error?.message; } catch {}
    throw new Error(msg);
  }

  fs.writeFileSync(outPath, res.body);
}

// ─── Update data file with audioFile fields ───────────────────────────────────
// Works for both multi-line objects (greetings.js) and single-line objects
// (numbers.js, colors.js, family.js, food.js, animals.js).
// Inserts audioFile: '...' inline right after the latin field value.
// Safe to re-run — skips entries that already have the field.

function updateDataFile(filePath, sectionName, pairs) {
  let src = fs.readFileSync(filePath, 'utf8');
  let insertCount = 0;

  for (const { latin } of pairs) {
    const slug      = latinToSlug(latin);
    const audioFile = `vocabulary/${sectionName}/${slug}.mp3`;
    const mp3Path   = path.join(OUTPUT_BASE, sectionName, `${slug}.mp3`);
    if (!fs.existsSync(mp3Path)) continue;

    // Skip if already present anywhere in the file for this entry
    if (src.includes(`audioFile: '${audioFile}'`)) continue;

    // Match latin: 'VALUE' or latin: "VALUE" anywhere on a line (inline or own line)
    const escaped = latin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re      = new RegExp(`(latin:\\s*["'\`]${escaped}["'\`])`, 'g');

    const updated = src.replace(re, `$1, audioFile: '${audioFile}'`);
    if (updated !== src) {
      src = updated;
      insertCount++;
    }
  }

  if (insertCount > 0) fs.writeFileSync(filePath, src);
  return insertCount;
}

// ─── Generate utils/vocabAudio.js ─────────────────────────────────────────────
// Expo requires static require() paths — dynamic requires break the bundler.
// This generates the pre-built map from all generated vocabulary audio files.

function generateVocabAudioModule(allSectionPairs) {
  const lines = [];

  for (const section of SECTIONS) {
    for (const { latin } of (allSectionPairs[section.name] || [])) {
      const slug    = latinToSlug(latin);
      const key     = `vocabulary/${section.name}/${slug}.mp3`;
      const relPath = `../assets/sounds/vocabulary/${section.name}/${slug}.mp3`;
      if (!fs.existsSync(path.join(OUTPUT_BASE, section.name, `${slug}.mp3`))) continue;
      lines.push(`  '${key}': require('${relPath}'),`);
    }
  }

  const content =
`// Auto-generated by scripts/generate-audio.js — do not edit manually
import { Audio } from 'expo-av';

const VOCAB_SOUNDS = {
${lines.join('\n')}
};

export async function playVocabSound(audioFile) {
  try {
    const source = VOCAB_SOUNDS[audioFile];
    if (!source) return;
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(source);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // Fail silently — missing or unplayable file
  }
}
`;

  fs.writeFileSync(path.join(UTILS_DIR, 'vocabAudio.js'), content);
  console.log(`📝  Generated utils/vocabAudio.js  (${lines.length} entries)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎙️  OpenAI TTS Kazakh vocabulary audio generator');
  console.log(`   Model: ${MODEL}  |  Voice: ${VOICE}  |  Format: MP3\n`);

  let totalGenerated = 0;
  let totalSkipped   = 0;
  let totalErrors    = 0;
  let totalChars     = 0;

  const allSectionPairs = {};

  for (const section of SECTIONS) {
    const outDir = path.join(OUTPUT_BASE, section.name);
    fs.mkdirSync(outDir, { recursive: true });

    const pairs = extractWordPairs(
      path.join(DATA_DIR, section.file),
      section.cyrillicField,  // Kazakh Cyrillic text → sent to OpenAI TTS
      section.latinField      // Latin transliteration → filename only
    );
    allSectionPairs[section.name] = pairs;

    console.log(`\n📂  ${section.name}  (${pairs.length} words)`);

    for (const { cyrillic, latin } of pairs) {
      const slug    = latinToSlug(latin);
      const outPath = path.join(outDir, `${slug}.mp3`);

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
        console.log(`   ⏭️  skip    ${section.name}/${slug}.mp3`);
        totalSkipped++;
        continue;
      }

      process.stdout.write(`   Generating: ${cyrillic} → ${section.name}/${slug}.mp3  `);

      try {
        await synthesize(cyrillic, outPath);  // Cyrillic text sent to TTS — not Latin
        totalChars += cyrillic.length;
        process.stdout.write('✅\n');
        totalGenerated++;
        await new Promise(r => setTimeout(r, DELAY_MS));
      } catch (err) {
        process.stdout.write('❌\n');
        console.error(`   Error: ${err.message}`);
        totalErrors++;
      }
    }
  }

  // ── Post-generation: update data files + write vocabAudio.js ─────────────

  console.log('\n' + '─'.repeat(52));
  console.log('📝  Updating data files with audioFile fields...');

  let totalInserted = 0;
  for (const section of SECTIONS) {
    const count = updateDataFile(
      path.join(DATA_DIR, section.file),
      section.name,
      allSectionPairs[section.name]
    );
    if (count > 0) console.log(`   ✅  data/${section.file}  (+${count} fields)`);
    totalInserted += count;
  }
  if (totalInserted === 0) {
    console.log('   ℹ️   All audioFile fields already present — nothing to update');
  }

  console.log('');
  generateVocabAudioModule(allSectionPairs);

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log('\n' + '─'.repeat(52));
  console.log(`✅  Generated   : ${totalGenerated} files`);
  console.log(`⏭️  Skipped     : ${totalSkipped} files`);
  if (totalErrors) console.log(`❌  Failed      : ${totalErrors} files`);
  console.log(`📝  Chars used  : ${totalChars}`);
  console.log('─'.repeat(52));
  console.log('\n📁  Audio saved to: assets/sounds/vocabulary/');
  console.log('🔧  Module written: utils/vocabAudio.js');
  console.log('');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
