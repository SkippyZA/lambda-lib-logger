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
 * @param {string} key global context property key
 * @param {*} value value of property key
 */
function set (key, value) {
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

  return getAll()[key]
}

module.exports = {
  clearAll,
  replaceAllWith,
  set: set,
  get: get,
  getAll: getAll
}
