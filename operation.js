const express = require('express')

module.exports = function (...args) {
  const router = express.Router()
  return router.use(...args)
}
