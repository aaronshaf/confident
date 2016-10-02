const express = require('express')
const { safeDump } = require('js-yaml')
const path = require('path')
const bodyParser = require('body-parser')

const loadSpecification = require('./lib/load-specification')
const validateSpecification = require('./lib/validate-specification')
const suggestSchemas = require('./lib/suggest-schemas')
const serveDocs = require('./lib/serve-docs')
const validateRequest = require('./lib/validate-request')

module.exports = function (options) {
  const isDevEnvironment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

  // load and validate specification
  const apiSpecification = loadSpecification(options.specification)
  validateSpecification(apiSpecification)

  // create confident middleware
  const apiRouter = express.Router({mergeParams: true})
  apiRouter.use(bodyParser.json())

  // serve /api.yml
  apiRouter.get(`/${path.basename(options.specification)}`, (req, res) => {
    res.header('Content-Type', 'text/yaml')
    res.send(safeDump(apiSpecification))
  })

  // serve /api.json
  apiRouter.get('/' + path.basename(options.specification, '.yml') + '.json', (req, res) => {
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify(apiSpecification, null, 2))
  })

  // serve docs
  if (options.docsEndpoint) {
    apiRouter.use(serveDocs(options.docsEndpoint))
  }

  // suggest schemas
  if (isDevEnvironment && options.suggestSchemas) {
    apiRouter.use(suggestSchemas)
  }

  // validate request body, query params (TODO: headers, path params)
  apiRouter.use(validateRequest(
    apiSpecification,
    options.operations,
    options.ajvOptions || {}
  ))

  // respect specification's basePath
  const basePath = apiSpecification.basePath ? (apiSpecification.basePath) : ''
  const baseRouter = express.Router({mergeParams: true})
  if (basePath) {
    baseRouter.use(basePath, apiRouter)
  } else {
    baseRouter.use(apiRouter)
  }

  return baseRouter
}
