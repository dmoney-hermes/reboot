# Memory Match upstream source

The embedded game is copied from `svhong/memorymatch`, directory
`src/memory-match`, on its `memory_ang` branch.

Last synchronized revision: `8d12eaa6f002594ba2938a07409e0507ecd559fb`
(the merge of upstream PR #11, the artwork/background refresh).

This sync brings in local WebP card faces, the clock-tower background, and the
source-credit manifest. Eight card faces were subsequently replaced with the
specific attachments selected in PR #34's review; they are intentional local
overrides, not byte-for-byte copies of the upstream artwork. Each attachment is
fitted proportionally without cropping, with any watermark/credit preserved.
Card fronts use `object-fit: contain` to keep the complete image visible in both
wide and tall game boxes. The original filenames are stable matching-slot IDs;
the descriptions in the credit manifest identify the current subjects.

Upstream Vitest files are not copied because Reboot does not use that test runner;
run `npm run test:memory-match` for the zero-dependency artwork/integration checks,
including all eight requested attachment URLs and their recorded image hashes.

The surrounding `../MemoryMatch.jsx` route wrapper stays owned by Reboot and is
not replaced. Assets continue to use bundler imports, and the background is
scoped to the component's CSS Module so it does not affect the navigation or host
page. No runtime hotlinks or additional npm dependencies are introduced.

Image source URLs and rights notes are in `assets/refresh/credits.json`.
Attribution is not a license; the movie imagery remains copyrighted by its
respective rights holders and is not represented as openly licensed.
