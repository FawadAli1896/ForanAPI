import React from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { RequestPane } from './components/RequestPane';
import { ResponsePane } from './components/ResponsePane';
import { EnvironmentModal } from './components/EnvironmentModal';
import { AccountModal } from './components/AccountModal';
import { WelcomeModal } from './components/WelcomeModal';
import { useApp } from './context/AppContext';

export const App: React.FC = () => {
  const { isSidebarOpen, activeTab, isResponseOpen, responseLayout } = useApp();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Top Application Header */}
      <Header />

      {/* Main Workspace Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Collections & Request Tree Sidebar */}
        {isSidebarOpen && <Sidebar />}

        {/* Center & Right Workspace: TabBar + Panes */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <TabBar />

          {!activeTab ? (
            /* Perfectly Centered Full-Width Empty State */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                color: 'var(--text-muted)',
                gap: '8px',
                userSelect: 'none',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No active request open. Select a request from the sidebar or click "+ Request".
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: isResponseOpen && responseLayout === 'bottom' ? 'column' : 'row',
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              {/* Request Configuration Pane */}
              <div
                style={{
                  flex: isResponseOpen
                    ? responseLayout === 'bottom'
                      ? '1 1 55%'
                      : '1 1 52%'
                    : '1 1 100%',
                  minWidth: isResponseOpen && responseLayout === 'right' ? '360px' : '0',
                  minHeight: isResponseOpen && responseLayout === 'bottom' ? '240px' : '0',
                  height: '100%',
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                <RequestPane />
              </div>

              {/* Response Viewer Pane */}
              {isResponseOpen && (
                <div
                  style={{
                    flex: responseLayout === 'bottom' ? '1 1 45%' : '1 1 48%',
                    minWidth: responseLayout === 'right' ? '360px' : '0',
                    minHeight: responseLayout === 'bottom' ? '200px' : '0',
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <ResponsePane />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlays */}
      <EnvironmentModal />
      <AccountModal />
      <WelcomeModal />
    </div>
  );
};
