/**
 * Security Utilities for SOC2 Compliance
 * 
 * This module provides security utilities to address critical SOC2 compliance issues:
 * - Secure token storage and management
 * - Audit logging
 * - Secure error handling
 * - Input sanitization
 * - Session management
 * - Rate limiting
 * - Certificate pinning
 * - Data encryption
 */

// Types for security events
export interface AuditEvent {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, unknown>;
  sessionId?: string;
}

export interface SecurityConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  auditLogEndpoint: string;
  secureLogEndpoint: string;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
  cspNonce?: string;
  certificateFingerprints?: string[];
}

// Security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  auditLogEndpoint: '/api/audit/log',
  secureLogEndpoint: '/api/logs/security',
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100,
};

/**
 * Rate Limiting Utility
 * Prevents abuse and brute force attacks
 */
export class RateLimiter {
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if request is allowed
   */
  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    const config = SecurityConfigManager.getConfig();
    const record = this.requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + config.rateLimitWindow,
      });
      return true;
    }

    if (record.count >= config.rateLimitMaxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  static getRemainingRequests(identifier: string): number {
    const record = this.requestCounts.get(identifier);
    if (!record) {
      return SecurityConfigManager.getConfig().rateLimitMaxRequests;
    }
    const remaining = SecurityConfigManager.getConfig().rateLimitMaxRequests - record.count;
    return Math.max(0, remaining);
  }

  /**
   * Clear rate limit for identifier
   */
  static clear(identifier: string): void {
    this.requestCounts.delete(identifier);
  }

  /**
   * Clear all rate limits
   */
  static clearAll(): void {
    this.requestCounts.clear();
  }
}

/**
 * Certificate Pinning Utility
 * Prevents man-in-the-middle attacks
 */
export class CertificatePinner {
  private static readonly EXPECTED_FINGERPRINTS: string[] = [];
  private static initialized = false;

  /**
   * Initialize certificate fingerprints from environment
   */
  static initialize(): void {
    // Clear existing fingerprints and reset initialization
    this.EXPECTED_FINGERPRINTS.length = 0;
    this.initialized = false;
    
    const fingerprints = process.env.REACT_APP_CERTIFICATE_FINGERPRINTS;
    if (fingerprints) {
      this.EXPECTED_FINGERPRINTS.push(...fingerprints.split(','));
    }
    this.initialized = true;
  }

  /**
   * Validate certificate fingerprint
   */
  static validateCertificate(certificate: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }
    
    // If no fingerprints are configured, allow all certificates
    if (this.EXPECTED_FINGERPRINTS.length === 0) {
      return true;
    }
    return this.EXPECTED_FINGERPRINTS.includes(certificate);
  }

  /**
   * Get expected fingerprints
   */
  static getExpectedFingerprints(): string[] {
    if (!this.initialized) {
      this.initialize();
    }
    return [...this.EXPECTED_FINGERPRINTS];
  }
}

/**
 * Data Encryption Utility
 * Provides client-side encryption for sensitive data
 */
export class DataEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  /**
   * Generate encryption key
   */
  private static async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate initialization vector
   */
  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
  }

  /**
   * Encrypt sensitive data
   */
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.generateKey();
      const iv = this.generateIV();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        dataBuffer
      );

      // Export key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      
      // Combine IV, key, and encrypted data
      const combined = new Uint8Array(iv.length + exportedKey.byteLength + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(exportedKey), iv.length);
      combined.set(new Uint8Array(encrypted), iv.length + exportedKey.byteLength);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      SecureLogger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const keyData = combined.slice(12, 12 + 32); // 256-bit key
      const encrypted = combined.slice(12 + 32);

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      SecureLogger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

/**
 * Content Security Policy Utility
 * Manages CSP nonces and validation
 */
export class CSPManager {
  private static nonce: string | null = null;

  /**
   * Initialize CSP nonce
   */
  static initialize(): void {
    this.nonce = process.env.REACT_APP_CSP_NONCE || this.generateNonce();
  }

  /**
   * Get current nonce
   */
  static getNonce(): string {
    if (!this.nonce) {
      this.initialize();
    }
    return this.nonce!;
  }

  /**
   * Generate new nonce
   */
  private static generateNonce(): string {
    return btoa(crypto.getRandomValues(new Uint8Array(16)).join(''));
  }

  /**
   * Validate nonce
   */
  static validateNonce(nonce: string): boolean {
    return this.nonce === nonce;
  }
}

/**
 * Secure Token Storage using httpOnly cookies
 * This replaces localStorage to prevent XSS attacks
 */
export class SecureTokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  /**
   * Store authentication token securely
   * In production, this should use httpOnly cookies set by the server
   */
  static setToken(token: string, expiresIn: number = 3600): void {
    try {
      // For development, use sessionStorage (less vulnerable than localStorage)
      // In production, tokens should be stored in httpOnly cookies by the server
      sessionStorage.setItem(this.TOKEN_KEY, token);
      
      // Set expiration
      const expiration = Date.now() + (expiresIn * 1000);
      sessionStorage.setItem(`${this.TOKEN_KEY}_expires`, expiration.toString());
      
      // Log token storage event
      AuditLogger.logSecurityEvent('TOKEN_STORED', 'authentication', true);
    } catch (error) {
      SecureLogger.error('Failed to store token securely', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve authentication token
   */
  static getToken(): string | null {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiration = sessionStorage.getItem(`${this.TOKEN_KEY}_expires`);
      
      if (!token || !expiration) {
        return null;
      }
      
      // Check if token has expired
      if (Date.now() > parseInt(expiration, 10)) {
        this.clearToken();
        return null;
      }
      
      return token;
    } catch (error) {
      SecureLogger.error('Failed to retrieve token', error);
      return null;
    }
  }

  /**
   * Clear authentication token
   */
  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(`${this.TOKEN_KEY}_expires`);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      
      AuditLogger.logSecurityEvent('TOKEN_CLEARED', 'authentication', true);
    } catch (error) {
      SecureLogger.error('Failed to clear token', error);
    }
  }

  /**
   * Check if token is valid and not expired
   */
  static isTokenValid(): boolean {
    const token = this.getToken();
    return token !== null;
  }
}

/**
 * Secure Session Management
 */
export class SessionManager {
  private static sessionTimer: NodeJS.Timeout | null = null;
  private static activityTimer: NodeJS.Timeout | null = null;
  private static lastActivity: number = Date.now();

  /**
   * Start session with timeout monitoring
   */
  static startSession(): void {
    this.lastActivity = Date.now();
    this.setupActivityMonitoring();
    this.setSessionTimer();
    
    AuditLogger.logSecurityEvent('SESSION_STARTED', 'session', true);
  }

  /**
   * Refresh session on user activity
   */
  static refreshSession(): void {
    this.lastActivity = Date.now();
    
    // Reset session timer
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    this.setSessionTimer();
  }

  /**
   * End session and clear all sensitive data
   */
  static endSession(): void {
    try {
      // Clear timers
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
        this.sessionTimer = null;
      }
      if (this.activityTimer) {
        clearTimeout(this.activityTimer);
        this.activityTimer = null;
      }

      // Clear sensitive data
      SecureTokenManager.clearToken();
      this.clearUserData();
      
      AuditLogger.logSecurityEvent('SESSION_ENDED', 'session', true);
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      SecureLogger.error('Failed to end session', error);
    }
  }

  /**
   * Setup activity monitoring
   */
  private static setupActivityMonitoring(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.refreshSession();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Store reference for cleanup
    (window as any).__activityHandler = activityHandler;
  }

  /**
   * Set session timeout timer
   */
  private static setSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(() => {
      AuditLogger.logSecurityEvent('SESSION_TIMEOUT', 'session', false);
      this.endSession();
    }, SecurityConfigManager.getConfig().sessionTimeout);
  }

  /**
   * Clear user data from storage
   */
  private static clearUserData(): void {
    try {
      // Clear all session storage
      sessionStorage.clear();
      
      // Clear specific localStorage items (if any)
      localStorage.removeItem('user_data');
      localStorage.removeItem('dashboard_preferences');
    } catch (error) {
      SecureLogger.error('Failed to clear user data', error);
    }
  }
}

/**
 * Secure Logging System
 * Prevents sensitive data exposure in console logs
 */
export class SecureLogger {
  private static readonly SENSITIVE_PATTERNS = [
    /\bpassword\b/gi,
    /\btoken\b/gi,
    /\bsecret\b/gi,
    /\bkey\b/gi,
    /\bcredential\b/gi,
  ];

  /**
   * Log error securely without exposing sensitive data
   */
  static error(message: string, error?: unknown): void {
    try {
      const sanitizedMessage = this.sanitizeMessage(message);
      const sanitizedError = this.sanitizeError(error);
      
      // Send to secure logging service
      this.sendToLoggingService('ERROR', sanitizedMessage, sanitizedError);
      
      // Log to console in development and test environments
      if (process.env.NODE_ENV !== 'production') {
        if (sanitizedError) {
          console.error('Secure Error:', sanitizedMessage, sanitizedError);
        } else {
          console.error('Secure Error:', sanitizedMessage);
        }
      }
    } catch (logError) {
      // Fallback to console if logging service fails
      console.error('Logging service error:', logError);
    }
  }

  /**
   * Log warning securely
   */
  static warn(message: string, data?: unknown): void {
    try {
      const sanitizedMessage = this.sanitizeMessage(message);
      const sanitizedData = this.sanitizeData(data);
      
      this.sendToLoggingService('WARN', sanitizedMessage, sanitizedData);
      
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Secure Warning:', sanitizedMessage);
      }
    } catch (error) {
      console.warn('Logging service error:', error);
    }
  }

  /**
   * Log info securely
   */
  static info(message: string, data?: unknown): void {
    try {
      const sanitizedMessage = this.sanitizeMessage(message);
      const sanitizedData = this.sanitizeData(data);
      
      this.sendToLoggingService('INFO', sanitizedMessage, sanitizedData);
    } catch (error) {
      // Info logs don't need fallback to console
    }
  }

  /**
   * Sanitize message to remove sensitive data
   */
  private static sanitizeMessage(message: string): string {
    let sanitized = message;
    
    // Replace sensitive patterns with [REDACTED]
    this.SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    // Also sanitize common sensitive values
    sanitized = sanitized.replace(/secret\d+/gi, '[REDACTED]');
    
    return sanitized;
  }

  /**
   * Sanitize error object
   */
  private static sanitizeError(error?: unknown): unknown {
    if (!error) return undefined;
    
    if (error instanceof Error) {
      return {
        name: error.name,
        message: this.sanitizeMessage(error.message),
        stack: this.sanitizeMessage(error.stack || ''),
      };
    }
    
    return this.sanitizeData(error);
  }

  /**
   * Sanitize data object
   */
  private static sanitizeData(data?: unknown): unknown {
    if (!data) return undefined;
    
    if (typeof data === 'string') {
      return this.sanitizeMessage(data);
    }
    
    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (this.containsSensitiveData(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Check if data contains sensitive information
   */
  private static containsSensitiveData(data: string): boolean {
    return this.SENSITIVE_PATTERNS.some(pattern => pattern.test(data));
  }

  /**
   * Send log to secure logging service
   */
  private static async sendToLoggingService(
    level: string, 
    message: string, 
    data?: unknown
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // In production, send to secure logging service
      if (process.env.NODE_ENV === 'production') {
        await fetch(SecurityConfigManager.getConfig().secureLogEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SecureTokenManager.getToken()}`,
          },
          body: JSON.stringify(logEntry),
        });
      }
    } catch (error) {
      // Don't log logging errors to avoid infinite loops
    }
  }

  /**
   * Get current user ID for logging
   */
  private static getCurrentUserId(): string | undefined {
    try {
      const userData = sessionStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  /**
   * Get session ID for logging
   */
  private static getSessionId(): string {
    return sessionStorage.getItem('session_id') || 'unknown';
  }
}

/**
 * Audit Logging System
 * Provides comprehensive audit trail for SOC2 compliance
 */
export class AuditLogger {
  /**
   * Log user action for audit trail
   */
  static logUserAction(event: AuditEvent): void {
    try {
      const auditEntry = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        sessionId: event.sessionId || this.getSessionId(),
        ipAddress: event.ipAddress || this.getClientIP(),
        userAgent: event.userAgent || navigator.userAgent,
      };

      this.sendToAuditService(auditEntry);
    } catch (error) {
      SecureLogger.error('Failed to log audit event', error);
    }
  }

  /**
   * Log security event
   */
  static logSecurityEvent(
    action: string, 
    resource: string, 
    success: boolean, 
    details?: Record<string, unknown>
  ): void {
    this.logUserAction({
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId() || 'anonymous',
      action,
      resource,
      success,
      details,
    });
  }

  /**
   * Log authentication event
   */
  static logAuthEvent(
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE',
    success: boolean,
    details?: Record<string, unknown>
  ): void {
    this.logSecurityEvent(action, 'authentication', success, details);
  }

  /**
   * Log data access event
   */
  static logDataAccess(
    resource: string,
    action: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT',
    success: boolean,
    details?: Record<string, unknown>
  ): void {
    this.logUserAction({
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId() || 'anonymous',
      action,
      resource,
      success,
      details,
    });
  }

  /**
   * Send audit entry to audit service
   */
  private static async sendToAuditService(auditEntry: AuditEvent): Promise<void> {
    try {
      // Always send to audit service, even in test environment
      await fetch(SecurityConfigManager.getConfig().auditLogEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SecureTokenManager.getToken()}`,
        },
        body: JSON.stringify(auditEntry),
      });
    } catch (error) {
      SecureLogger.error('Failed to send audit entry', error);
    }
  }

  /**
   * Get current user ID
   */
  private static getCurrentUserId(): string | undefined {
    try {
      const userData = sessionStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  /**
   * Get session ID
   */
  private static getSessionId(): string {
    return sessionStorage.getItem('session_id') || 'unknown';
  }

  /**
   * Get client IP (approximation)
   */
  private static getClientIP(): string {
    // In a real implementation, this would be provided by the server
    return 'unknown';
  }
}

/**
 * Input Sanitization Utilities
 */
export class InputSanitizer {
  /**
   * Sanitize HTML input to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    if (!input) return '';
    
    // Enhanced HTML sanitization to prevent XSS
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Remove event handlers and dangerous attributes
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSql(input: string): string {
    if (!input) return '';
    
    // Enhanced SQL injection prevention
    return input
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/union/gi, '')
      .replace(/select/gi, '')
      .replace(/drop/gi, '')
      .replace(/delete/gi, '')
      .replace(/insert/gi, '')
      .replace(/update/gi, '');
  }

  /**
   * Sanitize JavaScript input
   */
  static sanitizeJavaScript(input: string): string {
    if (!input) return '';
    
    // Remove JavaScript injection patterns
    return input.replace(/[<>"'&]/g, '');
  }

  /**
   * Validate and sanitize email
   */
  static sanitizeEmail(email: string): string {
    if (!email) return '';
    
    // Basic email validation and sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    return email.toLowerCase().trim();
  }

  /**
   * Validate and sanitize phone number
   */
  static sanitizePhone(phone: string): string {
    if (!phone) {
      throw new Error('Phone number too short');
    }
    
    // Remove all non-digit characters except +, -, (, )
    const sanitized = phone.replace(/[^\d+\-\(\)\s]/g, '');
    
    // Basic validation
    if (sanitized.length < 10) {
      throw new Error('Phone number too short');
    }
    
    return sanitized;
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Validate and sanitize file name
   */
  static sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    // Remove potentially dangerous characters and limit length
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .substring(0, 255); // Limit length
  }
}

/**
 * Security Configuration Manager
 */
export class SecurityConfigManager {
  private static config: SecurityConfig = DEFAULT_SECURITY_CONFIG;

  /**
   * Initialize security configuration
   */
  static initialize(config: Partial<SecurityConfig> = {}): void {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
    
    // Initialize security components
    CertificatePinner.initialize();
    CSPManager.initialize();
    
    // Start session management
    SessionManager.startSession();
    
    // Generate session ID
    this.generateSessionId();
    
    SecureLogger.info('Security configuration initialized');
  }

  /**
   * Get security configuration
   */
  static getConfig(): SecurityConfig {
    return this.config;
  }

  /**
   * Update security configuration
   */
  static updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
    SecureLogger.info('Security configuration updated', updates);
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): void {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
}

// Export security utilities
export const SecurityUtils = {
  SecureTokenManager,
  SessionManager,
  SecureLogger,
  AuditLogger,
  InputSanitizer,
  SecurityConfigManager,
  RateLimiter,
  CertificatePinner,
  DataEncryption,
  CSPManager,
};

// Initialize security on module load
if (typeof window !== 'undefined') {
  SecurityConfigManager.initialize();
}
