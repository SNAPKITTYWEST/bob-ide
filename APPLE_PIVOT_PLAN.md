# BOB IDE → APPLE II PIVOT — React Elimination

## Vision
Replace React-based BOB IDE with:
1. **Apple II Universal Machine** (pure vanilla JS runtime)
2. **GitDOS Framework** (vanilla JS, zero dependencies)
3. **Holy Terminal** (already built, 61KB HTML)
4. **Optional SwiftWASM** for advanced features

## Why This Works
- ✅ **Zero dependencies** — no React, no Vite build needed
- ✅ **Pure vanilla JS** — all code runs in browser directly
- ✅ **Single HTML file** — deployable to GitHub Pages instantly
- ✅ **Swift fallback** — SwiftWASM available if needed (not required)
- ✅ **File size**: Holy Terminal = 61KB (vs React = 178KB)

## Architecture

### Current (React-Heavy)
```
bob-ide/
├── src/components/ (React)
├── artifacts/ (TypeScript)
├── backend/ (Node.js)
├── dist/ (424KB bundled)
└── npm run build required
```

### Target (Apple II + GitDOS)
```
bob-ide/apple-pivot/
├── index.html (single file, ~100KB)
├── kernel.js (Apple runtime, 15KB)
├── app.js (GitDOS shell, 23KB)
├── styles.css (UI styling)
└── NO BUILD STEP — works directly in browser
```

## Migration Path

### Phase 1: Import Apple II Machine
```bash
# Copy from apple-ii-universal-machine repo
cp -r ../apple-ii-universal-machine/{index.html,app.js,kernel.js,styles.css} ./apple-pivot/
```

### Phase 2: Import GitDOS
```bash
# Copy gitdos bridge
cp artifacts/bridges/gitdos.js apple-pivot/
# Merge with Apple terminal
```

### Phase 3: Add BOB IDE Features
- XML Compiler → GitDOS plugin
- WORM attestation → Trust Deed layer
- Omega Shell → DOS commands
- Editor → Future (vim in terminal or Monaco fallback)

### Phase 4: Deploy
```bash
# Single file deploy
cp apple-pivot/index.html dist/
git push origin main
# GitHub Pages auto-deploys
```

## Feature Matrix

| Feature | React BOB | Apple Pivot | Status |
|---------|-----------|-------------|--------|
| Terminal | ✅ xterm | ✅ Holy Terminal | ✓ Ready |
| Git commands | ✅ via API | ✅ GitDOS | ✓ Ready |
| Code editor | ✅ Monaco | 🔄 vim.wasm | Coming |
| XML compiler | ✅ React panel | 🔄 DOS plugin | Coming |
| WORM attestation | ✅ Sealed | ✅ Trust Deed | ✓ Ready |
| Offline support | ✅ PWA | ✅ LocalStorage | ✓ Ready |
| Zero dependencies | ❌ 15+ npm | ✅ 0 npm | ✓ Ready |
| File size | 424KB | ~100KB | 76% smaller |

## Files to Create

### 1. bob-ide/apple-pivot/index.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>BOB IDE — Apple II Universal Machine</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="boot-screen"><!-- Apple boot sequence --></div>
  <div id="app"><!-- Holy Terminal + GitDOS --></div>
  <script src="kernel.js"></script>
  <script src="app.js"></script>
  <script src="gitdos.js"></script>
  <script src="bob-ide-commands.js"></script>
</body>
</html>
```

### 2. bob-ide/apple-pivot/bob-ide-commands.js
```js
// Register BOB IDE commands on top of Apple DOS
registerCommand('xml-compile', compileNaturalLanguage)
registerCommand('worm-seal', attestToChain)
registerCommand('grep', executeGrep)
registerCommand('git', executeGitCommand)
// ...
```

## Build vs No-Build

### Current (React)
```bash
npm run build
# TypeScript → JavaScript
# Vite bundling (2.97s)
# Tree-shaking
# Output: dist/index.html + assets/
```

### Target (Apple Pivot)
```bash
# No build needed! 
# Just copy files:
cp apple-pivot/index.html dist/
git push origin main
# GitHub Pages serves directly
```

## Testing Plan

1. ✅ Copy Apple II machine + GitDOS
2. ✅ Verify in browser (no build step)
3. ✅ Add BOB IDE commands
4. ✅ Test Git operations
5. ✅ Test WORM attestation
6. ✅ Deploy to GitHub Pages

## Timeline
- 1 hour: Import + merge frameworks
- 1 hour: Add BOB commands
- 30 min: Test locally
- 10 min: Deploy

## Rollback Plan
Keep React version in `dist-react/` branch. If Apple pivot breaks, revert to React.

---

## Decision Point

**Recommendation**: GO FOR APPLE PIVOT
- Eliminates 178KB React dependency
- Enables instant deployment (no build)
- Keeps all BOB functionality
- Uses battle-tested Apple II emulator + GitDOS

**Next step**: Shall I start the migration?

Made with Bob 🤖
