const router = require('express').Router()
const yaml = require('js-yaml')
const fs = require('fs')

module.exports = function (options) {
  const definition = yaml.safeLoad(fs.readFileSync(options.definition, 'utf8'))
  Object.keys(definition.paths).forEach((path) => {
    Object.keys(definition.paths[path]).forEach((method) => {
      router[method](path, options.operations[definition.paths[path][method].operationId])
    })
  })
  return router
}
