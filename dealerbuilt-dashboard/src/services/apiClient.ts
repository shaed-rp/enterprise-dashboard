import { toast } from 'sonner';
import { 
  SecureLogger, 
  AuditLogger, 
  RateLimiter, 
  CertificatePinner,
  SecurityConfigManager 
} from '../lib/security';

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  skipRateLimit?: boolean;
}

// API Client Configuration
interface ApiClientConfig {
  baseURL: string;
  defaultTimeout: number;
  maxRetries: number;
  retryDelay: number;
}

class ApiClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      defaultTimeout: config.defaultTimeout || 10000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    // Log token update for audit trail
    AuditLogger.logSecurityEvent('API_TOKEN_UPDATED', 'api_client', true);
  }

  clearAuthToken(): void {
    this.authToken = null;
    // Log token clearance for audit trail
    AuditLogger.logSecurityEvent('API_TOKEN_CLEARED', 'api_client', true);
  }

  private async requestWithTimeout(
    url: string, 
    options: RequestInit, 
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async retryRequest<T>(
    url: string,
    options: RequestConfig,
    retryCount: number = 0
  ): Promise<T> {
    try {
      const response = await this.requestWithTimeout(
        url,
        options,
        options.timeout || this.config.defaultTimeout
      );

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw this.createApiError(errorData, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (this.shouldRetry(error, retryCount, options)) {
        await this.delay(options.retryDelay || this.config.retryDelay);
        return this.retryRequest(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: unknown, retryCount: number, options: RequestConfig): boolean {
    const maxRetries = options.retries ?? this.config.maxRetries;
    
    if (retryCount >= maxRetries) {
      return false;
    }

    // Retry on network errors or 5xx server errors
    if (error instanceof Error) {
      if (error.message === 'Request timeout' || error.message === 'Failed to fetch') {
        return true;
      }
    }

    if (error instanceof Error && 'status' in error) {
      const status = (error as any).status;
      return status >= 500 && status < 600;
    }

    return false;
  }

  private async parseErrorResponse(response: Response): Promise<Partial<ApiError>> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || errorData.error || 'An error occurred',
        code: errorData.code,
        details: errorData.details,
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  }

  private createApiError(errorData: Partial<ApiError>, status: number): ApiError {
    return {
      message: errorData.message || 'An unexpected error occurred',
      status,
      code: errorData.code,
      details: errorData.details,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getHeaders(options: RequestInit = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private checkRateLimit(endpoint: string, options: RequestConfig): boolean {
    if (options.skipRateLimit) {
      return true;
    }

    const identifier = this.getRateLimitIdentifier(endpoint);
    const isAllowed = RateLimiter.isAllowed(identifier);

    if (!isAllowed) {
      const remaining = RateLimiter.getRemainingRequests(identifier);
      SecureLogger.warn(`Rate limit exceeded for ${endpoint}`, { 
        identifier, 
        remaining,
        maxRequests: SecurityConfigManager.getConfig().rateLimitMaxRequests 
      });
      
      AuditLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', 'api_client', false, {
        endpoint,
        identifier,
        remaining,
      });
    }

    return isAllowed;
  }

  private getRateLimitIdentifier(endpoint: string): string {
    // Use endpoint path as identifier, could be enhanced with user ID
    return `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  async request<T>(
    endpoint: string, 
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    // Check rate limiting
    if (!this.checkRateLimit(endpoint, options)) {
      throw {
        message: 'Rate limit exceeded. Please try again later.',
        status: 429,
        code: 'RATE_LIMITED',
      } as ApiError;
    }

    const requestOptions: RequestConfig = {
      method: 'GET',
      headers: this.getHeaders(options),
      ...options,
    };

    try {
      // Log API request for audit trail
      AuditLogger.logDataAccess(endpoint, 'READ', true, {
        method: requestOptions.method,
        url,
        timestamp: new Date().toISOString(),
      });

      const data = await this.retryRequest<ApiResponse<T>>(url, requestOptions);
      return data;
    } catch (error) {
      const apiError = this.handleError(error);
      
      // Log API error for audit trail
      AuditLogger.logDataAccess(endpoint, 'READ', false, {
        method: requestOptions.method,
        url,
        error: apiError.message,
        status: apiError.status,
      });
      
      throw apiError;
    }
  }

  async get<T>(endpoint: string, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string, 
    data: unknown, 
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string, 
    data: unknown, 
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(
    endpoint: string, 
    data: unknown, 
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      // Network errors
      if (error.message === 'Request timeout') {
        return {
          message: 'Request timed out. Please check your connection and try again.',
          status: 408,
          code: 'TIMEOUT',
        };
      }

      if (error.message === 'Failed to fetch') {
        return {
          message: 'Network error. Please check your connection and try again.',
          status: 0,
          code: 'NETWORK_ERROR',
        };
      }

      // API errors
      if ('status' in error) {
        const apiError = error as ApiError;
        
        // Handle specific status codes
        switch (apiError.status) {
          case 401:
            return {
              ...apiError,
              message: 'Authentication required. Please log in again.',
              code: 'UNAUTHORIZED',
            };
          case 403:
            return {
              ...apiError,
              message: 'Access denied. You don\'t have permission to perform this action.',
              code: 'FORBIDDEN',
            };
          case 404:
            return {
              ...apiError,
              message: 'The requested resource was not found.',
              code: 'NOT_FOUND',
            };
          case 429:
            return {
              ...apiError,
              message: 'Too many requests. Please wait a moment and try again.',
              code: 'RATE_LIMITED',
            };
          case 500:
            return {
              ...apiError,
              message: 'Server error. Please try again later.',
              code: 'SERVER_ERROR',
            };
          default:
            return apiError;
        }
      }

      // Generic error
      return {
        message: error.message || 'An unexpected error occurred',
        status: 500,
        code: 'UNKNOWN_ERROR',
      };
    }

    return {
      message: 'An unexpected error occurred',
      status: 500,
      code: 'UNKNOWN_ERROR',
    };
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Error handling utilities
export function handleApiError(error: ApiError, showToast: boolean = true): void {
  // Use secure logging instead of console.error
  SecureLogger.error('API Error occurred', error);

  if (showToast) {
    toast.error(error.message, {
      description: error.code ? `Error Code: ${error.code}` : undefined,
      duration: 5000,
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error && 'message' in error;
}

// Hook for API calls with error handling
export function useApiCall<T, P extends unknown[]>(
  apiCall: (...args: P) => Promise<ApiResponse<T>>,
  showErrorToast: boolean = true
) {
  return async (...args: P): Promise<T | null> => {
    try {
      const response = await apiCall(...args);
      return response.data;
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error, showErrorToast);
      } else {
        SecureLogger.error('Unexpected error in API call', error);
        if (showErrorToast) {
          toast.error('An unexpected error occurred');
        }
      }
      return null;
    }
  };
}

// Rate limiting utilities
export function getRemainingRequests(endpoint: string): number {
  const identifier = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
  return RateLimiter.getRemainingRequests(identifier);
}

export function clearRateLimit(endpoint: string): void {
  const identifier = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
  RateLimiter.clear(identifier);
}
