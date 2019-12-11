'use strict';

const finishSpan = (span, ctx, err) => {
  span.setTag('http.status_code', ctx.response.status);
  if (err) {
    span.setTag('error', true);
    span.log({
      event: 'error',
      'error.object': err,
      message: err.message,
      stack: err.stack,
    });
  }
  ctx.app.coreLogger.debug('[egg-jaeger] finishSpan', span);
  span.finish();
};

module.exports = (options, app) => async function jaegerMiddleware(ctx, next) {
  app.als.scope();

  const parentSpanContext = app.jaeger.extract('http_headers', ctx.header)
  const span = app.mdStartSpan(ctx.path, {
    'http.method': ctx.method,
    'http.url': ctx.url,
  }, parentSpanContext);
  //有requestId且没有注入链路
  if (ctx.header['x-request-id'] && !ctx.header['uber-trace-id']) {
    span.context().traceId = Buffer.from(ctx.header['x-request-id'], 'hex').slice(0, 8);
  }
  ctx.header['x-request-id'] = span.context().traceId.toString('hex');
  try {
    await next();
    finishSpan(span, ctx);
  } catch (err) {
    finishSpan(span, ctx, err);
    throw err;
  }
};
