const bunyan = require('bunyan')
const Axios = require('./extras/axios')
const BunyanStream = require('./extras/bunyan-stream')
const GlobalRequestContext = require('./extras/global-request-context')

// Global logger. Set when first calling createLogger.
let globalLogger = null

/**
 * Adapter for bunyan logger to expose a winston style interface.
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
 * Create a logger instance.
 *
 * By default, the logger instance created will be created with the bunyan logger plugin
 * to defaultly log out the properties available in the global request context and will
 * log with `info` verbosity.
 *
 * If no global logger instance is set, then the first logger instance created with this
 * method will be set as the global logger. This is required for use with the `getLogger`
 * method.
 *
 * @param {string} serviceName name of service
 * @param {object} loggerOptions bunyan logger options
 * @return {object} winston style log interface
 */
function createLogger (serviceName, loggerOptions = {}) {
  // Defaults are defined, but can be overridden by `loggerOptions`
  const defaults = {
    stream: new BunyanStream(),
    level: 'info'
  }

  // Head config is static. Any options passed via `loggerOptions` will be ignored
  // in favour of these
  const hardConfig = {
    name: serviceName
  }

  const loggerConfig = Object.assign(defaults, loggerOptions, hardConfig)
  const logger = bunyan.createLogger(loggerConfig)

  // If there is no global logger set, assume the first logger created will be set as that
  if (!globalLogger) {
    globalLogger = logger
  }

  return winstonLoggerStyle(logger)
}

/**
 * Get a child logger attached to the primary logger.
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
 * @param {String=} name name of child loger
 * @throws ReferenceError thrown when no global logger set
 * @return {object} winston style log interface
 */
function getLogger (name) {
  if (!globalLogger) {
    throw new ReferenceError('No logger has been created. Call `createLogger` to apply a default logger')
  }

  if (name) {
    return getChildLogger({ logger: globalLogger }, { loggerName: name })
  } else {
    return winstonLoggerStyle(globalLogger)
  }
}

module.exports = {
  getLogger,
  createLogger,
  getChildLogger,
  plugins: {
    Axios,
    GlobalRequestContext
  }
}
