const confident = require('../../index') // require('confident')
const express = require('express')
const app = express()
const path = require('path')

function greet (req, res) {
  res.json('Hello, world.')
}

app.use(confident({
  specification: path.join(__dirname, './api.yml'),
  suggestSchemas: true,
  operations: { greet }
}))

app.post('/foo/:bar', (req, res) => {
  res.json({
    someString: 'string',
    someObject: {
      anotherString: 'string'
    }
  })
})

if (!module.parent) {
  app.listen(3000, () => {
    console.log('Listening on port 3000!')
  })
}

module.exports = app
