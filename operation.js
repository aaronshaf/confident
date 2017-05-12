const express = require('express')

module.exports = function (...args) {
  const router = express.Router({ mergeParams: true })
  return router.use(...args)
}
