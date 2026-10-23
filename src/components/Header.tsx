import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import appLogo from '../assets/logo.svg';
import { CreateItemModal } from './CreateItemModal';
import {
  Menu,
  Home,
  ChevronDown,
  Box,
  Search,
  Plus,
  MoreVertical,
  MoreHorizontal,
  Settings2,
  PanelLeft,
  Sun,
  Moon,
  Zap,
  Upload,
  Download,
  Terminal,
  Play,
  RotateCcw,
  Check,
  Columns2,
  Rows2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentAccount,
    openAccountModal,
    collections,
    environments,
    activeEnvironmentId,
    setActiveEnvironmentId,
    activeEnvironment,
    openEnvModal,
    theme,
    toggleTheme,
    isSidebarOpen,
    toggleSidebar,
    toggleSearch,
    createRequest,
    exportCollection,
    importCollection,
    activeTab,
    resetCurrentWorkspaceToFresh,
    updateStatus,
    installUpdate,
    responseLayout,
    toggleResponseLayout,
  } = useApp();

  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [isMoreColMenuOpen, setIsMoreColMenuOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [isColDropdownOpen, setIsColDropdownOpen] = useState(false);
  const [selectedColId, setSelectedColId] = useState<string>(collections[0]?.id || '');

  const handleNewRequest = () => {
    const targetCol = selectedColId || collections[0]?.id || 'default';
    createRequest(targetCol);
  };

  const currentCollection = collections.find((c) => c.id === selectedColId) || collections[0];

  return (
    <>
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          userSelect: 'none',
        }}
      >
        {/* Tier 1: Bruno-style Top Window Header */}
        <div
          style={{
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          {/* Left: Menu, Home, Workspace Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={openAccountModal}
              title="Application Menu & Workspaces"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Menu size={15} />
            </button>

            <button
              type="button"
              onClick={openAccountModal}
              title="Home / Switch Workspace"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Home size={14} />
            </button>

            {/* Workspace Switcher Pill */}
            <button
              type="button"
              onClick={openAccountModal}
              title={`Active Profile: ${currentAccount.name}. Click to switch or create workspace.`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '3px 6px',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>{currentAccount.isGuest ? 'My Workspace' : `${currentAccount.name}'s Workspace`}</span>
              <ChevronDown size={13} color="var(--text-muted)" />
            </button>
          </div>

          {/* Center: ForanAPI Brand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
            }}
          >
            <img
              src={appLogo}
              alt="ForanAPI"
              style={{
                width: '18px',
                height: '18px',
                objectFit: 'contain',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              ForanAPI
            </span>
          </div>

          {/* Right: Layout Toggle, Theme, Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Toggle Sidebar Icon */}
            <button
              type="button"
              onClick={toggleSidebar}
              title={isSidebarOpen ? 'Hide Collections Sidebar' : 'Show Collections Sidebar'}
              style={{
                background: 'transparent',
                border: 'none',
                color: isSidebarOpen ? 'var(--accent-blue)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
            >
              <PanelLeft size={15} />
            </button>

            {/* Split Layout Toggle (Right vs Bottom) */}
            <button
              type="button"
              onClick={toggleResponseLayout}
              title={responseLayout === 'right' ? 'Switch Response to Bottom (Horizontal Split)' : 'Switch Response to Right (Vertical Split)'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {responseLayout === 'right' ? <Rows2 size={15} /> : <Columns2 size={15} />}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Auto-Update Badge */}
            {updateStatus.status === 'downloaded' && (
              <button
                type="button"
                onClick={installUpdate}
                title="New version downloaded! Click to restart and update."
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)',
                }}
              >
                <Zap size={11} />
                <span>Restart to Update</span>
              </button>
            )}

            {updateStatus.status === 'downloading' && (
              <div
                title="Downloading update in background..."
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--accent-blue)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                }}
              >
                <span>⬇️ Updating...</span>
              </div>
            )}

            {/* Profile Avatar */}
            <div
              onClick={openAccountModal}
              title={`Account: ${currentAccount.name} (${currentAccount.isCloud ? 'Cloud Synced' : currentAccount.isGuest ? 'Guest' : 'Local'})`}
              style={{
                position: 'relative',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: currentAccount.isCloud
                  ? 'linear-gradient(135deg, #22c55e, #3b82f6)'
                  : currentAccount.isGuest
                  ? '#475569'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {currentAccount.name.charAt(0).toUpperCase()}
              {currentAccount.isCloud && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '1px solid #000',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Bruno-style Sub-Header Toolbar */}
        <div style={{ height: '38px', display: 'flex', background: 'var(--bg-primary)' }}>
          {/* Left section (matches sidebar width 280px) */}
          {isSidebarOpen && (
            <div
              style={{
                width: '280px',
                height: '100%',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                boxSizing: 'border-box',
                background: 'var(--bg-secondary)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box size={15} color="var(--accent-blue)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Collections
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <button
                  type="button"
                  onClick={toggleSearch}
                  title="Search Requests"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <Search size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsColModalOpen(true)}
                  title="Create New Collection"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <Plus size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMoreColMenuOpen(!isMoreColMenuOpen)}
                  title="Collection Options"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <MoreVertical size={14} />
                </button>
              </div>

              {/* Dropdown menu for Collections */}
              {isMoreColMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '36px',
                    right: '10px',
                    width: '160px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 1000,
                    padding: '4px 0',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseLeave={() => setIsMoreColMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsColModalOpen(true);
                      setIsMoreColMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Plus size={13} />
                    New Collection
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      importCollection();
                      setIsMoreColMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Upload size={13} />
                    Import JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentCollection) exportCollection(currentCollection.id);
                      setIsMoreColMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Download size={13} />
                    Export JSON
                  </button>
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                  <button
                    type="button"
                    onClick={() => {
                      resetCurrentWorkspaceToFresh();
                      setIsMoreColMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-rose)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <RotateCcw size={13} />
                    Reset Workspace
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Right section (above request & response panes) */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              position: 'relative',
            }}
          >
            {/* Active Collection Breadcrumb / Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsColDropdownOpen(!isColDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '3px 6px',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Box size={14} color="var(--accent-blue)" />
                <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentCollection ? currentCollection.name : 'No Collection'}
                </span>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {isColDropdownOpen && collections.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '32px',
                    left: 0,
                    width: '220px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    padding: '4px 0',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseLeave={() => setIsColDropdownOpen(false)}
                >
                  {collections.map((c) => {
                    const isSelected = (selectedColId || collections[0]?.id) === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedColId(c.id);
                          setIsColDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: isSelected ? 'var(--bg-active)' : 'transparent',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? 'var(--bg-active)' : 'transparent')}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                        {isSelected && <Check size={13} color="var(--accent-blue)" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Controls: + Request, Environment Switcher, Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleNewRequest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 9px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              >
                <Plus size={12} />
                Request
              </button>

              {/* Environment Switcher Popover */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                    padding: '3px 8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: activeEnvironment ? 'var(--accent-green)' : 'var(--text-muted)',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>
                    {activeEnvironment ? activeEnvironment.name : 'No Environment'}
                  </span>
                  <ChevronDown size={13} color="var(--text-muted)" />
                </button>

                {isEnvDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '32px',
                      right: 0,
                      width: '190px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      zIndex: 1000,
                      padding: '4px 0',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseLeave={() => setIsEnvDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEnvironmentId(null);
                        setIsEnvDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: !activeEnvironmentId ? 'var(--bg-active)' : 'transparent',
                        color: !activeEnvironmentId ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = !activeEnvironmentId ? 'var(--bg-active)' : 'transparent')}
                    >
                      <span>No Environment</span>
                      {!activeEnvironmentId && <Check size={13} color="var(--accent-green)" />}
                    </button>

                    {environments.map((env) => {
                      const isSelected = activeEnvironmentId === env.id;
                      return (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => {
                            setActiveEnvironmentId(env.id);
                            setIsEnvDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: isSelected ? 'var(--bg-active)' : 'transparent',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? 'var(--bg-active)' : 'transparent')}
                        >
                          <span>{env.name}</span>
                          {isSelected && <Check size={13} color="var(--accent-green)" />}
                        </button>
                      );
                    })}

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => {
                        openEnvModal();
                        setIsEnvDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        color: 'var(--accent-blue)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Settings2 size={12} />
                      Configure Environments
                    </button>
                  </div>
                )}
              </div>

              {/* More Actions Dropdown */}
              <button
                type="button"
                onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
                title="More actions"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
              >
                <MoreHorizontal size={15} />
              </button>

              {isMoreActionsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '36px',
                    right: '16px',
                    width: '150px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 1000,
                    padding: '4px 0',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseLeave={() => setIsMoreActionsOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      importCollection();
                      setIsMoreActionsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Upload size={13} />
                    Import
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentCollection) exportCollection(currentCollection.id);
                      setIsMoreActionsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Download size={13} />
                    Export
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Create Collection Modal */}
      <CreateItemModal
        isOpen={isColModalOpen}
        type="collection"
        onClose={() => setIsColModalOpen(false)}
      />
    </>
  );
};
