import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "@upstash/ratelimit",
});
