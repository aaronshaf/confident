const path = require('path')

module.exports = function (file) {
  switch (path.extname(file)) {
    case '.json':
      return require(file)
    default:
      throw new Error('specification not .json')
  }
}
