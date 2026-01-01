/**
 * Input Validator Security Tests
 *
 * Test suite for InputValidator covering:
 * - XSS prevention
 * - Injection attack prevention
 * - Length validation
 * - Type validation
 * - Sanitization
 */

import {
  InputValidator,
  ValidationError,
} from '../../agentic-flow/src/utils/input-validator.js';

describe('InputValidator', () => {
  describe('validateTaskDescription', () => {
    test('should validate valid task description', () => {
      const result = InputValidator.validateTaskDescription('Valid task description');
      expect(result).toBe('Valid task description');
    });

    test('should reject null input', () => {
      expect(() => {
        InputValidator.validateTaskDescription(null as any);
      }).toThrow(ValidationError);
    });

    test('should reject undefined input', () => {
      expect(() => {
        InputValidator.validateTaskDescription(undefined as any);
      }).toThrow(ValidationError);
    });

    test('should reject non-string input', () => {
      expect(() => {
        InputValidator.validateTaskDescription(123 as any);
      }).toThrow(ValidationError);
      expect(() => {
        InputValidator.validateTaskDescription({ task: 'test' } as any);
      }).toThrow(ValidationError);
    });

    test('should reject empty string by default', () => {
      expect(() => {
        InputValidator.validateTaskDescription('');
      }).toThrow(ValidationError);
      expect(() => {
        InputValidator.validateTaskDescription('   ');
      }).toThrow(ValidationError);
    });

    test('should allow empty string when configured', () => {
      const result = InputValidator.validateTaskDescription('', { allowEmpty: true });
      expect(result).toBe('');
    });

    test('should reject XSS attempts - script tags', () => {
      expect(() => {
        InputValidator.validateTaskDescription('<script>alert("XSS")</script>');
      }).toThrow(ValidationError);
      expect(() => {
        InputValidator.validateTaskDescription('<SCRIPT>alert("XSS")</SCRIPT>');
      }).toThrow(ValidationError);
    });

    test('should reject XSS attempts - javascript: protocol', () => {
      expect(() => {
        InputValidator.validateTaskDescription('javascript:alert("XSS")');
      }).toThrow(ValidationError);
    });

    test('should reject XSS attempts - data URI', () => {
      expect(() => {
        InputValidator.validateTaskDescription('data:text/html,<script>alert("XSS")</script>');
      }).toThrow(ValidationError);
    });

    test('should reject XSS attempts - event handlers', () => {
      expect(() => {
        InputValidator.validateTaskDescription('<img onerror="alert(1)" src="x">');
      }).toThrow(ValidationError);
      expect(() => {
        InputValidator.validateTaskDescription('<div onclick="alert(1)">Click</div>');
      }).toThrow(ValidationError);
    });

    test('should reject eval() attempts', () => {
      expect(() => {
        InputValidator.validateTaskDescription('eval("malicious code")');
      }).toThrow(ValidationError);
    });

    test('should reject Function constructor attempts', () => {
      expect(() => {
        InputValidator.validateTaskDescription('new Function("return 1")()');
      }).toThrow(ValidationError);
    });

    test('should reject prototype pollution attempts', () => {
      expect(() => {
        InputValidator.validateTaskDescription('__proto__.isAdmin = true');
      }).toThrow(ValidationError);
    });

    test('should reject path traversal attempts', () => {
      expect(() => {
        InputValidator.validateTaskDescription('../../etc/passwd');
      }).toThrow(ValidationError);
    });

    test('should reject SQL injection characters', () => {
      expect(() => {
        InputValidator.validateTaskDescription("'; DROP TABLE users; --");
      }).toThrow(ValidationError);
    });

    test('should remove control characters', () => {
      const result = InputValidator.validateTaskDescription('Hello\x00World\x1F');
      expect(result).toBe('HelloWorld');
      expect(result).not.toContain('\x00');
      expect(result).not.toContain('\x1F');
    });

    test('should enforce minimum length', () => {
      expect(() => {
        InputValidator.validateTaskDescription('ab', { minLength: 3 });
      }).toThrow(ValidationError);
    });

    test('should enforce maximum length', () => {
      const longString = 'a'.repeat(10001);
      expect(() => {
        InputValidator.validateTaskDescription(longString);
      }).toThrow(ValidationError);
    });

    test('should respect custom length limits', () => {
      const result = InputValidator.validateTaskDescription('test', {
        minLength: 2,
        maxLength: 10,
      });
      expect(result).toBe('test');
    });

    test('should trim whitespace', () => {
      const result = InputValidator.validateTaskDescription('  test task  ');
      expect(result).toBe('test task');
    });
  });

  describe('validateAgentName', () => {
    test('should validate valid agent name', () => {
      const result = InputValidator.validateAgentName('my-agent-123');
      expect(result).toBe('my-agent-123');
    });

    test('should convert to lowercase', () => {
      const result = InputValidator.validateAgentName('MyAgent');
      expect(result).toBe('myagent');
    });

    test('should reject empty name', () => {
      expect(() => {
        InputValidator.validateAgentName('');
      }).toThrow(ValidationError);
    });

    test('should reject name with special characters', () => {
      expect(() => {
        InputValidator.validateAgentName('agent@name');
      }).toThrow(ValidationError);
      expect(() => {
        InputValidator.validateAgentName('agent name');
      }).toThrow(ValidationError);
    });

    test('should reject name exceeding 100 chars', () => {
      const longName = 'a'.repeat(101);
      expect(() => {
        InputValidator.validateAgentName(longName);
      }).toThrow(ValidationError);
    });

    test('should allow alphanumeric, dash, and underscore', () => {
      expect(InputValidator.validateAgentName('agent-123_test')).toBe('agent-123_test');
    });
  });

  describe('validateConfidence', () => {
    test('should validate valid confidence values', () => {
      expect(InputValidator.validateConfidence(0)).toBe(0);
      expect(InputValidator.validateConfidence(0.5)).toBe(0.5);
      expect(InputValidator.validateConfidence(1)).toBe(1);
    });

    test('should reject non-number values', () => {
      expect(() => {
        InputValidator.validateConfidence('0.5' as any);
      }).toThrow(ValidationError);
    });

    test('should reject NaN', () => {
      expect(() => {
        InputValidator.validateConfidence(NaN);
      }).toThrow(ValidationError);
    });

    test('should reject Infinity', () => {
      expect(() => {
        InputValidator.validateConfidence(Infinity);
      }).toThrow(ValidationError);
    });

    test('should reject negative values', () => {
      expect(() => {
        InputValidator.validateConfidence(-0.1);
      }).toThrow(ValidationError);
    });

    test('should reject values > 1', () => {
      expect(() => {
        InputValidator.validateConfidence(1.1);
      }).toThrow(ValidationError);
    });
  });

  describe('validateTimeout', () => {
    test('should validate valid timeout', () => {
      expect(InputValidator.validateTimeout(1000)).toBe(1000);
    });

    test('should floor decimal values', () => {
      expect(InputValidator.validateTimeout(1000.7)).toBe(1000);
    });

    test('should reject values below minimum', () => {
      expect(() => {
        InputValidator.validateTimeout(50, 100);
      }).toThrow(ValidationError);
    });

    test('should reject values above maximum', () => {
      expect(() => {
        InputValidator.validateTimeout(400000, 100, 300000);
      }).toThrow(ValidationError);
    });

    test('should accept custom min/max', () => {
      expect(InputValidator.validateTimeout(5000, 1000, 10000)).toBe(5000);
    });
  });

  describe('validateStringArray', () => {
    test('should validate valid string array', () => {
      const result = InputValidator.validateStringArray(['a', 'b', 'c'], 'items');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    test('should reject non-array', () => {
      expect(() => {
        InputValidator.validateStringArray('not an array', 'items');
      }).toThrow(ValidationError);
    });

    test('should reject array with non-string items', () => {
      expect(() => {
        InputValidator.validateStringArray(['a', 123, 'c'], 'items');
      }).toThrow(ValidationError);
    });

    test('should reject array exceeding max items', () => {
      const largeArray = new Array(101).fill('item');
      expect(() => {
        InputValidator.validateStringArray(largeArray, 'items', 100);
      }).toThrow(ValidationError);
    });

    test('should reject items exceeding max length', () => {
      expect(() => {
        InputValidator.validateStringArray(['a'.repeat(1001)], 'items', 100, 1000);
      }).toThrow(ValidationError);
    });
  });

  describe('validateConfig', () => {
    test('should validate valid config', () => {
      const schema = {
        name: { type: 'string' as const, required: true },
        age: { type: 'number' as const, required: true, min: 0, max: 150 },
      };

      const config = { name: 'Test', age: 25 };
      const result = InputValidator.validateConfig(config, schema);
      expect(result).toEqual(config);
    });

    test('should reject missing required fields', () => {
      const schema = {
        name: { type: 'string' as const, required: true },
      };

      expect(() => {
        InputValidator.validateConfig({}, schema);
      }).toThrow(ValidationError);
    });

    test('should allow optional fields', () => {
      const schema = {
        name: { type: 'string' as const, required: false },
      };

      const result = InputValidator.validateConfig({}, schema);
      expect(result).toEqual({});
    });

    test('should validate number ranges', () => {
      const schema = {
        count: { type: 'number' as const, required: true, min: 1, max: 10 },
      };

      expect(() => {
        InputValidator.validateConfig({ count: 0 }, schema);
      }).toThrow(ValidationError);

      expect(() => {
        InputValidator.validateConfig({ count: 11 }, schema);
      }).toThrow(ValidationError);

      const result = InputValidator.validateConfig({ count: 5 }, schema);
      expect(result.count).toBe(5);
    });

    test('should use custom validators', () => {
      const schema = {
        email: {
          type: 'string' as const,
          required: true,
          validator: (val: string) => val.includes('@'),
        },
      };

      expect(() => {
        InputValidator.validateConfig({ email: 'invalid' }, schema);
      }).toThrow(ValidationError);

      const result = InputValidator.validateConfig({ email: 'test@example.com' }, schema);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('sanitizeHtml', () => {
    test('should strip HTML tags', () => {
      const result = InputValidator.sanitizeHtml('<div>Hello <b>World</b></div>');
      expect(result).toBe('Hello World');
    });

    test('should decode HTML entities', () => {
      const result = InputValidator.sanitizeHtml('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(result).toBe('<script>alert(1)</script>');
    });

    test('should handle empty string', () => {
      expect(InputValidator.sanitizeHtml('')).toBe('');
    });

    test('should handle non-string input', () => {
      expect(InputValidator.sanitizeHtml(null as any)).toBe('');
      expect(InputValidator.sanitizeHtml(undefined as any)).toBe('');
    });
  });

  describe('validateEmail', () => {
    test('should validate valid email', () => {
      expect(InputValidator.validateEmail('test@example.com')).toBe('test@example.com');
    });

    test('should normalize to lowercase', () => {
      expect(InputValidator.validateEmail('Test@Example.COM')).toBe('test@example.com');
    });

    test('should trim whitespace', () => {
      expect(InputValidator.validateEmail('  test@example.com  ')).toBe('test@example.com');
    });

    test('should reject invalid formats', () => {
      expect(() => InputValidator.validateEmail('invalid')).toThrow(ValidationError);
      expect(() => InputValidator.validateEmail('@example.com')).toThrow(ValidationError);
      expect(() => InputValidator.validateEmail('test@')).toThrow(ValidationError);
    });

    test('should reject emails over 254 chars', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => InputValidator.validateEmail(longEmail)).toThrow(ValidationError);
    });
  });
});
