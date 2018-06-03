const Logger = require('./logger')
const Axios = require('./extras/axios')
const GlobalRequestContext = require('./extras/global-request-context')

module.exports = Logger

module.exports.Level = Logger.LogLevel
module.exports.LogLevel = Logger.LogLevel
module.exports.Plugins = {
  Axios,
  GlobalRequestContext
}
