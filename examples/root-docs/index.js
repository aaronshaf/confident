const confident = require('../../index') // require('confident')
const express = require('express')
const app = express()
const path = require('path')

function greet (req, res) {
  res.json('Hello, world.')
}

app.use(
  confident({
    specification: path.join(__dirname, './api.json'),
    docsEndpoint: '/',
    operations: { greet },
    onRequestValidationError: (req, res, errors, next) => {
      res.status(400).json({ errors })
    }
  })
)

if (!module.parent) {
  app.listen(3000, () => {
    console.log('Listening on port 3000!')
  })
}

module.exports = app
