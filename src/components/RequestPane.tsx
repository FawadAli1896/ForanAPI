import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HttpMethod, KeyValuePair } from '../types';
import { KeyValueEditor } from './KeyValueEditor';
import { JsonEditor } from './JsonEditor';
import { generateCurl } from '../utils/curl';
import { resolveVariables } from '../utils/variableResolver';
import {
  Send,
  Save,
  Terminal,
  Check,
  Key,
  Shield,
  FileText,
  Sliders,
  List,
  Columns2,
} from 'lucide-react';

export const RequestPane: React.FC = () => {
  const {
    activeTab,
    updateActiveTabRequest,
    sendActiveRequest,
    saveRequest,
    activeEnvironment,
    isResponseOpen,
    toggleResponsePane,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'params' | 'headers' | 'auth' | 'body'>('params');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const req = activeTab?.request;

  // Keyboard shortcuts (Ctrl+Enter to send, Ctrl+S to save)
  useEffect(() => {
    if (!req) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sendActiveRequest();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveRequest(req);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [req, sendActiveRequest, saveRequest]);

  if (!activeTab || !req) {
    return null;
  }

  // Handle URL change & sync params
  const handleUrlChange = (newUrl: string) => {
    updateActiveTabRequest((prev) => {
      // Parse query parameters from URL if present
      const queryIdx = newUrl.indexOf('?');
      let params = [...prev.params];

      if (queryIdx !== -1) {
        const queryString = newUrl.substring(queryIdx + 1);
        const searchParams = new URLSearchParams(queryString);
        const newParams: KeyValuePair[] = [];
        searchParams.forEach((val, key) => {
          newParams.push({
            id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            key,
            value: val,
            enabled: true,
          });
        });
        if (newParams.length > 0) {
          params = newParams;
        }
      }

      return {
        ...prev,
        url: newUrl,
        params,
      };
    });
  };

  // Handle Params change & sync into URL query string
  const handleParamsChange = (newParams: KeyValuePair[]) => {
    updateActiveTabRequest((prev) => {
      let baseUrl = prev.url;
      const queryIdx = baseUrl.indexOf('?');
      if (queryIdx !== -1) {
        baseUrl = baseUrl.substring(0, queryIdx);
      }

      const enabledParams = newParams.filter((p) => p.enabled && p.key.trim());
      let fullUrl = baseUrl;
      if (enabledParams.length > 0) {
        const sp = new URLSearchParams();
        enabledParams.forEach((p) => sp.append(p.key.trim(), p.value));
        fullUrl = `${baseUrl}?${sp.toString()}`;
      }

      return {
        ...prev,
        url: fullUrl,
        params: newParams,
      };
    });
  };

  const handleCopyCurl = () => {
    const curlCommand = generateCurl(req, activeEnvironment?.variables || []);
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  const handleManualSave = () => {
    saveRequest(req);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  // Count active badges
  const activeParamsCount = req.params.filter((p) => p.enabled && p.key.trim()).length;
  const activeHeadersCount = req.headers.filter((h) => h.enabled && h.key.trim()).length;
  const hasAuth = req.auth && req.auth.type !== 'none';
  const hasBody = req.body && req.body.type !== 'none' && req.body.raw.trim().length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-primary)',
        overflowY: 'auto',
      }}
    >
      {/* Request Title & Collection Path */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <input
          type="text"
          value={req.name}
          onChange={(e) => updateActiveTabRequest((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Request Name"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            background: 'transparent',
            border: '1px solid transparent',
            color: 'var(--text-primary)',
            padding: '2px 6px',
            borderRadius: '4px',
            width: '260px',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
          onBlur={(e) => (e.target.style.borderColor = 'transparent')}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleCopyCurl}
            title="Copy as cURL"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 500,
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {copiedCurl ? <Check size={12} color="var(--accent-green)" /> : <Terminal size={12} />}
            {copiedCurl ? 'Copied' : 'cURL'}
          </button>

          <button
            type="button"
            onClick={handleManualSave}
            title="Save request (Ctrl+S)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 500,
              background: activeTab.isDirty ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab.isDirty ? 'var(--accent-amber)' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {savedSuccess ? <Check size={12} color="var(--accent-green)" /> : <Save size={12} />}
            {savedSuccess ? 'Saved!' : 'Save'}
          </button>

          {!isResponseOpen && (
            <button
              type="button"
              onClick={toggleResponsePane}
              title="Open Response Panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                background: 'var(--bg-secondary)',
                color: 'var(--accent-blue)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <Columns2 size={12} />
              Response
            </button>
          )}
        </div>
      </div>

      {/* Main Request Bar: Method + URL + Send */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          {/* Method Selector */}
          <select
            value={req.method}
            onChange={(e) =>
              updateActiveTabRequest((prev) => ({ ...prev, method: e.target.value as HttpMethod }))
            }
            className="font-mono"
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'var(--bg-tertiary)',
              border: 'none',
              borderRight: '1px solid var(--border-color)',
              color:
                req.method === 'GET'
                  ? 'var(--accent-green)'
                  : req.method === 'POST'
                  ? 'var(--accent-amber)'
                  : req.method === 'DELETE'
                  ? 'var(--accent-rose)'
                  : 'var(--accent-blue)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          {/* URL Input */}
          <input
            type="text"
            className="font-mono"
            value={req.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://api.example.com/v1/resource or {{baseUrl}}/endpoint"
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={sendActiveRequest}
          disabled={activeTab.isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'var(--accent-blue)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: activeTab.isLoading ? 'not-allowed' : 'pointer',
            opacity: activeTab.isLoading ? 0.7 : 1,
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.25)',
          }}
        >
          {activeTab.isLoading ? (
            <div
              style={{
                width: '14px',
                height: '14px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
              }}
              className="animate-spin"
            />
          ) : (
            <Send size={14} />
          )}
          Send
        </button>
      </div>

      {/* Sub-Tabs: Params, Headers, Auth, Body */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('params')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'params' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeSubTab === 'params' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <Sliders size={13} />
          Params
          {activeParamsCount > 0 && (
            <span
              style={{
                fontSize: '10px',
                background: 'var(--bg-tertiary)',
                color: 'var(--accent-blue)',
                padding: '1px 5px',
                borderRadius: '999px',
                fontWeight: 600,
              }}
            >
              {activeParamsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('headers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'headers' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeSubTab === 'headers' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <List size={13} />
          Headers
          {activeHeadersCount > 0 && (
            <span
              style={{
                fontSize: '10px',
                background: 'var(--bg-tertiary)',
                color: 'var(--accent-blue)',
                padding: '1px 5px',
                borderRadius: '999px',
                fontWeight: 600,
              }}
            >
              {activeHeadersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('auth')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'auth' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeSubTab === 'auth' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <Shield size={13} />
          Auth
          {hasAuth && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-green)',
                display: 'inline-block',
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('body')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'body' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeSubTab === 'body' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <FileText size={13} />
          Body
          {hasBody && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-amber)',
                display: 'inline-block',
              }}
            />
          )}
        </button>
      </div>

      {/* Sub-Tab Contents */}
      <div style={{ flex: 1 }}>
        {activeSubTab === 'params' && (
          <KeyValueEditor
            items={req.params}
            onChange={handleParamsChange}
            keyPlaceholder="param"
            valuePlaceholder="value"
            showDescription={true}
          />
        )}

        {activeSubTab === 'headers' && (
          <KeyValueEditor
            items={req.headers}
            onChange={(newHeaders) => updateActiveTabRequest((prev) => ({ ...prev, headers: newHeaders }))}
            keyPlaceholder="Header"
            valuePlaceholder="Value"
            showDescription={false}
          />
        )}

        {activeSubTab === 'auth' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Type:
              </span>
              <select
                value={req.auth.type}
                onChange={(e) =>
                  updateActiveTabRequest((prev) => ({
                    ...prev,
                    auth: { ...prev.auth, type: e.target.value as any },
                  }))
                }
                style={{
                  padding: '6px 10px',
                  fontSize: '13px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  outline: 'none',
                }}
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
              </select>
            </div>

            {req.auth.type === 'bearer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Bearer Token (supports {{bearerToken}} variables):
                </label>
                <input
                  type="text"
                  className="font-mono"
                  placeholder="eyJhbGciOi..."
                  value={req.auth.bearer.token}
                  onChange={(e) =>
                    updateActiveTabRequest((prev) => ({
                      ...prev,
                      auth: {
                        ...prev.auth,
                        bearer: { token: e.target.value },
                      },
                    }))
                  }
                  style={{
                    padding: '8px 10px',
                    fontSize: '13px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}

            {req.auth.type === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Username:</label>
                  <input
                    type="text"
                    value={req.auth.basic.username}
                    onChange={(e) =>
                      updateActiveTabRequest((prev) => ({
                        ...prev,
                        auth: {
                          ...prev.auth,
                          basic: { ...prev.auth.basic, username: e.target.value },
                        },
                      }))
                    }
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Password:</label>
                  <input
                    type="password"
                    value={req.auth.basic.password}
                    onChange={(e) =>
                      updateActiveTabRequest((prev) => ({
                        ...prev,
                        auth: {
                          ...prev.auth,
                          basic: { ...prev.auth.basic, password: e.target.value },
                        },
                      }))
                    }
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            )}

            {req.auth.type === 'apikey' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Key Name:</label>
                  <input
                    type="text"
                    placeholder="X-API-Key"
                    value={req.auth.apikey.key}
                    onChange={(e) =>
                      updateActiveTabRequest((prev) => ({
                        ...prev,
                        auth: {
                          ...prev.auth,
                          apikey: { ...prev.auth.apikey, key: e.target.value },
                        },
                      }))
                    }
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Key Value:</label>
                  <input
                    type="text"
                    value={req.auth.apikey.value}
                    onChange={(e) =>
                      updateActiveTabRequest((prev) => ({
                        ...prev,
                        auth: {
                          ...prev.auth,
                          apikey: { ...prev.auth.apikey, value: e.target.value },
                        },
                      }))
                    }
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Add to:</label>
                  <select
                    value={req.auth.apikey.addTo}
                    onChange={(e) =>
                      updateActiveTabRequest((prev) => ({
                        ...prev,
                        auth: {
                          ...prev.auth,
                          apikey: { ...prev.auth.apikey, addTo: e.target.value as any },
                        },
                      }))
                    }
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="header">Request Headers</option>
                    <option value="query">Query Params</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'body' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Content Type:
              </span>
              <select
                value={req.body.type}
                onChange={(e) =>
                  updateActiveTabRequest((prev) => ({
                    ...prev,
                    body: { ...prev.body, type: e.target.value as any },
                  }))
                }
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="none">No Body</option>
                <option value="json">JSON</option>
                <option value="raw">Raw Text</option>
              </select>
            </div>

            {req.body.type === 'json' && (
              <JsonEditor
                value={req.body.raw}
                onChange={(newRaw) =>
                  updateActiveTabRequest((prev) => ({
                    ...prev,
                    body: { ...prev.body, raw: newRaw },
                  }))
                }
              />
            )}

            {req.body.type === 'raw' && (
              <textarea
                className="font-mono"
                value={req.body.raw}
                onChange={(e) =>
                  updateActiveTabRequest((prev) => ({
                    ...prev,
                    body: { ...prev.body, raw: e.target.value },
                  }))
                }
                placeholder="Enter raw payload..."
                style={{
                  width: '100%',
                  height: '240px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  resize: 'none',
                }}
              />
            )}

            {req.body.type === 'none' && (
              <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                This request does not have a body. Select "JSON" or "Raw Text" above to configure a payload.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
