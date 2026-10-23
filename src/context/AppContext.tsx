import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ApiCollection,
  ApiFolder,
  ApiRequest,
  Environment,
  TabItem,
  ApiResponse,
  AppStateData,
  HttpMethod,
  UserProfile,
  UpdateStatus,
} from '../types';
import { defaultInitialState, createNewBlankRequest, defaultGuestProfile, createFreshEmptyState } from '../utils/defaultData';
import {
  loadStorageData,
  saveStorageData,
  executeHttpRequest,
  exportCollectionData,
  importCollectionData,
  subscribeToUpdateStatus,
  checkForAppUpdates,
  quitAndInstallAppUpdate,
} from '../utils/storageBridge';
import {
  sendTelemetryHeartbeat,
  registerWithServer,
  loginWithServer,
  getServerUrl,
  setServerUrl as setServerUrlStorage,
} from '../utils/cloudSync';
import { resolveVariables } from '../utils/variableResolver';


interface AppContextType {
  // Account & Profiles
  accounts: UserProfile[];
  currentAccount: UserProfile;
  isAccountModalOpen: boolean;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  createAccount: (name: string, email?: string, startFresh?: boolean) => void;
  switchAccount: (accountId: string) => void;
  deleteAccount: (accountId: string) => void;
  resetCurrentWorkspaceToFresh: () => void;

  // Workspace Data
  collections: ApiCollection[];
  folders: ApiFolder[];
  requests: ApiRequest[];
  environments: Environment[];
  activeEnvironmentId: string | null;
  activeEnvironment: Environment | null;
  theme: 'dark' | 'light';
  tabs: TabItem[];
  activeTabId: string | null;
  activeTab: TabItem | null;
  isEnvModalOpen: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;

  // Actions
  toggleTheme: () => void;
  setActiveEnvironmentId: (id: string | null) => void;
  createEnvironment: (name: string) => Environment;
  updateEnvironment: (env: Environment) => void;
  deleteEnvironment: (id: string) => void;

  createCollection: (name: string, description?: string) => ApiCollection;
  updateCollection: (col: ApiCollection) => void;
  deleteCollection: (id: string) => void;

  createFolder: (collectionId: string, name: string, folderId?: string | null) => ApiFolder;
  updateFolder: (folder: ApiFolder) => void;
  deleteFolder: (id: string) => void;

  createRequest: (collectionId: string, folderId?: string | null, name?: string) => ApiRequest;
  saveRequest: (request: ApiRequest) => void;
  deleteRequest: (id: string) => void;
  duplicateRequest: (id: string) => void;

  openRequestInTab: (request: ApiRequest) => void;
  closeTab: (tabId: string) => void;
  setActiveTabId: (tabId: string) => void;
  updateActiveTabRequest: (updater: (prev: ApiRequest) => ApiRequest) => void;
  sendActiveRequest: () => Promise<void>;

  exportCollection: (collectionId: string) => Promise<boolean>;
  importCollection: () => Promise<boolean>;
  openEnvModal: () => void;
  closeEnvModal: () => void;

  // Central Server & Auto-Updater
  serverUrl: string;
  setServerUrl: (url: string) => void;
  updateStatus: UpdateStatus;
  checkUpdates: () => Promise<void>;
  installUpdate: () => void;
  cloudLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  cloudRegister: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;

  // Layout & Response Pane Visibility
  isResponseOpen: boolean;
  setIsResponseOpen: (open: boolean) => void;
  responseLayout: 'right' | 'bottom';
  setResponseLayout: (layout: 'right' | 'bottom') => void;
  toggleResponseLayout: () => void;
  toggleResponsePane: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Accounts state
  const [accounts, setAccounts] = useState<UserProfile[]>([defaultGuestProfile]);
  const [currentAccountId, setCurrentAccountId] = useState<string>('guest');
  const [workspaces, setWorkspaces] = useState<Record<string, AppStateData>>({
    guest: defaultInitialState,
  });
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Active Workspace Data
  const [collections, setCollections] = useState<ApiCollection[]>(defaultInitialState.collections);
  const [folders, setFolders] = useState<ApiFolder[]>(defaultInitialState.folders);
  const [requests, setRequests] = useState<ApiRequest[]>(defaultInitialState.requests);
  const [environments, setEnvironments] = useState<Environment[]>(defaultInitialState.environments);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(defaultInitialState.activeEnvironmentId);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);
  const toggleSearch = useCallback(() => setIsSearchOpen((prev) => !prev), []);

  // Tab management
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Central Server & Auto-Updater state
  const [serverUrl, setServerUrlState] = useState<string>(getServerUrl());
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ status: 'idle' });

  // Response Pane Open & Layout Position State
  const [isResponseOpen, setIsResponseOpen] = useState<boolean>(false);
  const [responseLayout, setResponseLayoutState] = useState<'right' | 'bottom'>(() => {
    try {
      return (localStorage.getItem('foranapi_response_layout') as 'right' | 'bottom') || 'right';
    } catch {
      return 'right';
    }
  });

  const setResponseLayout = useCallback((layout: 'right' | 'bottom') => {
    setResponseLayoutState(layout);
    try {
      localStorage.setItem('foranapi_response_layout', layout);
    } catch {}
  }, []);

  const toggleResponseLayout = useCallback(() => {
    setResponseLayoutState((prev) => {
      const next = prev === 'right' ? 'bottom' : 'right';
      try {
        localStorage.setItem('foranapi_response_layout', next);
      } catch {}
      return next;
    });
  }, []);

  const toggleResponsePane = useCallback(() => {
    setIsResponseOpen((prev) => !prev);
  }, []);

  const setServerUrl = (url: string) => {
    setServerUrlState(url);
    setServerUrlStorage(url);
  };

  // Subscribe to auto-updater status from Electron
  useEffect(() => {
    const unsub = subscribeToUpdateStatus((status: UpdateStatus) => {
      setUpdateStatus(status);
    });
    return unsub;
  }, []);

  // Send telemetry heartbeat to central database when app is loaded and on account change
  useEffect(() => {
    if (!isLoaded) return;
    const currentAcc = accounts.find((a) => a.id === currentAccountId) || defaultGuestProfile;
    sendTelemetryHeartbeat(currentAcc.email, currentAcc.isGuest);
  }, [isLoaded, currentAccountId, accounts]);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    loadStorageData().then((saved: any) => {
      if (!mounted) return;
      if (saved) {
        if (saved.accounts && Array.isArray(saved.accounts) && saved.accounts.length > 0) {
          // Multi-account data structure
          setAccounts(saved.accounts);
          const activeAccId = saved.currentAccountId || saved.accounts[0].id;
          setCurrentAccountId(activeAccId);
          setWorkspaces(saved.workspaces || {});

          const currentWs: AppStateData = saved.workspaces?.[activeAccId] || defaultInitialState;
          applyWorkspaceData(currentWs);
        } else if (saved.collections) {
          // Legacy single workspace migration to Guest
          const guestWs: AppStateData = {
            collections: saved.collections || defaultInitialState.collections,
            folders: saved.folders || [],
            requests: saved.requests || defaultInitialState.requests,
            environments: saved.environments || defaultInitialState.environments,
            activeEnvironmentId: saved.activeEnvironmentId !== undefined ? saved.activeEnvironmentId : defaultInitialState.activeEnvironmentId,
            theme: saved.theme || 'dark',
          };
          setAccounts([defaultGuestProfile]);
          setCurrentAccountId('guest');
          setWorkspaces({ guest: guestWs });
          applyWorkspaceData(guestWs);
        }
      } else {
        // First run
        applyWorkspaceData(defaultInitialState);
      }
      setIsLoaded(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  function applyWorkspaceData(ws: AppStateData) {
    setCollections(ws.collections || []);
    setFolders(ws.folders || []);
    setRequests(ws.requests || []);
    setEnvironments(ws.environments || []);
    setActiveEnvironmentId(ws.activeEnvironmentId);
    if (ws.theme) setTheme(ws.theme);

    if (ws.requests && ws.requests.length > 0) {
      const firstReq = ws.requests[0];
      setTabs([
        {
          id: `tab-${firstReq.id}`,
          requestId: firstReq.id,
          isDirty: false,
          request: { ...firstReq },
          response: null,
        },
      ]);
      setActiveTabId(`tab-${firstReq.id}`);
    } else {
      setTabs([]);
      setActiveTabId(null);
    }
  }

  // Save changes to storage whenever relevant state updates
  useEffect(() => {
    if (!isLoaded) return;
    const currentWorkspaceData: AppStateData = {
      collections,
      folders,
      requests,
      environments,
      activeEnvironmentId,
      theme,
    };

    const multiAccountData = {
      currentAccountId,
      accounts,
      workspaces: {
        ...workspaces,
        [currentAccountId]: currentWorkspaceData,
      },
      // Keep legacy fields so older readers don't break
      ...currentWorkspaceData,
    };

    saveStorageData(multiAccountData as any);
  }, [isLoaded, collections, folders, requests, environments, activeEnvironmentId, theme, currentAccountId, accounts, workspaces]);

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Current Account profile
  const currentAccount = useMemo(() => {
    return accounts.find((a) => a.id === currentAccountId) || defaultGuestProfile;
  }, [accounts, currentAccountId]);

  // Active environment
  const activeEnvironment = useMemo(() => {
    return environments.find((e) => e.id === activeEnvironmentId) || null;
  }, [environments, activeEnvironmentId]);

  // Active tab
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  // Account switching
  const switchAccount = useCallback(
    (targetAccountId: string) => {
      if (targetAccountId === currentAccountId) return;

      // 1. Snapshot current workspace
      const currentWorkspaceData: AppStateData = {
        collections,
        folders,
        requests,
        environments,
        activeEnvironmentId,
        theme,
      };

      const updatedWorkspaces = {
        ...workspaces,
        [currentAccountId]: currentWorkspaceData,
      };

      setWorkspaces(updatedWorkspaces);

      // 2. Load target workspace
      const targetWs = updatedWorkspaces[targetAccountId] || createFreshEmptyState();
      setCurrentAccountId(targetAccountId);
      applyWorkspaceData(targetWs);
    },
    [currentAccountId, collections, folders, requests, environments, activeEnvironmentId, theme, workspaces]
  );

  // Account creation
  const createAccount = useCallback(
    (name: string, email?: string, startFresh: boolean = true) => {
      const newAccountId = `user_${Date.now()}`;
      const newProfile: UserProfile = {
        id: newAccountId,
        name: name.trim() || 'Developer',
        email: email?.trim() || undefined,
        isGuest: false,
        avatarColor: '#3b82f6',
        createdAt: Date.now(),
      };

      // 1. Save current workspace
      const currentWorkspaceData: AppStateData = {
        collections,
        folders,
        requests,
        environments,
        activeEnvironmentId,
        theme,
      };

      const newWsData = startFresh
        ? createFreshEmptyState()
        : JSON.parse(JSON.stringify(currentWorkspaceData));

      setAccounts((prev) => [...prev, newProfile]);
      setWorkspaces((prev) => ({
        ...prev,
        [currentAccountId]: currentWorkspaceData,
        [newAccountId]: newWsData,
      }));

      // Switch to new account
      setCurrentAccountId(newAccountId);
      applyWorkspaceData(newWsData);
      setIsAccountModalOpen(false);
    },
    [currentAccountId, collections, folders, requests, environments, activeEnvironmentId, theme]
  );

  const deleteAccount = useCallback(
    (accountId: string) => {
      if (accountId === 'guest') return; // Cannot delete guest
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      setWorkspaces((prev) => {
        const copy = { ...prev };
        delete copy[accountId];
        return copy;
      });

      if (currentAccountId === accountId) {
        switchAccount('guest');
      }
    },
    [currentAccountId, switchAccount]
  );

  const resetCurrentWorkspaceToFresh = useCallback(() => {
    const fresh = createFreshEmptyState();
    applyWorkspaceData(fresh);
  }, []);

  // Central Server Authentication
  const cloudLogin = useCallback(
    async (email: string, pass: string) => {
      const res = await loginWithServer(email, pass);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Login failed' };
      }

      const existing = accounts.find((a) => a.email?.toLowerCase() === res.user?.email.toLowerCase());
      let targetAccId = existing?.id;

      if (!existing) {
        const newAcc: UserProfile = {
          id: `cloud_${res.user.id}`,
          name: res.user.name,
          email: res.user.email,
          isGuest: false,
          isCloud: true,
          token: res.token,
          createdAt: Date.now(),
          avatarColor: '#38bdf8',
        };
        setAccounts((prev) => [...prev, newAcc]);
        targetAccId = newAcc.id;
        setWorkspaces((prev) => ({
          ...prev,
          [newAcc.id]: createFreshEmptyState(),
        }));
      } else {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === existing.id
              ? { ...a, name: res.user!.name, isCloud: true, token: res.token }
              : a
          )
        );
      }

      if (targetAccId) {
        switchAccount(targetAccId);
      }

      sendTelemetryHeartbeat(res.user.email, false);
      return { success: true };
    },
    [accounts, switchAccount]
  );

  const cloudRegister = useCallback(
    async (name: string, email: string, pass: string) => {
      const res = await registerWithServer(name, email, pass);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Registration failed' };
      }

      const newAcc: UserProfile = {
        id: `cloud_${res.user.id}`,
        name: res.user.name,
        email: res.user.email,
        isGuest: false,
        isCloud: true,
        token: res.token,
        createdAt: Date.now(),
        avatarColor: '#22c55e',
      };

      setAccounts((prev) => [...prev, newAcc]);
      setWorkspaces((prev) => ({
        ...prev,
        [newAcc.id]: createFreshEmptyState(),
      }));

      switchAccount(newAcc.id);
      sendTelemetryHeartbeat(res.user.email, false);
      return { success: true };
    },
    [switchAccount]
  );

  const checkUpdates = useCallback(async () => {
    setUpdateStatus({ status: 'checking' });
    const res = await checkForAppUpdates();
    if (res.status === 'dev-mode') {
      setUpdateStatus({ status: 'dev-mode', message: res.message });
    } else if (res.status === 'error') {
      setUpdateStatus({ status: 'error', error: res.message });
    }
  }, []);

  const installUpdate = useCallback(() => {
    quitAndInstallAppUpdate();
  }, []);


  // Tab operations
  const openRequestInTab = useCallback(
    (request: ApiRequest) => {
      const existingTab = tabs.find((t) => t.requestId === request.id);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        setIsResponseOpen(Boolean(existingTab.response));
      } else {
        const newTabId = `tab-${request.id}-${Date.now()}`;
        const newTab: TabItem = {
          id: newTabId,
          requestId: request.id,
          isDirty: false,
          request: JSON.parse(JSON.stringify(request)),
          response: null,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTabId);
        setIsResponseOpen(false);
      }
    },
    [tabs]
  );

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== tabId);
        if (activeTabId === tabId) {
          if (newTabs.length > 0) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
          } else {
            setActiveTabId(null);
          }
        }
        return newTabs;
      });
    },
    [activeTabId]
  );

  const updateActiveTabRequest = useCallback(
    (updater: (prev: ApiRequest) => ApiRequest) => {
      if (!activeTabId) return;
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === activeTabId) {
            const updatedReq = updater(tab.request);
            return {
              ...tab,
              request: updatedReq,
              isDirty: true,
            };
          }
          return tab;
        })
      );
    },
    [activeTabId]
  );

  // Request execution
  const sendActiveRequest = useCallback(async () => {
    if (!activeTab) return;
    const req = activeTab.request;

    // Immediately reveal response pane so user sees loading & response
    setIsResponseOpen(true);

    // Set loading state on active tab
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, isLoading: true } : t))
    );

    const variables = activeEnvironment?.variables || [];

    // Resolve URL
    let targetUrl = resolveVariables(req.url, variables).trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // Resolve & construct query params
    const enabledParams = req.params.filter((p) => p.enabled && p.key.trim());
    if (enabledParams.length > 0) {
      try {
        const urlObj = new URL(targetUrl);
        enabledParams.forEach((p) => {
          urlObj.searchParams.append(
            resolveVariables(p.key.trim(), variables),
            resolveVariables(p.value, variables)
          );
        });
        targetUrl = urlObj.toString();
      } catch (e) {
        console.error('Invalid URL parsing:', e);
      }
    }

    // Resolve Headers
    const headers: Record<string, string> = {};
    req.headers
      .filter((h) => h.enabled && h.key.trim())
      .forEach((h) => {
        const k = resolveVariables(h.key.trim(), variables);
        const v = resolveVariables(h.value, variables);
        headers[k] = v;
      });

    // Resolve Auth
    if (req.auth) {
      if (req.auth.type === 'bearer' && req.auth.bearer.token) {
        const token = resolveVariables(req.auth.bearer.token, variables);
        headers['Authorization'] = `Bearer ${token}`;
      } else if (req.auth.type === 'basic') {
        const user = resolveVariables(req.auth.basic.username, variables);
        const pass = resolveVariables(req.auth.basic.password, variables);
        const base64 = btoa(`${user}:${pass}`);
        headers['Authorization'] = `Basic ${base64}`;
      } else if (req.auth.type === 'apikey' && req.auth.apikey.key) {
        const k = resolveVariables(req.auth.apikey.key, variables);
        const v = resolveVariables(req.auth.apikey.value, variables);
        if (req.auth.apikey.addTo === 'header') {
          headers[k] = v;
        } else {
          try {
            const urlObj = new URL(targetUrl);
            urlObj.searchParams.append(k, v);
            targetUrl = urlObj.toString();
          } catch (e) {
            console.error('Failed to append API key param:', e);
          }
        }
      }
    }

    // Body
    let resolvedBody: string | undefined = undefined;
    if (!['GET', 'HEAD'].includes(req.method.toUpperCase())) {
      if (req.body.type === 'json' && req.body.raw) {
        resolvedBody = resolveVariables(req.body.raw, variables);
        if (!Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) {
          headers['Content-Type'] = 'application/json';
        }
      } else if (req.body.type === 'raw' && req.body.raw) {
        resolvedBody = resolveVariables(req.body.raw, variables);
      }
    }

    try {
      const response: ApiResponse = await executeHttpRequest({
        url: targetUrl,
        method: req.method as HttpMethod,
        headers,
        body: resolvedBody,
      });

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id ? { ...t, response, isLoading: false } : t
        )
      );
    } catch (err: any) {
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'Execution Error',
        time: 0,
        size: 0,
        headers: {},
        body: '',
        contentType: 'text/plain',
        timestamp: Date.now(),
        error: err.message || 'Unknown network error occurred.',
      };

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id ? { ...t, response: errorResponse, isLoading: false } : t
        )
      );
    }
  }, [activeTab, activeEnvironment]);

  // Request actions
  const createRequest = useCallback(
    (collectionId: string, folderId?: string | null, name?: string): ApiRequest => {
      const newReq = createNewBlankRequest(collectionId, folderId);
      if (name) newReq.name = name;

      setRequests((prev) => [...prev, newReq]);
      openRequestInTab(newReq);
      return newReq;
    },
    [openRequestInTab]
  );

  const saveRequest = useCallback(
    (requestToSave: ApiRequest) => {
      setRequests((prev) => {
        const exists = prev.some((r) => r.id === requestToSave.id);
        if (exists) {
          return prev.map((r) =>
            r.id === requestToSave.id ? { ...requestToSave, updatedAt: Date.now() } : r
          );
        } else {
          return [...prev, { ...requestToSave, updatedAt: Date.now() }];
        }
      });

      // Clear dirty flag for tabs holding this request
      setTabs((prev) =>
        prev.map((t) => {
          if (t.request.id === requestToSave.id) {
            return {
              ...t,
              requestId: requestToSave.id,
              isDirty: false,
              request: { ...requestToSave },
            };
          }
          return t;
        })
      );
    },
    []
  );

  const deleteRequest = useCallback(
    (id: string) => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setTabs((prev) => {
        const remaining = prev.filter((t) => t.requestId !== id && t.request.id !== id);
        if (activeTabId && !remaining.some((t) => t.id === activeTabId)) {
          setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    },
    [activeTabId]
  );

  const duplicateRequest = useCallback(
    (id: string) => {
      const original = requests.find((r) => r.id === id);
      if (!original) return;
      const copy: ApiRequest = {
        ...JSON.parse(JSON.stringify(original)),
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${original.name} (Copy)`,
        updatedAt: Date.now(),
      };
      setRequests((prev) => [...prev, copy]);
      openRequestInTab(copy);
    },
    [requests, openRequestInTab]
  );

  // Collection actions
  const createCollection = useCallback((name: string, description: string = ''): ApiCollection => {
    const newCol: ApiCollection = {
      id: `col-${Date.now()}`,
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCollections((prev) => [...prev, newCol]);
    return newCol;
  }, []);

  const updateCollection = useCallback((updatedCol: ApiCollection) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCol.id ? { ...updatedCol, updatedAt: Date.now() } : c))
    );
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setFolders((prev) => prev.filter((f) => f.collectionId !== id));
    setRequests((prev) => prev.filter((r) => r.collectionId !== id));
  }, []);

  // Folder actions
  const createFolder = useCallback(
    (collectionId: string, name: string, folderId: string | null = null): ApiFolder => {
      const newFolder: ApiFolder = {
        id: `fld-${Date.now()}`,
        name,
        collectionId,
        folderId,
      };
      setFolders((prev) => [...prev, newFolder]);
      return newFolder;
    },
    []
  );

  const updateFolder = useCallback((folder: ApiFolder) => {
    setFolders((prev) => prev.map((f) => (f.id === folder.id ? folder : f)));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id && f.folderId !== id));
    setRequests((prev) => prev.filter((r) => r.folderId !== id));
  }, []);

  // Environment actions
  const createEnvironment = useCallback((name: string): Environment => {
    const newEnv: Environment = {
      id: `env-${Date.now()}`,
      name,
      variables: [
        { id: `v-${Date.now()}`, key: 'baseUrl', value: 'https://', enabled: true },
      ],
    };
    setEnvironments((prev) => [...prev, newEnv]);
    setActiveEnvironmentId(newEnv.id);
    return newEnv;
  }, []);

  const updateEnvironment = useCallback((env: Environment) => {
    setEnvironments((prev) => prev.map((e) => (e.id === env.id ? env : e)));
  }, []);

  const deleteEnvironment = useCallback((id: string) => {
    setEnvironments((prev) => prev.filter((e) => e.id !== id));
    setActiveEnvironmentId((current) => (current === id ? null : current));
  }, []);

  // Export / Import
  const exportCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      const targetCol = collections.find((c) => c.id === collectionId);
      if (!targetCol) return false;

      const colFolders = folders.filter((f) => f.collectionId === collectionId);
      const colRequests = requests.filter((r) => r.collectionId === collectionId);

      const exportPayload = {
        schema: 'foranapi-v1',
        collection: targetCol,
        folders: colFolders,
        requests: colRequests,
        exportedAt: new Date().toISOString(),
      };

      return await exportCollectionData(
        JSON.stringify(exportPayload, null, 2),
        targetCol.name
      );
    },
    [collections, folders, requests]
  );

  const importCollection = useCallback(async (): Promise<boolean> => {
    const rawJson = await importCollectionData();
    if (!rawJson) return false;

    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.collection) {
        const newColId = `col-${Date.now()}`;
        const newCol: ApiCollection = {
          ...parsed.collection,
          id: newColId,
          name: `${parsed.collection.name} (Imported)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const folderMap = new Map<string, string>();
        const newFolders: ApiFolder[] = (parsed.folders || []).map((f: ApiFolder) => {
          const freshFolderId = `fld-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          folderMap.set(f.id, freshFolderId);
          return {
            ...f,
            id: freshFolderId,
            collectionId: newColId,
          };
        });

        const newRequests: ApiRequest[] = (parsed.requests || []).map((r: ApiRequest) => {
          return {
            ...r,
            id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            collectionId: newColId,
            folderId: r.folderId && folderMap.has(r.folderId) ? folderMap.get(r.folderId) : null,
          };
        });

        setCollections((prev) => [...prev, newCol]);
        setFolders((prev) => [...prev, ...newFolders]);
        setRequests((prev) => [...prev, ...newRequests]);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import parse error:', e);
      return false;
    }
  }, []);

  const openEnvModal = useCallback(() => setIsEnvModalOpen(true), []);
  const closeEnvModal = useCallback(() => setIsEnvModalOpen(false), []);
  const openAccountModal = useCallback(() => setIsAccountModalOpen(true), []);
  const closeAccountModal = useCallback(() => setIsAccountModalOpen(false), []);

  return (
    <AppContext.Provider
      value={{
        // Accounts
        accounts,
        currentAccount,
        isAccountModalOpen,
        openAccountModal,
        closeAccountModal,
        createAccount,
        switchAccount,
        deleteAccount,
        resetCurrentWorkspaceToFresh,

        // Data
        collections,
        folders,
        requests,
        environments,
        activeEnvironmentId,
        activeEnvironment,
        theme,
        tabs,
        activeTabId,
        activeTab,
        isEnvModalOpen,
        isSidebarOpen,
        toggleSidebar,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        toggleSearch,
        activeCollectionId,
        setActiveCollectionId,

        toggleTheme,
        setActiveEnvironmentId,
        createEnvironment,
        updateEnvironment,
        deleteEnvironment,

        createCollection,
        updateCollection,
        deleteCollection,

        createFolder,
        updateFolder,
        deleteFolder,

        createRequest,
        saveRequest,
        deleteRequest,
        duplicateRequest,

        openRequestInTab,
        closeTab,
        setActiveTabId,
        updateActiveTabRequest,
        sendActiveRequest,

        exportCollection,
        importCollection,
        openEnvModal,
        closeEnvModal,

        serverUrl,
        setServerUrl,
        updateStatus,
        checkUpdates,
        installUpdate,
        cloudLogin,
        cloudRegister,

        isResponseOpen,
        setIsResponseOpen,
        responseLayout,
        setResponseLayout,
        toggleResponseLayout,
        toggleResponsePane,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
