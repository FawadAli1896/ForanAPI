export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export interface AuthConfig {
  type: AuthType;
  bearer: {
    token: string;
  };
  basic: {
    username: string;
    password: string;
  };
  apikey: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
}

export type BodyType = 'none' | 'json' | 'raw' | 'x-www-form-urlencoded';

export interface RequestBody {
  type: BodyType;
  raw: string;
  formData: KeyValuePair[];
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  auth: AuthConfig;
  body: RequestBody;
  collectionId: string;
  folderId?: string | null;
  updatedAt?: number;
}

export interface ApiFolder {
  id: string;
  name: string;
  collectionId: string;
  folderId?: string | null; // nested folder support
}

export interface ApiCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  secret?: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}

export interface ApiResponse {
  status: number;
  statusText: string;
  time: number; // in milliseconds
  size: number; // in bytes
  headers: Record<string, string>;
  body: string;
  contentType: string;
  timestamp: number;
  error?: string;
}

export interface TabItem {
  id: string;
  requestId?: string; // empty if new unsaved scratch request
  isDirty: boolean;
  request: ApiRequest;
  response?: ApiResponse | null;
  isLoading?: boolean;
}

export interface UserProfile {
  id: string; // 'guest' or 'user_<id>'
  name: string;
  email?: string;
  isGuest: boolean;
  avatarColor?: string;
  createdAt: number;
  token?: string;
  isCloud?: boolean;
}


export interface AppStateData {
  collections: ApiCollection[];
  folders: ApiFolder[];
  requests: ApiRequest[];
  environments: Environment[];
  activeEnvironmentId: string | null;
  theme: 'dark' | 'light';
}

export interface MultiAccountStore {
  currentAccountId: string;
  accounts: UserProfile[];
  workspaces: Record<string, AppStateData>;
}

export interface SystemInfo {
  machineId: string;
  os: string;
  platform: string;
  appVersion: string;
  hostname: string;
}

export interface UpdateStatus {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error' | 'dev-mode';
  info?: any;
  progress?: {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
  };
  error?: string;
  message?: string;
}

export interface ElectronAPI {
  sendRequest: (req: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    body?: string;
    timeout?: number;
  }) => Promise<ApiResponse>;
  loadData: () => Promise<AppStateData | null>;
  saveData: (data: AppStateData) => Promise<boolean>;
  exportCollection: (collectionData: string, defaultName: string) => Promise<boolean>;
  importCollection: () => Promise<string | null>;
  platform: string;
  getSystemInfo: () => Promise<SystemInfo>;
  checkForUpdates: () => Promise<{ status: string; updateInfo?: any; message?: string }>;
  quitAndInstall: () => void;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void;
}

declare global {
  interface Window {
    foranAPI?: ElectronAPI;
  }
}

