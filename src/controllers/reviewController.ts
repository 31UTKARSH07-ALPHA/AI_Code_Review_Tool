import { Request, Response } from "express";
import { z } from "zod";
import { getCodeReview } from "../services/aiService";
import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { detectLanguage } from "../services/languageDetector";
import {
  generateCacheKey,
  getCachedReview,
  setCachedReview,
} from "../services/cacheService";

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
  const detectedLanguage =
    language === "unknown" ? detectLanguage(code) : language;

  const cacheKey = generateCacheKey(code, detectedLanguage);
  const cached = await getCachedReview(cacheKey);

  if (cached) {
    logger.info("Cache hit! Returning cached review",{language:detectedLanguage});
    res.status(200).json({
      cached: true,
      language: detectLanguage,
      review: cached,
    });
    return;
  }
  logger.info("Cache miss! Calling Groq AI...",{language,detectLanguage});
  try {
    const rawReview = await getCodeReview(code, detectedLanguage);
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

    await setCachedReview(cacheKey, review);

    const saved = await prisma.review.create({
      data: {
        code,
        language: detectedLanguage,
        summary: review.summary,
        bugs: review.bugs,
        improvements: review.improvements,
        quality: review.quality,
      },
    });

    res.status(200).json({
      id: saved.id,
      language: detectedLanguage,
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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          language: true,
          summary: true,
          quality: true,
          createdAt: true,
        },
      }),
      prisma.review.count(),
    ]);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch reviews",
    });
  }
}

export async function getReviewById(req: Request, res: Response) {
  const id = req.params.id as string;
  //console.log(id);
  try {
    const review = await prisma.review.findUniqueOrThrow({
      where: { id },
    });
    res.status(200).json({ review });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch review",
    });
  }
}
