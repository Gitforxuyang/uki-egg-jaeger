'use strict';

const util = require('../util');

module.exports = app => {
  util.wrap(app, 'curl', original => function curl(url, options) {
    const span = app.startSpan(`http request`, {
      'http.url': url,
      'http.method': options.method,
      'http.request.data': options.data,
      'span.kind': 'client',
    });
    return original.apply(this, arguments).then(
      result => {
        const data = result.res.data.toString();
        span.setTag('http.status_code', result.res.status)
        if (result.res.status !== 200 || data.code !== 0) {
          span.setTag('http.res.data', data)
          // span.setTag('http.remoteAddress:', result.res.remoteAddress)
        }
        span.finish();
        return result;
      },
      err => {
        span.finish(err);
        throw err;
      }
    );
  });
};
