import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HttpMethod } from '../types';
import { X, Folder, Layers, Send, Edit3, Plus } from 'lucide-react';

export type CreateModalType =
  | 'collection'
  | 'folder'
  | 'request'
  | 'rename-collection'
  | 'rename-folder'
  | 'rename-request';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CreateModalType;
  targetId?: string; // collectionId or folderId or requestId
  initialValue?: string;
  parentId?: string; // collectionId for folder/request
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  type,
  targetId,
  initialValue = '',
  parentId,
}) => {
  const {
    createCollection,
    updateCollection,
    collections,
    createFolder,
    updateFolder,
    folders,
    createRequest,
    updateActiveTabRequest,
    requests,
    saveRequest,
  } = useApp();

  const [name, setName] = useState(initialValue);
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialValue);
      setDescription('');
      setMethod('GET');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (type === 'collection') {
      createCollection(trimmed, description.trim());
    } else if (type === 'folder' && parentId) {
      createFolder(parentId, trimmed);
    } else if (type === 'request' && parentId) {
      const created = createRequest(parentId, targetId || null, trimmed);
      if (method !== 'GET') {
        saveRequest({ ...created, method });
      }
    } else if (type === 'rename-collection' && targetId) {
      const col = collections.find((c) => c.id === targetId);
      if (col) updateCollection({ ...col, name: trimmed });
    } else if (type === 'rename-folder' && targetId) {
      const fld = folders.find((f) => f.id === targetId);
      if (fld) updateFolder({ ...fld, name: trimmed });
    } else if (type === 'rename-request' && targetId) {
      const req = requests.find((r) => r.id === targetId);
      if (req) {
        saveRequest({ ...req, name: trimmed });
      }
    }

    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'collection':
        return 'Create New Collection';
      case 'folder':
        return 'Create New Folder';
      case 'request':
        return 'Create New Request';
      case 'rename-collection':
        return 'Rename Collection';
      case 'rename-folder':
        return 'Rename Folder';
      case 'rename-request':
        return 'Rename Request';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'collection':
      case 'rename-collection':
        return <Layers size={16} color="var(--accent-blue)" />;
      case 'folder':
      case 'rename-folder':
        return <Folder size={16} color="var(--accent-amber)" />;
      case 'request':
      case 'rename-request':
        return <Send size={16} color="var(--accent-green)" />;
    }
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
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '420px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            height: '44px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getIcon()}
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {getTitle()}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {type === 'request' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                HTTP METHOD
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="font-mono"
                style={{
                  padding: '7px 10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  color: 'var(--text-primary)',
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
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              NAME *
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type.replace('rename-', '')} name...`}
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

          {type === 'collection' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                DESCRIPTION (OPTIONAL)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this collection..."
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
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
              {type.startsWith('rename-') ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
