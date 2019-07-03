'use strict';

const mock = require('egg-mock');

describe('test/uki-egg-jaeger.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/uki-egg-jaeger-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, ukiEggJaeger')
      .expect(200);
  });
});
