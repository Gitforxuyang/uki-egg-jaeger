'use strict';
const hookSequelize = require('./sequelize');
const hookRedis = require('./redis');
const hookHttp = require('./http');
const hookMongoose = require('./mongo');

module.exports = app => {
  const { Sequelize, redis, curl, mongoose, mongooseDB, config: { jaeger } } = app;
  if (jaeger.sequelize && Sequelize) {
    app.coreLogger.info('[egg-jaeger] setup Sequelize hooks');
    hookSequelize(app);
  }
  if (jaeger.redis && redis) {
    app.coreLogger.info('[egg-jaeger] setup ioredis hooks');
    hookRedis(app);
  }
  if (jaeger.http && curl) {
    app.coreLogger.info('[egg-jaeger] setup http hooks');
    hookHttp(app);
  }
  if (jaeger.mongoose && (mongoose || mongooseDB)) {
    app.coreLogger.info('[egg-jaeger] setup mongoose hooks');
    hookMongoose(app);
  }
};
