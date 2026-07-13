import crypto from "crypto";
import redis from "../lib/redis";

export function generateCacheKey(code: string, language: string): string {
  const hash = crypto
    .createHash("md5")
    .update(code + language)
    .digest("hex");

  return `review:${hash}`;
}

export async function getCachedReview(key: string): Promise<any | null> {
  const cached = await redis.get(key);
  if (!cached) return null;

  return JSON.parse(cached);
}

export async function setCachedReview(key: string, review: any): Promise<void> {
  await redis.set(key, JSON.stringify(review), "EX", 3600);
}
