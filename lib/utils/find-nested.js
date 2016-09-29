const has = require('lodash/has')
const map = require('lodash/map')
const flatten = require('lodash/flatten')

// http://stackoverflow.com/a/15643385/176758
function fn (obj, key) {
  if (has(obj, key)) return [obj]

  return flatten(map(obj, function (v) {
    return typeof v === 'object' ? fn(v, key) : []
  }), true)
}

module.exports = fn
