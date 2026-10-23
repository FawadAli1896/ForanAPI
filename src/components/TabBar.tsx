import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab, createRequest, collections } = useApp();

  const handleNewTab = () => {
    const colId = collections[0]?.id || 'default';
    createRequest(colId);
  };

  const getBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'badge-get';
      case 'POST':
        return 'badge-post';
      case 'PUT':
        return 'badge-put';
      case 'PATCH':
        return 'badge-patch';
      case 'DELETE':
        return 'badge-delete';
      default:
        return 'badge-options';
    }
  };

  return (
    <div
      style={{
        height: '36px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        overflowY: 'hidden',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 12px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                borderRight: '1px solid var(--border-color)',
                borderTop: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                maxWidth: '220px',
                minWidth: '120px',
                position: 'relative',
              }}
            >
              <span
                className={`font-mono ${getBadgeClass(tab.request.method)}`}
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 3px',
                  borderRadius: '2px',
                }}
              >
                {tab.request.method}
              </span>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}
              >
                {tab.request.name || 'Untitled'}
              </span>

              {/* Dirty indicator */}
              {tab.isDirty && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-amber)',
                    display: 'inline-block',
                  }}
                  title="Unsaved changes"
                />
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        {/* Add Tab Button */}
        <button
          type="button"
          onClick={handleNewTab}
          title="Open New Tab"
          style={{
            height: '100%',
            padding: '0 10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
