import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import appLogo from '../assets/logo.svg';
import {
  X,
  User,
  UserPlus,
  Check,
  Trash2,
  Cloud,
  Server,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';

export const AccountModal: React.FC = () => {
  const {
    isAccountModalOpen,
    closeAccountModal,
    accounts,
    currentAccount,
    createAccount,
    switchAccount,
    deleteAccount,
    resetCurrentWorkspaceToFresh,
    cloudLogin,
    cloudRegister,
    serverUrl,
    setServerUrl,
    updateStatus,
    checkUpdates,
    installUpdate,
  } = useApp();

  const [mode, setMode] = useState<'cloud' | 'create' | 'switch' | 'server'>('cloud');

  // Cloud form state
  const [cloudTab, setCloudTab] = useState<'login' | 'register'>('login');
  const [cloudName, setCloudName] = useState('');
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudSuccess, setCloudSuccess] = useState<string | null>(null);

  // Local account form state
  const [localName, setLocalName] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [startFresh, setStartFresh] = useState(true);

  // Server settings state
  const [customServerUrl, setCustomServerUrl] = useState(serverUrl);
  const [serverUrlSaved, setServerUrlSaved] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  // Danger zone state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isAccountModalOpen) return null;

  const handleCloudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudError(null);
    setCloudSuccess(null);
    setCloudLoading(true);

    try {
      if (cloudTab === 'register') {
        if (!cloudName.trim() || !cloudEmail.trim() || !cloudPassword.trim()) {
          setCloudError('Please fill in all registration fields.');
          setCloudLoading(false);
          return;
        }
        const res = await cloudRegister(cloudName.trim(), cloudEmail.trim(), cloudPassword);
        if (!res.success) {
          setCloudError(res.error || 'Registration failed');
        } else {
          setCloudSuccess('Account created and connected to central database!');
          setTimeout(() => closeAccountModal(), 1200);
        }
      } else {
        if (!cloudEmail.trim() || !cloudPassword.trim()) {
          setCloudError('Please enter both email and password.');
          setCloudLoading(false);
          return;
        }
        const res = await cloudLogin(cloudEmail.trim(), cloudPassword);
        if (!res.success) {
          setCloudError(res.error || 'Invalid credentials or server unreachable');
        } else {
          setCloudSuccess('Logged in successfully!');
          setTimeout(() => closeAccountModal(), 1200);
        }
      }
    } catch (err: any) {
      setCloudError(err.message || 'Network error occurred');
    } finally {
      setCloudLoading(false);
    }
  };

  const handleLocalCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim()) return;
    createAccount(localName.trim(), localEmail.trim(), startFresh);
    setLocalName('');
    setLocalEmail('');
  };

  const handleSaveServerUrl = () => {
    setServerUrl(customServerUrl);
    setServerUrlSaved(true);
    setTimeout(() => setServerUrlSaved(false), 2000);
  };

  const handleManualCheckUpdates = async () => {
    setCheckingUpdate(true);
    await checkUpdates();
    setCheckingUpdate(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={closeAccountModal}
    >
      <div
        style={{
          width: '580px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            height: '48px',
            padding: '0 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={appLogo} alt="ForanAPI" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              ForanAPI Cloud & Account Management
            </span>
          </div>

          <button
            type="button"
            onClick={closeAccountModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            padding: '0 16px',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('cloud')}
            style={{
              padding: '10px 12px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'cloud' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: mode === 'cloud' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Cloud size={13} color="var(--accent-blue)" />
            Cloud Database
          </button>

          <button
            type="button"
            onClick={() => setMode('switch')}
            style={{
              padding: '10px 12px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'switch' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: mode === 'switch' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <User size={13} />
            Accounts ({accounts.length})
          </button>

          <button
            type="button"
            onClick={() => setMode('create')}
            style={{
              padding: '10px 12px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'create' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: mode === 'create' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <UserPlus size={13} />
            Local Profile
          </button>

          <button
            type="button"
            onClick={() => setMode('server')}
            style={{
              padding: '10px 12px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'server' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: mode === 'server' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Server size={13} />
            Server & Updates
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {/* TAB 1: CLOUD DATABASE LOGIN / REGISTER */}
          {mode === 'cloud' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <ShieldCheck size={18} color="var(--accent-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Connected to Central Database
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Signing in lets you identify your machine on the admin dashboard and synchronizes your account info with your server.
                  </div>
                </div>
              </div>

              {/* Sub-tab: Login vs Register */}
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-primary)',
                  borderRadius: '6px',
                  padding: '3px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setCloudTab('login'); setCloudError(null); }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: cloudTab === 'login' ? 'var(--accent-blue)' : 'transparent',
                    color: cloudTab === 'login' ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  Sign In to Existing Account
                </button>
                <button
                  type="button"
                  onClick={() => { setCloudTab('register'); setCloudError(null); }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: cloudTab === 'register' ? 'var(--accent-blue)' : 'transparent',
                    color: cloudTab === 'register' ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  Create New Account
                </button>
              </div>

              {cloudError && (
                <div
                  style={{
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{cloudError}</span>
                </div>
              )}

              {cloudSuccess && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--accent-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Check size={15} />
                  <span>{cloudSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCloudSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cloudTab === 'register' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Developer"
                      value={cloudName}
                      onChange={(e) => setCloudName(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        fontSize: '13px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '5px',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={cloudEmail}
                    onChange={(e) => setCloudEmail(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={cloudPassword}
                    onChange={(e) => setCloudPassword(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Server: <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{serverUrl}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={cloudLoading}
                    style={{
                      padding: '8px 20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--accent-blue)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: cloudLoading ? 'wait' : 'pointer',
                      opacity: cloudLoading ? 0.7 : 1,
                    }}
                  >
                    {cloudLoading
                      ? 'Connecting...'
                      : cloudTab === 'register'
                      ? 'Create Cloud Account'
                      : 'Sign In to Server'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: LOCAL PROFILE CREATION */}
          {mode === 'create' && (
            <form onSubmit={handleLocalCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Local Account / Developer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    fontSize: '13px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Email Address (optional)
                </label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    fontSize: '13px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Fresh Workspace option */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Workspace Initialization
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="wsMode"
                    checked={startFresh}
                    onChange={() => setStartFresh(true)}
                    style={{ accentColor: 'var(--accent-blue)' }}
                  />
                  <span><b>Start fresh (Empty workspace):</b> Clean slate with no pre-existing APIs</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="wsMode"
                    checked={!startFresh}
                    onChange={() => setStartFresh(false)}
                    style={{ accentColor: 'var(--accent-blue)' }}
                  />
                  <span><b>Copy current APIs:</b> Clone active collections into your new account</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={!localName.trim()}
                  style={{
                    padding: '8px 18px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: localName.trim() ? 'pointer' : 'not-allowed',
                    opacity: localName.trim() ? 1 : 0.6,
                  }}
                >
                  Create Local Account
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SWITCH ACCOUNTS & PROFILES */}
          {mode === 'switch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                ACTIVE & AVAILABLE PROFILES
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {accounts.map((acc) => {
                  const isActive = acc.id === currentAccount.id;
                  return (
                    <div
                      key={acc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: isActive ? 'var(--bg-active)' : 'var(--bg-primary)',
                        border: `1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: acc.isCloud
                              ? 'linear-gradient(135deg, #22c55e, #3b82f6)'
                              : acc.isGuest
                              ? '#64748b'
                              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '12px',
                          }}
                        >
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {acc.name}
                            </span>
                            {acc.isCloud && (
                              <span style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--accent-green)', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                ☁️ Cloud
                              </span>
                            )}
                            {acc.isGuest && (
                              <span style={{ fontSize: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', padding: '1px 5px', borderRadius: '3px' }}>
                                Guest
                              </span>
                            )}
                            {isActive && (
                              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                Active
                              </span>
                            )}
                          </div>
                          {acc.email && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {acc.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              switchAccount(acc.id);
                              closeAccountModal();
                            }}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 500,
                              background: 'var(--accent-blue)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Switch
                          </button>
                        ) : (
                          <Check size={16} color="var(--accent-green)" />
                        )}

                        {!acc.isGuest && (
                          confirmDeleteId === acc.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAccount(acc.id);
                                  setConfirmDeleteId(null);
                                }}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  background: 'var(--accent-rose)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  background: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(acc.id)}
                              title="Delete Account"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                              <Trash2 size={13} />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fresh Workspace Action */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(244, 63, 94, 0.05)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-rose)', display: 'block' }}>
                    Reset / Fresh Tool
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Wipe current collections and start with a completely empty workspace.
                  </span>
                </div>
                {confirmReset ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        resetCurrentWorkspaceToFresh();
                        setConfirmReset(false);
                        closeAccountModal();
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: 'var(--accent-rose)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Yes, Reset All
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      style={{
                        padding: '5px 8px',
                        fontSize: '11px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: 'transparent',
                      border: '1px solid var(--accent-rose)',
                      color: 'var(--accent-rose)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Start Fresh
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SERVER CONFIG & AUTO-UPDATER */}
          {mode === 'server' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Central Server URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customServerUrl}
                    onChange={(e) => setCustomServerUrl(e.target.value)}
                    placeholder="http://localhost:3001"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveServerUrl}
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: serverUrlSaved ? 'var(--accent-green)' : 'var(--accent-blue)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {serverUrlSaved ? 'Saved!' : 'Save URL'}
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Default is <code>http://localhost:3001</code>. Update this when deploying your server to a live domain.
                </span>
              </div>

              {/* Auto-Updater Status Box */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Desktop Software Updates
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Current Installed Version: <strong>v1.0.0</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualCheckUpdates}
                    disabled={checkingUpdate}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      cursor: checkingUpdate ? 'wait' : 'pointer',
                    }}
                  >
                    <RefreshCw size={12} className={checkingUpdate ? 'animate-spin' : ''} />
                    {checkingUpdate ? 'Checking...' : 'Check for Updates'}
                  </button>
                </div>

                {updateStatus.status === 'downloaded' && (
                  <div
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                      ⚡ Update v1.0.1 ready to install!
                    </span>
                    <button
                      type="button"
                      onClick={installUpdate}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'var(--accent-green)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Restart & Update
                    </button>
                  </div>
                )}

                {updateStatus.status === 'not-available' && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ✅ ForanAPI is up to date.
                  </div>
                )}

                {updateStatus.status === 'dev-mode' && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ℹ️ Auto-updates run automatically in the packaged Windows application.
                  </div>
                )}
              </div>

              {/* Admin Dashboard Link */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Web Admin Dashboard
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    View real-time telemetry, all users, active machines, and downloads.
                  </div>
                </div>

                <a
                  href={`${serverUrl}/admin`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    borderRadius: '5px',
                    textDecoration: 'none',
                  }}
                >
                  <span>Open Admin</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
