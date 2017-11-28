const bunyan = require('bunyan')

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
    silly: function (msg, extra) { logger.trace(extra || {}, msg) },
    debug: function (msg, extra) { logger.debug(extra || {}, msg) },
    info: function (msg, extra) { logger.info(extra || {}, msg) },
    warn: function (msg, extra) { logger.warn(extra || {}, msg) },
    error: function (msg, extra) { logger.error(extra || {}, msg) }
  }
}

/**
 * Create a logger instance
 *
 * @param {string} serviceName name of service
 * @param {object} stream bunyan log writing stream
 * @param {string} loggerLevel log level
 * @return {object} winston style log interface
 */
function createLogger (serviceName, stream, loggerLevel = 'trace') {
  const logger = bunyan.createLogger({
    name: serviceName,
    level: loggerLevel,
    stream: stream
  })

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
  const childLogger = logger.child(obj, true)

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

module.exports = getLogger
module.exports.createLogger = createLogger
module.exports.getChildLogger = getChildLogger
module.exports.getLogger = getLogger
