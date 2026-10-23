import React from 'react';
import { useApp } from '../context/AppContext';
import { JsonViewer } from './JsonViewer';
import { Clock, HardDrive, AlertTriangle, Send, X, Columns2, Rows2 } from 'lucide-react';

export const ResponsePane: React.FC = () => {
  const {
    activeTab,
    sendActiveRequest,
    setIsResponseOpen,
    responseLayout,
    toggleResponseLayout,
  } = useApp();

  if (!activeTab) {
    return null;
  }

  const { response, isLoading } = activeTab;

  const getStatusClass = (status: number) => {
    if (status >= 200 && status < 300) return 'status-2xx';
    if (status >= 300 && status < 400) return 'status-3xx';
    if (status >= 400 && status < 500) return 'status-4xx';
    return 'status-5xx';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-primary)',
        borderLeft: responseLayout === 'right' ? '1px solid var(--border-color)' : 'none',
        borderTop: responseLayout === 'bottom' ? '1px solid var(--border-color)' : 'none',
        padding: '12px 16px',
        overflow: 'hidden',
      }}
    >
      {/* Response Header Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          minHeight: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            RESPONSE
          </span>

          {response && !isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Status Code */}
              <span
                className={`font-mono ${getStatusClass(response.status)}`}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {response.status ? `${response.status} ${response.statusText}` : 'Error'}
              </span>

              {/* Time */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                <Clock size={12} />
                {response.time} ms
              </span>

              {/* Size */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                <HardDrive size={12} />
                {formatBytes(response.size)}
              </span>
            </div>
          )}
        </div>

        {/* Right action controls: Timestamp, Position Toggle, Close button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {response && response.timestamp && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {new Date(response.timestamp).toLocaleTimeString()}
            </span>
          )}

          {/* Position Layout Switcher: Right vs Bottom */}
          <button
            type="button"
            onClick={toggleResponseLayout}
            title={responseLayout === 'right' ? 'Dock Response to Bottom' : 'Dock Response to Right'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 500,
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            {responseLayout === 'right' ? <Rows2 size={12} /> : <Columns2 size={12} />}
            <span>{responseLayout === 'right' ? 'Bottom' : 'Right'}</span>
          </button>

          {/* Close Response Pane */}
          <button
            type="button"
            onClick={() => setIsResponseOpen(false)}
            title="Close response panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Response Body Area */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--accent-blue)',
                borderRadius: '50%',
              }}
              className="animate-spin"
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Sending request...
            </span>
          </div>
        ) : response ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {response.error ? (
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--accent-rose)',
                  borderRadius: '6px',
                  color: 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Network Error</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                    {response.error}
                  </div>
                </div>
              </div>
            ) : (
              <JsonViewer data={response.body} contentType={response.contentType} />
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: 'var(--text-muted)',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}
            >
              <Send size={18} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No Response Yet
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[11px] border border-zinc-700">Ctrl + Enter</kbd> or click <b>Send</b> to execute this request.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
