const GlobalRequestContext = require('../../../src/extras/global-request-context')

describe('global-request-context plugin', () => {
  it('should work with headers and request context', (done) => {
    const plugin = new GlobalRequestContext()

    const res = {}
    const data = {}
    const req = {
      headers: {
        'User-Agent': 'mocha-test',
        'x-correlation-test': 'hello-world'
      }
    }
    const context = {
      awsRequestId: 'sample-request-id-hash'
    }

    plugin.setGlobalContext()(req, res, data, context, () => {
      global.CONTEXT.should.deep.equal({
        'User-Agent': 'mocha-test',
        'awsRequestId': 'sample-request-id-hash',
        'x-rrid': 'sample-request-id-hash',
        'x-correlation-id': 'sample-request-id-hash',
        'x-correlation-test': 'hello-world'
      })

      done()
    })
  })

  it('should work with empty req', (done) => {
    const plugin = new GlobalRequestContext()

    const res = {}
    const data = {}
    const req = {}
    const context = { awsRequestId: 'sample-request-id-hash' }

    plugin.setGlobalContext()(req, res, data, context, () => {
      global.CONTEXT.should.deep.equal({
        'awsRequestId': 'sample-request-id-hash',
        'x-rrid': 'sample-request-id-hash',
        'x-correlation-id': 'sample-request-id-hash'
      })

      done()
    })
  })

  it('should set debug true if Debug-Log-Enabled === "true"', (done) => {
    const plugin = new GlobalRequestContext()

    const res = {}
    const data = {}
    const req = {
      headers: {
        'Debug-Log-Enabled': 'true'
      }
    }
    const context = { awsRequestId: 'sample-request-id-hash' }

    plugin.setGlobalContext()(req, res, data, context, () => {
      global.CONTEXT.should.deep.equal({
        'awsRequestId': 'sample-request-id-hash',
        'x-rrid': 'sample-request-id-hash',
        'x-correlation-id': 'sample-request-id-hash',
        'Debug-Log-Enabled': 'true'
      })

      done()
    })
  })
})
