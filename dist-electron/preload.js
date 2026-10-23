"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('foranAPI', {
    sendRequest: (req) => electron_1.ipcRenderer.invoke('api:send-request', req),
    loadData: () => electron_1.ipcRenderer.invoke('storage:load-data'),
    saveData: (data) => electron_1.ipcRenderer.invoke('storage:save-data', data),
    exportCollection: (collectionData, defaultName) => electron_1.ipcRenderer.invoke('dialog:export-collection', { collectionData, defaultName }),
    importCollection: () => electron_1.ipcRenderer.invoke('dialog:import-collection'),
    platform: process.platform,
    getSystemInfo: () => electron_1.ipcRenderer.invoke('system:get-info'),
    checkForUpdates: () => electron_1.ipcRenderer.invoke('updater:check-for-updates'),
    quitAndInstall: () => electron_1.ipcRenderer.invoke('updater:quit-and-install'),
    onUpdateStatus: (callback) => {
        const listener = (_event, data) => callback(data);
        electron_1.ipcRenderer.on('updater:status', listener);
        return () => electron_1.ipcRenderer.removeListener('updater:status', listener);
    },
});
