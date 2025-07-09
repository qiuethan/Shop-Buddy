import type { SearchResult, Store, Location, HealthCheck, ApiError } from '../types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Base API client with error handling
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Unknown error occurred',
          details: `HTTP ${response.status}: ${response.statusText}`,
        }));
        
        throw new Error(errorData.details || errorData.error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

/**
 * API service functions
 */
export const apiService = {
  /**
   * Find solutions for a problem
   */
  async findSolutions(
    problem: string,
    stores: string[] = ['all'],
    maxPrice: string = '',
    location: string = 'United States'
  ): Promise<SearchResult> {
    return apiClient.post<SearchResult>('/find-solutions', {
      problem,
      stores,
      maxPrice,
      location,
    });
  },

  /**
   * Get health check
   */
  async getHealthCheck(): Promise<HealthCheck> {
    return apiClient.get<HealthCheck>('/health');
  },

  /**
   * Get supported stores
   */
  async getStores(): Promise<{ stores: Store[] }> {
    return apiClient.get<{ stores: Store[] }>('/stores');
  },

  /**
   * Get supported locations
   */
  async getLocations(): Promise<{ locations: Location[] }> {
    return apiClient.get<{ locations: Location[] }>('/locations');
  },
};

export default apiService; 