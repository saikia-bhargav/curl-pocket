import { interpolate } from '@/services/interpolate';
import type { EnvVariable } from '@/types/environment';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeVar = (
  key: string,
  value: string,
  opts: Partial<EnvVariable> = {},
): EnvVariable => ({
  id: key,
  key,
  value,
  enabled: true,
  secret: false,
  ...opts,
});

const vars: EnvVariable[] = [
  makeVar('baseUrl',    'https://api.example.com'),
  makeVar('apiVersion', 'v2'),
  makeVar('token',      'secret-abc', { secret: true }),
  makeVar('userId',     '42'),
  makeVar('disabled',   'should-not-appear', { enabled: false }),
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('interpolate', () => {
  it('replaces a single variable', () => {
    const { result, unresolvedKeys } = interpolate('{{baseUrl}}/users', vars);
    expect(result).toBe('https://api.example.com/users');
    expect(unresolvedKeys).toHaveLength(0);
  });

  it('replaces multiple variables in one string', () => {
    const { result } = interpolate('{{baseUrl}}/{{apiVersion}}/users/{{userId}}', vars);
    expect(result).toBe('https://api.example.com/v2/users/42');
  });

  it('leaves unresolved keys in place and reports them', () => {
    const { result, unresolvedKeys } = interpolate('{{baseUrl}}/{{missing}}', vars);
    expect(result).toBe('https://api.example.com/{{missing}}');
    expect(unresolvedKeys).toContain('missing');
    expect(unresolvedKeys).toHaveLength(1);
  });

  it('deduplicates repeated unresolved keys', () => {
    const { unresolvedKeys } = interpolate('{{missing}}/{{missing}}', vars);
    expect(unresolvedKeys).toHaveLength(1);
    expect(unresolvedKeys[0]).toBe('missing');
  });

  it('does not substitute disabled variables', () => {
    const { result, unresolvedKeys } = interpolate('{{disabled}}', vars);
    expect(result).toBe('{{disabled}}');
    expect(unresolvedKeys).toContain('disabled');
  });

  it('marks secret variables in secretKeys', () => {
    const { result, secretKeys, unresolvedKeys } = interpolate('Bearer {{token}}', vars);
    expect(result).toBe('Bearer secret-abc');
    expect(secretKeys).toContain('token');
    expect(unresolvedKeys).toHaveLength(0);
  });

  it('returns empty string unchanged', () => {
    const { result, unresolvedKeys } = interpolate('', vars);
    expect(result).toBe('');
    expect(unresolvedKeys).toHaveLength(0);
  });

  it('returns template unchanged when no variables provided', () => {
    const { result, unresolvedKeys } = interpolate('{{baseUrl}}/test', []);
    expect(result).toBe('{{baseUrl}}/test');
    expect(unresolvedKeys).toContain('baseUrl');
  });

  it('handles template with no variable tokens', () => {
    const { result, unresolvedKeys } = interpolate('https://example.com/plain', vars);
    expect(result).toBe('https://example.com/plain');
    expect(unresolvedKeys).toHaveLength(0);
  });

  it('is case-sensitive — {{Token}} does not match "token"', () => {
    const { unresolvedKeys } = interpolate('{{Token}}', vars);
    expect(unresolvedKeys).toContain('Token');
  });

  it('handles keys with dots and underscores', () => {
    const dotVars = [makeVar('api.base_url', 'https://dotted.com')];
    const { result } = interpolate('{{api.base_url}}/path', dotVars);
    expect(result).toBe('https://dotted.com/path');
  });

  it('handles multiple different unresolved keys', () => {
    const { unresolvedKeys } = interpolate('{{a}}/{{b}}/{{c}}', []);
    expect(unresolvedKeys).toHaveLength(3);
    expect(unresolvedKeys).toContain('a');
    expect(unresolvedKeys).toContain('b');
    expect(unresolvedKeys).toContain('c');
  });
});
