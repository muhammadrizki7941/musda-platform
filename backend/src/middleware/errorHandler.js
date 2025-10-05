// Central error handler
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    error: err.name || 'Error',
    message: err.message || 'Internal server error',
  };
  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.stack = err.stack;
  }
  console.error('❌ API Error:', err.message);
  res.status(status).json(payload);
}

function notFound(req, res) {
  res.status(404).json({ error: 'NotFound', message: 'Route not found' });
}

module.exports = { errorHandler, notFound };
