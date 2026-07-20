import './AppShell.css';

export function AppShell() {
  return (
    <div className="app-shell">
      {/* Titlebar */}
      <div className="titlebar">
        <div className="titlebar-left">
          <div className="titlebar-logo">🤖 BOB IDE</div>
          <div className="titlebar-workspace">
            <span className="workspace-owner">owner</span>
            <span className="workspace-separator">/</span>
            <span className="workspace-name">repo</span>
          </div>
        </div>
        <div className="titlebar-center">
          <input 
            type="text" 
            className="command-field" 
            placeholder="Search files, commands, symbols..."
          />
        </div>
        <div className="titlebar-right">
          <div className="status-badge">Web Mode</div>
          <div className="status-badge">WebLLM</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn">←</button>
          <button className="toolbar-btn">→</button>
          <select className="toolbar-select">
            <option>main</option>
          </select>
        </div>
        <div className="toolbar-center">
          <div className="breadcrumb">src / App.tsx</div>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn">▶ Run</button>
          <button className="toolbar-btn">Split</button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="workspace">
        {/* Activity Rail */}
        <div className="activity-rail">
          <button className="activity-item active" title="Explorer">📁</button>
          <button className="activity-item" title="Search">🔍</button>
          <button className="activity-item" title="Source Control">🌿</button>
          <button className="activity-item" title="Agents">🤖</button>
          <button className="activity-item" title="GitHub">🐙</button>
        </div>

        {/* Primary Sidebar */}
        <div className="primary-sidebar">
          <div className="sidebar-header">
            <h3>EXPLORER</h3>
            <div className="sidebar-actions">
              <button>+</button>
              <button>⟳</button>
            </div>
          </div>
          <div className="sidebar-content">
            <div className="file-tree">
              <div className="tree-item">📁 src</div>
              <div className="tree-item indent">📄 App.tsx</div>
              <div className="tree-item indent">📄 main.tsx</div>
              <div className="tree-item">📄 package.json</div>
              <div className="tree-item">📄 README.md</div>
            </div>
          </div>
        </div>

        {/* Editor Stage */}
        <div className="editor-stage">
          <div className="editor-tabs">
            <div className="editor-tab active">
              <span>App.tsx</span>
              <button className="tab-close">×</button>
            </div>
          </div>
          <div className="editor-content">
            <div className="editor-placeholder">
              <div className="placeholder-icon">📝</div>
              <div className="placeholder-text">Monaco Editor will load here</div>
              <div className="placeholder-hint">Open a file to start editing</div>
            </div>
          </div>
        </div>

        {/* Agent Panel */}
        <div className="agent-panel">
          <div className="panel-header">
            <h3>🤖 BOB Agent</h3>
            <div className="panel-actions">
              <button>⚙️</button>
              <button>−</button>
            </div>
          </div>
          <div className="chat-messages">
            <div className="chat-message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <p><strong>BOB IDE Ready</strong></p>
                <p>I can help you with:</p>
                <ul>
                  <li>Code analysis and refactoring</li>
                  <li>Bug fixes and improvements</li>
                  <li>Documentation generation</li>
                  <li>Test creation</li>
                </ul>
                <p>What would you like to work on?</p>
              </div>
            </div>
          </div>
          <div className="chat-composer">
            <textarea 
              className="chat-input" 
              placeholder="Ask BOB to inspect, build, fix, test, or explain..."
              rows={3}
            />
            <div className="composer-actions">
              <button className="composer-btn">📎</button>
              <button className="composer-btn">@</button>
              <button className="composer-btn primary">Send</button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span>main</span>
          <span>•</span>
          <span>TypeScript</span>
        </div>
        <div className="status-right">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
