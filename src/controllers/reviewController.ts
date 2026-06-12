import { Request, Response } from "express";
import { z } from "zod";
import { getCodeReview } from "../services/aiService";
import prisma from "../lib/prisma";

const reviewSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string().optional().default("unknown"),
});

export async function reviewCode(req: Request, res: Response) {
  const result = reviewSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.flatten(),
    });
  }
  const { code, language } = result.data;

  try {
    const rawReview = await getCodeReview(code, language);
    // remove markdown backticks AI sometimes adds
    const cleaned = rawReview
      .replace(/^```[\w]*\n?/, "") // remove opening ```json or ```
      .replace(/\n?```$/, "") // remove closing ```
      .trim();

    let review;
    try {
      review = JSON.parse(cleaned);
    } catch (error) {
      return res.status(502).json({
        error: "AI returned invalid response , please try again",
      });
    }

    const saved = await prisma.review.create({
      data: {
        code,
        language,
        summary: review.summary,
        bugs: review.bugs,
        improvements: review.improvements,
        quality: review.quality,
      },
    });

    res.status(200).json({
      id: saved.id,
      language,
      review,
    });
  } catch (error: any) {
    console.log(error);

    if (error?.status == 429) {
      return res.status(429).json({
        error: "Too many requests — please wait and try again",
      });
    }

    return res.status(500).json({
      error: "Failed to get code review",
    });
  }
}

export async function getReviews(req: Request, res: Response) {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        language: true,
        summary: true,
        quality: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch reviews",
    });
  }
}
