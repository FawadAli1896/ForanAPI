/**
 * Central Cloud Telemetry & Auth Client
 * Connects desktop instances to your central server & MySQL/SQLite database.
 */

import { getSystemInfo } from './storageBridge';

export const DEFAULT_SERVER_URL = 'http://localhost:3001';

export function getServerUrl(): string {
  try {
    return localStorage.getItem('foranapi_server_url') || DEFAULT_SERVER_URL;
  } catch {
    return DEFAULT_SERVER_URL;
  }
}

export function setServerUrl(url: string) {
  try {
    localStorage.setItem('foranapi_server_url', url.trim().replace(/\/+$/, ''));
  } catch (err) {
    console.error('Failed to save server URL:', err);
  }
}

export interface CloudUserResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}

/**
 * Send heartbeat to central database on app launch
 */
export async function sendTelemetryHeartbeat(userEmail?: string, isGuest: boolean = true): Promise<void> {
  const serverUrl = getServerUrl();
  try {
    const sys = await getSystemInfo();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000); // 4s timeout

    await fetch(`${serverUrl}/api/telemetry/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machine_id: sys.machineId,
        user_email: userEmail || undefined,
        os: sys.os,
        platform: sys.platform,
        app_version: sys.appVersion,
        hostname: sys.hostname,
        is_guest: isGuest,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    // Fail silently when offline or server unreachable - local app always functions
  }
}

/**
 * Register account with central database
 */
export async function registerWithServer(name: string, email: string, password: string): Promise<CloudUserResponse> {
  const serverUrl = getServerUrl();
  const sys = await getSystemInfo();

  try {
    const res = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        machine_id: sys.machineId,
        os: sys.os,
        platform: sys.platform,
        app_version: sys.appVersion,
        hostname: sys.hostname,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `Server responded with status ${res.status}` };
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { success: false, error: `Could not connect to central server at ${serverUrl}. Is the server running?` };
  }
}

/**
 * Log in with central database
 */
export async function loginWithServer(email: string, password: string): Promise<CloudUserResponse> {
  const serverUrl = getServerUrl();
  const sys = await getSystemInfo();

  try {
    const res = await fetch(`${serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        machine_id: sys.machineId,
        os: sys.os,
        platform: sys.platform,
        app_version: sys.appVersion,
        hostname: sys.hostname,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `Server responded with status ${res.status}` };
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { success: false, error: `Could not connect to central server at ${serverUrl}. Is the server running?` };
  }
}
