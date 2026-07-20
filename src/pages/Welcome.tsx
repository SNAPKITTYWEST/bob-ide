import { useState } from 'react';
import { useWorkspaceStore } from '../stores/workspace.store';

export function Welcome() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { openWorkspace } = useWorkspaceStore();

  const handleOpenRepo = async () => {
    if (!repoUrl) return;
    
    setLoading(true);
    try {
      // Parse GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        await openWorkspace({
          owner: match[1],
          name: match[2].replace('.git', ''),
          branch: 'main',
          url: repoUrl
        });
      }
    } catch (error) {
      console.error('Failed to open repository:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-canvas)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-ui)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
          <h1 style={{ 
            fontSize: 'var(--font-32)', 
            fontFamily: 'var(--font-display)',
            marginBottom: '0.5rem'
          }}>
            BOB IDE
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-16)'
          }}>
            Sovereign Coding Environment
          </p>
        </div>

        <div style={{
          background: 'var(--bg-panel)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          backdropFilter: 'blur(32px)',
          border: '1px solid var(--border-subtle)'
        }}>
          <h2 style={{ 
            fontSize: 'var(--font-18)',
            marginBottom: '1.5rem'
          }}>
            Open GitHub Repository
          </h2>
          
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: 'var(--font-14)',
              fontFamily: 'var(--font-code)',
              background: 'var(--bg-editor)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              outline: 'none'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleOpenRepo()}
          />
          
          <button
            onClick={handleOpenRepo}
            disabled={!repoUrl || loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              fontSize: 'var(--font-14)',
              fontWeight: 600,
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: loading || !repoUrl ? 'not-allowed' : 'pointer',
              opacity: loading || !repoUrl ? 0.5 : 1,
              transition: 'all var(--duration-fast) var(--ease-standard)'
            }}
          >
            {loading ? 'Opening...' : 'Open Repository'}
          </button>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'var(--bg-panel)',
          borderRadius: 'var(--radius-md)',
          backdropFilter: 'blur(32px)',
          border: '1px solid var(--border-subtle)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--font-14)',
            marginBottom: '1rem',
            color: 'var(--text-secondary)'
          }}>
            Features
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: 'var(--font-13)',
            color: 'var(--text-secondary)'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>🧠 WebLLM - Browser-native AI</li>
            <li style={{ marginBottom: '0.5rem' }}>📝 Monaco Editor - VS Code editing</li>
            <li style={{ marginBottom: '0.5rem' }}>🔌 WebSocket Bridge - Native capabilities</li>
            <li style={{ marginBottom: '0.5rem' }}>🐙 GitHub Integration - Direct repo access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
