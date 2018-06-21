const RequestContext = require('../request-context')

/**
 * Interceptor for axios to include global context properties into each
 * requests headers.
 *
 * Using `global.CONTEXT` which is set by the GlobalContextPlugin, it merges
 * the contents with the request headers
 *
 * @param {object} config Axios config
 * @returns {object} axios config
 */
function axiosInterceptor (config) {
  Object.keys(RequestContext.getAll()).forEach(ctxVar => {
    const contextVariable = RequestContext.get(ctxVar)

    if (contextVariable && !config.headers[ctxVar]) {
      config.headers[ctxVar] = contextVariable
    }
  })

  return config
}

module.exports = axiosInterceptor
