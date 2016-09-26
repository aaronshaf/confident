const express = require('express')
const router = express.Router({mergeParams: true})
const safeLoad = require('js-yaml').safeLoad
const fs = require('fs')
const path = require('path')
const pick = require('lodash/pick')
const fromPairs = require('lodash/fromPairs')
const Ajv = require('ajv')
const bodyParser = require('body-parser')
const chalk = require('chalk')

const ajv = new Ajv({ removeAdditional: true })
const swaggerDefinitionJson = fs.readFileSync(path.join(__dirname, './lib/definitions/swagger-2.json'), 'utf8')
const swaggerSchema = JSON.parse(swaggerDefinitionJson)
const validateApiDefinition = new Ajv().compile(swaggerSchema)

module.exports = function (options) {
  const yaml = fs.readFileSync(options.definition, 'utf8')
  const apiDefinition = safeLoad(yaml)

  const apiDefinitionValid = validateApiDefinition(apiDefinition)
  if (!apiDefinitionValid) {
    console.log(validateApiDefinition.errors)
    throw new Error('API definition is not valid')
  }

  const basePath = apiDefinition.basePath ? (apiDefinition.basePath) : ''

  const api = express.Router({mergeParams: true})

  api.get('/' + path.basename(options.definition), (req, res) => {
    res.header('Content-Type', 'text/yaml')
    res.send(yaml)
  })
  api.get('/' + path.basename(options.definition, '.yml') + '.json', (req, res) => {
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify(apiDefinition, null, 2))
  })
  const devModulePath = path.join(__dirname, './node_modules/react-openapi/build/')
  const prodModulePath = path.join(__dirname, '../react-openapi/build/')

  let isDev = false
  let isProd = false
  try {
    // node is terrible at this
    fs.accessSync(prodModulePath)
    isProd = true
  } catch (error) {
    try {
      fs.accessSync(devModulePath)
      isDev = true
    } catch (error) {}
  }

  if (isProd) {
    api.use(options.docsEndpoint || '/docs', express.static(prodModulePath))
  } else if (isDev) {
    api.use(options.docsEndpoint || '/docs', express.static(devModulePath))
  }

  for (let path in apiDefinition.paths) {
    for (let method in apiDefinition.paths[path]) {
      const methodInfo = apiDefinition.paths[path][method]
      const validators = []

      // validate request body
      const bodyPropertySchemas = (methodInfo.parameters || [])
        .filter(inBody)
        .map((param) => {
          const schema = Object.assign({},
            (param.schema || {})
          )
          return [param.name, schema]
        })
      if (bodyPropertySchemas.length) {
        const required = methodInfo.parameters
          .filter(inBody)
          .filter((param) => param.required)
          .map((param) => param.name)
        const bodySchema = {
          type: 'object',
          required,
          properties: fromPairs(bodyPropertySchemas)
        }
        const validateBody = ajv.compile(bodySchema)
        validators.push((req, res) => {
          const valid = validateBody(req.body)
          if (!valid) {
            return res.status(400).json(validateBody.errors)
          }
        })
      }

      const nonBodySchemaFields = [
        'type', 'items', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum',
        'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems',
        'uniqueItems', 'enum', 'multipleOf'
      ]

      // validate query params
      const queryParamsSchemas = (methodInfo.parameters || [])
        .filter(inQuery)
        .map((param) => {
          const schema = Object.assign({},
            pick(param, nonBodySchemaFields)
          )
          return [param.name, schema]
        })
      if (queryParamsSchemas.length) {
        const required = methodInfo.parameters
          .filter(inQuery)
          .filter((param) => param.required)
          .map((param) => param.name)
        const queryParamsSchema = {
          type: 'object',
          required,
          properties: fromPairs(queryParamsSchemas)
        }
        const validateQueryParams = ajv.compile(queryParamsSchema)
        validators.push((req, res) => {
          const valid = validateQueryParams(req.query)
          if (!valid) {
            return res.status(400).json(validateQueryParams.errors)
          }
        })
      }

      const validateRequest = (req, res, next) => {
        validators.forEach((validator) => validator(req, res))
        next()
      }

      if (!options.operations[methodInfo.operationId]) {
        console.log(chalk.red(`The operation ${chalk.bold(methodInfo.operationId)} is missing`))
        process.exit(1)
      }
      const routeController = options.operations[methodInfo.operationId]
      const expressFriendlyPath = path.replace(/\/{/, "/:").replace("\}","")
      api[method](expressFriendlyPath,
        bodyParser.json(), // TODO: infer parsing middleware from API spec
        validateRequest,
        routeController
      )
    }
  }

  if (basePath) {
    router.use(basePath, api)
  } else {
    router.use(api)
  }

  return router
}

const inBody = (parameter) => parameter.in === 'body'
const inPath = (parameter) => parameter.in === 'path'
const inQuery = (parameter) => parameter.in === 'query'
const inFormData = (parameter) => parameter.in === 'formData'
const inHeader = (parameter) => parameter.in === 'header'
