import { useState, useCallback, useEffect } from 'react';
import { 
  ValidationSchema, 
  validateForm, 
  validateFieldRealTime, 
  sanitizeFormData,
  createDebouncedValidator
} from '@/utils/validation';

export interface UseFormValidationOptions {
  schema: ValidationSchema;
  initialData?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  sanitizeOnChange?: boolean;
}

export interface UseFormValidationReturn<T> {
  formData: T;
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  touched: Record<string, boolean>;
  
  // Methods
  setFormData: (data: T | ((prev: T) => T)) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  validateField: (field: keyof T) => string | null;
  validateForm: () => boolean;
  markFieldTouched: (field: keyof T) => void;
  markAllTouched: () => void;
  resetForm: (newData?: Partial<T>) => void;
  handleFieldChange: (field: keyof T, value: any) => void;
  handleFieldBlur: (field: keyof T) => void;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialData = {} as T,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300,
  sanitizeOnChange = true
}: UseFormValidationOptions): UseFormValidationReturn<T> {
  const [formData, setFormDataState] = useState<T>(initialData as T);
  const [errors, setErrorsState] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validator for real-time validation
  const debouncedValidator = useCallback(
    createDebouncedValidator((validationErrors) => {
      setErrorsState(validationErrors);
      setIsValidating(false);
    }, debounceMs),
    [debounceMs]
  );

  // Validate entire form
  const validateFormData = useCallback((): boolean => {
    const result = validateForm(formData, schema);
    setErrorsState(result.errors);
    return result.isValid;
  }, [formData, schema]);

  // Validate single field
  const validateSingleField = useCallback((field: keyof T): string | null => {
    const error = validateFieldRealTime(
      field as string,
      formData[field],
      schema,
      formData
    );
    
    if (error) {
      setErrorsState(prev => ({ ...prev, [field]: error }));
    } else {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
    
    return error;
  }, [formData, schema]);

  // Set form data with optional sanitization
  const setFormData = useCallback((data: T | ((prev: T) => T)) => {
    setFormDataState(prev => {
      const newData = typeof data === 'function' ? data(prev) : data;
      return sanitizeOnChange ? sanitizeFormData(newData) : newData;
    });
  }, [sanitizeOnChange]);

  // Set individual field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    const sanitizedValue = sanitizeOnChange && typeof value === 'string' 
      ? value.trim() 
      : value;

    setFormDataState(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Clear field error when user starts typing
    if (errors[field as string]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }

    // Trigger real-time validation if enabled
    if (validateOnChange && touched[field as string]) {
      setIsValidating(true);
      debouncedValidator({ ...formData, [field]: sanitizedValue }, schema);
    }
  }, [formData, errors, touched, validateOnChange, sanitizeOnChange, debouncedValidator, schema]);

  // Handle field change (combines setFieldValue with touch tracking)
  const handleFieldChange = useCallback((field: keyof T, value: any) => {
    setFieldValue(field, value);
    
    // Mark field as touched if not already
    if (!touched[field as string]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  }, [setFieldValue, touched]);

  // Handle field blur
  const handleFieldBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validateOnBlur) {
      validateSingleField(field);
    }
  }, [validateOnBlur, validateSingleField]);

  // Set field error manually
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    if (error) {
      setErrorsState(prev => ({ ...prev, [field]: error }));
    } else {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((field: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  // Mark field as touched
  const markFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Mark all fields as touched
  const markAllTouched = useCallback(() => {
    const allFields = Object.keys(schema);
    const touchedState = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(touchedState);
  }, [schema]);

  // Reset form
  const resetForm = useCallback((newData?: Partial<T>) => {
    const resetData = { ...initialData, ...newData } as T;
    setFormDataState(resetData);
    setErrorsState({});
    setTouched({});
    setIsValidating(false);
  }, [initialData]);

  // Calculate if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormDataState(initialData as T);
    }
  }, []);

  return {
    formData,
    errors,
    isValid,
    isValidating,
    touched,
    
    // Methods
    setFormData,
    setFieldValue,
    setFieldError,
    setErrors,
    clearErrors,
    clearFieldError,
    validateField: validateSingleField,
    validateForm: validateFormData,
    markFieldTouched,
    markAllTouched,
    resetForm,
    handleFieldChange,
    handleFieldBlur
  };
}

// Specialized hook for authentication forms
export function useAuthFormValidation(
  type: 'login' | 'register',
  initialData?: Record<string, any>
) {
  const { authValidationSchemas } = require('@/utils/validation');
  
  return useFormValidation({
    schema: authValidationSchemas[type],
    initialData,
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    sanitizeOnChange: true
  });
}

// Specialized hook for session forms
export function useSessionFormValidation(initialData?: Record<string, any>) {
  const { sessionValidationSchema } = require('@/utils/validation');
  
  return useFormValidation({
    schema: sessionValidationSchema,
    initialData,
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 500, // Slightly longer debounce for session forms
    sanitizeOnChange: true
  });
}