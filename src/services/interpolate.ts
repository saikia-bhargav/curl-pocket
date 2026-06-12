// Replaces {{variableName}} tokens in a template string with values
// from the active environment variables. Case-sensitive key matching.

import type { EnvVariable } from '@/types/environment';
import type { ApiRequest } from '@/types/request';

export interface InterpolateResult {
  result: string;
  unresolvedKeys: string[];
  secretKeys: string[];    // keys that were resolved but are marked secret
}

// Matches {{key}} — keys may contain letters, digits, dots, underscores, hyphens, colons
const VAR_REGEX = /\{\{([a-zA-Z0-9_.:-]+)\}\}/g;

export function interpolate(
  template: string,
  variables: EnvVariable[],
): InterpolateResult {
  if (template.trim() === '') {
    return { result: template, unresolvedKeys: [], secretKeys: [] };
  }

  const unresolvedKeys: string[] = [];
  const secretKeys: string[] = [];

  // Build O(1) lookup — only enabled variables with non-empty keys
  const varMap = new Map<string, EnvVariable>();
  for (const v of variables) {
    if (v.enabled && v.key.trim() !== '') {
      varMap.set(v.key, v);
    }
  }

  const result = template.replace(VAR_REGEX, (_match, key: string) => {
    const variable = varMap.get(key);

    if (variable === undefined) {
      if (!unresolvedKeys.includes(key)) {
        unresolvedKeys.push(key);
      }
      return _match;  // leave {{key}} in place
    }

    if (variable.secret && !secretKeys.includes(key)) {
      secretKeys.push(key);
    }

    return variable.value;
  });

  return { result, unresolvedKeys, secretKeys };
}

// ── Interpolate an entire ApiRequest ──────────────────────────────────────────
// Applies variable substitution to URL, params, headers, body, and auth.
// Returns a new request object — never mutates the original.

export function interpolateRequest(
  request: ApiRequest,
  variables: EnvVariable[],
): { request: ApiRequest; unresolvedKeys: string[] } {
  const allUnresolved: string[] = [];

  const interp = (template: string): string => {
    const r = interpolate(template, variables);
    for (const key of r.unresolvedKeys) {
      if (!allUnresolved.includes(key)) {
        allUnresolved.push(key);
      }
    }
    return r.result;
  };

  const interpolatedRequest: ApiRequest = {
    ...request,

    url: interp(request.url),

    params: request.params.map(p => ({
      ...p,
      key:   interp(p.key),
      value: interp(p.value),
    })),

    headers: request.headers.map(h => ({
      ...h,
      key:   interp(h.key),
      value: interp(h.value),
    })),

    body: {
      ...request.body,
      raw: interp(request.body.raw),
      formData: request.body.formData.map(f => ({
        ...f,
        key:   interp(f.key),
        value: interp(f.value),
      })),
      urlEncoded: request.body.urlEncoded.map(u => ({
        ...u,
        key:   interp(u.key),
        value: interp(u.value),
      })),
    },

    auth: (() => {
      const auth = { ...request.auth };
      if (auth.bearer !== undefined) {
        auth.bearer = { token: interp(auth.bearer.token) };
      }
      if (auth.basic !== undefined) {
        auth.basic = {
          username: interp(auth.basic.username),
          password: interp(auth.basic.password),
        };
      }
      if (auth.apiKey !== undefined) {
        auth.apiKey = {
          ...auth.apiKey,
          value: interp(auth.apiKey.value),
        };
      }
      return auth;
    })(),
  };

  return { request: interpolatedRequest, unresolvedKeys: allUnresolved };
}
