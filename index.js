const express = require('express')
const router = express.Router()
const safeLoad = require('js-yaml').safeLoad
const fs = require('fs')
const path = require('path')
const pick = require('lodash/pick')
const fromPairs = require('lodash/fromPairs')
const Ajv = require('ajv')
const bodyParser = require('body-parser')

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

  router.get('/' + path.basename(options.definition), (req, res) => {
    res.header('Content-Type', 'text/yaml')
    res.send(yaml)
  })

  router.get('/' + path.basename(options.definition, '.yml') + '.json', (req, res) => {
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify(apiDefinition, null, 2))
  })

  router.use('/docs', express.static(path.join(__dirname, './node_modules/react-openapi/build/')))

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

      const routeController = options.operations[methodInfo.operationId]
      router[method](path,
        bodyParser.json(), // TODO: infer parsing middleware from API spec
        validateRequest,
        routeController
      )
    }
  }
  return router
}

const inBody = (parameter) => parameter.in === 'body'
const inPath = (parameter) => parameter.in === 'path'
const inQuery = (parameter) => parameter.in === 'query'
const inFormData = (parameter) => parameter.in === 'formData'
const inHeader = (parameter) => parameter.in === 'header'
