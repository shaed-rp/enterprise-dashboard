/**
 * Security Module Tests for SOC2 Compliance
 * 
 * These tests validate the security improvements implemented to address
 * critical SOC2 compliance issues identified in the security review.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SecureTokenManager,
  SessionManager,
  SecureLogger,
  AuditLogger,
  InputSanitizer,
  SecurityConfigManager,
  SecurityUtils,
  RateLimiter,
  CertificatePinner,
  DataEncryption,
  CSPManager,
} from '../security';

// Mock sessionStorage and localStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/dashboard',
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
  },
  writable: true,
});

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
    },
    getRandomValues: vi.fn(() => new Uint8Array(16).fill(1)),
  },
  writable: true,
});

describe('Security Module - SOC2 Compliance Tests', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('RateLimiter', () => {
    describe('Rate Limiting', () => {
      it('should allow requests within rate limit', () => {
        const identifier = 'test-endpoint';
        
        // First 100 requests should be allowed
        for (let i = 0; i < 100; i++) {
          expect(RateLimiter.isAllowed(identifier)).toBe(true);
        }
        
        // 101st request should be blocked
        expect(RateLimiter.isAllowed(identifier)).toBe(false);
      });

      it('should reset rate limit after window expires', () => {
        const identifier = 'test-endpoint';
        
        // Make some requests
        RateLimiter.isAllowed(identifier);
        RateLimiter.isAllowed(identifier);
        
        // Clear rate limit
        RateLimiter.clear(identifier);
        
        // Should be allowed again
        expect(RateLimiter.isAllowed(identifier)).toBe(true);
      });

      it('should return correct remaining requests', () => {
        const identifier = 'test-endpoint-remaining';
        
        expect(RateLimiter.getRemainingRequests(identifier)).toBe(100);
        
        RateLimiter.isAllowed(identifier);
        expect(RateLimiter.getRemainingRequests(identifier)).toBe(99);
      });

      it('should clear all rate limits', () => {
        const identifier1 = 'endpoint1';
        const identifier2 = 'endpoint2';
        
        RateLimiter.isAllowed(identifier1);
        RateLimiter.isAllowed(identifier2);
        
        RateLimiter.clearAll();
        
        expect(RateLimiter.getRemainingRequests(identifier1)).toBe(100);
        expect(RateLimiter.getRemainingRequests(identifier2)).toBe(100);
      });
    });
  });

  describe('CertificatePinner', () => {
    describe('Certificate Validation', () => {
      it('should initialize with environment fingerprints', () => {
        const originalEnv = process.env.REACT_APP_CERTIFICATE_FINGERPRINTS;
        process.env.REACT_APP_CERTIFICATE_FINGERPRINTS = 'sha256/test1,sha256/test2';
        
        CertificatePinner.initialize();
        
        expect(CertificatePinner.getExpectedFingerprints()).toContain('sha256/test1');
        expect(CertificatePinner.getExpectedFingerprints()).toContain('sha256/test2');
        
        process.env.REACT_APP_CERTIFICATE_FINGERPRINTS = originalEnv;
      });

      it('should validate certificate fingerprints', () => {
        const originalEnv = process.env.REACT_APP_CERTIFICATE_FINGERPRINTS;
        process.env.REACT_APP_CERTIFICATE_FINGERPRINTS = 'sha256/test1,sha256/test2';
        
        CertificatePinner.initialize();
        
        expect(CertificatePinner.validateCertificate('sha256/test1')).toBe(true);
        expect(CertificatePinner.validateCertificate('sha256/invalid')).toBe(false);
        
        process.env.REACT_APP_CERTIFICATE_FINGERPRINTS = originalEnv;
      });

      it('should allow all certificates when no pinning configured', () => {
        const originalEnv = process.env.REACT_APP_CERTIFICATE_FINGERPRINTS;
        delete process.env.REACT_APP_CERTIFICATE_FINGERPRINTS;
        
        CertificatePinner.initialize();
        
        expect(CertificatePinner.validateCertificate('any-certificate')).toBe(true);
        
        process.env.REACT_APP_CERTIFICATE_FINGERPRINTS = originalEnv;
      });
    });
  });

  describe('DataEncryption', () => {
    describe('Data Encryption and Decryption', () => {
      it('should encrypt and decrypt data correctly', async () => {
        const testData = 'sensitive information';
        
        // Mock crypto API
        const mockKey = {} as CryptoKey;
        const mockEncrypted = new ArrayBuffer(16);
        const mockExportedKey = new ArrayBuffer(32);
        
        vi.mocked(crypto.subtle.generateKey).mockResolvedValue(mockKey);
        vi.mocked(crypto.subtle.encrypt).mockResolvedValue(mockEncrypted);
        vi.mocked(crypto.subtle.exportKey).mockResolvedValue(mockExportedKey);
        vi.mocked(crypto.subtle.importKey).mockResolvedValue(mockKey);
        vi.mocked(crypto.subtle.decrypt).mockResolvedValue(new TextEncoder().encode(testData));
        
        const encrypted = await DataEncryption.encrypt(testData);
        const decrypted = await DataEncryption.decrypt(encrypted);
        
        expect(decrypted).toBe(testData);
      });

      it('should handle encryption errors gracefully', async () => {
        vi.mocked(crypto.subtle.generateKey).mockRejectedValue(new Error('Crypto error'));
        
        await expect(DataEncryption.encrypt('test')).rejects.toThrow('Failed to encrypt data');
      });

      it('should handle decryption errors gracefully', async () => {
        vi.mocked(crypto.subtle.importKey).mockRejectedValue(new Error('Import error'));
        
        await expect(DataEncryption.decrypt('invalid-data')).rejects.toThrow('Failed to decrypt data');
      });
    });
  });

  describe('CSPManager', () => {
    describe('Content Security Policy Management', () => {
      it('should initialize with environment nonce', () => {
        const originalEnv = process.env.REACT_APP_CSP_NONCE;
        process.env.REACT_APP_CSP_NONCE = 'test-nonce-123';
        
        CSPManager.initialize();
        
        expect(CSPManager.getNonce()).toBe('test-nonce-123');
        
        process.env.REACT_APP_CSP_NONCE = originalEnv;
      });

      it('should generate nonce when not provided', () => {
        const originalEnv = process.env.REACT_APP_CSP_NONCE;
        delete process.env.REACT_APP_CSP_NONCE;
        
        CSPManager.initialize();
        
        const nonce = CSPManager.getNonce();
        expect(nonce).toBeTruthy();
        expect(typeof nonce).toBe('string');
        
        process.env.REACT_APP_CSP_NONCE = originalEnv;
      });

      it('should validate nonce correctly', () => {
        CSPManager.initialize();
        const nonce = CSPManager.getNonce();
        
        expect(CSPManager.validateNonce(nonce)).toBe(true);
        expect(CSPManager.validateNonce('invalid-nonce')).toBe(false);
      });
    });
  });

  describe('SecureTokenManager', () => {
    describe('Token Storage Security', () => {
      it('should store tokens in sessionStorage instead of localStorage', () => {
        const token = 'test-jwt-token';
        const expiresIn = 3600;
        
        SecureTokenManager.setToken(token, expiresIn);
        
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_token', token);
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'auth_token_expires',
          expect.any(String)
        );
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      });

      it('should retrieve tokens from sessionStorage', () => {
        const token = 'test-jwt-token';
        const expiration = (Date.now() + 3600000).toString();
        
        mockSessionStorage.getItem
          .mockReturnValueOnce(token)
          .mockReturnValueOnce(expiration);
        
        const result = SecureTokenManager.getToken();
        
        expect(result).toBe(token);
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('auth_token');
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('auth_token_expires');
      });

      it('should clear tokens from sessionStorage', () => {
        SecureTokenManager.clearToken();
        
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token_expires');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      });

      it('should handle expired tokens', () => {
        const expiredTime = (Date.now() - 1000).toString();
        
        mockSessionStorage.getItem
          .mockReturnValueOnce('test-token')
          .mockReturnValueOnce(expiredTime);
        
        const result = SecureTokenManager.getToken();
        
        expect(result).toBeNull();
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token_expires');
      });

      it('should validate token existence', () => {
        mockSessionStorage.getItem.mockReturnValue('valid-token');
        expect(SecureTokenManager.isTokenValid()).toBe(true);
        
        mockSessionStorage.getItem.mockReturnValue(null);
        expect(SecureTokenManager.isTokenValid()).toBe(false);
      });
    });
  });

  describe('SessionManager', () => {
    describe('Session Management', () => {
      it('should start session with activity monitoring', () => {
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        
        SessionManager.startSession();
        
        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
        expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
        expect(addEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function), true);
      });

      it('should refresh session on activity', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
        const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
        
        SessionManager.refreshSession();
        
        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(setTimeoutSpy).toHaveBeenCalled();
      });

      it('should end session and clear data', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
        
        SessionManager.endSession();
        
        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(mockSessionStorage.clear).toHaveBeenCalled();
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_data');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard_preferences');
      });
    });
  });

  describe('SecureLogger', () => {
    describe('Secure Logging', () => {
      it('should sanitize sensitive data in error messages', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        SecureLogger.error('Password is invalid: secret123');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Secure Error:',
          '[REDACTED] is invalid: [REDACTED]'
        );
      });

      it('should sanitize sensitive data in objects', () => {
        const sensitiveData = {
          username: 'testuser',
          password: 'secret123',
          token: 'jwt-token-123',
        };
        
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        SecureLogger.error('Authentication failed', sensitiveData);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Secure Error:',
          'Authentication failed',
          expect.objectContaining({
            password: '[REDACTED]',
            token: '[REDACTED]',
            username: 'testuser'
          })
        );
      });

      it('should not log sensitive data to console in production', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        SecureLogger.error('Password is invalid: secret123');
        
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        
        process.env.NODE_ENV = originalEnv;
      });

      it('should send logs to secure logging service in production', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({ ok: true } as Response);
        
        SecureLogger.error('Test error message');
        
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/logs/security',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('Test error message'),
          })
        );
        
        process.env.NODE_ENV = originalEnv;
      });
    });
  });

  describe('AuditLogger', () => {
    describe('Audit Trail', () => {
      it('should log user actions with proper metadata', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({ ok: true } as Response);
        
        const auditEvent = {
          timestamp: '2025-01-15T10:30:00Z',
          userId: 'user-123',
          action: 'DATA_ACCESS',
          resource: 'customers',
          success: true,
          details: { customerId: 'cust-456' },
        };
        
        AuditLogger.logUserAction(auditEvent);
        
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/audit/log',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('DATA_ACCESS'),
          })
        );
      });

      it('should log security events', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({ ok: true } as Response);
        
        AuditLogger.logSecurityEvent('LOGIN_ATTEMPT', 'authentication', true, {
          username: 'testuser',
          ipAddress: '192.168.1.1',
        });
        
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/audit/log',
          expect.objectContaining({
            body: expect.stringContaining('LOGIN_ATTEMPT'),
          })
        );
      });

      it('should log authentication events', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({ ok: true } as Response);
        
        AuditLogger.logAuthEvent('LOGIN', true, { method: 'credentials' });
        
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/audit/log',
          expect.objectContaining({
            body: expect.stringContaining('LOGIN'),
          })
        );
      });

      it('should log data access events', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({ ok: true } as Response);
        
        AuditLogger.logDataAccess('customers', 'READ', true, { customerId: 'cust-123' });
        
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/audit/log',
          expect.objectContaining({
            body: expect.stringContaining('READ'),
          })
        );
      });
    });
  });

  describe('InputSanitizer', () => {
    describe('XSS Prevention', () => {
      it('should sanitize HTML input to prevent XSS', () => {
        const maliciousInput = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
        const sanitized = InputSanitizer.sanitizeHtml(maliciousInput);
        
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).toContain('&lt;script&gt;');
        expect(sanitized).toContain('&gt;');
      });

      it('should sanitize SQL input to prevent injection', () => {
        const maliciousInput = "'; DROP TABLE users; --";
        const sanitized = InputSanitizer.sanitizeSql(maliciousInput);
        
        expect(sanitized).not.toContain("'");
        expect(sanitized).not.toContain(';');
        expect(sanitized).not.toContain('--');
      });

      it('should sanitize JavaScript input', () => {
        const maliciousInput = '<script>alert("xss")</script>';
        const sanitized = InputSanitizer.sanitizeJavaScript(maliciousInput);
        
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('"');
      });

      it('should validate and sanitize email addresses', () => {
        const validEmail = 'test@example.com';
        const sanitized = InputSanitizer.sanitizeEmail(validEmail);
        
        expect(sanitized).toBe('test@example.com');
      });

      it('should reject invalid email addresses', () => {
        expect(() => InputSanitizer.sanitizeEmail('invalid-email')).toThrow('Invalid email format');
        expect(() => InputSanitizer.sanitizeEmail('test@')).toThrow('Invalid email format');
        expect(() => InputSanitizer.sanitizeEmail('@example.com')).toThrow('Invalid email format');
      });

      it('should validate and sanitize phone numbers', () => {
        const validPhone = '(555) 123-4567';
        const sanitized = InputSanitizer.sanitizePhone(validPhone);
        
        expect(sanitized).toBe('(555) 123-4567');
      });

      it('should reject invalid phone numbers', () => {
        expect(() => InputSanitizer.sanitizePhone('123')).toThrow('Phone number too short');
        expect(() => InputSanitizer.sanitizePhone('')).toThrow('Phone number too short');
      });

      it('should validate and sanitize URLs', () => {
        const validUrl = 'https://example.com';
        const sanitized = InputSanitizer.sanitizeUrl(validUrl);
        
        expect(sanitized).toBe('https://example.com/');
      });

      it('should reject invalid URLs', () => {
        expect(() => InputSanitizer.sanitizeUrl('invalid-url')).toThrow('Invalid URL format');
      });

      it('should sanitize file names', () => {
        const maliciousFileName = 'file<>:"/\\|?*.txt';
        const sanitized = InputSanitizer.sanitizeFileName(maliciousFileName);
        
        expect(sanitized).toBe('file_________.txt');
      });
    });
  });

  describe('SecurityConfigManager', () => {
    describe('Configuration Management', () => {
      it('should initialize with default configuration', () => {
        SecurityConfigManager.initialize();
        
        const config = SecurityConfigManager.getConfig();
        
        expect(config.sessionTimeout).toBe(30 * 60 * 1000);
        expect(config.maxLoginAttempts).toBe(5);
        expect(config.auditLogEndpoint).toBe('/api/audit/log');
        expect(config.secureLogEndpoint).toBe('/api/logs/security');
        expect(config.rateLimitWindow).toBe(15 * 60 * 1000);
        expect(config.rateLimitMaxRequests).toBe(100);
      });

      it('should allow custom configuration', () => {
        const customConfig = {
          sessionTimeout: 60 * 60 * 1000, // 1 hour
          maxLoginAttempts: 3,
          rateLimitMaxRequests: 50,
        };
        
        SecurityConfigManager.initialize(customConfig);
        
        const config = SecurityConfigManager.getConfig();
        
        expect(config.sessionTimeout).toBe(60 * 60 * 1000);
        expect(config.maxLoginAttempts).toBe(3);
        expect(config.rateLimitMaxRequests).toBe(50);
      });

      it('should update configuration', () => {
        SecurityConfigManager.initialize();
        
        SecurityConfigManager.updateConfig({
          sessionTimeout: 45 * 60 * 1000,
        });
        
        const config = SecurityConfigManager.getConfig();
        expect(config.sessionTimeout).toBe(45 * 60 * 1000);
      });

      it('should generate session ID on initialization', () => {
        SecurityConfigManager.initialize();
        
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'session_id',
          expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
        );
      });
    });
  });

  describe('SecurityUtils Integration', () => {
    it('should export all security utilities', () => {
      expect(SecurityUtils.SecureTokenManager).toBe(SecureTokenManager);
      expect(SecurityUtils.SessionManager).toBe(SessionManager);
      expect(SecurityUtils.SecureLogger).toBe(SecureLogger);
      expect(SecurityUtils.AuditLogger).toBe(AuditLogger);
      expect(SecurityUtils.InputSanitizer).toBe(InputSanitizer);
      expect(SecurityUtils.SecurityConfigManager).toBe(SecurityConfigManager);
      expect(SecurityUtils.RateLimiter).toBe(RateLimiter);
      expect(SecurityUtils.CertificatePinner).toBe(CertificatePinner);
      expect(SecurityUtils.DataEncryption).toBe(DataEncryption);
      expect(SecurityUtils.CSPManager).toBe(CSPManager);
    });
  });

  describe('SOC2 Compliance Validation', () => {
    it('should prevent sensitive data exposure in logs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const sensitiveData = {
        password: 'secret123',
        token: 'jwt-token',
        apiKey: 'api-key-123',
      };
      
      SecureLogger.error('Authentication error', sensitiveData);
      
      const loggedData = consoleErrorSpy.mock.calls[0][2];
      const loggedDataString = JSON.stringify(loggedData);
      
      expect(loggedDataString).not.toContain('secret123');
      expect(loggedDataString).not.toContain('jwt-token');
      expect(loggedDataString).not.toContain('api-key-123');
      expect(loggedDataString).toContain('[REDACTED]');
    });

    it('should provide comprehensive audit trail', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({ ok: true } as Response);
      
      // Simulate user actions
      AuditLogger.logAuthEvent('LOGIN', true, { method: 'credentials' });
      AuditLogger.logDataAccess('customers', 'READ', true, { customerId: 'cust-123' });
      AuditLogger.logSecurityEvent('PASSWORD_CHANGE', 'authentication', true);
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      
      // Verify audit entries contain required fields
      const auditCalls = mockFetch.mock.calls;
      auditCalls.forEach(call => {
        const body = JSON.parse(call[1]?.body as string);
        expect(body).toHaveProperty('timestamp');
        expect(body).toHaveProperty('userId');
        expect(body).toHaveProperty('action');
        expect(body).toHaveProperty('resource');
        expect(body).toHaveProperty('success');
      });
    });

    it('should implement secure session management', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      SessionManager.startSession();
      SessionManager.refreshSession();
      SessionManager.endSession();
      
      expect(addEventListenerSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });

    it('should prevent XSS attacks through input sanitization', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '"><script>alert("xss")</script>',
      ];
      
      maliciousInputs.forEach(input => {
        const sanitized = InputSanitizer.sanitizeHtml(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).not.toContain('javascript:');
      });
    });

    it('should implement rate limiting to prevent abuse', () => {
      const identifier = 'api-endpoint';
      
      // Should allow requests within limit
      for (let i = 0; i < 100; i++) {
        expect(RateLimiter.isAllowed(identifier)).toBe(true);
      }
      
      // Should block requests beyond limit
      expect(RateLimiter.isAllowed(identifier)).toBe(false);
      
      // Should provide remaining count
      expect(RateLimiter.getRemainingRequests(identifier)).toBe(0);
    });

    it('should support certificate pinning for MITM protection', () => {
      const originalEnv = process.env.REACT_APP_CERTIFICATE_FINGERPRINTS;
      process.env.REACT_APP_CERTIFICATE_FINGERPRINTS = 'sha256/valid1,sha256/valid2';
      
      CertificatePinner.initialize();
      
      expect(CertificatePinner.validateCertificate('sha256/valid1')).toBe(true);
      expect(CertificatePinner.validateCertificate('sha256/invalid')).toBe(false);
      
      process.env.REACT_APP_CERTIFICATE_FINGERPRINTS = originalEnv;
    });

    it('should support data encryption for sensitive information', async () => {
      const testData = 'sensitive customer data';
      
      // Mock crypto API for testing
      const mockKey = {} as CryptoKey;
      const mockEncrypted = new ArrayBuffer(16);
      const mockExportedKey = new ArrayBuffer(32);
      
      vi.mocked(crypto.subtle.generateKey).mockResolvedValue(mockKey);
      vi.mocked(crypto.subtle.encrypt).mockResolvedValue(mockEncrypted);
      vi.mocked(crypto.subtle.exportKey).mockResolvedValue(mockExportedKey);
      vi.mocked(crypto.subtle.importKey).mockResolvedValue(mockKey);
      vi.mocked(crypto.subtle.decrypt).mockResolvedValue(new TextEncoder().encode(testData));
      
      const encrypted = await DataEncryption.encrypt(testData);
      const decrypted = await DataEncryption.decrypt(encrypted);
      
      expect(decrypted).toBe(testData);
    });

    it('should support CSP nonce management', () => {
      const originalEnv = process.env.REACT_APP_CSP_NONCE;
      process.env.REACT_APP_CSP_NONCE = 'test-nonce-456';
      
      CSPManager.initialize();
      
      expect(CSPManager.getNonce()).toBe('test-nonce-456');
      expect(CSPManager.validateNonce('test-nonce-456')).toBe(true);
      expect(CSPManager.validateNonce('invalid-nonce')).toBe(false);
      
      process.env.REACT_APP_CSP_NONCE = originalEnv;
    });
  });
});
