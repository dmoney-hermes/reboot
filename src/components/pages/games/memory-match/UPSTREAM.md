# Memory Match upstream source

The embedded game is copied from `svhong/memorymatch`, directory
`src/memory-match`, on its `memory_ang` branch.

Last synchronized revision: `8d12eaa6f002594ba2938a07409e0507ecd559fb`
(the merge of upstream PR #11, the artwork/background refresh).

This update brings in all 12 refreshed local WebP card faces, the clock-tower
background, and the source-credit manifest. Production component files and assets
match that revision byte-for-byte. Upstream Vitest files are not copied because
Reboot does not use that test runner; run `npm run test:memory-match` for the
zero-dependency artwork/integration regression checks.

The surrounding `../MemoryMatch.jsx` route wrapper stays owned by Reboot and is
not replaced. Assets continue to use bundler imports, and the background is
scoped to the component's CSS Module so it does not affect the navigation or host
page. No runtime hotlinks or additional npm dependencies are introduced.

Image source URLs and rights notes are in `assets/refresh/credits.json`.
Attribution is not a license; the movie imagery remains copyrighted by its
respective rights holders and is not represented as openly licensed.
