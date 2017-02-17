const {safeLoad} = require('js-yaml')
const fs = require('fs')
const path = require('path')

module.exports = function (file) {
  switch (path.extname(file)) {
    case '.yml':
    case '.yaml':
      const yaml = fs.readFileSync(file, 'utf8')
      return safeLoad(yaml)
    case '.json':
      return require(file)
    default:
      throw new Error('specification not .yaml, yml, or .json')
  }
}
