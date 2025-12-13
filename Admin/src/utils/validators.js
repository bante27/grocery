// Form validation utility functions

export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  },

  // Password validation
  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
  },

  // Required field validation
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Phone number validation
  phone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    if (phone.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
    return null;
  },

  // Price validation
  price: (price) => {
    if (!price) return 'Price is required';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Price must be a valid number';
    if (numPrice <= 0) return 'Price must be greater than 0';
    return null;
  },

  // Quantity validation
  quantity: (quantity) => {
    if (quantity === '' || quantity === null || quantity === undefined) return 'Quantity is required';
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity)) return 'Quantity must be a valid number';
    if (numQuantity < 0) return 'Quantity cannot be negative';
    return null;
  },

  // URL validation
  url: (url) => {
    if (!url) return 'URL is required';
    try {
      new URL(url);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  // Name validation
  name: (name) => {
    if (!name) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters long';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    return null;
  },

  // Message validation
  message: (message, minLength = 10) => {
    if (!message) return 'Message is required';
    if (message.trim().length < minLength) return `Message must be at least ${minLength} characters long`;
    if (message.trim().length > 1000) return 'Message must be less than 1000 characters';
    return null;
  },

  // File validation
  file: (file, allowedTypes = [], maxSizeMB = 5) => {
    if (!file) return 'File is required';
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    return null;
  },

  // Image validation
  image: (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validators.file(file, allowedTypes, 10);
  }
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    
    for (const rule of fieldRules) {
      let error = null;
      
      if (typeof rule === 'string') {
        // Built-in validator
        error = validators[rule] ? validators[rule](value) : null;
      } else if (typeof rule === 'function') {
        // Custom validator function
        error = rule(value);
      } else if (typeof rule === 'object' && rule.validator) {
        // Validator with custom message
        error = validators[rule.validator] ? validators[rule.validator](value) : null;
        if (error && rule.message) {
          error = rule.message;
        }
      }
      
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation hook (for use with React components)
export const useFormValidation = (initialData = {}, validationRules = {}) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  
  const validateField = (field, value) => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return null;
    
    const rules = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    
    for (const rule of rules) {
      let error = null;
      
      if (typeof rule === 'string') {
        error = validators[rule] ? validators[rule](value) : null;
      } else if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object' && rule.validator) {
        error = validators[rule.validator] ? validators[rule.validator](value) : null;
        if (error && rule.message) {
          error = rule.message;
        }
      }
      
      if (error) return error;
    }
    
    return null;
  };
  
  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const validateAll = () => {
    const validation = validateForm(data, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  };
  
  return {
    data,
    errors,
    updateField,
    validateAll,
    isValid: Object.keys(errors).length === 0 && Object.values(errors).every(error => !error)
  };
};

export default validators;