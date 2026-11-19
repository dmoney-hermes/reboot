import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const game = resolve(dirname(fileURLToPath(import.meta.url)), '../src/components/pages/games/memory-match')
const read = (path) => readFileSync(resolve(game, path))

function checkWebP(path, width, height, maxBytes) {
  const bytes = read(path)
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  assert.equal(bytes.toString('ascii', 12, 16), 'VP8 ')
  assert.equal(bytes.readUInt16LE(26) & 0x3fff, width)
  assert.equal(bytes.readUInt16LE(28) & 0x3fff, height)
  assert.ok(bytes.length < maxBytes, `${path} exceeds its size budget`)
  return bytes
}

test('all twelve card faces use distinct bundled, attributed WebP artwork', () => {
  const source = read('assets.js').toString()
  const imports = [...source.matchAll(/import\s+(\w+)\s+from\s+"(\.\/assets\/refresh\/[a-z-]+\.webp)"/g)]
  assert.equal(imports.length, 12, 'expected twelve refreshed artwork imports')
  const faces = source.match(/export const CARD_FACES = \[([\s\S]*?)\]/)?.[1]
  assert.ok(faces, 'CARD_FACES must remain exported')
  const bindings = faces.split(',').map((name) => name.trim()).filter(Boolean)
  assert.deepEqual(bindings, imports.map((match) => match[1]))
  const credits = JSON.parse(read('assets/refresh/credits.json'))
  const hashes = new Set()
  for (const [, , path] of imports) {
    const bytes = checkWebP(path, 640, 640, 150_000)
    hashes.add(createHash('sha256').update(bytes).digest('hex'))
    const credit = credits.assets.find((entry) => entry.path === path.slice(2))
    assert.ok(credit?.description, `missing credit for ${path}`)
    if (credit.sourceType === 'review-attachment') {
      assert.match(credit.sourcePage, /^https:\/\/github\.com\/juicybear44\/reboot\/pull\/34#discussion_r\d+$/)
      assert.match(credit.sourceImage, /^https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+$/)
    } else {
      assert.match(credit.sourcePage, /^https:\/\/www\.backtothefuture\.com\/movies\//)
      assert.match(credit.sourceImage, /^https:\/\/(static1\.squarespace\.com|images\.squarespace-cdn\.com)\//)
    }
  }
  assert.equal(hashes.size, 12, 'each pair must use different artwork')
})

test('all eight reviewed slots use the exact supplied attachment sources without cropping', () => {
  const requested = {
    'biff-tannen': '104f7c2e-ba85-4271-bdef-2b97d07246d7',
    'marty-goggles': '8eca3def-58e6-4a64-8636-a098004f5118',
    'western-showdown': '606716bd-22da-43b0-ab83-87d6de7b7c84',
    'time-train': '415e7abd-89f6-42c9-b5c7-fbc986ff0c04',
    'marty-guitar': 'b72e7479-4b16-49e7-bdf8-3c01c58a5863',
    'hoverboard': '8823b2d6-f16c-491f-891c-346f54e3103e',
    'doc-clock': '2b3e86c5-e784-4b29-8b98-3b703785c4ea',
    'flying-delorean': '85f21d25-1878-4a04-8a09-84273abf90fd',
  }
  const credits = JSON.parse(read('assets/refresh/credits.json'))
  assert.equal(credits.assets.filter((entry) => entry.sourceType === 'review-attachment').length, 8)
  for (const [name, id] of Object.entries(requested)) {
    const path = `assets/refresh/${name}.webp`
    const credit = credits.assets.find((entry) => entry.path === path)
    assert.equal(credit.sourceImage, `https://github.com/user-attachments/assets/${id}`)
    assert.match(credit.sourcePage, /^https:\/\/github\.com\/juicybear44\/reboot\/pull\/34#discussion_r\d+$/)
    assert.equal(credit.fit, 'contain')
    assert.equal(credit.watermarksPreserved, true)
    assert.match(credit.sourceSha256, /^[a-f0-9]{64}$/)
    assert.equal(createHash('sha256').update(read(path)).digest('hex'), credit.outputSha256)
  }
  const css = read('MemoryGame.module.css').toString()
  const front = css.match(/\.front\s*\{([^}]+)\}/)?.[1]
  assert.match(front ?? '', /object-fit:\s*contain/)
})

test('the new backdrop and readability overlay stay scoped to the embedded game', () => {
  checkWebP('assets/refresh/clock-tower-night.webp', 1920, 1080, 500_000)
  const css = read('MemoryGame.module.css').toString()
  const root = css.match(/\.root\s*\{([^}]+)\}/)?.[1]
  assert.match(root ?? '', /background:\s*linear-gradient\([\s\S]*url\("\.\/assets\/refresh\/clock-tower-night\.webp"\)/)
  assert.doesNotMatch(css, /wallpaper\.jpg/)
  assert.doesNotMatch(css, /(?:^|\n)\s*(?:body|:root|#root)\s*\{/)
  assert.match(css, /@container\s*\(max-aspect-ratio:\s*1\/1\)/)
})
