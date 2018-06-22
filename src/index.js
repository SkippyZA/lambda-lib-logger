const Logger = require('./logger')
const Axios = require('./extras/axios')
const LogLevel = require('./enums/log-levels')
const GlobalRequestContext = require('./extras/global-request-context')
const RequestContext = require('./request-context')

// Export the logger as the default
Logger.LogLevel = LogLevel
module.exports = Logger

module.exports.LogLevel = LogLevel
module.exports.RequestContext = RequestContext
module.exports.Plugins = {
  Axios,
  GlobalRequestContext
}
