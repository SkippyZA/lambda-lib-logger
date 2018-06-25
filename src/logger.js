const RequestContext = require('./request-context')
const LogLevel = require('./enums/log-levels')

const HOSTNAME = 'aws-lambda'
const LAMBDA_PID = 0
const LOG_VERSION = 1
const DEFAULT_LOG_LEVEL = LogLevel.INFO

/**
 * Lambda Lib Logger
 *
 * @param {Object} options logger options
 * @param {String} options.name name of logger instance
 * @param {String} options.level log level (default: 'info'
 * @throws {TypeError} Thrown when constructed with invalid values
 */
function Logger (options = {}, _childOptions) {
  let parent

  if (_childOptions !== undefined) {
    parent = options
    options = _childOptions
  }

  this.fields = {}

  // If we have a parent logger passed, then we construct the logger slightly differently by taking
  // over configuration options and additional fields.
  if (parent) {
    if (options.name) throw new TypeError('invalid options.name: child cannot set logger name')

    this.name = parent.name
    this.level = parent.level

    const parentFieldNames = Object.getOwnPropertyNames(parent.fields)
    for (let i = 0; i <= parentFieldNames.length; i++) {
      const name = parentFieldNames[i]
      this.fields[name] = parent.fields[name]
    }
  } else {
    if (!options.name) throw new TypeError('options.name (string) is required')

    this.name = options.name
    this.level = options.level || DEFAULT_LOG_LEVEL
  }

  // Add options to fields map
  const names = Object.getOwnPropertyNames(options)
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    this.fields[name] = options[name]
  }
}

/**
 * Create a child logger of this logger instance.
 *
 * @param {Object} options logger options
 * @returns {Logger} child logger instance
 */
Logger.prototype.child = function (options) {
  return new (this.constructor)(this, options)
}

/**
 * Prepare log object.
 *
 * When preparing a log object, this will stringify the object to a JSON string, and append a newline.
 *
 * @param {object} obj log object
 * @return {string} complete log object as a json string
 */
function _prepareLogObject (obj) {
  return JSON.stringify(obj).concat('\n')
}

/**
 * Check if we are able/allowed to log the message
 *
 * @param {number} level log level
 * @return {boolean} returns true if allowed to log
 */
function _isLoggable (level) {
  // Drop out early if not the required log level
  return LogLevel.levels[this.level] <= level
}

/**
 * Write a log message to the console using `stdout``.
 *
 * @param {string} logLevel log level
 * @param {msg} string log message
 * @param {object} options additional parameters to add to log object
 */
function _writeLog (logLevel, msg, options) {
  const level = LogLevel.levels[logLevel]

  // Drop out early if not the required log level
  if (!_isLoggable.call(this, level)) return

  const globalContext = RequestContext.getAll()

  // Construct the entire log record
  const logMessageProperties = {
    v: LOG_VERSION,
    pid: LAMBDA_PID,
    hostname: HOSTNAME,
    time: new Date().toISOString(),
    level,
    msg
  }

  const logRecord = Object.assign({}, options, globalContext, this.fields, logMessageProperties)

  // Log x-rrid as rrid and remove the original
  if (logRecord['x-rrid']) {
    logRecord['rrid'] = logRecord['x-rrid']
    delete logRecord['x-rrid']
  }

  const logOutputString = _prepareLogObject(logRecord)

  // Write to stdout
  process.stdout.write(logOutputString)
}

/**
 * Log a trace message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.trace = function (msg, options) { _writeLog.call(this, LogLevel.TRACE, msg, options) }

/**
 * Log a debug message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.debug = function (msg, options) { _writeLog.call(this, LogLevel.DEBUG, msg, options) }

/**
 * Log an info message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.info = function (msg, options) { _writeLog.call(this, LogLevel.INFO, msg, options) }

/**
 * Log a warning message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.warn = function (msg, options) { _writeLog.call(this, LogLevel.WARN, msg, options) }

/**
 * Log an error message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.error = function (msg, options) { _writeLog.call(this, LogLevel.ERROR, msg, options) }

/**
 * Log a fatal message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.fatal = function (msg, options) { _writeLog.call(this, LogLevel.FATAL, msg, options) }

module.exports = Logger
