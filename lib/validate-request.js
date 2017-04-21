const express = require('express')
const Ajv = require('ajv')
const chalk = require('chalk')
const pick = require('lodash/pick')
const fromPairs = require('lodash/fromPairs')
const loadRefs = require('./utils/load-refs')

module.exports = (
  apiDefinition,
  operations,
  ajvOptions,
  requestValidationErrorHandler
) => {
  const ajv = new Ajv(Object.assign({}, {removeAdditional: true}, ajvOptions))
  const requestValidationRouter = express.Router({mergeParams: true})
  loadRefs({ajv, apiDefinition})

  for (let path in apiDefinition.paths) {
    for (let method in apiDefinition.paths[path]) {
      // check that the method exists, filters out paramers & $ref
      if (requestValidationRouter[method]) {
        const methodInfo = apiDefinition.paths[path][method]
        const validators = []

        // validate request body
        const bodyPropertySchemas = (methodInfo.parameters || [])
          .filter(inBody)
          .map(param => {
            const schema = Object.assign({}, param.schema || {})
            return [param.name, schema]
          })

        if (bodyPropertySchemas.length) {
          // only one body schema is allowed per operation
          if (bodyPropertySchemas.length > 1) {
            console.log(
              chalk.red(
                `The operation ${chalk.bold(methodInfo.operationId)} has multiple body schemas defined. Each operation may only have one.`
              )
            )
            process.exit(1)
          }
          const bodySchema = bodyPropertySchemas[0][1]
          const validateBody = ajv.compile(bodySchema)
          validators.push((req, res, next) => {
            const isValid = validateBody(req.body)
            if (!isValid) {
              requestValidationErrorHandler(req, res, validateBody.errors, next)
              return false
            }
            return true
          })
        }

        const nonBodySchemaFields = [
          'type',
          'items',
          'exclusiveMaximum',
          'minimum',
          'exclusiveMinimum',
          'maxLength',
          'minLength',
          'pattern',
          'maxItems',
          'minItems',
          'uniqueItems',
          'enum',
          'multipleOf'
        ]

        // validate query params
        const queryParamsSchemas = (methodInfo.parameters || [])
          .filter(inQuery)
          .map(param => {
            const schema = Object.assign({}, pick(param, nonBodySchemaFields))
            return [param.name, schema]
          })
          
        if (queryParamsSchemas.length) {
          const required = methodInfo.parameters
            .filter(inQuery)
            .filter(param => param.required)
            .map(param => param.name)
          const queryParamsSchema = {
            type: 'object',
            required: required.length ? required : undefined,
            properties: fromPairs(queryParamsSchemas)
          }
          const validateQueryParams = ajv.compile(queryParamsSchema)
          validators.push((req, res, next) => {
            const valid = validateQueryParams(req.query)
            if (!valid) {
              requestValidationErrorHandler(
                req,
                res,
                validateQueryParams.errors,
                next
              )
              return false
            }
            return true
          })
        }

        const validateRequest = (req, res, next) => {
          const validations = validators.map(validator => validator(req, res))
          const allWereValid = validations.every(validation => validation)
          if (allWereValid) {
            next()
          }
        }

        const expressFriendlyPath = path
          .replace(/\/{/g, '/:')
          .replace(new RegExp('}', 'g'), '')
          
        requestValidationRouter[method](expressFriendlyPath, validateRequest)

        if (methodInfo.operationId) {
          if (!operations[methodInfo.operationId]) {
            console.log(
              chalk.red(
                `The operation ${chalk.bold(methodInfo.operationId)} is missing`
              )
            )
            process.exit(1)
          }
          const routeController = operations[methodInfo.operationId]
          requestValidationRouter[method](expressFriendlyPath, routeController)
        }
      }
    }
  }

  return requestValidationRouter
}

const inBody = parameter => parameter.in === 'body'
const inQuery = parameter => parameter.in === 'query'
// const inPath = (parameter) => parameter.in === 'path'
// const inFormData = (parameter) => parameter.in === 'formData'
// const inHeader = (parameter) => parameter.in === 'header'
