import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import appLogo from '../assets/logo.svg';
import { Zap, User, ArrowRight, ShieldCheck, HardDrive, Sparkles } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { currentAccount, createAccount, switchAccount, resetCurrentWorkspaceToFresh, openAccountModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [startFresh, setStartFresh] = useState(true);

  useEffect(() => {
    // Check if user has already completed onboarding
    const seen = localStorage.getItem('foranapi_onboarding_seen');
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleContinueAsGuest = (fresh: boolean) => {
    localStorage.setItem('foranapi_onboarding_seen', 'true');
    switchAccount('guest');
    if (fresh) {
      resetCurrentWorkspaceToFresh();
    }
    setIsOpen(false);
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('foranapi_onboarding_seen', 'true');
    createAccount(name.trim(), email.trim(), startFresh);
    setIsOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20000,
      }}
    >
      <div
        style={{
          width: '560px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Banner Header */}
        <div
          style={{
            padding: '28px 24px 20px',
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.12) 0%, rgba(18, 18, 20, 0) 100%)',
            borderBottom: '1px solid var(--border-color)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <img
            src={appLogo}
            alt="ForanAPI Logo"
            style={{
              width: '52px',
              height: '52px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 16px rgba(59, 130, 246, 0.35))',
            }}
          />

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            Welcome to ForanAPI
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.4' }}>
            Fast, lightweight desktop API testing client inspired by Bruno. All your collections, requests, and environments are stored local-first on your machine.
          </p>
        </div>

        {/* Content Options */}
        <div style={{ padding: '24px' }}>
          {!isCreatingAccount ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Choose how you would like to start
              </span>

              {/* Option 1: Guest Mode */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Continue as Guest
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                      Start testing immediately without signing up. Everything persists locally in your Guest workspace.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleContinueAsGuest(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--accent-blue)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Guest Mode
                    <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContinueAsGuest(true)}
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    title="Start with an empty blank workspace"
                  >
                    Start Fresh (Empty)
                  </button>
                </div>
              </div>

              {/* Option 2: Create Account */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-blue)',
                      flexShrink: 0,
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Create Local Account
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                      Set up your developer profile. Keep multiple isolated workspaces for different projects.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingAccount(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                >
                  Create Account
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Option 3: Cloud Database Sign In */}
              <div
                style={{
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'rgba(56, 189, 248, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-blue)',
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Connect Cloud Account
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                      Sign in or register with your central database to monitor activity and sync profile details.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('foranapi_onboarding_seen', 'true');
                    setIsOpen(false);
                    openAccountModal();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Cloud Sign In
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            /* Account Creation Form */
            <form onSubmit={handleCreateAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Create Your Developer Profile
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingAccount(false)}
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ← Back to options
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Your Name / Alias *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Email Address (optional)
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Workspace Starting Setup:
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="setupMode"
                    checked={startFresh}
                    onChange={() => setStartFresh(true)}
                    style={{ accentColor: 'var(--accent-blue)' }}
                  />
                  <span><b>Start fresh (Empty workspace):</b> Clean slate with zero sample APIs</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="setupMode"
                    checked={!startFresh}
                    onChange={() => setStartFresh(false)}
                    style={{ accentColor: 'var(--accent-blue)' }}
                  />
                  <span><b>Include starter sample APIs:</b> Includes JSONPlaceholder & HTTPBin tests</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingAccount(false)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  style={{
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: name.trim() ? 'pointer' : 'not-allowed',
                    opacity: name.trim() ? 1 : 0.6,
                  }}
                >
                  Create & Launch ForanAPI
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '12px 24px',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HardDrive size={12} />
            <span>Local data storage in %APPDATA%/foranapi-store.json</span>
          </div>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
};
