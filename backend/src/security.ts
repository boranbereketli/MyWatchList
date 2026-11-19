import { Request, Response, NextFunction } from "express";

// API-only server: nothing here should ever be rendered, framed or sniffed by a browser.
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  next();
};

// Minimal in-memory limiter (per IP, fixed window). Enough to stop password guessing and bcrypt
// CPU abuse on a single instance. Behind a reverse proxy set `app.set("trust proxy", 1)`.
export const rateLimit = (max: number, windowMs: number) => {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);

    const key = req.ip ?? "unknown";
    const entry = hits.get(key) ?? { count: 0, resetAt: now + windowMs };
    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ message: "Too many attempts. Please try again later." });
    }
    next();
  };
};
