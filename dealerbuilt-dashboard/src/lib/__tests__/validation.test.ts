import { describe, it, expect } from 'vitest';
import {
  validateInput,
  formatValidationErrors,
  getFieldError,
  validationSchemas,
  LoginFormData,
  CustomerFormData,
  VehicleFormData,
} from '../validation';

describe('Validation Schemas', () => {
  describe('Base Schemas', () => {
    describe('emailSchema', () => {
      it('should validate correct email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
        ];

        validEmails.forEach(email => {
          const result = validateInput(validationSchemas.email, email);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(email);
          }
        });
      });

      it('should reject invalid email addresses', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user@.com',
          '',
        ];

        invalidEmails.forEach(email => {
          const result = validateInput(validationSchemas.email, email);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.errors.errors[0].message).toContain('valid email address');
          }
        });
      });
    });

    describe('passwordSchema', () => {
      it('should validate strong passwords', () => {
        const validPasswords = [
          'StrongPass1!',
          'Complex@Password123',
          'MyP@ssw0rd',
        ];

        validPasswords.forEach(password => {
          const result = validateInput(validationSchemas.password, password);
          expect(result.success).toBe(true);
        });
      });

      it('should reject weak passwords', () => {
        const invalidPasswords = [
          'weak',
          'password',
          '12345678',
          'PASSWORD',
          'password123',
        ];

        invalidPasswords.forEach(password => {
          const result = validateInput(validationSchemas.password, password);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('nameSchema', () => {
      it('should validate valid names', () => {
        const validNames = [
          'John',
          'Mary Jane',
          'O\'Connor',
          'Jean-Pierre',
          'José María',
        ];

        validNames.forEach(name => {
          const result = validateInput(validationSchemas.name, name);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid names', () => {
        const invalidNames = [
          '',
          'John123',
          'Mary@Jane',
          'A'.repeat(101), // Too long
        ];

        invalidNames.forEach(name => {
          const result = validateInput(validationSchemas.name, name);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('phoneSchema', () => {
      it('should validate valid phone numbers', () => {
        const validPhones = [
          '+1-555-123-4567',
          '(555) 123-4567',
          '555-123-4567',
          '+44 20 7946 0958',
        ];

        validPhones.forEach(phone => {
          const result = validateInput(validationSchemas.phone, phone);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid phone numbers', () => {
        const invalidPhones = [
          '123',
          'abc-def-ghij',
          '555-123-45678901234567890', // Too long
        ];

        invalidPhones.forEach(phone => {
          const result = validateInput(validationSchemas.phone, phone);
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe('Authentication Schemas', () => {
    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const validLogin: LoginFormData = {
          username: 'john.doe',
          password: 'password123',
          organizationId: 'org-1',
        };

        const result = validateInput(validationSchemas.login, validLogin);
        expect(result.success).toBe(true);
      });

      it('should reject invalid login data', () => {
        const invalidLogins = [
          { username: '', password: 'password', organizationId: 'org-1' },
          { username: 'user', password: '', organizationId: 'org-1' },
          { username: 'user', password: 'password', organizationId: '' },
        ];

        invalidLogins.forEach(login => {
          const result = validateInput(validationSchemas.login, login);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('registerSchema', () => {
      it('should validate correct registration data', () => {
        const validRegister = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'StrongPass1!',
          confirmPassword: 'StrongPass1!',
          organizationId: 'org-1',
        };

        const result = validateInput(validationSchemas.register, validRegister);
        expect(result.success).toBe(true);
      });

      it('should reject mismatched passwords', () => {
        const invalidRegister = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'StrongPass1!',
          confirmPassword: 'DifferentPass1!',
          organizationId: 'org-1',
        };

        const result = validateInput(validationSchemas.register, invalidRegister);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors.errors.some(e => e.message.includes("Passwords don't match"))).toBe(true);
        }
      });
    });
  });

  describe('Customer Schema', () => {
    it('should validate correct customer data', () => {
      const validCustomer: CustomerFormData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0123',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
        },
        notes: 'Preferred contact method: email',
      };

      const result = validateInput(validationSchemas.customer, validCustomer);
      expect(result.success).toBe(true);
    });

    it('should reject invalid customer data', () => {
      const invalidCustomer = {
        firstName: '',
        lastName: 'Smith',
        email: 'invalid-email',
        phone: 'invalid-phone',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CALIFORNIA', // Too long
          zipCode: 'invalid-zip',
        },
      };

      const result = validateInput(validationSchemas.customer, invalidCustomer);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = formatValidationErrors(result.errors);
        expect(errors.firstName).toBe('Name is required');
        expect(errors.email).toContain('valid email address');
        expect(errors.phone).toContain('valid phone number');
        expect(errors['address.state']).toBe('State is required');
        expect(errors['address.zipCode']).toContain('valid ZIP code');
      }
    });
  });

  describe('Vehicle Schema', () => {
    it('should validate correct vehicle data', () => {
      const validVehicle: VehicleFormData = {
        vin: '1HGBH41JXMN109186',
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        color: 'Blue',
        mileage: 15000,
        licensePlate: 'ABC123',
        customerId: 'customer-1',
      };

      const result = validateInput(validationSchemas.vehicle, validVehicle);
      expect(result.success).toBe(true);
    });

    it('should reject invalid vehicle data', () => {
      const invalidVehicle = {
        vin: 'INVALID-VIN',
        make: '',
        model: '',
        year: 1800, // Too old
        color: '',
        mileage: -1000, // Negative
        customerId: '',
      };

      const result = validateInput(validationSchemas.vehicle, invalidVehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = formatValidationErrors(result.errors);
        expect(errors.vin).toContain('valid 17-character VIN');
        expect(errors.make).toBe('Make is required');
        expect(errors.model).toBe('Model is required');
        expect(errors.year).toContain('after 1900');
        expect(errors.color).toBe('Color is required');
        expect(errors.mileage).toContain('cannot be negative');
        expect(errors.customerId).toBe('Customer is required');
      }
    });
  });

  describe('Date Range Schema', () => {
    it('should validate correct date range', () => {
      const validDateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const result = validateInput(validationSchemas.dateRange, validDateRange);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const invalidDateRange = {
        startDate: new Date('2024-01-31'),
        endDate: new Date('2024-01-01'), // End before start
      };

      const result = validateInput(validationSchemas.dateRange, invalidDateRange);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.errors[0].message).toBe('End date must be after start date');
      }
    });
  });

  describe('Search Schema', () => {
    it('should validate correct search parameters', () => {
      const validSearch = {
        query: 'test search',
        type: 'customers' as const,
        limit: 50,
      };

      const result = validateInput(validationSchemas.search, validSearch);
      expect(result.success).toBe(true);
    });

    it('should reject invalid search parameters', () => {
      const invalidSearch = {
        query: '', // Empty query
        type: 'invalid_type' as any,
        limit: 1000, // Too high
      };

      const result = validateInput(validationSchemas.search, invalidSearch);
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation Utilities', () => {
  describe('validateInput', () => {
    it('should return success result for valid data', () => {
      const result = validateInput(validationSchemas.email, 'test@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should return error result for invalid data', () => {
      const result = validateInput(validationSchemas.email, 'invalid-email');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeInstanceOf(Error);
      }
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation errors correctly', () => {
      const invalidData = {
        firstName: '',
        email: 'invalid-email',
      };

      const result = validateInput(validationSchemas.customer, invalidData);
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.errors);
        expect(formattedErrors.firstName).toBe('Name is required');
        expect(formattedErrors.email).toContain('valid email address');
      }
    });

    it('should handle nested field errors', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        address: {
          street: '',
          city: 'Anytown',
          state: 'C', // Too short
          zipCode: 'invalid',
        },
      };

      const result = validateInput(validationSchemas.customer, invalidData);
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.errors);
        expect(formattedErrors['address.street']).toBe('Street address is required');
        expect(formattedErrors['address.state']).toBe('State is required');
        expect(formattedErrors['address.zipCode']).toContain('valid ZIP code');
      }
    });
  });

  describe('getFieldError', () => {
    it('should return error for specific field', () => {
      const errors = {
        firstName: 'Name is required',
        email: 'Invalid email address',
      };

      expect(getFieldError(errors, 'firstName')).toBe('Name is required');
      expect(getFieldError(errors, 'email')).toBe('Invalid email address');
      expect(getFieldError(errors, 'nonexistent')).toBeUndefined();
    });
  });
});
