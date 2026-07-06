import crypto from 'crypto';

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 120);
const buckets = new Map();

export function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

export function rateLimit(req, res, next) {
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = buckets.get(key) || { resetAt: now + WINDOW_MS, count: 0 };
  if (bucket.resetAt < now) {
    bucket.resetAt = now + WINDOW_MS;
    bucket.count = 0;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(MAX_REQUESTS - bucket.count, 0)));
  if (bucket.count > MAX_REQUESTS) return res.status(429).json({ error: 'Demasiadas solicitudes, intentá nuevamente en unos minutos' });
  return next();
}
