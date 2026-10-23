import React from 'react';
import { KeyValuePair } from '../types';
import { Trash2, Plus, Check } from 'lucide-react';

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  showDescription?: boolean;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  showDescription = false,
}) => {
  const handleItemChange = (index: number, field: keyof KeyValuePair, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([
      ...items,
      {
        id: `kv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key: '',
        value: '',
        enabled: true,
        description: '',
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Key-Value Pairs ({items.filter((i) => i.enabled && i.key).length} active)
        </span>
        <button
          type="button"
          onClick={handleAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '3px 8px',
            cursor: 'pointer',
          }}
        >
          <Plus size={13} />
          Add Row
        </button>
      </div>

      <div
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ width: '38px', padding: '6px 8px', textAlign: 'center' }}></th>
              <th style={{ padding: '6px 10px', fontWeight: 500 }}>Key</th>
              <th style={{ padding: '6px 10px', fontWeight: 500 }}>Value</th>
              {showDescription && <th style={{ padding: '6px 10px', fontWeight: 500 }}>Description</th>}
              <th style={{ width: '40px', padding: '6px 8px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={showDescription ? 5 : 4}
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                  }}
                >
                  No items configured. Click "Add Row" or start typing below.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  style={{
                    borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--border-color)',
                    background: item.enabled ? 'transparent' : 'rgba(0,0,0,0.1)',
                    opacity: item.enabled ? 1 : 0.65,
                  }}
                >
                  <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => handleItemChange(idx, 'enabled', e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                      title="Enable / Disable"
                    />
                  </td>
                  <td style={{ padding: '4px 8px' }}>
                    <input
                      type="text"
                      className="font-mono"
                      value={item.key}
                      onChange={(e) => handleItemChange(idx, 'key', e.target.value)}
                      placeholder={keyPlaceholder}
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
                    <input
                      type="text"
                      className="font-mono"
                      value={item.value}
                      onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                      placeholder={valuePlaceholder}
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
                  {showDescription && (
                    <td style={{ padding: '4px 8px' }}>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          background: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
                        onBlur={(e) => (e.target.style.borderColor = 'transparent')}
                      />
                    </td>
                  )}
                  <td style={{ textAlign: 'center', padding: '4px 6px' }}>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="Delete row"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
