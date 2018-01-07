const dirtyChai = require('dirty-chai')
const chai = require('chai')

chai.use(dirtyChai)

// doSomething().should.equal('Hello')
chai.should()

// turn on stack trace for all assertions
chai.config.includeStack = true
