import { z } from "zod";

// ============================================
// INDONESIAN GEOSPATIAL BOUNDARIES
// ============================================
// Indonesia spans approximately:
// Latitude: -11.0 (southernmost) to 6.0 (northernmost)
// Longitude: 95.0 (westernmost) to 141.0 (easternmost)

const INDONESIA_BOUNDS = {
  latitude: { min: -11.0, max: 6.0 },
  longitude: { min: 95.0, max: 141.0 },
} as const;

// ============================================
// REUSABLE FIELD SCHEMAS
// ============================================

/**
 * CUID validation schema
 * CUIDs are 25 characters starting with 'c'
 * Pattern: c[a-z0-9]{24}
 */
export const cuidSchema = z
  .string()
  .min(25, { message: "Invalid ID format" })
  .max(25, { message: "Invalid ID format" })
  .regex(/^c[a-z0-9]{24}$/, { message: "Invalid ID format" });

/**
 * Validate if a string is a valid CUID
 */
export function isValidCuid(id: string): boolean {
  return cuidSchema.safeParse(id).success;
}

export const latitudeSchema = z
  .number({
    required_error: "Latitude is required",
    invalid_type_error: "Latitude must be a number",
  })
  .min(INDONESIA_BOUNDS.latitude.min, {
    message: `Latitude must be at least ${INDONESIA_BOUNDS.latitude.min} (within Indonesia)`,
  })
  .max(INDONESIA_BOUNDS.latitude.max, {
    message: `Latitude must be at most ${INDONESIA_BOUNDS.latitude.max} (within Indonesia)`,
  });

export const longitudeSchema = z
  .number({
    required_error: "Longitude is required",
    invalid_type_error: "Longitude must be a number",
  })
  .min(INDONESIA_BOUNDS.longitude.min, {
    message: `Longitude must be at least ${INDONESIA_BOUNDS.longitude.min} (within Indonesia)`,
  })
  .max(INDONESIA_BOUNDS.longitude.max, {
    message: `Longitude must be at most ${INDONESIA_BOUNDS.longitude.max} (within Indonesia)`,
  });

export const batteryVoltageSchema = z
  .number({
    required_error: "Battery voltage is required",
    invalid_type_error: "Battery voltage must be a number",
  })
  .min(0, { message: "Battery voltage cannot be negative" })
  .max(100, { message: "Battery voltage seems too high (max 100V)" });

// ============================================
// REPORT SUBMISSION SCHEMA
// ============================================

export const submitReportSchema = z.object({
  unitId: z
    .string({
      required_error: "Unit ID is required",
    })
    .min(1, { message: "Unit ID cannot be empty" }),

  latitude: latitudeSchema,
  longitude: longitudeSchema,
  batteryVoltage: batteryVoltageSchema,

  notes: z
    .string()
    .max(1000, { message: "Notes cannot exceed 1000 characters" })
    .optional(),
});

export type SubmitReportInput = z.infer<typeof submitReportSchema>;

// ============================================
// PJUTS UNIT SCHEMAS
// ============================================

export const createPjutsUnitSchema = z.object({
  serialNumber: z
    .string()
    .min(1, { message: "Serial number is required" })
    .regex(/^PJUTS-[A-Z]+-\d+$/, {
      message:
        "Serial number must follow format: PJUTS-[LETTERS]-[NUMBERS] (e.g., PJUTS-JAKARTA-001)",
    }),

  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),

  province: z.string().min(1, { message: "Province is required" }),
  regency: z.string().min(1, { message: "Regency is required" }),
  district: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
});

export type CreatePjutsUnitInput = z.infer<typeof createPjutsUnitSchema>;

// ============================================
// MAP BOUNDS SCHEMA (for filtering map points)
// ============================================

export const mapBoundsSchema = z
  .object({
    north: z.number().min(-90).max(90),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    west: z.number().min(-180).max(180),
  })
  .refine((data) => data.north > data.south, {
    message: "North boundary must be greater than south boundary",
  });

export type MapBounds = z.infer<typeof mapBoundsSchema>;

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  role: z.enum(["ADMIN", "FIELD_STAFF"]).default("FIELD_STAFF"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============================================
// IMAGE VALIDATION
// ============================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const imageFileSchema = z.object({
  name: z.string(),
  size: z.number().max(MAX_FILE_SIZE, {
    message: `Image size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  }),
  type: z
    .string()
    .refine((type) => ACCEPTED_IMAGE_TYPES.includes(type), {
      message: "Only JPEG, PNG, and WebP images are accepted",
    }),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isWithinIndonesia(lat: number, lng: number): boolean {
  return (
    lat >= INDONESIA_BOUNDS.latitude.min &&
    lat <= INDONESIA_BOUNDS.latitude.max &&
    lng >= INDONESIA_BOUNDS.longitude.min &&
    lng <= INDONESIA_BOUNDS.longitude.max
  );
}

export function validateCoordinates(
  lat: unknown,
  lng: unknown,
): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  const latResult = latitudeSchema.safeParse(lat);
  const lngResult = longitudeSchema.safeParse(lng);

  if (!latResult.success) {
    errors.push(...latResult.error.errors.map((e) => e.message));
  }
  if (!lngResult.success) {
    errors.push(...lngResult.error.errors.map((e) => e.message));
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
