<img alt="Swagger wagon" src="https://d3vv6lp55qjaqc.cloudfront.net/items/0a2x1S1k1l0R0s1Z0n3e/Screen%20Shot%202017-08-09%20at%202.41.10%20PM.png?X-CloudApp-Visitor-Id=2785f610d78799cc3528493040d9b583&v=fdb8909a" width="300" />

Confident treats your API specification (a .json file) as the source of truth for express routes, API documentation, and request/response validation. It's your swagger wagon.

## Features

* Works with existing Express app.
* Everything is opt-in. Incrementally integrate or eject.
* Validate your API schema.
* Validate requests.
* Validate responses.
* Serves up API documentation.
* Serves up /api.json.
* Suggests schemas to increase coverage.
* Supports basePath.

## Get started

```
npm install confident --save
```

### api.json

```json
{
  "swagger": "2.0",
  "info": {
    "title": "Hello World",
    "version": "1.0.0"
  },
  "paths": {
    "/hello": {
      "get": {
        "summary": "Say hello to the world",
        "operationId": "greet",
        "responses": {
          "200": {
            "description": "Sweet success"
          }
        }
      }
    }
  }
}
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
  specification: './api.json',
  docsEndpoint: '/docs',
  operations: { greet }
}))

app.listen(3000)
```

## Generated documentation

`http://localhost:3000/docs`

![screenshot](https://d3vv6lp55qjaqc.cloudfront.net/items/0V0d341O2k0l2c243C3G/Screen%20Shot%202016-09-23%20at%203.25.07%20PM.png?X-CloudApp-Visitor-Id=ab2071d5f76f8504ab6d3070d8a2c5c3&v=60088c3e)

## Tutorial video

* [Starting from scratch (4m53s)](https://cl.ly/0w1S0Q1O3o3z)

## See also

* [swagger-express-middleware](https://github.com/BigstickCarpet/swagger-express-middleware)
* [swaggerize-express](https://github.com/krakenjs/swaggerize-express)
* [swaggerize-routes](https://github.com/krakenjs/swaggerize-routes)
* [swagger-tools](https://github.com/apigee-127/swagger-tools)
* [swagger-node-express](https://github.com/swagger-api/swagger-node)
* [blueoak-server](https://github.com/BlueOakJS/blueoak-server)
