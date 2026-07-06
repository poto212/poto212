export function logRequest(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const entry = {
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      user: req.user?.username || null
    };
    console.log(JSON.stringify(entry));
  });
  next();
}

export function logError(error, req) {
  console.error(JSON.stringify({ level: 'error', requestId: req.id, message: error.message, stack: error.stack }));
}
