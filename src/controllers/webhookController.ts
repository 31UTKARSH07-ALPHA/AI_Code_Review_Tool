import { Request, Response } from "express";
import crypto from "crypto";
import logger from "../lib/logger";
import { getCodeReview } from "../services/aiService";
import { detectLanguage } from "../services/languageDetector";
import prisma from "../lib/prisma";
import {
  getCachedReview,
  generateCacheKey,
  setCachedReview,
} from "../services/cacheService";
import { error } from "console";

function verifyGithubSignature(req: Request): boolean {
  const signature = req.headers["x-hub-signature-256"] as string;
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;

  if (!signature || !secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest =
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function handleWebhook(req: Request, res: Response) {
  if (!verifyGithubSignature(req)) {
    logger.warn("Invalid webhook signature");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.headers["x-github-event"];

  if (event != "push") {
    res.status(200).json({ message: "Event Ignored" });
    return;
  }

  const payload = req.body;
  const commits = payload.commits || [];

  logger.info("Webhook received", {
    repo: payload.repository?.name,
    commits: commits.length,
  });

  const changedFiles: string[] = commits.flatMap(
    (commit: any) => commit.added || commit.modified || [],
  );

  // filter only code files
  const codeFiles = changedFiles.filter((file: string) =>
    [".ts", ".js", ".py", ".java"].some((ext) => file.endsWith(ext)),
  );

  logger.info("Files to review", { count: codeFiles.length, files: codeFiles });

  res.status(200).json({
    message: "Webhook received",
    filesQueued: codeFiles.length,
  });
}
