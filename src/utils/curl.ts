import { ApiRequest, EnvironmentVariable } from '../types';
import { resolveVariables } from './variableResolver';

export function generateCurl(request: ApiRequest, variables: EnvironmentVariable[] = []): string {
  const method = request.method.toUpperCase();
  
  // Resolve URL
  let fullUrl = resolveVariables(request.url, variables);

  // Append enabled query params
  const enabledParams = request.params.filter((p) => p.enabled && p.key.trim());
  if (enabledParams.length > 0) {
    const urlObj = new URL(fullUrl.startsWith('http') ? fullUrl : `http://${fullUrl}`);
    enabledParams.forEach((p) => {
      urlObj.searchParams.append(
        resolveVariables(p.key.trim(), variables),
        resolveVariables(p.value, variables)
      );
    });
    fullUrl = urlObj.toString();
  }

  const parts: string[] = ['curl'];

  // Method
  if (method !== 'GET') {
    parts.push(`-X ${method}`);
  }

  // URL
  parts.push(`'${fullUrl}'`);

  // Headers
  const enabledHeaders = request.headers.filter((h) => h.enabled && h.key.trim());
  enabledHeaders.forEach((h) => {
    const key = resolveVariables(h.key.trim(), variables);
    const val = resolveVariables(h.value, variables);
    parts.push(`-H '${key}: ${val}'`);
  });

  // Auth
  if (request.auth) {
    if (request.auth.type === 'bearer' && request.auth.bearer.token) {
      const token = resolveVariables(request.auth.bearer.token, variables);
      parts.push(`-H 'Authorization: Bearer ${token}'`);
    } else if (request.auth.type === 'basic') {
      const user = resolveVariables(request.auth.basic.username, variables);
      const pass = resolveVariables(request.auth.basic.password, variables);
      parts.push(`-u '${user}:${pass}'`);
    } else if (request.auth.type === 'apikey' && request.auth.apikey.key) {
      const k = resolveVariables(request.auth.apikey.key, variables);
      const v = resolveVariables(request.auth.apikey.value, variables);
      if (request.auth.apikey.addTo === 'header') {
        parts.push(`-H '${k}: ${v}'`);
      }
    }
  }

  // Body
  if (!['GET', 'HEAD'].includes(method) && request.body) {
    if (request.body.type === 'json' && request.body.raw) {
      const resolvedBody = resolveVariables(request.body.raw, variables);
      // Auto add content-type header if not already present
      if (!enabledHeaders.some((h) => h.key.toLowerCase() === 'content-type')) {
        parts.push(`-H 'Content-Type: application/json'`);
      }
      parts.push(`--data '${resolvedBody.replace(/'/g, "'\\''")}'`);
    } else if (request.body.type === 'raw' && request.body.raw) {
      const resolvedBody = resolveVariables(request.body.raw, variables);
      parts.push(`--data '${resolvedBody.replace(/'/g, "'\\''")}'`);
    }
  }

  return parts.join(' \\\n  ');
}
