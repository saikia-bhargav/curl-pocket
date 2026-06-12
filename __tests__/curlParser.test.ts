import { parseCurl } from '@/services/curlParser';

describe('curlParser — tokenizer', () => {
  it('handles single-quoted URL', () => {
    const r = parseCurl("curl 'https://api.example.com/users'");
    expect(r.valid).toBe(true);
    expect(r.request?.url).toBe('https://api.example.com/users');
  });

  it('handles double-quoted URL', () => {
    const r = parseCurl('curl "https://api.example.com/users"');
    expect(r.valid).toBe(true);
    expect(r.request?.url).toBe('https://api.example.com/users');
  });

  it('handles unquoted URL', () => {
    const r = parseCurl('curl https://api.example.com/users');
    expect(r.valid).toBe(true);
    expect(r.request?.url).toBe('https://api.example.com/users');
  });

  it('handles backslash line continuation', () => {
    const r = parseCurl(
      "curl 'https://api.example.com/users' \\\n  -H 'Content-Type: application/json'",
    );
    expect(r.valid).toBe(true);
    expect(r.request?.headers).toHaveLength(1);
    expect(r.request?.headers?.[0]?.key).toBe('Content-Type');
  });
});

describe('curlParser — method', () => {
  it('parses -X POST', () => {
    const r = parseCurl("curl -X POST 'https://api.example.com/users'");
    expect(r.request?.method).toBe('POST');
  });

  it('parses --request DELETE', () => {
    const r = parseCurl("curl --request DELETE 'https://api.example.com/users/1'");
    expect(r.request?.method).toBe('DELETE');
  });

  it('infers GET when no method and no body', () => {
    const r = parseCurl("curl 'https://api.example.com/users'");
    expect(r.request?.method).toBe('GET');
  });

  it('infers POST when body present but no -X', () => {
    const r = parseCurl(
      "curl 'https://api.example.com/users' -d '{\"name\":\"alice\"}'",
    );
    expect(r.request?.method).toBe('POST');
    expect(r.notes).toBeDefined();
  });

  it('respects explicit -X GET even with body', () => {
    const r = parseCurl(
      "curl -X GET 'https://api.example.com' -d 'test'",
    );
    expect(r.request?.method).toBe('GET');
  });
});

describe('curlParser — headers', () => {
  it('parses a single -H header', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' -H 'Accept: application/json'",
    );
    expect(r.request?.headers).toHaveLength(1);
    expect(r.request?.headers?.[0]?.key).toBe('Accept');
    expect(r.request?.headers?.[0]?.value).toBe('application/json');
  });

  it('parses multiple -H headers', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' " +
      "-H 'Accept: application/json' " +
      "-H 'X-Api-Key: abc123' " +
      "-H 'X-Request-ID: 999'",
    );
    expect(r.request?.headers).toHaveLength(3);
  });

  it('parses --header long form', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' --header 'Content-Type: application/json'",
    );
    expect(r.request?.headers?.[0]?.key).toBe('Content-Type');
  });

  it('header value can contain colons', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' -H 'X-Time: 12:00:00'",
    );
    expect(r.request?.headers?.[0]?.value).toBe('12:00:00');
  });
});

describe('curlParser — auth', () => {
  it('extracts Bearer token from Authorization header', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' -H 'Authorization: Bearer my-token-123'",
    );
    expect(r.request?.auth?.type).toBe('bearer');
    expect(r.request?.auth?.bearer?.token).toBe('my-token-123');
    // Authorization header should be removed from headers array
    expect(r.request?.headers?.find(h => h.key === 'Authorization')).toBeUndefined();
  });

  it('parses -u user:pass as Basic auth', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' -u admin:secret",
    );
    expect(r.request?.auth?.type).toBe('basic');
    expect(r.request?.auth?.basic?.username).toBe('admin');
    expect(r.request?.auth?.basic?.password).toBe('secret');
  });

  it('parses --user with no password', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' --user justuser",
    );
    expect(r.request?.auth?.type).toBe('basic');
    expect(r.request?.auth?.basic?.username).toBe('justuser');
    expect(r.request?.auth?.basic?.password).toBe('');
  });

  it('has no auth when no auth flags present', () => {
    const r = parseCurl("curl 'https://api.example.com'");
    expect(r.request?.auth?.type).toBe('none');
  });
});

describe('curlParser — body', () => {
  it('parses -d JSON body', () => {
    const r = parseCurl(
      "curl -X POST 'https://api.example.com' " +
      "-H 'Content-Type: application/json' " +
      "-d '{\"name\":\"alice\",\"age\":30}'",
    );
    expect(r.request?.body?.type).toBe('raw');
    expect(r.request?.body?.language).toBe('json');
    expect(r.request?.body?.raw).toContain('alice');
  });

  it('parses --data-raw body', () => {
    const r = parseCurl(
      "curl -X POST 'https://api.example.com' --data-raw 'plain text'",
    );
    expect(r.request?.body?.type).toBe('raw');
    expect(r.request?.body?.raw).toBe('plain text');
  });

  it('parses --data-urlencode as urlencoded body', () => {
    const r = parseCurl(
      "curl -X POST 'https://api.example.com' " +
      "--data-urlencode 'name=alice' " +
      "--data-urlencode 'city=New%20York'",
    );
    expect(r.request?.body?.type).toBe('urlencoded');
    expect(r.request?.body?.urlEncoded).toHaveLength(2);
    expect(r.request?.body?.urlEncoded?.[1]?.value).toBe('New York');
  });

  it('parses -d urlencoded string as urlencoded body', () => {
    const r = parseCurl(
      "curl -X POST 'https://api.example.com' " +
      "-H 'Content-Type: application/x-www-form-urlencoded' " +
      "-d 'name=alice&age=30'",
    );
    expect(r.request?.body?.type).toBe('urlencoded');
    expect(r.request?.body?.urlEncoded).toHaveLength(2);
  });

  it('parses -F form-data fields', () => {
    const r = parseCurl(
      "curl -X POST 'https://api.example.com/upload' " +
      "-F 'name=alice' " +
      "-F 'file=@photo.jpg'",
    );
    expect(r.request?.body?.type).toBe('form-data');
    expect(r.request?.body?.formData).toHaveLength(2);
    expect(r.request?.body?.formData?.[0]?.key).toBe('name');
  });

  it('auto-detects JSON body without Content-Type header', () => {
    const r = parseCurl(
      "curl -X POST 'https://api.example.com' -d '{\"key\":\"value\"}'",
    );
    expect(r.request?.body?.language).toBe('json');
  });

  it('sets body type to none when no body flags', () => {
    const r = parseCurl("curl 'https://api.example.com'");
    expect(r.request?.body?.type).toBe('none');
  });
});

describe('curlParser — URL params', () => {
  it('splits query params from URL', () => {
    const r = parseCurl(
      "curl 'https://api.example.com/users?page=1&limit=20'",
    );
    expect(r.request?.url).toBe('https://api.example.com/users');
    expect(r.request?.params).toHaveLength(2);
    expect(r.request?.params?.[0]?.key).toBe('page');
    expect(r.request?.params?.[0]?.value).toBe('1');
    expect(r.request?.params?.[1]?.key).toBe('limit');
    expect(r.request?.params?.[1]?.value).toBe('20');
  });

  it('URL-decodes param values', () => {
    const r = parseCurl(
      "curl 'https://api.example.com/search?q=hello%20world'",
    );
    expect(r.request?.params?.[0]?.value).toBe('hello world');
  });

  it('handles param with no value', () => {
    const r = parseCurl("curl 'https://api.example.com?flag'");
    expect(r.request?.params?.[0]?.key).toBe('flag');
    expect(r.request?.params?.[0]?.value).toBe('');
  });
});

describe('curlParser — stripped flags', () => {
  it('strips --compressed and adds a note', () => {
    const r = parseCurl(
      "curl 'https://api.example.com' --compressed",
    );
    expect(r.valid).toBe(true);
    expect(r.notes?.some(n => n.includes('--compressed'))).toBe(true);
  });

  it('strips -k/--insecure and adds a note', () => {
    const r = parseCurl(
      "curl -k 'https://api.example.com'",
    );
    expect(r.valid).toBe(true);
    expect(r.notes?.some(n => n.includes('--insecure'))).toBe(true);
  });

  it('strips -L / --location without error', () => {
    const r = parseCurl(
      "curl -L 'https://api.example.com'",
    );
    expect(r.valid).toBe(true);
  });

  it('strips -s --silent without error', () => {
    const r = parseCurl(
      "curl -s 'https://api.example.com'",
    );
    expect(r.valid).toBe(true);
  });
});

describe('curlParser — errors', () => {
  it('returns invalid for empty string', () => {
    const r = parseCurl('');
    expect(r.valid).toBe(false);
    expect(r.error).toBeDefined();
  });

  it('returns invalid when not starting with curl', () => {
    const r = parseCurl('wget https://example.com');
    expect(r.valid).toBe(false);
    expect(r.error).toContain('curl');
  });

  it('returns invalid when no URL found', () => {
    const r = parseCurl('curl -X POST -H "Accept: application/json"');
    expect(r.valid).toBe(false);
    expect(r.error).toContain('URL');
  });
});

describe('curlParser — real-world examples', () => {
  it('parses a full GitHub API request', () => {
    const r = parseCurl(
      "curl -L \\\n" +
      "  -X POST \\\n" +
      "  -H 'Accept: application/vnd.github+json' \\\n" +
      "  -H 'Authorization: Bearer ghp_token123' \\\n" +
      "  -H 'X-GitHub-Api-Version: 2022-11-28' \\\n" +
      "  -H 'Content-Type: application/json' \\\n" +
      "  https://api.github.com/repos/owner/repo/issues \\\n" +
      "  -d '{\"title\":\"Bug report\",\"body\":\"Found a bug\"}'",
    );
    expect(r.valid).toBe(true);
    expect(r.request?.method).toBe('POST');
    expect(r.request?.url).toBe('https://api.github.com/repos/owner/repo/issues');
    expect(r.request?.auth?.type).toBe('bearer');
    expect(r.request?.auth?.bearer?.token).toBe('ghp_token123');
    expect(r.request?.headers?.find(h => h.key === 'X-GitHub-Api-Version')).toBeDefined();
    expect(r.request?.body?.language).toBe('json');
  });

  it('parses a Stripe API charge request', () => {
    const r = parseCurl(
      "curl https://api.stripe.com/v1/charges \\\n" +
      "  -u sk_test_abc123: \\\n" +
      "  -d amount=2000 \\\n" +
      "  -d currency=usd \\\n" +
      "  -d 'source=tok_visa' \\\n" +
      "  -d 'description=My First Test Charge'",
    );
    expect(r.valid).toBe(true);
    expect(r.request?.auth?.type).toBe('basic');
    expect(r.request?.auth?.basic?.username).toBe('sk_test_abc123');
  });
});
