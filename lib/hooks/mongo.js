'use strict';

const util = require('../util');

module.exports = app => {
  const { clients } = app.config.mongoose;
  if (clients) {
    const dbs = Object.keys(clients)
    for (const db of dbs) {
      const conn = app.mongooseDB.get(db)
      const _model = conn['model']
      conn.model = function (name, schema, collection) {
        const funcs = [
          'find', 'findOne', 'findById', 'findByIdAndDelete', 'findByIdAndUpdate', 'findOneAndDelete',
          'findOneAndUpdate', 'updateMany', 'updateOne', 'update', 'aggregate',
          'create', 'insert', 'insertOne', 'insertMany', 'save', 'count', 'countDocuments'
        ]
        const model = _model.apply(this, arguments)
        for (const item of funcs) {
          util.wrap(model, item, original => function func() {
            this.span = app.startSpan(`mongodb ${item} `, {
              'db.instance': `${name}.${collection}`,
              'db.statement': 'mongodb',
              'db.query': this._conditions,
              'db.type': 'mongodb',
              'span.kind': 'client',
            });
            return original.apply(this, arguments).then(
              value => {
                this.span.finish()
                return value;
              },
              err => {
                this.span.finish(err)
                throw err;
              }
            );
          })
        }
        return model;
      }
    }
  } else {
    const _model = app.mongoose['model']
    app.mongoose.model = function (name, schema, collection) {
      const funcs = [
        'find', 'findOne', 'findById', 'findByIdAndDelete', 'findByIdAndUpdate', 'findOneAndDelete',
        'findOneAndUpdate', 'updateMany', 'updateOne', 'update', 'aggregate',
        'create', 'insert', 'insertOne', 'insertMany', 'save', 'count', 'countDocuments'
      ]
      const model = _model.apply(this, arguments)
      for (const item of funcs) {
        util.wrap(model, item, original => function func() {
          this.span = app.startSpan(`mongodb ${item} `, {
            'db.instance': `${name}.${collection}`,
            'db.statement': 'mongodb',
            'db.query': this._conditions,
            'db.type': 'mongodb',
            'span.kind': 'client',
          });
          return original.apply(this, arguments).then(
            value => {
              this.span.finish()
              return value;
            },
            err => {
              this.span.finish(err)
              throw err;
            }
          );
        })
      }
      return model;
    }
  }
};
