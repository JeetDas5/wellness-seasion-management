import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  code?: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Standard error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// Create standardized error responses
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  errors?: Record<string, string>
): NextResponse {
  const response: ApiErrorResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors }),
  };

  return NextResponse.json(response, { status });
}

// Create standardized success responses
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };

  return NextResponse.json(response, { status });
}

// Common error responses
export const ErrorResponses = {
  unauthorized: (message = 'Authentication required') =>
    createErrorResponse(message, 401, ERROR_CODES.UNAUTHORIZED),

  forbidden: (message = 'Access denied') =>
    createErrorResponse(message, 403, ERROR_CODES.FORBIDDEN),

  notFound: (message = 'Resource not found') =>
    createErrorResponse(message, 404, ERROR_CODES.NOT_FOUND),

  validation: (message: string, errors?: Record<string, string>) =>
    createErrorResponse(message, 400, ERROR_CODES.VALIDATION_ERROR, errors),

  database: (message = 'Database operation failed') =>
    createErrorResponse(message, 500, ERROR_CODES.DATABASE_ERROR),

  internal: (message = 'Internal server error') =>
    createErrorResponse(message, 500, ERROR_CODES.INTERNAL_ERROR),
};

// Wrapper for API route handlers with error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);

      // Handle known error types
      if (error instanceof Error) {
        // Database connection errors
        if (error.message.includes('MongooseError') || error.message.includes('MongoDB')) {
          return ErrorResponses.database('Database connection failed. Please try again.');
        }

        // Validation errors from Mongoose
        if (error.name === 'ValidationError') {
          return ErrorResponses.validation('Validation failed', 
            // @ts-ignore - Mongoose validation error structure
            error.errors ? Object.keys(error.errors).reduce((acc, key) => {
              // @ts-ignore
              acc[key] = error.errors[key].message;
              return acc;
            }, {} as Record<string, string>) : undefined
          );
        }

        // Cast errors (invalid ObjectId, etc.)
        if (error.name === 'CastError') {
          return ErrorResponses.validation('Invalid data format provided');
        }

        // JWT errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
          return ErrorResponses.unauthorized('Invalid or expired authentication token');
        }
      }

      // Default internal server error
      return ErrorResponses.internal();
    }
  };
}

// Validation helper
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Rate limiting helper (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries
  for (const [key, value] of requestCounts.entries()) {
    if (value.resetTime < windowStart) {
      requestCounts.delete(key);
    }
  }

  const current = requestCounts.get(identifier);
  
  if (!current || current.resetTime < windowStart) {
    // First request in window or window expired
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (current.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  // Increment count
  current.count++;
  requestCounts.set(identifier, current);
  
  return { 
    allowed: true, 
    remaining: maxRequests - current.count, 
    resetTime: current.resetTime 
  };
}