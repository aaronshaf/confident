const Ajv = require('ajv')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = specification => {
  const swaggerDefinitionJson = fs.readFileSync(
    path.join(__dirname, './definitions/swagger-2.json'),
    'utf8'
  )
  const swaggerSchema = JSON.parse(swaggerDefinitionJson)
  const validateSpecification = new Ajv().compile(swaggerSchema)
  const isSpecificationValid = validateSpecification(specification)
  if (!isSpecificationValid) {
    validateSpecification.errors.forEach(error => {
      console.log(chalk.red(`${chalk.bold(error.dataPath)} ${error.message}`))
      if (Object.keys(error.params).length) {
        console.log(chalk.red(JSON.stringify(error.params, null, 2)))
      }
    })
    process.exit(1)
  }
}
