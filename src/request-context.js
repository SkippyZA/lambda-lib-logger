const CORRELATION_PREFIX = 'x-correlation-'

/**
 * Clear the global context and set it to an empty object.
 */
function clearAll () {
  global.CONTEXT = {}
}

/**
 * Replace the global context with the supplied context
 *
 * @param {object} context context object
 */
function replaceAllWith (context) {
  global.CONTEXT = context
}

/**
 * Set a value on the global context.
 *
 * When setting a key, when it does not start with the CORRELATION_PREFIX, then it is automatically
 * prepended to the key.
 *
 * @param {string} key global context property key
 * @param {*} value value of property key
 */
function set (key, value) {
  if (!key.startsWith(CORRELATION_PREFIX)) {
    key = CORRELATION_PREFIX + key
  }

  if (!global.CONTEXT) {
    global.CONTEXT = {}
  }

  global.CONTEXT[key] = value
}

/**
 * Retrieve all values stored in the global context
 *
 * @return {object} global context object
 */
function getAll () {
  return global.CONTEXT || {}
}

/**
 * Retrieve a property from the global context.
 *
 * @param {string} key global context property key
 * @return {*|undefined} value from global context
 */
function get (key) {
  if (!global.CONTEXT) return

  const searchKey = !key.startsWith(CORRELATION_PREFIX)
    ? CORRELATION_PREFIX + key
    : key

  return getAll()[searchKey]
}

module.exports = {
  clearAll,
  replaceAllWith,
  set: set,
  get: get,
  getAll: getAll
}
