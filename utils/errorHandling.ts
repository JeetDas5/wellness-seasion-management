import toast from 'react-hot-toast';

// Standard error response interface
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
  code?: string;
  status?: number;
}

// Standard success response interface
export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Custom error class for API errors
export class ApiErrorClass extends Error {
  public readonly type: ErrorType;
  public readonly status: number;
  public readonly errors?: Record<string, string>;
  public readonly code?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    status: number = 500,
    errors?: Record<string, string>,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

// Parse error from API response
export function parseApiError(error: any): ApiErrorClass {
  // Network error
  if (!error.response && error.message) {
    return new ApiErrorClass(
      'Network error. Please check your connection and try again.',
      ErrorType.NETWORK,
      0
    );
  }

  // API error response
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data || {};
    
    let type = ErrorType.UNKNOWN;
    let message = data.message || 'An unexpected error occurred';

    // Categorize error by status code
    switch (status) {
      case 400:
        type = ErrorType.VALIDATION;
        break;
      case 401:
        type = ErrorType.AUTHENTICATION;
        message = data.message || 'Please log in to continue';
        break;
      case 403:
        type = ErrorType.AUTHORIZATION;
        message = data.message || 'You do not have permission to perform this action';
        break;
      case 404:
        type = ErrorType.NOT_FOUND;
        message = data.message || 'The requested resource was not found';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = ErrorType.SERVER;
        message = data.message || 'Server error. Please try again later.';
        break;
    }

    return new ApiErrorClass(
      message,
      type,
      status,
      data.errors,
      data.code
    );
  }

  // Generic error
  return new ApiErrorClass(
    error.message || 'An unexpected error occurred',
    ErrorType.UNKNOWN
  );
}

// Handle API errors with appropriate user feedback
export function handleApiError(error: any, options?: {
  showToast?: boolean;
  customMessage?: string;
  onAuthError?: () => void;
}): ApiErrorClass {
  const apiError = parseApiError(error);
  const { showToast = true, customMessage, onAuthError } = options || {};

  // Handle authentication errors
  if (apiError.type === ErrorType.AUTHENTICATION && onAuthError) {
    onAuthError();
  }

  // Show toast notification
  if (showToast) {
    const message = customMessage || apiError.message;
    
    switch (apiError.type) {
      case ErrorType.NETWORK:
        toast.error(message, { duration: 5000 });
        break;
      case ErrorType.VALIDATION:
        toast.error(message, { duration: 4000 });
        break;
      case ErrorType.AUTHENTICATION:
        toast.error(message, { duration: 4000 });
        break;
      case ErrorType.AUTHORIZATION:
        toast.error(message, { duration: 4000 });
        break;
      case ErrorType.SERVER:
        toast.error(message, { duration: 6000 });
        break;
      default:
        toast.error(message, { duration: 4000 });
    }
  }

  // Log error for debugging
  console.error('API Error:', {
    type: apiError.type,
    status: apiError.status,
    message: apiError.message,
    errors: apiError.errors,
    code: apiError.code
  });

  return apiError;
}

// Wrapper for fetch requests with error handling
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiErrorClass(
        data.message || `HTTP ${response.status}`,
        response.status === 401 ? ErrorType.AUTHENTICATION :
        response.status === 403 ? ErrorType.AUTHORIZATION :
        response.status === 404 ? ErrorType.NOT_FOUND :
        response.status >= 500 ? ErrorType.SERVER :
        response.status === 400 ? ErrorType.VALIDATION :
        ErrorType.UNKNOWN,
        response.status,
        data.errors,
        data.code
      );
    }

    if (!data.success && data.success !== undefined) {
      throw new ApiErrorClass(
        data.message || 'Request failed',
        ErrorType.UNKNOWN,
        response.status,
        data.errors,
        data.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiErrorClass(
      'Network error. Please check your connection and try again.',
      ErrorType.NETWORK,
      0
    );
  }
}

// Retry mechanism for failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication/authorization errors
      if (error instanceof ApiErrorClass) {
        if (error.type === ErrorType.AUTHENTICATION || 
            error.type === ErrorType.AUTHORIZATION ||
            error.type === ErrorType.VALIDATION) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
}

// Format validation errors for display
export function formatValidationErrors(errors: Record<string, string>): string {
  const errorMessages = Object.values(errors);
  if (errorMessages.length === 1) {
    return errorMessages[0];
  }
  return `Please fix the following errors:\n• ${errorMessages.join('\n• ')}`;
}