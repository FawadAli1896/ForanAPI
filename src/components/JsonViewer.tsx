import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, Search, FileCode, AlignLeft, ListFilter } from 'lucide-react';

interface JsonViewerProps {
  data: string;
  headers?: Record<string, string>;
  contentType?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  headers = {},
  contentType = '',
}) => {
  const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'headers'>('pretty');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const isJson = useMemo(() => {
    if (!data || !data.trim()) return false;
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }, [data]);

  const prettyJson = useMemo(() => {
    if (!data) return '';
    if (!isJson) return data;
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  }, [data, isJson]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'pretty' ? prettyJson : activeTab === 'raw' ? data : JSON.stringify(headers, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const textToSave = activeTab === 'pretty' ? prettyJson : activeTab === 'raw' ? data : JSON.stringify(headers, null, 2);
    const ext = isJson ? 'json' : 'txt';
    const blob = new Blob([textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting for JSON strings
  const renderHighlightedJson = (jsonString: string) => {
    if (!jsonString) return null;
    
    // Simple fast tokenizer for JSON syntax highlighting
    const formattedLines = jsonString.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {formattedLines.map((line, index) => {
          let lineContent = line;
          let isMatch = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

          // Tokenize string, numbers, booleans, keys
          const highlightedHtml = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
              let cls = 'color: #f59e0b;'; // number
              if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                  cls = 'color: #38bdf8; font-weight: 500;'; // key
                } else {
                  cls = 'color: #34d399;'; // string
                }
              } else if (/true|false/.test(match)) {
                cls = 'color: #a78bfa; font-weight: 600;'; // boolean
              } else if (/null/.test(match)) {
                cls = 'color: #f43f5e;'; // null
              }
              return `<span style="${cls}">${match}</span>`;
            });

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                background: isMatch ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                padding: '0 8px',
                borderRadius: isMatch ? '3px' : '0',
              }}
            >
              <span
                style={{
                  width: '38px',
                  userSelect: 'none',
                  color: 'var(--text-muted)',
                  textAlign: 'right',
                  paddingRight: '12px',
                  opacity: 0.6,
                }}
              >
                {index + 1}
              </span>
              <span
                style={{ flex: 1, whiteSpace: 'pre', wordBreak: 'break-all' }}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const headerEntries = Object.entries(headers);
  const filteredHeaders = searchQuery
    ? headerEntries.filter(
        ([k, v]) =>
          k.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : headerEntries;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('pretty')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'pretty' ? 'var(--bg-active)' : 'transparent',
              color: activeTab === 'pretty' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <FileCode size={13} />
            Pretty
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'raw' ? 'var(--bg-active)' : 'transparent',
              color: activeTab === 'raw' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <AlignLeft size={13} />
            Raw
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('headers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'headers' ? 'var(--bg-active)' : 'transparent',
              color: activeTab === 'headers' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <ListFilter size={13} />
            Headers ({headerEntries.length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search in response */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Find..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '3px 8px 3px 26px',
                fontSize: '12px',
                width: '120px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy Response"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download Response Body"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* Body Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', fontSize: '13px' }}>
        {activeTab === 'pretty' && (
          <div className="font-mono">
            {isJson ? (
              renderHighlightedJson(prettyJson)
            ) : (
              <pre style={{ padding: '0 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                {data || '<Empty response body>'}
              </pre>
            )}
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="font-mono" style={{ padding: '0 12px' }}>
            <textarea
              readOnly
              value={data}
              style={{
                width: '100%',
                height: '350px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                lineHeight: '1.5',
                resize: 'none',
              }}
            />
          </div>
        )}

        {activeTab === 'headers' && (
          <div style={{ padding: '0 12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 8px', fontWeight: 600 }}>Header</th>
                  <th style={{ padding: '6px 8px', fontWeight: 600 }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeaders.map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 8px', color: 'var(--text-primary)', fontWeight: 500 }} className="font-mono">
                      {k}
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)', wordBreak: 'break-all' }} className="font-mono">
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
