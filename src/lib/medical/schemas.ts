import { z } from "zod";

/**
 * Route parameter validation schemas — PRD v2 §12.3
 */

// Common Enums
export const TrackSchema = z.enum(["ug", "pg"]);
export const QuotaSchema = z.enum(["aiq", "state", "deemed", "central"]);
export const CategorySchema = z.enum(["general", "obc", "sc", "st", "ews"]);
export const CollegeTypeSchema = z.enum(["all", "government", "private", "deemed", "central"]);

// Results & Calculator Query Params
export const CalculatorQuerySchema = z.object({
  track: TrackSchema.default("ug"),
  rank: z.coerce.number().positive().int().optional(),
  quota: QuotaSchema.default("aiq"),
  category: CategorySchema.default("general"),
  state: z.string().optional(),     // State code, e.g. "MH"
  course: z.string().optional(),    // "mbbs", "bds", or PG specialty
  type: CollegeTypeSchema.default("all"),
});

// Directory (All Colleges) Query Params
export const DirectoryQuerySchema = z.object({
  track: TrackSchema.default("ug"),
  state: z.string().optional(),
  type: CollegeTypeSchema.default("all"),
  course: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["name_asc", "name_desc", "established"]).default("name_asc"),
});

// Compare Tray Query Params
export const CompareQuerySchema = z.object({
  ids: z.string().default("").transform((val) => val.split(",").filter(Boolean).slice(0, 3)),
});

// Seat Matrix Query Params
export const SeatMatrixQuerySchema = z.object({
  track: TrackSchema.default("ug"),
  quota: QuotaSchema.or(z.literal("all")).default("all"),
  category: CategorySchema.or(z.literal("all")).default("all"),
  state: z.string().optional(),
  type: CollegeTypeSchema.default("all"),
  course: z.string().optional(),
  search: z.string().optional(),
});
