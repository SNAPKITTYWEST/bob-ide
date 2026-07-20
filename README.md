# BOB IDE

**Sovereign browser-native AI coding environment. No server. No install. Just open it.**

[![Live](https://img.shields.io/badge/Live-GitHub%20Pages-brightgreen)](https://snapkittywest.github.io/bob-ide/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## What it is

BOB IDE is a full coding environment that runs entirely in your browser. Monaco editor (same engine as VS Code), three AI providers to choose from, and a terminal — all as a static page deployed on GitHub Pages.

**Live:** https://snapkittywest.github.io/bob-ide/

---

## AI Providers

| Provider | How it works | Setup |
|----------|-------------|-------|
| **WebLLM** | Llama 3.2 1B runs in your GPU via WebGPU | None — works out of the box |
| **OpenRouter** | Claude, GPT-4, Llama via cloud API | Paste your key in Settings |
| **Ollama** | Any local model via Ollama server | Run `ollama serve` locally |

Switch providers anytime in the Settings panel (⚙️). API keys stay in your browser, never sent anywhere else.

---

## Features

- Monaco editor — full VS Code experience (syntax highlighting, IntelliSense, multi-tab)
- Multi-provider AI chat — ask the model about your code
- 7 state stores (workspace, editor, agent, model, github, terminal, settings)
- PWA — installable, works offline after first load
- GitHub Pages deploy via GitHub Actions
- Apple-inspired UI design system

---

## Stack

- React 18 + TypeScript
- Monaco Editor
- WebLLM (@mlc-ai/web-llm) for in-browser inference
- Zustand for state
- Vite + PWA plugin
- GitHub Actions for deploy

---

## Run locally

```bash
git clone https://github.com/SNAPKITTYWEST/bob-ide.git
cd bob-ide
npm install
npm run dev
```

Open http://localhost:5173

---

## Deploy your own

1. Fork this repo
2. Settings → Pages → Source: GitHub Actions
3. Push anything to `main` — it deploys automatically

---

## License

MIT — see [LICENSE](LICENSE)

Built by Jessica (SNAPKITTYWEST)
