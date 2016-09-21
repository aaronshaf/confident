const confident = require('../../index') // require('confident')
const express = require('express')
const app = express()
const greet = require('./greet')
const path = require('path')

app.use(confident({
  definition: path.join(__dirname, './api.yml'),
  operations: { greet }
}))

if (!module.parent) {
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
  })
}

module.exports = app
