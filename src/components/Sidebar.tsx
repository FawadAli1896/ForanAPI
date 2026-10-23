import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApiCollection, ApiFolder, ApiRequest } from '../types';
import { CreateItemModal, CreateModalType } from './CreateItemModal';
import { ConfirmModal } from './ConfirmModal';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
  Copy,
  Download,
  Search,
  Layers,
  Edit2,
  FilePlus,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    collections,
    folders,
    requests,
    deleteCollection,
    deleteFolder,
    deleteRequest,
    duplicateRequest,
    openRequestInTab,
    activeTab,
    exportCollection,
    isSearchOpen,
  } = useApp();

  const [search, setSearch] = useState('');
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Create & Rename Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: CreateModalType;
    targetId?: string;
    initialValue?: string;
    parentId?: string;
  }>({
    isOpen: false,
    type: 'collection',
  });

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const toggleCollection = (id: string) => {
    setCollapsedCols((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (id: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = (
    type: CreateModalType,
    parentId?: string,
    targetId?: string,
    initialValue?: string
  ) => {
    setModalState({
      isOpen: true,
      type,
      parentId,
      targetId,
      initialValue,
    });
  };

  const openDeleteConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'badge-get';
      case 'POST':
        return 'badge-post';
      case 'PUT':
        return 'badge-put';
      case 'PATCH':
        return 'badge-patch';
      case 'DELETE':
        return 'badge-delete';
      default:
        return 'badge-options';
    }
  };

  const filteredRequests = requests.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <aside
        style={{
          width: '280px',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        {/* Toggleable Search Bar */}
        {(isSearchOpen || search) && (
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={13} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px 5px 28px',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        )}

        {/* Collections List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {collections.length === 0 ? (
            <div
              style={{
                padding: '30px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  No Collections
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Create your first collection to organize your APIs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openCreateModal('collection')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'var(--accent-blue)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                <Plus size={13} />
                Create Collection
              </button>
            </div>
          ) : (
            collections.map((col) => {
              const isColCollapsed = Boolean(collapsedCols[col.id]);
              const colFolders = folders.filter((f) => f.collectionId === col.id && !f.folderId);
              const colRequestsRoot = filteredRequests.filter((r) => r.collectionId === col.id && !r.folderId);

              return (
                <div key={col.id} style={{ marginBottom: '2px' }}>
                  {/* Collection Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      margin: '0 4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div
                      onClick={() => toggleCollection(col.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}
                    >
                      {isColCollapsed ? <ChevronRight size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                      <Layers size={14} color="var(--accent-blue)" />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {col.name}
                      </span>
                    </div>

                    {/* Actions on hover */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => openCreateModal('request', col.id)}
                        title="Add Request"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openCreateModal('folder', col.id)}
                        title="Add Folder"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        <FolderPlus size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openCreateModal('rename-collection', undefined, col.id, col.name)}
                        title="Rename Collection"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => exportCollection(col.id)}
                        title="Export Collection"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        <Download size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openDeleteConfirm(
                            'Delete Collection',
                            `Are you sure you want to delete collection "${col.name}" and all requests inside it?`,
                            () => deleteCollection(col.id)
                          )
                        }
                        title="Delete Collection"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '3px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Collection Contents */}
                  {!isColCollapsed && (
                    <div style={{ paddingLeft: '14px' }}>
                      {/* Folders */}
                      {colFolders.map((fld) => {
                        const isFolderCollapsed = Boolean(collapsedFolders[fld.id]);
                        const folderReqs = filteredRequests.filter((r) => r.folderId === fld.id);

                        return (
                          <div key={fld.id} style={{ marginTop: '2px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <div
                                onClick={() => toggleFolder(fld.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, overflow: 'hidden' }}
                              >
                                {isFolderCollapsed ? <ChevronRight size={13} color="var(--text-muted)" /> : <ChevronDown size={13} color="var(--text-muted)" />}
                                <Folder size={13} color="var(--accent-amber)" />
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {fld.name}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <button
                                  type="button"
                                  onClick={() => openCreateModal('request', col.id, fld.id)}
                                  title="Add Request into Folder"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                                >
                                  <Plus size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openCreateModal('rename-folder', undefined, fld.id, fld.name)}
                                  title="Rename Folder"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteConfirm(
                                      'Delete Folder',
                                      `Are you sure you want to delete folder "${fld.name}"?`,
                                      () => deleteFolder(fld.id)
                                    )
                                  }
                                  title="Delete Folder"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {!isFolderCollapsed && (
                              <div style={{ paddingLeft: '14px' }}>
                                {folderReqs.map((req) => renderRequestItem(req, col.id))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Root Requests */}
                      {colRequestsRoot.map((req) => renderRequestItem(req, col.id))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Modal Dialogs */}
      <CreateItemModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        parentId={modalState.parentId}
        targetId={modalState.targetId}
        initialValue={modalState.initialValue}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );

  function renderRequestItem(req: ApiRequest, colId: string) {
    const isActive = activeTab?.request?.id === req.id;
    return (
      <div
        key={req.id}
        onClick={() => openRequestInTab(req)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 8px',
          margin: '1px 4px',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
          <span
            className={`font-mono ${getMethodBadgeClass(req.method)}`}
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 4px',
              borderRadius: '3px',
              minWidth: '32px',
              textAlign: 'center',
            }}
          >
            {req.method}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {req.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openCreateModal('rename-request', undefined, req.id, req.name);
            }}
            title="Rename request"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <Edit2 size={11} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              duplicateRequest(req.id);
            }}
            title="Duplicate request"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirm(
                'Delete Request',
                `Are you sure you want to delete request "${req.name}"?`,
                () => deleteRequest(req.id)
              );
            }}
            title="Delete request"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    );
  }
};
