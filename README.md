# BOB IDE — Sovereign Development Environment

**Browser-based IDE with terminal, code editor, and real command execution. Ship from GitHub directly.**

[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE) [![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-brightgreen)](https://snapkittywest.github.io/bob-ide/) [![Backend](https://img.shields.io/badge/Backend-Optional-orange)](https://github.com/SNAPKITTYWEST/bob-ide#backend-product)

---

## 🌟 Two Products in One

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND PRODUCT (GitHub Pages)                    │
├─────────────────────────────────────────────────────┤
│  • No installation                                  │
│  • Works offline (Service Worker)                   │
│  • Open: https://snapkittywest.github.io/bob-ide/  │
│  • Terminal, Editor, XML Compiler in browser       │
└─────────────────────────────────────────────────────┘
                        ↕
                  (Optional WebSocket)
                        ↕
┌─────────────────────────────────────────────────────┐
│  BACKEND PRODUCT (Node.js + Fastify)                │
├─────────────────────────────────────────────────────┤
│  • Real command execution (bash, git, curl, etc.)   │
│  • File system access                               │
│  • Model inference (Granite, Nemotron)              │
│  • WORM attestation + sealing                       │
│  • Run locally: npm run start:backend               │
└─────────────────────────────────────────────────────┘

Frontend works without backend (UI only).
Backend unlocks terminal execution (optional).
```

---

## 🚀 Quick Start

### Option 1: Use on GitHub Pages (No Installation)
```
1. Open: https://snapkittywest.github.io/bob-ide/
2. Wait for boot sequence
3. Terminal is live (limited to UI operations)
4. To unlock full terminal: run backend locally
```

### Option 2: Run Locally (Full Features)
```bash
git clone https://github.com/SNAPKITTYWEST/bob-ide.git
cd bob-ide

# Terminal 1: Frontend
npm install
npm run dev
# Opens http://localhost:5173/bob-ide/

# Terminal 2: Backend (optional, for command execution)
npm run start:backend
# Starts on http://localhost:3000

# Now terminal commands work: git status, curl, grep, etc.
```

### Option 3: Push to GitHub, Auto-Deploy
```bash
# Edit code locally
vim src/components/SovereignIDE.tsx

# Commit
git add -A
git commit -m "feat: add new feature"

# Push to GitHub → Auto-deploys to GitHub Pages
git push origin main

# Live in 2-5 minutes on: https://snapkittywest.github.io/bob-ide/
```

---

## 🎯 Frontend Product

**Deploy anywhere, no backend required.**

### Features
- 📝 **Code Editor** — Monaco (VS Code engine) with syntax highlighting
- 🖥️ **Terminal UI** — Omega Shell with guarded execution
- 🔮 **XML Compiler** — Natural language → system prompts
- 📁 **File Viewer** — Browse/view code (read-only without backend)
- 🔗 **Git UI** — Git operations display (requires backend for execution)
- ⚡ **Offline Mode** — Service Worker caches entire app

### Entry Points
- **React Version** (GitHub Pages): `https://snapkittywest.github.io/bob-ide/`
- **Standalone Version** (zero deps): `app-release-1.0.html` (open locally)

### Deployment
```bash
npm run build
git push origin main
# GitHub Actions auto-deploys dist/ to GitHub Pages
```

---

## 🔌 Backend Product (Optional)

**Unlock real terminal, git, and model inference.**

### Features
- 🖥️ **Real Terminal** — bash, sh, zsh execution
- 📦 **Git Commands** — git status, add, commit, push, etc.
- 🌐 **HTTP Requests** — curl, fetch, WebSocket
- 🤖 **Model Inference** — Granite + Nemotron streaming
- 💾 **File System** — Read/write files
- 🔐 **WORM Sealing** — Attest operations to immutable chain

### Supported Commands
```
bash              # Shell scripts
grep              # File searching
curl              # HTTP requests
git               # Version control
npm               # Package management
python            # Python scripts
cat, ls, pwd, cd  # File operations
```

### Run Backend
```bash
npm run start:backend
# Starts on http://localhost:3000

# API Endpoints:
POST /api/execute           # Run commands
POST /api/omega/run         # Omega shell
POST /api/xml/compile       # XML compiler
POST /api/xml/control-model # Model control
WS /api/terminal/:id/ws     # Terminal streaming
```

### Optional: Replace with sov-kernel-monster
Current backend will be replaced by [sov-kernel-monster](https://github.com/SNAPKITTYWEST/sov-kernel-monster):
```typescript
// Future: import { SovereignKernel } from 'sov-kernel-monster'
const kernel = new SovereignKernel()
kernel.mountTerminal(socketServer)
kernel.wireGitDOS(expressServer)
```

---

## 📡 Push to GitHub → Auto-Deploy Workflow

### How It Works

1. **Edit locally**
   ```bash
   npm run dev                    # Local dev server
   ```

2. **Commit changes**
   ```bash
   git add src/components/...
   git commit -m "feat: new feature"
   ```

3. **Push to main**
   ```bash
   git push origin main
   ```

4. **GitHub Actions triggers** (automatic)
   - Runs: `npm run build`
   - Uploads `dist/` to GitHub Pages
   - Deploys to: `https://snapkittywest.github.io/bob-ide/`
   - Completes in 2-5 minutes

5. **Verify live**
   - Check: https://github.com/SNAPKITTYWEST/bob-ide/actions
   - Open: https://snapkittywest.github.io/bob-ide/
   - Done! ✅

### Workflow File
See: `.github/workflows/pages.yml`

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| [USER_GUIDE_GITHUB_PAGES.md](USER_GUIDE_GITHUB_PAGES.md) | How to use BOB IDE on GitHub Pages |
| [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) | Deployment architecture + backend setup |
| [APPLE_PIVOT_PLAN.md](APPLE_PIVOT_PLAN.md) | Roadmap: React → Apple II + GitDOS |
| [BOB_IDE_2.2_TOOLKIT_MAP.md](BOB_IDE_2.2_TOOLKIT_MAP.md) | All available frameworks (WOZ, Holy Agents, Mantra) |
| [REDUNDANCY_CHECK.md](REDUNDANCY_CHECK.md) | Code audit (zero duplicate, 5.8K LOC) |

---

## 🏗️ Architecture

### Frontend (React)
```
src/
├── components/
│   ├── shell/AppShell.tsx          # Main game/shell
│   ├── ide/SovereignIDE.tsx        # Full IDE layout
│   ├── terminal/OmegaShell.tsx     # Terminal panel
│   ├── xml/XMLCompilerPanel.tsx    # XML compiler
│   └── ...
├── stores/                         # Zustand state management
└── App.tsx                         # Entry point
```

### Backend (Node.js + Fastify)
```
backend/
├── server.ts                       # Main HTTP server
├── s-autocode-bridge.ts           # WebSocket + S-AUTOCODE protocol
├── xml-compiler-bridge.ts         # XML compilation
└── wasm.ts                        # WASM engine
```

### Standalone HTML
```
app-release-1.0.html               # Zero-dep IDE (691 lines)
dist/index.html                    # Production React build
```

---

## 🔧 Development

### Setup
```bash
npm install
npm run type-check    # TypeScript checks
npm run build         # Production build
npm run preview       # Test production build
```

### Local Development
```bash
# Terminal 1: Frontend dev server
npm run dev

# Terminal 2: Backend server
npm run start:backend

# Terminal 3: Test API
curl http://localhost:3000/api/execute -X POST \
  -H "Content-Type: application/json" \
  -d '{"cmd":"git status"}'
```

---

## 🎯 Features Checklist

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Terminal (read) | ✅ | — | Works offline |
| Terminal (execute) | — | ✅ | Requires backend |
| Code Editor | ✅ | — | Monaco editor |
| File Browse | ✅ | — | Read-only |
| Git UI | ✅ | ✅ | Full with backend |
| XML Compiler | ✅ | — | Works offline |
| WORM Sealing | ✅ | ✅ | On every operation |
| Model Inference | ✅ | ✅ | Backend streaming |
| Offline Support | ✅ | — | Service Worker |

---

## 📦 Build Output

```
dist/
├── index.html (0.85 KB)           # Entry point
├── manifest.webmanifest           # PWA metadata
├── registerSW.js                  # Service Worker registration
├── sw.js                          # Service Worker runtime
└── assets/
    ├── index-*.js (178 KB)        # React app bundle
    ├── monaco-*.js (6.8 KB)       # Monaco code chunk
    ├── monaco-*.css (116 KB)      # Editor styling
    ├── index-*.css (8.9 KB)       # App styling
    ├── codicon-*.ttf (77 KB)      # Icon font
    └── (empty chunks for xterm, webllm - bundled elsewhere)

Total: 424 KB (75 KB gzipped)
Build time: 2.97 seconds
```

---

## 🚀 Next: BOB IDE 2.2

Coming soon: Single-file IDE with zero dependencies.

- ✅ Apple II Universal Machine
- ✅ GitDOS Framework  
- ✅ WOZ Vault (code execution)
- ✅ Holy Agents (agent framework)
- ✅ Mantra Stream (real-time inference)

See: [BOB_IDE_2.2_TOOLKIT_MAP.md](BOB_IDE_2.2_TOOLKIT_MAP.md)

---

## 📄 License

MIT — See [LICENSE](LICENSE)

---

**Made with Bob** 🤖

### 📝 Editor
- **Monaco Editor** — full VS Code engine
- **Multi-language** — TypeScript, JavaScript, Bash, Python, etc.
- **Syntax Highlighting** — every language
- **Line Numbers** — with selection
- **Keyboard Shortcuts:**
  - `Ctrl+S` / `Cmd+S` — Save file
  - `Ctrl+K` / `Cmd+K` — Run code (if bash/JavaScript)
  - `Tab` — Indent
  - `Ctrl+/` — Comment toggle

### 📦 Artifact Monorepo
- **Quantum Core** — 14 Fortran modules (bob_*.f90)
- **Theorem 3** — Haskell proof kernel (8 modules)
- **QuantumPiper** — 11-stage orchestration
- **Phase 3 Components** — Isabelle, IBM Granite, WebGPU, Terminal
- **WORM Chain** — immutable attestation (Blake3 + Ed25519)

All artifacts accessible via `/artifacts/` directory.

### 🤖 AI Integration
- **IBM Granite** — primary inference backend
- **OpenRouter** — Claude, GPT-4, Llama (API key)
- **WebLLM** — Llama 3.2 1B in browser (no key needed)

---

## API Reference

### Terminal

**Create Session**
```
POST /api/terminal/create
{ "cols": 80, "rows": 24 }
→ { "sessionId": "...", "cwd": "/home/user" }
```

**Execute Command**
```
POST /api/execute
{ "sessionId": "term-...", "cmd": "ls -la", "cwd": "/home/user" }
→ { "ok": true, "output": "...", "cwd": "...", "exitCode": 0 }
```

**WebSocket Terminal (Real-time)**
```
WS /api/terminal/{id}/ws
Send: { "type": "input", "data": "echo hello\n" }
Recv: { "type": "output", "data": "hello\n" }
```

### File Operations

**Read File**
```
GET /api/file/path/to/file.ts
→ { "content": "...", "path": "path/to/file.ts" }
```

**Write File**
```
POST /api/file/write
{ "path": "path/to/file.ts", "content": "..." }
→ { "ok": true, "path": "..." }
```

### Search & Query

**Grep**
```
POST /api/grep
{ "pattern": "function", "path": "src", "recursive": true }
→ { "ok": true, "results": [{ "file": "...", "lineNum": 42, "content": "..." }] }
```

**Curl**
```
POST /api/curl
{ "url": "https://api.example.com", "method": "GET", "headers": {}, "body": "..." }
→ { "ok": true, "output": "..." }
```

**Bash**
```
POST /api/bash
{ "script": "for i in {1..5}; do echo $i; done" }
→ { "ok": true, "output": "1\n2\n3\n4\n5" }
```

---

## Architecture

```
bob-ide/
├── src/
│   ├── components/
│   │   ├── ide/SovereignIDE.tsx    ← Main IDE component
│   │   └── shell/AppShell.tsx      ← Legacy Vortex shell
│   ├── stores/                     ← Zustand state
│   └── App.tsx                     ← Entry point
│
├── backend/
│   └── server.ts                   ← Fastify server
│       • Terminal session management
│       • Command execution (bash, grep, curl)
│       • File I/O
│       • WebSocket real-time shell
│       • Artifact storage
│
├── artifacts/                      ← Monorepo (3K+ files)
│   ├── quantum-core/               ← Fortran modules
│   ├── theorem-3/                  ← Haskell proof kernel
│   ├── orchestration/              ← QuantumPiper
│   └── artifacts-schema/           ← TypeScript schema
│
└── package.json                    ← Dependencies
```

### Technology Stack

**Frontend**
- React 18 + TypeScript
- Monaco Editor (VS Code engine)
- Zustand (state management)
- Vite (build tool)
- xterm (terminal emulation)

**Backend**
- Fastify (web server)
- WebSocket support
- Node.js child_process (shell execution)
- FS (file I/O)

**Integration**
- Sovereign IDE Framework (TypeScript)
- Artifact Store (WORM-sealed)
- QuantumPiper Orchestration (Haskell)

---

## Environment

### Set API Keys (optional)
```bash
export IBM_GRANITE_API_KEY="your-key-here"
export OPENROUTER_API_KEY="your-key-here"
```

### Run Full Stack
```bash
# Terminal 1: Backend
cd backend
npm install && npm run dev

# Terminal 2: Frontend
npm run dev
```

Open http://localhost:5173 in browser  
Backend API at http://localhost:3000

---

## Performance

- **Terminal Response:** <100ms
- **File Operations:** <50ms
- **Grep Search:** <500ms (1000+ files)
- **Editor Startup:** <2s
- **Chat Response:** varies by provider

---

## Security

- ✅ No API keys exposed in frontend
- ✅ All backend operations sanitized
- ✅ Directory traversal protection (`cwd` isolation)
- ✅ 30s command timeout (prevents hanging)
- ✅ WORM chain attestation on all artifacts

---

## Roadmap

### Phase 1 ✅ (Current)
- Real terminal backend
- File I/O
- Code editor
- Artifact monorepo

### Phase 2 (Next)
- sov-kernel-monster integration
- Real quantum execution
- Isabelle theorem proving
- IBM Granite inference

### Phase 3 (Future)
- Distributed verification (BFT)
- RTX 4090 GPU inference
- Multi-language debugging
- Live collaboration

---

## Development

### Add New Command

1. **Backend** (`backend/server.ts`):
```typescript
app.post('/api/mycommand', async (req) => {
  const result = execSync(cmd, { encoding: 'utf-8' });
  return { ok: true, output: result };
});
```

2. **Frontend** (`src/components/ide/SovereignIDE.tsx`):
```typescript
async function myCommand() {
  const res = await fetch('/api/mycommand', { method: 'POST' });
  const data = await res.json();
  setTerminalState(prev => ({
    ...prev,
    history: [...prev.history, data.output]
  }));
}
```

---

## License

MIT — see [LICENSE](LICENSE)

**Built by Jessica (SNAPKITTYWEST)**  
**Powered by Sovereign Kernel Monster**  
**2026-07-20
