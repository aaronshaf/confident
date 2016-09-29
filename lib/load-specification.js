const fs = require('fs')
const { safeLoad } = require('js-yaml')
const chalk = require('chalk')

module.exports = (specification) =>{
  if (!specification) {
    const errorMessage = `
${chalk.bold('specification')} is missing in your confident configuration. Example:
app.use(confident({
  specification: './api.yml',
  operations: {}
}))`.trim()
    console.error(chalk.red(errorMessage))
    process.exit(1)
  }
  const yaml = fs.readFileSync(specification, 'utf8')
  const apiSpecification = safeLoad(yaml)

  return apiSpecification
}
