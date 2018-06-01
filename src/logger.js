const LogLevel = require('./enums/log-levels')

const LOG_VERSION = 1

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
  const logLevel = LogLevel.levels[options.level || 'info']

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
const _prepareLogObject = obj => JSON.stringify(obj).concat('\n')

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
  if (this._logLevel > level) return

  const globalContext = global.CONTEXT || {}

  // Construct the entire log record
  let logRecord = {
    ...globalContext,
    ...options,
    v: LOG_VERSION,
    pid: 0,
    hostname: 'aws-lambda',
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
 * Log a fatal message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.fatal = function (msg, options) { _writeLog.bind(this)(LogLevel.FATAL, msg, options) }

/**
 * Log an error message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.error = function (msg, options) { _writeLog.bind(this)(LogLevel.ERROR, msg, options) }

/**
 * Log an info message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.info = function (msg, options) { _writeLog.bind(this)(LogLevel.INFO, msg, options) }

/**
 * Log a warning message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.warn = function (msg, options) { _writeLog.bind(this)(LogLevel.WARN, msg, options) }

/**
 * Log a debug message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.debug = function (msg, options) { _writeLog.bind(this)(LogLevel.DEBUG, msg, options) }

/**
 * Log a trace message.
 *
 * @param {string} msg log message
 * @param {object} options additional log properties
 */
Logger.prototype.trace = function (msg, options) { _writeLog.bind(this)(LogLevel.TRACE, msg, options) }

module.exports = Logger
module.exports.LogLevel = LogLevel
