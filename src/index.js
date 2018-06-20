const Logger = require('./logger')
const Axios = require('./extras/axios')
const GlobalRequestContext = require('./extras/global-request-context')

// Export the logger as the default
module.exports = Logger

module.exports.LogLevel = Logger.LogLevel
module.exports.Plugins = {
  Axios,
  GlobalRequestContext
}
