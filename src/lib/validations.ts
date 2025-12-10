// Comprehensive validation utilities for the Patient Management System

// Name validation - only letters, spaces, and common name characters
export const validateName = (value: string): { isValid: boolean; message: string } => {
  if (!value.trim()) {
    return { isValid: false, message: "This field is required" };
  }
  // Allow letters, spaces, dots, hyphens (for names like "Dr. John Smith-Jones")
  const nameRegex = /^[a-zA-Z\s.\-']+$/;
  if (!nameRegex.test(value)) {
    return { isValid: false, message: "Only letters, spaces, and hyphens are allowed" };
  }
  if (value.length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters" };
  }
  if (value.length > 100) {
    return { isValid: false, message: "Name must be less than 100 characters" };
  }
  return { isValid: true, message: "" };
};

// Phone validation - only numbers and common phone characters
export const validatePhone = (value: string): { isValid: boolean; message: string } => {
  if (!value.trim()) {
    return { isValid: false, message: "Phone number is required" };
  }
  // Allow numbers, spaces, +, -, () for international formats
  const phoneRegex = /^[0-9\s\+\-()]+$/;
  if (!phoneRegex.test(value)) {
    return { isValid: false, message: "Only numbers and +, -, () are allowed" };
  }
  // Remove non-numeric characters for length check
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    return { isValid: false, message: "Phone number must be at least 10 digits" };
  }
  if (digitsOnly.length > 15) {
    return { isValid: false, message: "Phone number must be less than 15 digits" };
  }
  return { isValid: true, message: "" };
};

// Email validation
export const validateEmail = (value: string, required: boolean = true): { isValid: boolean; message: string } => {
  if (!value.trim()) {
    if (required) {
      return { isValid: false, message: "Email is required" };
    }
    return { isValid: true, message: "" };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  if (value.length > 255) {
    return { isValid: false, message: "Email must be less than 255 characters" };
  }
  return { isValid: true, message: "" };
};

// Password validation
export const validatePassword = (value: string): { isValid: boolean; message: string } => {
  if (!value) {
    return { isValid: false, message: "Password is required" };
  }
  if (value.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters" };
  }
  if (value.length > 72) {
    return { isValid: false, message: "Password must be less than 72 characters" };
  }
  return { isValid: true, message: "" };
};

// CNIC validation (Pakistan National ID - 13 digits with optional dashes)
export const validateCNIC = (value: string): { isValid: boolean; message: string } => {
  if (!value.trim()) {
    return { isValid: true, message: "" }; // Optional field
  }
  // Remove dashes for validation
  const cleanValue = value.replace(/-/g, "");
  if (!/^\d+$/.test(cleanValue)) {
    return { isValid: false, message: "CNIC must contain only numbers" };
  }
  if (cleanValue.length !== 13) {
    return { isValid: false, message: "CNIC must be exactly 13 digits" };
  }
  return { isValid: true, message: "" };
};

// Address validation
export const validateAddress = (value: string): { isValid: boolean; message: string } => {
  if (!value.trim()) {
    return { isValid: true, message: "" }; // Optional field
  }
  if (value.length < 5) {
    return { isValid: false, message: "Address must be at least 5 characters" };
  }
  if (value.length > 500) {
    return { isValid: false, message: "Address must be less than 500 characters" };
  }
  return { isValid: true, message: "" };
};

// Number only validation (for fields like experience, fee, etc.)
export const validateNumber = (value: string, min?: number, max?: number): { isValid: boolean; message: string } => {
  if (!value.trim()) {
    return { isValid: false, message: "This field is required" };
  }
  if (!/^\d+$/.test(value)) {
    return { isValid: false, message: "Only numbers are allowed" };
  }
  const num = parseInt(value, 10);
  if (min !== undefined && num < min) {
    return { isValid: false, message: `Value must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { isValid: false, message: `Value must be at most ${max}` };
  }
  return { isValid: true, message: "" };
};

// General text validation with max length
export const validateText = (value: string, maxLength: number = 1000): { isValid: boolean; message: string } => {
  if (value.length > maxLength) {
    return { isValid: false, message: `Text must be less than ${maxLength} characters` };
  }
  return { isValid: true, message: "" };
};

// Input handlers that filter invalid characters
export const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>): string => {
  // Allow only letters, spaces, dots, hyphens, and apostrophes
  return e.target.value.replace(/[^a-zA-Z\s.\-']/g, "");
};

export const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>): string => {
  // Allow only numbers, +, -, (), and spaces
  return e.target.value.replace(/[^0-9\s\+\-()]/g, "");
};

export const handleCNICInput = (e: React.ChangeEvent<HTMLInputElement>): string => {
  // Allow only numbers and dashes
  return e.target.value.replace(/[^0-9\-]/g, "");
};

export const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>): string => {
  // Allow only numbers
  return e.target.value.replace(/[^0-9]/g, "");
};

// Clinic name validation - allows letters, numbers, spaces, and common business characters
export const validateClinicName = (value: string): { isValid: boolean; message: string } => {
  if (!value.trim()) {
    return { isValid: false, message: "Clinic name is required" };
  }
  if (value.length < 2) {
    return { isValid: false, message: "Clinic name must be at least 2 characters" };
  }
  if (value.length > 200) {
    return { isValid: false, message: "Clinic name must be less than 200 characters" };
  }
  return { isValid: true, message: "" };
};

// Validate all patient form fields
export const validatePatientForm = (form: {
  full_name: string;
  phone: string;
  email?: string;
  cnic?: string;
  date_of_birth?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameValidation = validateName(form.full_name);
  if (!nameValidation.isValid) errors.full_name = nameValidation.message;

  const phoneValidation = validatePhone(form.phone);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.message;

  if (form.email) {
    const emailValidation = validateEmail(form.email, false);
    if (!emailValidation.isValid) errors.email = emailValidation.message;
  }

  if (form.cnic) {
    const cnicValidation = validateCNIC(form.cnic);
    if (!cnicValidation.isValid) errors.cnic = cnicValidation.message;
  }

  if (!form.date_of_birth) {
    errors.date_of_birth = "Date of birth is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
