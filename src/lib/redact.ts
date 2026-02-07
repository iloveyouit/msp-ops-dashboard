// Redaction patterns for sensitive data
const PATTERNS: Array<{ name: string; regex: RegExp; replacement: string }> = [
  { name: 'password', regex: /(?:password|passwd|pwd)\s*[:=]\s*\S+/gi, replacement: '[REDACTED_PASSWORD]' },
  { name: 'api_key', regex: /(?:api[_-]?key|apikey)\s*[:=]\s*\S+/gi, replacement: '[REDACTED_API_KEY]' },
  { name: 'token', regex: /(?:bearer|token)\s+[A-Za-z0-9._-]{20,}/gi, replacement: '[REDACTED_TOKEN]' },
  { name: 'connection_string', regex: /(?:Server|Data Source)=[^;]+;[^"'\s]*/gi, replacement: '[REDACTED_CONNECTION_STRING]' },
  { name: 'aws_key', regex: /AKIA[0-9A-Z]{16}/g, replacement: '[REDACTED_AWS_KEY]' },
  { name: 'private_key', regex: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA )?PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  { name: 'azure_secret', regex: /[a-zA-Z0-9+/]{40,}={0,2}(?=\s|$|")/g, replacement: '[POSSIBLE_SECRET_REDACTED]' },
];

export function redactSensitiveData(text: string): string {
  let result = text;
  for (const pattern of PATTERNS) {
    result = result.replace(pattern.regex, pattern.replacement);
  }
  return result;
}

export function hasRedactedContent(text: string): boolean {
  return text.includes('[REDACTED_') || text.includes('[POSSIBLE_SECRET_REDACTED]');
}
