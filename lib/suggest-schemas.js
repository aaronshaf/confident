const { safeDump } = require('js-yaml')
const generateSchema = require('generate-schema')
const chalk = require('chalk')

module.exports = (req, res, next) => {
  let body
  if (req.is('json')) {
    const propSchemas = generateSchema.json('Request Body', req.body).properties
    const parameters = []
    for (prop in propSchemas) {
      parameters.push({
        name: prop,
        in: 'body',
        schema: propSchemas[prop]
      })
    }
    const obj = {
      [req.path]: {
        [req.method.toLowerCase()]: {
          parameters
        }
      }
    }
    console.log(chalk.yellow(
      safeDump(obj, {level: 2})
    ))
  }
  next()
}
