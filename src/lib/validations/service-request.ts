import { z } from "zod";

/**
 * Validation schema for guest service request submission
 * Used for the public form where users submit requests without authentication
 */
export const guestServiceRequestSchema = z.object({
  // Guest information
  guest_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  guest_email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),

  guest_phone: z
    .string()
    .min(8, "Phone number must be at least 8 characters")
    .max(20, "Phone number must be less than 20 characters")
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      "Please enter a valid phone number"
    )
    .optional()
    .or(z.literal("")),

  // Project details
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters")
    .trim(),

  project_type: z
    .enum([
      "residential",
      "commercial",
      "hospitality",
      "office",
      "retail",
      "other",
    ])
    .optional(),

  dimensions: z
    .string()
    .max(200, "Dimensions must be less than 200 characters")
    .optional()
    .or(z.literal("")),

  constraints: z
    .string()
    .max(1000, "Constraints must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  budget_range: z
    .enum([
      "under_10k",
      "10k_25k",
      "25k_50k",
      "50k_100k",
      "100k_250k",
      "over_250k",
      "not_sure",
    ])
    .optional(),

  preferred_contact: z.enum(["email", "phone", "either"]),
});

export type GuestServiceRequestInput = z.infer<
  typeof guestServiceRequestSchema
>;

/**
 * Validation schema for tracking serial lookup
 */
export const trackingSerialSchema = z.object({
  tracking_serial: z
    .string()
    .regex(
      /^SIZER-[A-Z0-9]{6}$/,
      "Invalid tracking serial format. Expected: SIZER-XXXXXX"
    )
    .trim()
    .toUpperCase(),
});

export type TrackingSerialInput = z.infer<typeof trackingSerialSchema>;

/**
 * Validation schema for linking guest request to user account
 */
export const linkGuestRequestSchema = z.object({
  tracking_serial: z
    .string()
    .regex(/^SIZER-[A-Z0-9]{6}$/, "Invalid tracking serial format")
    .trim()
    .toUpperCase(),
  user_id: z.string().uuid("Invalid user ID"),
});

export type LinkGuestRequestInput = z.infer<typeof linkGuestRequestSchema>;

/**
 * Rate limiting configuration for service request submissions
 */
export const RATE_LIMIT_CONFIG = {
  // Maximum requests per IP address per time window
  MAX_REQUESTS_PER_IP: 3,
  // Time window in milliseconds (15 minutes)
  TIME_WINDOW_MS: 15 * 60 * 1000,
  // Maximum requests per email per time window
  MAX_REQUESTS_PER_EMAIL: 5,
} as const;

/**
 * Project type labels for display
 */
export const PROJECT_TYPE_LABELS: Record<
  NonNullable<GuestServiceRequestInput["project_type"]>,
  string
> = {
  residential: "Residential",
  commercial: "Commercial",
  hospitality: "Hospitality",
  office: "Office",
  retail: "Retail",
  other: "Other",
};

/**
 * Budget range labels for display
 */
export const BUDGET_RANGE_LABELS: Record<
  NonNullable<GuestServiceRequestInput["budget_range"]>,
  string
> = {
  under_10k: "Under $10,000",
  "10k_25k": "$10,000 - $25,000",
  "25k_50k": "$25,000 - $50,000",
  "50k_100k": "$50,000 - $100,000",
  "100k_250k": "$100,000 - $250,000",
  over_250k: "Over $250,000",
  not_sure: "Not sure yet",
};

/**
 * Preferred contact method labels
 */
export const PREFERRED_CONTACT_LABELS: Record<
  GuestServiceRequestInput["preferred_contact"],
  string
> = {
  email: "Email",
  phone: "Phone",
  either: "Either",
};

// Made with Bob
