const LambdaLib = require('lambda-lib')
const RequestContext = require('../request-context')
const { AbstractLambdaPlugin, Enums: { Hooks, LambdaType } } = LambdaLib

const CORRELATION_PREFIX = 'x-correlation-'
const CORRELATION_ID = 'x-correlation-id'
const USER_AGENT = 'User-Agent'
const X_RRID = 'x-rrid'
const DEBUG_LOG_ENABLED = 'Debug-Log-Enabled'

class GlobalRequestContext extends AbstractLambdaPlugin {
  constructor () {
    super('globalRequestContext', [ LambdaType.DEFAULT, LambdaType.API_GATEWAY ])

    this.addHook(Hooks.PRE_EXECUTE, this.setGlobalContext.bind(this))
  }

  setGlobalContext () {
    return (req, res, data, context, done) => {
      RequestContext.clearAll()

      if (context && context.awsRequestId) RequestContext.set('awsRequestId', context.awsRequestId)

      // api-gateway headers. currently i am just setting these from the headers property. this will expand to place
      // the appropriate headers into the global context.
      if (req.headers) {
        for (var header in req.headers) {
          if (header.toLowerCase().startsWith(CORRELATION_PREFIX)) {
            RequestContext.set(header, req.headers[header])
          }
        }

        if (req.headers[X_RRID]) RequestContext.set(X_RRID, req.headers[X_RRID])
        if (req.headers[USER_AGENT]) RequestContext.set(USER_AGENT, req.headers[USER_AGENT])
        if (req.headers[DEBUG_LOG_ENABLED] === 'true') RequestContext.set(DEBUG_LOG_ENABLED, 'true')
      }

      if (!RequestContext.get(CORRELATION_ID)) {
        RequestContext.set(CORRELATION_ID, context.awsRequestId)
      }

      if (!RequestContext.get('x-rrid')) {
        const correlationId = RequestContext.get(CORRELATION_ID)
        const awsRequestId = RequestContext.get('awsRequestId')

        RequestContext.set('x-rrid', correlationId || awsRequestId)
      }

      done()
    }
  }
}

module.exports = GlobalRequestContext
