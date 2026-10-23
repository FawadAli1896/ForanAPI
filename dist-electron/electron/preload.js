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
});
