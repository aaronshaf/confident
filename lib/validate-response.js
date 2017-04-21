const express = require('express')
const Ajv = require('ajv')
const loadRefs = require('./utils/load-refs')

module.exports = (
  apiDefinition,
  ajvOptions,
  responseValidationErrorHandler
) => {
  const ajv = new Ajv(Object.assign({}, {removeAdditional: true}, ajvOptions))
  const responseValidationRouter = express.Router({mergeParams: true})
  loadRefs({ajv, apiDefinition})
  
  for (let path in apiDefinition.paths) {
    for (let method in apiDefinition.paths[path]) {
      // check that the method exists, filters out paramers & $ref
      if (responseValidationRouter[method]) {
        const methodInfo = apiDefinition.paths[path][method]
        const validators = {}
        Object.keys(methodInfo.responses).forEach(statusCode => {
          if (methodInfo.responses[statusCode].schema) {
            validators[statusCode] = ajv.compile(
              methodInfo.responses[statusCode].schema
            )
          }
        })

        const expressFriendlyPath = path
          .replace(/\/{/g, '/:')
          .replace(new RegExp('}', 'g'), '')
        responseValidationRouter[method](
          expressFriendlyPath,
          injectResponseValidator(validators, responseValidationErrorHandler)
        )
      }
    }
  }
  return responseValidationRouter
}

function injectResponseValidator (validators, responseValidationErrorHandler) {
  return (req, res, next) => {
    const oldResJson = res.json.bind(res)
    res.json = function (body) {
      if (!validators[res.statusCode] && !validators['default']) {
        return oldResJson(body)
      }

      const validateResponseBody = validators[res.statusCode]
        ? validators[res.statusCode]
        : validators['default']
      const isValid = validateResponseBody(body)
      if (isValid) {
        oldResJson(body)
      } else {
        res.body = body
        res.json = oldResJson
        responseValidationErrorHandler(
          req,
          res,
          validateResponseBody.errors,
          () => oldResJson(body)
        )
      }
    }
    next()
  }
}
