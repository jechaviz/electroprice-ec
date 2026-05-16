import { describe, it, expect } from 'vitest';
import { sanitizeInput, escapeHtml, isValidEmail, isValidPassword, sanitizeObject } from './sanitize';

describe('sanitizeInput', () => {
  it('strips HTML tags from script', () => {
    expect(sanitizeInput('<b>Bold</b>')).toBe('Bold');
  });

  it('removes script content entirely for security', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(123 as any)).toBe('');
  });

  it('handles plain text without modification', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });

  it('strips nested HTML', () => {
    expect(sanitizeInput('<div><b>Bold</b> text</div>')).toBe('Bold text');
  });
});

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    const result = escapeHtml('<script>&"\'');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&amp;');
    expect(result).not.toContain('<script>');
  });

  it('handles plain text', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.name@domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('no@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('validates strong passwords', () => {
    const result = isValidPassword('Password1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects weak passwords', () => {
    const result = isValidPassword('pass');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('requires uppercase', () => {
    const result = isValidPassword('password1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain an uppercase letter');
  });

  it('requires number', () => {
    const result = isValidPassword('Password');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain a number');
  });

  it('requires 8 characters minimum', () => {
    const result = isValidPassword('Pass1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });
});

describe('sanitizeObject', () => {
  it('sanitizes string values in objects', () => {
    const input = { name: '<b>John</b>', age: 30 };
    const result = sanitizeObject(input);
    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
  });

  it('sanitizes nested objects', () => {
    const input = { user: { name: '<b>evil</b>' } };
    const result = sanitizeObject(input as any);
    expect((result as any).user.name).toBe('evil');
  });

  it('sanitizes arrays of strings', () => {
    const input = { tags: ['<b>good</b>', 'plain'] };
    const result = sanitizeObject(input);
    expect(result.tags).toEqual(['good', 'plain']);
  });
});
