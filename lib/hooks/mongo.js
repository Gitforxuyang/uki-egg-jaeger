'use strict';

const util = require('../util');

module.exports = app => {
  const { clients } = app.config.mongoose;
  if (clients) {
    const dbs = Object.keys(clients)
    for (const db of dbs) {
      const conn = app.mongooseDB.get(db)
      util.wrap(conn, 'model', original => function func(collection, schema) {
        const func = ['findOne', 'save', 'insertMany', 'aggregate', 'count', 'find',
          'findOneAndRemove', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany']
        func.forEach(item => {
          schema.pre(item, function (next) {
            this.span = app.startSpan(`mongodb ${item} `, {
              'db.instance': `${conn.name}.${collection}`,
              'db.statement': 'mongodb',
              'db.query': this._conditions,
              'db.type': 'mongodb',
              'span.kind': 'client',
            });
            return next();
          })
          schema.post(item, function (doc, next) {
            if (['save', 'insertMany'].includes(item)) {
              this.span.setTag('db.doc', doc);
            }
            this.span.finish();
            return next();
          })
        })
        return original.apply(this, arguments);
      });
    }
  } else {
    // const conn = app.mongoose
    util.wrap(app.mongoose, 'model', original => function func(collection, schema) {
      const func = ['findOne', 'save', 'insertMany', 'aggregate', 'count', 'find',
        'findOneAndRemove', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany']
      func.forEach(item => {
        schema.pre(item, function (next) {
          this.span = app.startSpan(`mongodb ${item} `, {
            'db.instance': `${collection}`,
            'db.statement': 'mongodb',
            'db.query': this._conditions,
            'db.type': 'mongodb',
            'span.kind': 'client',
          });
          return next();
        })
        schema.post(item, function (doc, next) {
          if (['save', 'insertMany'].includes(item)) {
            this.span.setTag('db.doc', doc);
          }
          this.span.finish();
          return next();
        })
      })
      return original.apply(this, arguments);
    });
  }
};
