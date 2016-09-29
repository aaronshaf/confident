const express = require('express')
const Ajv = require('ajv')
const chalk = require('chalk')
const pick = require('lodash/pick')
const fromPairs = require('lodash/fromPairs')

module.exports = (apiDefinition, operations) => {
  const ajv = new Ajv({ removeAdditional: true })
  const validationRouter = express.Router({mergeParams: true})

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
          required: required.length ? required : undefined,
          properties: fromPairs(bodyPropertySchemas)
        }
        const validateBody = ajv.compile(bodySchema)
        validators.push((req, res) => {
          const valid = validateBody(req.body)
          if (!valid) {
            res.status(400).json(validateBody.errors)
            return false
          }
          return true
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
          required: required.length ? required : undefined,
          properties: fromPairs(queryParamsSchemas)
        }
        const validateQueryParams = ajv.compile(queryParamsSchema)
        validators.push((req, res) => {
          const valid = validateQueryParams(req.query)
          if (!valid) {
            res.status(400).json(validateQueryParams.errors)
            return false
          }
          return true
        })
      }

      const validateRequest = (req, res, next) => {
        const validations = validators.map((validator) => validator(req, res))
        const allWereValid = validations.every((validation) => validation)
        if (allWereValid) {
          next()
        }
      }

      const expressFriendlyPath = path.replace(/\/{/g, "/:").replace(new RegExp("\}", "g"),"")
      validationRouter[method](expressFriendlyPath, validateRequest)
      if (methodInfo.operationId) {
        if (!operations[methodInfo.operationId]) {
          console.log(chalk.red(`The operation ${chalk.bold(methodInfo.operationId)} is missing`))
          process.exit(1)
        }
        const routeController = operations[methodInfo.operationId]
        validationRouter[method](expressFriendlyPath, routeController)
      }
    }
  }

  return validationRouter
}

const inBody = (parameter) => parameter.in === 'body'
const inPath = (parameter) => parameter.in === 'path'
const inQuery = (parameter) => parameter.in === 'query'
const inFormData = (parameter) => parameter.in === 'formData'
const inHeader = (parameter) => parameter.in === 'header'
