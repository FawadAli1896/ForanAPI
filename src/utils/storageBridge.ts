import { AppStateData, ApiResponse, HttpMethod } from '../types';

const LOCAL_STORAGE_KEY = 'foranapi_data_v1';

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.foranAPI);
};

export async function loadStorageData(): Promise<AppStateData | null> {
  if (isElectron()) {
    try {
      const data = await window.foranAPI!.loadData();
      if (data) return data;
    } catch (err) {
      console.warn('Failed to load data from Electron store, falling back to localStorage:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return null;
  }
}

export async function saveStorageData(data: AppStateData): Promise<boolean> {
  let savedElectron = false;
  if (isElectron()) {
    try {
      savedElectron = await window.foranAPI!.saveData(data);
    } catch (err) {
      console.warn('Failed to save to Electron store:', err);
    }
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return savedElectron;
  }
}

export async function executeHttpRequest(params: {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
  timeout?: number;
}): Promise<ApiResponse> {
  if (isElectron()) {
    return await window.foranAPI!.sendRequest(params);
  }

  // Fallback for browser mode
  const startTime = performance.now();
  try {
    const fetchOptions: RequestInit = {
      method: params.method,
      headers: params.headers,
    };
    if (!['GET', 'HEAD'].includes(params.method) && params.body) {
      fetchOptions.body = params.body;
    }

    const res = await fetch(params.url, fetchOptions);
    const endTime = performance.now();
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const bodyText = await res.text();
    return {
      status: res.status,
      statusText: res.statusText,
      time: Math.round(endTime - startTime),
      size: new Blob([bodyText]).size,
      headers: responseHeaders,
      body: bodyText,
      contentType: res.headers.get('content-type') || '',
      timestamp: Date.now(),
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      status: 0,
      statusText: 'CORS/Network Error',
      time: Math.round(endTime - startTime),
      size: 0,
      headers: {},
      body: '',
      contentType: 'text/plain',
      timestamp: Date.now(),
      error: `${err.message}. (Note: In browser mode, CORS restricts external URLs. Run in ForanAPI Desktop app for unrestricted requests!)`,
    };
  }
}

export async function exportCollectionData(collectionData: string, name: string): Promise<boolean> {
  if (isElectron()) {
    return await window.foranAPI!.exportCollection(collectionData, name);
  }

  // Browser download fallback
  try {
    const blob = new Blob([collectionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Browser export failed:', err);
    return false;
  }
}

export async function importCollectionData(): Promise<string | null> {
  if (isElectron()) {
    return await window.foranAPI!.importCollection();
  }

  // Browser file input fallback
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (re) => {
        resolve(re.target?.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}

export async function getSystemInfo(): Promise<{
  machineId: string;
  os: string;
  platform: string;
  appVersion: string;
  hostname: string;
}> {
  if (isElectron() && window.foranAPI?.getSystemInfo) {
    return await window.foranAPI.getSystemInfo();
  }

  // Fallback for browser testing
  let webMachineId = localStorage.getItem('foranapi_web_machine_id');
  if (!webMachineId) {
    webMachineId = 'web-' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem('foranapi_web_machine_id', webMachineId);
  }

  return {
    machineId: webMachineId,
    os: navigator.userAgent,
    platform: 'web',
    appVersion: '1.0.0',
    hostname: 'browser-client',
  };
}

export async function checkForAppUpdates(): Promise<{ status: string; updateInfo?: any; message?: string }> {
  if (isElectron() && window.foranAPI?.checkForUpdates) {
    return await window.foranAPI.checkForUpdates();
  }
  return { status: 'dev-mode', message: 'Auto-updates require the installed desktop app.' };
}

export function quitAndInstallAppUpdate() {
  if (isElectron() && window.foranAPI?.quitAndInstall) {
    window.foranAPI.quitAndInstall();
  }
}

export function subscribeToUpdateStatus(callback: (status: any) => void): () => void {
  if (isElectron() && window.foranAPI?.onUpdateStatus) {
    return window.foranAPI.onUpdateStatus(callback);
  }
  return () => {};
}

