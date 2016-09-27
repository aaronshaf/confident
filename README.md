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
      summary: Say hello to the world
      operationId: greet
      responses:
        200:
          description: Sweet success
```

### index.js

```javascript
const confident = require('confident')
const express = require('express')
const app = express()

function greet (req, res) {
  res.json('Hello, world.')
}

app.use(confident({
  definition: './api.yml',
  operations: { greet }
}))

app.listen(3000)
```

## Generated documentation

`http://localhost:3000/docs`

![screenshot](https://d3vv6lp55qjaqc.cloudfront.net/items/0V0d341O2k0l2c243C3G/Screen%20Shot%202016-09-23%20at%203.25.07%20PM.png?X-CloudApp-Visitor-Id=ab2071d5f76f8504ab6d3070d8a2c5c3&v=60088c3e)

## Tutorial video

* [https://cl.ly/0w1S0Q1O3o3z](Starting from scratch (4m53s))

## See also

* [swaggerize-express](https://github.com/krakenjs/swaggerize-express)
* [swaggerize-routes](https://github.com/krakenjs/swaggerize-routes)
* [swagger-tools](https://github.com/apigee-127/swagger-tools)
* [swagger-node-express](https://github.com/swagger-api/swagger-node)
