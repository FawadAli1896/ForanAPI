import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Copy, Check } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder = '{\n  "key": "value"\n}',
}) => {
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!value || !value.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(value);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [value]);

  const handleFormat = () => {
    try {
      if (!value.trim()) return;
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError('Cannot format invalid JSON: ' + err.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '6px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            JSON PAYLOAD
          </span>
          {value.trim() && (
            error ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--accent-rose)',
                  background: 'rgba(244, 63, 94, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                <AlertCircle size={12} />
                Invalid JSON
              </span>
            ) : (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--accent-green)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                <CheckCircle2 size={12} />
                Valid JSON
              </span>
            )
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handleFormat}
            disabled={!value.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: value.trim() ? 'pointer' : 'not-allowed',
              opacity: value.trim() ? 1 : 0.5,
            }}
            title="Format / Prettify JSON"
          >
            <Sparkles size={12} />
            Beautify
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!value.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: value.trim() ? 'pointer' : 'not-allowed',
              opacity: value.trim() ? 1 : 0.5,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: '180px', display: 'flex' }}>
        <textarea
          className="font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            padding: '10px 12px',
            fontSize: '13px',
            lineHeight: '1.5',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--accent-rose)' : 'var(--border-color)'}`,
            borderRadius: '6px',
            outline: 'none',
          }}
        />
      </div>

      {error && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--accent-rose)',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
