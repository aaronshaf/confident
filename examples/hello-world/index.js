const confident = require('../../index') // require('confident')
const express = require('express')
const app = express()
const greet = require('./greet')

app.use(confident({
  definition: './api.yml',
  operations: { greet }
}))

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
