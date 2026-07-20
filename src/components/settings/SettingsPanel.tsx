import { useState } from 'react';
import { useSettingsStore } from '../../stores/settings.store';
import './SettingsPanel.css';

export function SettingsPanel() {
  const {
    aiProvider,
    openRouterApiKey,
    ollamaBaseUrl,
    openRouterModel,
    ollamaModel,
    theme,
    fontSize,
    tabSize,
    wordWrap,
    setAIProvider,
    setOpenRouterApiKey,
    setOllamaBaseUrl,
    setOpenRouterModel,
    setOllamaModel,
    setTheme,
    setFontSize,
    setTabSize,
    setWordWrap,
    clearApiKeys,
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
      </div>

      <div className="settings-content">
        {/* AI Provider Section */}
        <section className="settings-section">
          <h3>AI Provider</h3>
          
          <div className="setting-item">
            <label>Provider</label>
            <select value={aiProvider} onChange={(e) => setAIProvider(e.target.value as any)}>
              <option value="webllm">WebLLM (Browser-Native)</option>
              <option value="openrouter">OpenRouter (Cloud API)</option>
              <option value="ollama">Ollama (Local API)</option>
            </select>
            <p className="setting-description">
              {aiProvider === 'webllm' && '🌐 Runs entirely in your browser using WebGPU. No API key needed.'}
              {aiProvider === 'openrouter' && '☁️ Cloud-based API with access to multiple models. Requires API key.'}
              {aiProvider === 'ollama' && '🏠 Local API server. Run models on your own machine.'}
            </p>
          </div>

          {/* OpenRouter Settings */}
          {aiProvider === 'openrouter' && (
            <>
              <div className="setting-item">
                <label>OpenRouter API Key</label>
                <div className="api-key-input">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={openRouterApiKey}
                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                  />
                  <button onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="setting-description">
                  Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a>
                </p>
              </div>

              <div className="setting-item">
                <label>Model</label>
                <select value={openRouterModel} onChange={(e) => setOpenRouterModel(e.target.value)}>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                  <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="openai/gpt-4">GPT-4</option>
                  <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
                  <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                </select>
              </div>
            </>
          )}

          {/* Ollama Settings */}
          {aiProvider === 'ollama' && (
            <>
              <div className="setting-item">
                <label>Ollama Base URL</label>
                <input
                  type="text"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <p className="setting-description">
                  Make sure Ollama is running locally. <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer">Download Ollama</a>
                </p>
              </div>

              <div className="setting-item">
                <label>Model</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2"
                />
                <p className="setting-description">
                  Model name from <code>ollama list</code>
                </p>
              </div>
            </>
          )}
        </section>

        {/* Appearance Section */}
        <section className="settings-section">
          <h3>Appearance</h3>
          
          <div className="setting-item">
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </section>

        {/* Editor Section */}
        <section className="settings-section">
          <h3>Editor</h3>
          
          <div className="setting-item">
            <label>Font Size</label>
            <input
              type="number"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>Tab Size</label>
            <input
              type="number"
              min="2"
              max="8"
              value={tabSize}
              onChange={(e) => setTabSize(Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
              />
              Word Wrap
            </label>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-section danger-zone">
          <h3>⚠️ Danger Zone</h3>
          
          <div className="setting-item">
            <button className="danger-button" onClick={clearApiKeys}>
              Clear All API Keys
            </button>
            <p className="setting-description">
              This will remove all stored API keys from your browser.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// Made with Bob
