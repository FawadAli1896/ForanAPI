import { EnvironmentVariable } from '../types';

/**
 * Resolves variables in the format {{variable_name}} against active environment variables.
 */
export function resolveVariables(text: string, variables: EnvironmentVariable[]): string {
  if (!text || typeof text !== 'string') return text;

  // Map enabled variables
  const varMap = new Map<string, string>();
  variables.forEach((v) => {
    if (v.enabled && v.key.trim()) {
      varMap.set(v.key.trim(), v.value);
    }
  });

  return text.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (match, varName) => {
    const trimmed = varName.trim();
    if (varMap.has(trimmed)) {
      return varMap.get(trimmed)!;
    }
    return match; // return original {{var}} if unresolved
  });
}

/**
 * Extracts all {{variable}} keys found in a string
 */
export function extractVariableNames(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = text.matchAll(/\{\{([a-zA-Z0-9_.-]+)\}\}/g);
  const names: string[] = [];
  for (const m of matches) {
    if (m[1] && !names.includes(m[1].trim())) {
      names.push(m[1].trim());
    }
  }
  return names;
}
