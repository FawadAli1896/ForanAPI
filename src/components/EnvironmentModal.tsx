import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Environment, EnvironmentVariable } from '../types';
import { X, Plus, Trash2, Eye, EyeOff, Layers, Check } from 'lucide-react';

export const EnvironmentModal: React.FC = () => {
  const {
    isEnvModalOpen,
    closeEnvModal,
    environments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    activeEnvironmentId,
    setActiveEnvironmentId,
  } = useApp();

  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(
    activeEnvironmentId || environments[0]?.id || null
  );

  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  if (!isEnvModalOpen) return null;

  const currentEnv = environments.find((e) => e.id === selectedEnvId) || environments[0];

  const handleAddEnv = () => {
    const defaultName = `Environment ${environments.length + 1}`;
    const created = createEnvironment(defaultName);
    setSelectedEnvId(created.id);
  };

  const handleAddVariable = () => {
    if (!currentEnv) return;
    const newVar: EnvironmentVariable = {
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key: '',
      value: '',
      enabled: true,
      secret: false,
    };
    updateEnvironment({
      ...currentEnv,
      variables: [...currentEnv.variables, newVar],
    });
  };

  const handleUpdateVar = (index: number, field: keyof EnvironmentVariable, val: any) => {
    if (!currentEnv) return;
    const updatedVars = [...currentEnv.variables];
    updatedVars[index] = { ...updatedVars[index], [field]: val };
    updateEnvironment({
      ...currentEnv,
      variables: updatedVars,
    });
  };

  const handleDeleteVar = (index: number) => {
    if (!currentEnv) return;
    const updatedVars = currentEnv.variables.filter((_, i) => i !== index);
    updateEnvironment({
      ...currentEnv,
      variables: updatedVars,
    });
  };

  const toggleSecretVisibility = (varId: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [varId]: !prev[varId] }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={closeEnvModal}
    >
      <div
        style={{
          width: '760px',
          height: '520px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            height: '46px',
            padding: '0 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--accent-blue)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Environment Variables
            </span>
          </div>

          <button
            type="button"
            onClick={closeEnvModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Split view */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Left: Environment List */}
          <div
            style={{
              width: '200px',
              borderRight: '1px solid var(--border-color)',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                ENVIRONMENTS
              </span>
              <button
                type="button"
                onClick={handleAddEnv}
                title="New Environment"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Plus size={12} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {environments.map((env) => {
                const isSelected = (currentEnv?.id || '') === env.id;
                const isActive = activeEnvironmentId === env.id;

                return (
                  <div
                    key={env.id}
                    onClick={() => setSelectedEnvId(env.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--bg-active)' : 'transparent',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? 'var(--accent-green)' : 'transparent',
                          border: isActive ? 'none' : '1px solid var(--text-muted)',
                        }}
                      />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {env.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {!isActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEnvironmentId(env.id);
                          }}
                          title="Set as Active"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: '2px',
                          }}
                        >
                          Use
                        </button>
                      )}
                      {environments.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEnvironment(env.id);
                          }}
                          title="Delete Environment"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Environment Variables Table */}
          <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {currentEnv ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      value={currentEnv.name}
                      onChange={(e) => updateEnvironment({ ...currentEnv, name: e.target.value })}
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        padding: '4px 8px',
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
                      onBlur={(e) => (e.target.style.borderColor = 'transparent')}
                    />
                    {activeEnvironmentId === currentEnv.id && (
                      <span
                        style={{
                          fontSize: '11px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: 'var(--accent-green)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}
                      >
                        Active Environment
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariable}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: 'var(--accent-blue)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} />
                    Add Variable
                  </button>
                </div>

                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: 'var(--bg-primary)',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ width: '36px', padding: '6px 8px', textAlign: 'center' }}></th>
                        <th style={{ padding: '6px 10px', fontWeight: 500 }}>Variable</th>
                        <th style={{ padding: '6px 10px', fontWeight: 500 }}>Value</th>
                        <th style={{ width: '60px', padding: '6px 8px', textAlign: 'center' }}>Secret</th>
                        <th style={{ width: '36px', padding: '6px 8px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEnv.variables.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                            No variables defined. Click "Add Variable" to create one.
                          </td>
                        </tr>
                      ) : (
                        currentEnv.variables.map((v, idx) => {
                          const isSecret = Boolean(v.secret);
                          const isVisible = Boolean(visibleSecrets[v.id]);

                          return (
                            <tr key={v.id || idx} style={{ borderBottom: idx === currentEnv.variables.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                              <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                                <input
                                  type="checkbox"
                                  checked={v.enabled}
                                  onChange={(e) => handleUpdateVar(idx, 'enabled', e.target.checked)}
                                  style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                                />
                              </td>
                              <td style={{ padding: '4px 8px' }}>
                                <input
                                  type="text"
                                  className="font-mono"
                                  placeholder="e.g. baseUrl"
                                  value={v.key}
                                  onChange={(e) => handleUpdateVar(idx, 'key', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    background: 'transparent',
                                    border: '1px solid transparent',
                                    borderRadius: '4px',
                                    color: 'var(--text-primary)',
                                  }}
                                  onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
                                  onBlur={(e) => (e.target.style.borderColor = 'transparent')}
                                />
                              </td>
                              <td style={{ padding: '4px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input
                                    type={isSecret && !isVisible ? 'password' : 'text'}
                                    className="font-mono"
                                    placeholder="value"
                                    value={v.value}
                                    onChange={(e) => handleUpdateVar(idx, 'value', e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: '5px 8px',
                                      background: 'transparent',
                                      border: '1px solid transparent',
                                      borderRadius: '4px',
                                      color: 'var(--text-primary)',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'transparent')}
                                  />
                                  {isSecret && (
                                    <button
                                      type="button"
                                      onClick={() => toggleSecretVisibility(v.id)}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                      }}
                                    >
                                      {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                                <input
                                  type="checkbox"
                                  checked={isSecret}
                                  onChange={(e) => handleUpdateVar(idx, 'secret', e.target.checked)}
                                  style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                                  title="Mask value as sensitive secret"
                                />
                              </td>
                              <td style={{ textAlign: 'center', padding: '4px 6px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVar(idx)}
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
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-primary)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  💡 <b>Usage tip:</b> Reference these variables anywhere in your request URLs, headers, or body using <code className="font-mono" style={{ color: 'var(--accent-blue)' }}>{'{{variable_name}}'}</code>.
                </div>
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select an environment on the left to configure variables.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
