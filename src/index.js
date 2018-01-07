const bunyan = require('bunyan')
const Axios = require('./extras/axios')
const Bunyan = require('./extras/bunyan')
const GlobalRequestContext = require('./extras/global-request-context')

// Global logger. Set when first calling createLogger.
let globalLogger = null

/**
 * Adapter for bunyan logger to expose a winston style interface
 *
 * @param {bunyan.Logger} logger instance of bunyan logger
 * @return {object} winston style log interface
 */
function winstonLoggerStyle (logger) {
  return {
    logger: logger,
    fatal: function (msg, extra) { logger.fatal(extra || {}, msg) },
    error: function (msg, extra) { logger.error(extra || {}, msg) },
    info: function (msg, extra) { logger.info(extra || {}, msg) },
    warn: function (msg, extra) { logger.warn(extra || {}, msg) },
    debug: function (msg, extra) { logger.debug(extra || {}, msg) },
    trace: function (msg, extra) { logger.trace(extra || {}, msg) },
    silly: function (msg, extra) { logger.trace(extra || {}, msg) }
  }
}

/**
 * Create a logger instance
 *
 * @param {string} serviceName name of service
 * @param {object} stream bunyan log writing stream
 * @param {object} loggerOptions bunyan logger options
 * @return {object} winston style log interface
 */
function createLogger (serviceName, stream, loggerOptions = {}) {
  // TODO: Defaultly apply the bunyan stream here...
  // TODO: Logic here is broken. We are always forcing a log level of `trace`
  const loggerConfig = Object.assign({}, loggerOptions, {
    name: serviceName,
    stream: stream,
    level: 'trace'
  })

  const logger = bunyan.createLogger(loggerConfig)

  // If there is no global logger set, assume the first logger created will be that
  if (!globalLogger) {
    globalLogger = logger
  }

  return winstonLoggerStyle(logger)
}

/**
 * Get a child logger attached to the primary logger
 *
 * @param {bunyan.Logger} logger instance of bunyan logger
 * @param {object} obj additional propeties for logger
 * @return {object} winston style log interface
 */
function getChildLogger (logger, obj) {
  const childLogger = logger.logger.child(obj, true)

  return winstonLoggerStyle(childLogger)
}

/**
 * Get the global logger.
 *
 * @throws ReferenceError thrown when no global logger set
 * @return {object} winston style log interface
 */
function getLogger () {
  if (!globalLogger) {
    throw new ReferenceError('No logger has been created. Call `createLogger` to apply a default logger')
  }

  return winstonLoggerStyle(globalLogger)
}

module.exports = {
  getLogger,
  createLogger,
  getChildLogger,
  plugins: {
    Axios,
    Bunyan,
    GlobalRequestContext
  }
}
