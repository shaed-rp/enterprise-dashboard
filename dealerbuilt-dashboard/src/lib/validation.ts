import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number is too short')
  .max(20, 'Phone number is too long');

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional();

// Authentication schemas
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(100, 'Username is too long'),
  password: z
    .string()
    .min(1, 'Password is required'),
  organizationId: z
    .string()
    .min(1, 'Organization is required'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  organizationId: z.string().min(1, 'Organization is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Dashboard filter schemas
export const dateRangeSchema = z.object({
  startDate: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Please enter a valid start date',
  }),
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'Please enter a valid end date',
  }),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const dashboardFilterSchema = z.object({
  location: z.string().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  department: z.enum(['all', 'sales', 'service', 'parts', 'finance']).default('all'),
  dateRange: dateRangeSchema.optional(),
});

// Customer schemas
export const customerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required').max(255),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(2, 'State is required').max(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  }).optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

export const customerUpdateSchema = customerSchema.partial();

// Vehicle schemas
export const vehicleSchema = z.object({
  vin: z
    .string()
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Please enter a valid 17-character VIN')
    .min(17, 'VIN must be 17 characters')
    .max(17, 'VIN must be 17 characters'),
  make: z.string().min(1, 'Make is required').max(50),
  model: z.string().min(1, 'Model is required').max(50),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  color: z.string().min(1, 'Color is required').max(30),
  mileage: z
    .number()
    .int()
    .min(0, 'Mileage cannot be negative')
    .max(999999, 'Mileage is too high'),
  licensePlate: z.string().max(20, 'License plate is too long').optional(),
  customerId: z.string().min(1, 'Customer is required'),
});

// Repair Order schemas
export const repairOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  description: z.string().min(1, 'Description is required').max(1000),
  estimatedCost: z
    .number()
    .min(0, 'Estimated cost cannot be negative')
    .max(100000, 'Estimated cost is too high'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  appointmentDate: z.date().optional(),
  technicianId: z.string().optional(),
  notes: z.string().max(2000, 'Notes are too long').optional(),
});

// Parts schemas
export const partSchema = z.object({
  partNumber: z.string().min(1, 'Part number is required').max(50),
  name: z.string().min(1, 'Part name is required').max(100),
  description: z.string().max(500, 'Description is too long').optional(),
  cost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .max(100000, 'Cost is too high'),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price is too high'),
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity is too high'),
  supplierId: z.string().optional(),
  category: z.string().min(1, 'Category is required').max(50),
  location: z.string().max(50).optional(),
});

// Deal schemas
export const dealSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  salespersonId: z.string().min(1, 'Salesperson is required'),
  dealType: z.enum(['purchase', 'lease', 'trade_in']),
  amount: z
    .number()
    .min(0, 'Amount cannot be negative')
    .max(1000000, 'Amount is too high'),
  downPayment: z
    .number()
    .min(0, 'Down payment cannot be negative')
    .max(1000000, 'Down payment is too high'),
  monthlyPayment: z
    .number()
    .min(0, 'Monthly payment cannot be negative')
    .max(50000, 'Monthly payment is too high')
    .optional(),
  term: z
    .number()
    .int()
    .min(12, 'Term must be at least 12 months')
    .max(84, 'Term cannot exceed 84 months')
    .optional(),
  status: z.enum(['pending', 'approved', 'funded', 'cancelled']).default('pending'),
  notes: z.string().max(2000, 'Notes are too long').optional(),
});

// Appointment schemas
export const appointmentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  serviceType: z.enum(['maintenance', 'repair', 'inspection', 'consultation']),
  date: z.date({
    required_error: 'Appointment date is required',
    invalid_type_error: 'Please enter a valid date',
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
  duration: z
    .number()
    .int()
    .min(30, 'Duration must be at least 30 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  technicianId: z.string().optional(),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  type: z.enum(['customers', 'vehicles', 'deals', 'repair_orders', 'parts']).optional(),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export all schemas
export const validationSchemas = {
  // Authentication
  login: loginSchema,
  register: registerSchema,
  
  // Dashboard
  dateRange: dateRangeSchema,
  dashboardFilter: dashboardFilterSchema,
  
  // Entities
  customer: customerSchema,
  customerUpdate: customerUpdateSchema,
  vehicle: vehicleSchema,
  repairOrder: repairOrderSchema,
  part: partSchema,
  deal: dealSchema,
  appointment: appointmentSchema,
  
  // Search and pagination
  search: searchSchema,
  pagination: paginationSchema,
  
  // Base schemas
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema,
  url: urlSchema,
} as const;

// Validation utility functions
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    formattedErrors[field] = err.message;
  });
  
  return formattedErrors;
}

export function getFieldError(
  errors: Record<string, string>,
  field: string
): string | undefined {
  return errors[field];
}

// Type exports for use in components
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type VehicleFormData = z.infer<typeof vehicleSchema>;
export type RepairOrderFormData = z.infer<typeof repairOrderSchema>;
export type DealFormData = z.infer<typeof dealSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type DashboardFilterData = z.infer<typeof dashboardFilterSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
