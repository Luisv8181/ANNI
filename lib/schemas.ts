import { z } from "zod";

export const annotationFormSchema = z.object({
  span: z.string().min(1, "Evidence quote is required"),
  note: z.string().min(1, "Reviewer note is required"),
  confidence: z.number().min(0).max(100),
  relationship: z.enum(["supports", "contradicts", "qualifies", "contextualizes"]),
});

export type AnnotationFormValues = z.infer<typeof annotationFormSchema>;
