/**
 * Base API service for handling HTTP requests
 */

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Request options type
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  withAuth?: boolean;
}

// Error response type
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

/**
 * Handles API responses and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: ApiError = {
      message: errorData.message || 'An error occurred',
      status: response.status,
      details: errorData.details
    };
    throw error;
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Builds the request URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }
  
  return url.toString();
}

/**
 * Gets the auth token from Clerk
 * This is a helper function that will be used by the API service
 */
let authToken: string | null = null;

// Function to set the auth token (to be called from AuthContext)
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Prepares request headers
 */
function prepareHeaders(options?: RequestOptions): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.append(key, value);
    });
  }
  
  if (options?.withAuth && authToken) {
    headers.append('Authorization', `Bearer ${authToken}`);
  }
  
  return headers;
}

/**
 * Generic request function
 */
async function request<T>(
  method: string,
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  const headers = prepareHeaders(options);
  
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include'
  };
  
  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, config);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
        status: 0,
        details: error
      };
      throw apiError;
    }
    throw error;
  }
}

/**
 * API service with methods for different HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions): Promise<T> => 
    request<T>('GET', endpoint, undefined, options),
    
  post: <T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => 
    request<T>('POST', endpoint, data, options),
    
  put: <T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => 
    request<T>('PUT', endpoint, data, options),
    
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => 
    request<T>('PATCH', endpoint, data, options),
    
  delete: <T>(endpoint: string, options?: RequestOptions): Promise<T> => 
    request<T>('DELETE', endpoint, undefined, options)
};