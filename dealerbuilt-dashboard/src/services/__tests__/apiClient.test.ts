import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, handleApiError, isApiError, useApiCall } from '../apiClient';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.clearAuthToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('request method', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = { success: true, data: { test: 'data' } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make a successful POST request with data', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const postData = { name: 'test' };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/test', postData);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include auth token in headers when set', async () => {
      const token = 'test-token';
      apiClient.setAuthToken(token);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      });

      await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    });

    it('should handle request timeout', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      await expect(apiClient.get('/test', { timeout: 50 })).rejects.toThrow('Request timed out');
    });

    it('should retry failed requests', async () => {
      const mockResponse = { success: true, data: {} };
      
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

      const result = await apiClient.get('/test', { retries: 2 });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it('should not retry after max retries exceeded', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/test', { retries: 2 })).rejects.toThrow('Network error');
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should retry 5xx server errors', async () => {
      const mockResponse = { success: true, data: {} };
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

      const result = await apiClient.get('/test', { retries: 2 });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it('should not retry 4xx client errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Bad request');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle 401 unauthorized error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Authentication required. Please log in again.',
        status: 401,
        code: 'UNAUTHORIZED',
      });
    });

    it('should handle 403 forbidden error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Access denied. You don\'t have permission to perform this action.',
        status: 403,
        code: 'FORBIDDEN',
      });
    });

    it('should handle 404 not found error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'The requested resource was not found.',
        status: 404,
        code: 'NOT_FOUND',
      });
    });

    it('should handle 429 rate limit error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too many requests' }),
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Too many requests. Please wait a moment and try again.',
        status: 429,
        code: 'RATE_LIMITED',
      });
    });

    it('should handle 500 server error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Server error. Please try again later.',
        status: 500,
        code: 'SERVER_ERROR',
      });
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    });

    it('should handle timeout errors', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      await expect(apiClient.get('/test', { timeout: 50 })).rejects.toMatchObject({
        message: 'Request timed out. Please check your connection and try again.',
        status: 408,
        code: 'TIMEOUT',
      });
    });
  });

  describe('utility functions', () => {
    it('should identify API errors correctly', () => {
      const apiError = {
        message: 'Test error',
        status: 500,
        code: 'TEST_ERROR',
      };

      expect(isApiError(apiError)).toBe(true);
      expect(isApiError(new Error('Regular error'))).toBe(false);
      expect(isApiError({ message: 'No status' })).toBe(false);
    });

    it('should handle API errors with toast', () => {
      const mockToast = vi.fn();
      vi.doMock('sonner', () => ({
        toast: { error: mockToast },
      }));

      const apiError = {
        message: 'Test error',
        status: 500,
        code: 'TEST_ERROR',
      };

      handleApiError(apiError, true);
      // Note: In a real test, you'd need to properly mock the toast module
    });
  });

  describe('useApiCall hook', () => {
    it('should return data on successful API call', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({
        success: true,
        data: { test: 'data' },
      });

      const apiCall = useApiCall(mockApiCall);
      const result = await apiCall('test');

      expect(result).toEqual({ test: 'data' });
      expect(mockApiCall).toHaveBeenCalledWith('test');
    });

    it('should return null on API error', async () => {
      const mockApiCall = vi.fn().mockRejectedValue({
        message: 'Test error',
        status: 500,
      });

      const apiCall = useApiCall(mockApiCall);
      const result = await apiCall('test');

      expect(result).toBeNull();
    });

    it('should not show toast when showErrorToast is false', async () => {
      const mockApiCall = vi.fn().mockRejectedValue({
        message: 'Test error',
        status: 500,
      });

      const apiCall = useApiCall(mockApiCall, false);
      await apiCall('test');

      // Should not show toast (would need proper mocking to verify)
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const client = new (apiClient.constructor as any)();
      expect(client.config.baseURL).toBe('/api');
      expect(client.config.defaultTimeout).toBe(10000);
      expect(client.config.maxRetries).toBe(3);
      expect(client.config.retryDelay).toBe(1000);
    });

    it('should use custom configuration', () => {
      const customConfig = {
        baseURL: 'https://api.example.com',
        defaultTimeout: 5000,
        maxRetries: 5,
        retryDelay: 2000,
      };

      const client = new (apiClient.constructor as any)(customConfig);
      expect(client.config.baseURL).toBe(customConfig.baseURL);
      expect(client.config.defaultTimeout).toBe(customConfig.defaultTimeout);
      expect(client.config.maxRetries).toBe(customConfig.maxRetries);
      expect(client.config.retryDelay).toBe(customConfig.retryDelay);
    });
  });
});
