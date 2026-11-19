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
    assert.match(credit.sourcePage, /^https:\/\/www\.backtothefuture\.com\/movies\//)
    assert.match(credit.sourceImage, /^https:\/\/(static1\.squarespace\.com|images\.squarespace-cdn\.com)\//)
  }
  assert.equal(hashes.size, 12, 'each pair must use different artwork')
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
