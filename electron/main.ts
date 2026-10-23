import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { LocalStore } from './store';

let mainWindow: BrowserWindow | null = null;
const store = new LocalStore();

const isDev = !app.isPackaged && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);

// Auto-updater configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater:status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updater:status', { status: 'available', info });
  });

  autoUpdater.on('update-not-available', (info) => {
    mainWindow?.webContents.send('updater:status', { status: 'not-available', info });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('updater:status', { status: 'downloading', progress: progressObj });
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('updater:status', { status: 'downloaded', info });
  });

  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('updater:status', { status: 'error', error: err?.message || 'Update error' });
  });

  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify().catch((e) => {
        console.log('Background update check:', e?.message);
      });
    }, 4000);
  }
}

function createWindow() {
  const icoPath = path.join(__dirname, '../public/icon.ico');
  const pngPath = path.join(__dirname, '../public/icon.png');
  const iconPath = fs.existsSync(icoPath) ? icoPath : fs.existsSync(pngPath) ? pngPath : undefined;

  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#090d16',
    title: 'ForanAPI',
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(devUrl).catch(() => {
      if (fs.existsSync(distHtml)) {
        mainWindow?.loadFile(distHtml);
      }
    });
  } else if (fs.existsSync(distHtml)) {
    mainWindow.loadFile(distHtml);
  } else {
    mainWindow.loadURL(devUrl);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  setupAutoUpdater();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  // Storage IPC
  ipcMain.handle('storage:load-data', async () => {
    return store.getAll();
  });

  ipcMain.handle('storage:save-data', async (_event, data) => {
    return store.saveAll(data);
  });

  // Export / Import Dialogs
  ipcMain.handle('dialog:export-collection', async (_event, { collectionData, defaultName }) => {
    if (!mainWindow) return false;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export ForanAPI Collection',
      defaultPath: `${defaultName.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (canceled || !filePath) return false;

    try {
      fs.writeFileSync(filePath, collectionData, 'utf-8');
      return true;
    } catch (err) {
      console.error('Export collection failed:', err);
      return false;
    }
  });

  ipcMain.handle('dialog:import-collection', async () => {
    if (!mainWindow) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Collection',
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (canceled || filePaths.length === 0) return null;

    try {
      return fs.readFileSync(filePaths[0], 'utf-8');
    } catch (err) {
      console.error('Import collection failed:', err);
      return null;
    }
  });

  // Request Execution IPC
  ipcMain.handle('api:send-request', async (_event, requestParams) => {
    const { url, method = 'GET', headers = {}, body, timeout = 30000 } = requestParams;
    const startTime = performance.now();

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
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
      const responseHeaders: Record<string, string> = {};
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
    } catch (error: any) {
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

  // Auto-updater IPC handlers
  ipcMain.handle('updater:check-for-updates', async () => {
    if (!app.isPackaged) {
      return { status: 'dev-mode', message: 'Auto-updates are active in packaged desktop build.' };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      return { status: 'ok', updateInfo: result?.updateInfo };
    } catch (err: any) {
      return { status: 'error', message: err?.message || 'Update check failed' };
    }
  });

  ipcMain.handle('updater:quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  // Machine Telemetry IPC handler
  ipcMain.handle('system:get-info', async () => {
    const allData = store.getAll() as any;
    let machineId = allData?.system?.machineId;
    if (!machineId) {
      machineId = crypto.randomUUID();
      store.saveAll({
        ...allData,
        system: {
          ...(allData?.system || {}),
          machineId,
        },
      });
    }

    return {
      machineId,
      os: `${os.type()} ${os.release()} (${os.arch()})`,
      platform: process.platform,
      appVersion: app.getVersion(),
      hostname: os.hostname(),
    };
  });
}

