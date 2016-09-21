const router = require('express').Router()
const safeLoad = require('js-yaml').safeLoad
const fs = require('fs')
const path = require('path')

module.exports = function (options) {
  const yaml = fs.readFileSync(options.definition, 'utf8')
  const definition = safeLoad(yaml)
  router.get('/' + path.basename(options.definition), (req, res) => {
    res.header('Content-Type', 'text/yaml').send(yaml)
  })
  Object.keys(definition.paths).forEach((path) => {
    Object.keys(definition.paths[path]).forEach((method) => {
      router[method](path, options.operations[definition.paths[path][method].operationId])
    })
  })
  return router
}
