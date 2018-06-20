const LogLevel = require('./enums/log-levels')

const HOSTNAME = 'aws-lambda'
const LAMBDA_PID = 0
const LOG_VERSION = 1
const DEFAULT_LOG_LEVEL = LogLevel.INFO

/**
 * Lambda Lib Logger
 *
 * @param {String} name name of logger instance
 * @param {Object} options logger options
 * @param {String} options.level log level (default: 'info'
 * @param {Number} options.sampleDebug percentage of debug messages to log. 0 = disabled (default: 0)
 * @throws {TypeError} Thrown when constructed with invalid values
 */
function Logger (name, options = {}) {
  const logLevel = LogLevel.levels[options.level || DEFAULT_LOG_LEVEL]

  if (!name) throw new TypeError('Logger constructed without name')
  if (!logLevel) throw new TypeError(`Invalid log level ('${logLevel}' is not a valid log level')`)

  this._name = name
  this._options = options
  this._logLevel = logLevel
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

function _isLoggable (level) {
  // Drop out early if not the required log level
  return this._logLevel <= level
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

  const globalContext = global.CONTEXT || {}

  // Construct the entire log record
  let logRecord = {
    ...globalContext,
    ...options,
    v: LOG_VERSION,
    pid: LAMBDA_PID,
    hostname: HOSTNAME,
    name: this._name,
    time: new Date().toISOString(),
    level,
    msg
  }

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
module.exports.LogLevel = LogLevel
