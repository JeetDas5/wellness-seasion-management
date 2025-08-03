// Comprehensive form validation utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Email validation regex (RFC 5322 compliant)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// URL validation regex
export const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;

// Password strength regex (at least one uppercase, one lowercase, one digit)
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

// Common validation schemas
export const authValidationSchemas = {
  login: {
    email: {
      required: true,
      pattern: EMAIL_REGEX,
      custom: (value: string) => {
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
        return null;
      }
    },
    password: {
      required: true,
      minLength: 6,
      custom: (value: string) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      }
    }
  },
  
  register: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      custom: (value: string) => {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return null;
      }
    },
    email: {
      required: true,
      pattern: EMAIL_REGEX,
      custom: (value: string) => {
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
        if (value.trim().length > 254) return 'Email address is too long';
        return null;
      }
    },
    password: {
      required: true,
      minLength: 6,
      custom: (value: string) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 128) return 'Password is too long';
        if (!PASSWORD_STRENGTH_REGEX.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value: string, formData?: any) => {
        if (!value) return 'Please confirm your password';
        if (formData && value !== formData.password) return 'Passwords do not match';
        return null;
      }
    }
  }
};

export const sessionValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    custom: (value: string) => {
      if (!value.trim()) return 'Title is required';
      if (value.trim().length < 3) return 'Title must be at least 3 characters long';
      if (value.trim().length > 100) return 'Title must be less than 100 characters';
      if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(value.trim())) {
        return 'Title contains invalid characters';
      }
      return null;
    }
  },
  tags: {
    custom: (value: string[] | string) => {
      const tags = Array.isArray(value) ? value : [];
      if (tags.length > 10) return 'Maximum 10 tags allowed';
      
      for (const tag of tags) {
        if (typeof tag !== 'string') return 'Invalid tag format';
        if (tag.trim().length === 0) continue;
        if (tag.trim().length > 30) return 'Each tag must be less than 30 characters';
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag.trim())) {
          return 'Tags can only contain letters, numbers, spaces, hyphens, and underscores';
        }
      }
      return null;
    }
  },
  json_file_url: {
    custom: (value: string) => {
      if (!value || !value.trim()) return null; // Optional field
      
      try {
        const url = new URL(value.trim());
        if (!url.protocol.startsWith('http')) {
          return 'URL must start with http:// or https://';
        }
        if (value.trim().length > 2048) return 'URL is too long';
        return null;
      } catch {
        return 'Please provide a valid URL';
      }
    }
  }
};

// Core validation function
export function validateField(
  value: any,
  rule: ValidationRule,
  fieldName: string,
  formData?: any
): string | null {
  // Handle custom validation first
  if (rule.custom) {
    return rule.custom(value, formData);
  }

  // Required validation
  if (rule.required) {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    if (typeof value === 'string' && !value.trim()) {
      return `${fieldName} is required`;
    }
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // String-specific validations
  if (typeof value === 'string') {
    // Min length validation
    if (rule.minLength && value.trim().length < rule.minLength) {
      return `${fieldName} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.trim().length > rule.maxLength) {
      return `${fieldName} must be less than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.trim())) {
      return `${fieldName} format is invalid`;
    }
  }

  return null;
}

// Validate entire form against schema
export function validateForm(
  formData: Record<string, any>,
  schema: ValidationSchema
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, rule] of Object.entries(schema)) {
    const value = formData[fieldName];
    const error = validateField(value, rule, fieldName, formData);
    
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Real-time validation for individual fields
export function validateFieldRealTime(
  fieldName: string,
  value: any,
  schema: ValidationSchema,
  formData?: Record<string, any>
): string | null {
  const rule = schema[fieldName];
  if (!rule) return null;

  return validateField(value, rule, fieldName, formData);
}

// Sanitize input data
export function sanitizeInput(value: string): string {
  if (typeof value !== 'string') return '';
  
  return value
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

// Sanitize form data
export function sanitizeFormData<T extends Record<string, any>>(
  formData: T
): T {
  const sanitized = { ...formData };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    }
  }
  
  return sanitized;
}

// Debounced validation for real-time feedback
export function createDebouncedValidator(
  callback: (errors: Record<string, string>) => void,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (formData: Record<string, any>, schema: ValidationSchema) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const result = validateForm(formData, schema);
      callback(result.errors);
    }, delay);
  };
}

// Server-side validation helpers
export function createServerValidationResponse(
  errors: Record<string, string>
) {
  const firstError = Object.values(errors)[0];
  
  return {
    success: false,
    message: firstError || 'Validation failed',
    errors,
    code: 'VALIDATION_ERROR'
  };
}

// Check if validation errors match between client and server
export function validateServerClientMatch(
  clientErrors: Record<string, string>,
  serverErrors: Record<string, string>
): boolean {
  const clientFields = Object.keys(clientErrors);
  const serverFields = Object.keys(serverErrors);
  
  // Check if both have errors for the same fields
  return clientFields.length === serverFields.length &&
         clientFields.every(field => serverFields.includes(field));
}