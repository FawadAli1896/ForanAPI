import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('foranAPI', {
  sendRequest: (req: any) => ipcRenderer.invoke('api:send-request', req),
  loadData: () => ipcRenderer.invoke('storage:load-data'),
  saveData: (data: any) => ipcRenderer.invoke('storage:save-data', data),
  exportCollection: (collectionData: string, defaultName: string) =>
    ipcRenderer.invoke('dialog:export-collection', { collectionData, defaultName }),
  importCollection: () => ipcRenderer.invoke('dialog:import-collection'),
  platform: process.platform,
  getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
  checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('updater:quit-and-install'),
  onUpdateStatus: (callback: (status: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on('updater:status', listener);
    return () => ipcRenderer.removeListener('updater:status', listener);
  },
});

