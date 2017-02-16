const confident = require('../../index') // require('confident')
const express = require('express')
const app = express()
const path = require('path')

function greet (req, res) {
  res.json('Hello, world.')
}

function hai (req, res) {
  res.json('Oh, hai.')
}

app.use(
  confident({
    specification: path.join(__dirname, './api.yml'),
    docsEndpoint: '/docs',
    operations: {greet, hai},
    onResponseValidationError: (req, res, errors, next) => {
      res.status(500).json({errors})
    }
  })
)

if (!module.parent) {
  app.listen(3000, () => {
    console.log('Listening on port 3000!')
  })
}

module.exports = app
