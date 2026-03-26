import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  board: z.string().min(1, "Board is required"),
  medium: z.string().min(1, "Medium is required"),
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  price: z.number().min(0, "Price must be a positive number"),
  isFree: z.boolean().default(false),
  thumbnail: z.string().optional(),
});

export const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  videoUrl: z.string().min(1, "Video URL is required"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  order: z.number().int().min(0, "Order must be a positive integer"),
  duration: z.number().min(0, "Duration must be a positive number"),
  isFree: z.boolean().default(false),
  courseId: z.string().min(1, "Course ID is required"),
  resources: z.array(z.string()).optional()
});

export const curriculumSchema = z.object({
  treeData: z.record(z.string(), z.any()).refine(data => {
    // Basic root check - it shouldn't be completely empty, 
    // but even if it is, 'treeData' itself must exist.
    return data !== undefined && data !== null;
  }, "Invalid curriculum treeData structure")
});
