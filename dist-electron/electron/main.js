"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const store_1 = require("./store");
let mainWindow = null;
const store = new store_1.LocalStore();
const isDev = !electron_1.app.isPackaged && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1300,
        height: 850,
        minWidth: 980,
        minHeight: 640,
        backgroundColor: '#090d16',
        title: 'ForanAPI',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    if (isDev) {
        const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
        mainWindow.loadURL(devUrl);
        // mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    setupIpcHandlers();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
function setupIpcHandlers() {
    // Storage IPC
    electron_1.ipcMain.handle('storage:load-data', async () => {
        return store.getAll();
    });
    electron_1.ipcMain.handle('storage:save-data', async (_event, data) => {
        return store.saveAll(data);
    });
    // Export / Import Dialogs
    electron_1.ipcMain.handle('dialog:export-collection', async (_event, { collectionData, defaultName }) => {
        if (!mainWindow)
            return false;
        const { canceled, filePath } = await electron_1.dialog.showSaveDialog(mainWindow, {
            title: 'Export ForanAPI Collection',
            defaultPath: `${defaultName.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`,
            filters: [{ name: 'JSON Files', extensions: ['json'] }],
        });
        if (canceled || !filePath)
            return false;
        try {
            fs_1.default.writeFileSync(filePath, collectionData, 'utf-8');
            return true;
        }
        catch (err) {
            console.error('Export collection failed:', err);
            return false;
        }
    });
    electron_1.ipcMain.handle('dialog:import-collection', async () => {
        if (!mainWindow)
            return null;
        const { canceled, filePaths } = await electron_1.dialog.showOpenDialog(mainWindow, {
            title: 'Import Collection',
            properties: ['openFile'],
            filters: [{ name: 'JSON Files', extensions: ['json'] }],
        });
        if (canceled || filePaths.length === 0)
            return null;
        try {
            return fs_1.default.readFileSync(filePaths[0], 'utf-8');
        }
        catch (err) {
            console.error('Import collection failed:', err);
            return null;
        }
    });
    // Request Execution IPC
    electron_1.ipcMain.handle('api:send-request', async (_event, requestParams) => {
        const { url, method = 'GET', headers = {}, body, timeout = 30000 } = requestParams;
        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutTimer = setTimeout(() => controller.abort(), timeout);
        try {
            const fetchOptions = {
                method: method.toUpperCase(),
                headers: headers,
                signal: controller.signal,
            };
            if (!['GET', 'HEAD'].includes(method.toUpperCase()) && body) {
                fetchOptions.body = body;
            }
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutTimer);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            // Extract all headers
            const responseHeaders = {};
            response.headers.forEach((val, key) => {
                responseHeaders[key] = val;
            });
            const contentType = response.headers.get('content-type') || '';
            const responseText = await response.text();
            const sizeBytes = Buffer.byteLength(responseText, 'utf-8');
            return {
                status: response.status,
                statusText: response.statusText,
                time: responseTime,
                size: sizeBytes,
                headers: responseHeaders,
                body: responseText,
                contentType: contentType,
                timestamp: Date.now(),
            };
        }
        catch (error) {
            clearTimeout(timeoutTimer);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            let errorMessage = error.message || 'Unknown network error';
            if (error.name === 'AbortError') {
                errorMessage = `Request timed out after ${timeout}ms`;
            }
            return {
                status: 0,
                statusText: 'Error',
                time: responseTime,
                size: 0,
                headers: {},
                body: '',
                contentType: 'text/plain',
                timestamp: Date.now(),
                error: errorMessage,
            };
        }
    });
}
