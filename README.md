## Get started

```
npm install confident --save
```

### api.yaml

```yaml
swagger: '2.0'
info:
  title: Hello World
  version: 1.0.0
paths:
  /hello:
    get:
      operationId: greet
      responses:
        200:
          description: Say hello to the world.
```

### index.js

```javascript
const confident = require('confident')
const express = require('express')
const app = express()
const greet = require('./greet')

function greet (req, res) {
  res.json('Hello, world.')
}

app.use(confident({
  definition: '/api.yml',
  operations: { greet }
}))

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
```

## http://localhost:3000/docs

![screenshot](https://d3vv6lp55qjaqc.cloudfront.net/items/0V0d341O2k0l2c243C3G/Screen%20Shot%202016-09-23%20at%203.25.07%20PM.png?X-CloudApp-Visitor-Id=ab2071d5f76f8504ab6d3070d8a2c5c3&v=60088c3e)

## Roadmap

* Validate query params
* Validate path params
* Validate classic formData
* Validate headers
* Validate responses
* Support $ref
