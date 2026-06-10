import { Request, Response } from "express";
import { z } from "zod";

const reviewSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string().optional(),
});

export async function reviewCode(req: Request, res: Response) {
  const result = reviewSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.flatten,
    });
  }
  console.log(result);

  const { code, language } = result.data;
  res.json({
    message: "Review received!",
    code,
    language: language ?? "not specified",
  });
}
