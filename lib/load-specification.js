const chalk = require('chalk')
const cloneDeepWith = require('lodash/cloneDeepWith')
const uniq = require('lodash/uniq')
const path = require('path')
const jsonpointer = require('jsonpointer')
const findNested = require('./utils/find-nested')
const loadSchemaFile = require('./utils/load-schema-file')

module.exports = specification => {
  if (!specification) {
    const errorMessage = `
${chalk.bold(
      'specification'
    )} is missing in your confident configuration. Example:
app.use(confident({
  specification: './api.json',
  operations: {}
}))`.trim()
    console.log(chalk.red(errorMessage))
    process.exit(1)
  }

  let apiSpecification = loadSchemaFile(specification)

  const refFiles = uniq(findNested(apiSpecification, '$ref'))
    .map(obj => obj.$ref)
    .map($ref => $ref.split('#')[0])
    .filter(notEmpty => notEmpty)

  const refContents = {}

  refFiles.forEach(file => {
    const absPath = path.join(path.dirname(specification), file)
    refContents[file] = loadSchemaFile(absPath)
  })

  // TODO: resolve internal refs within external ref

  // resolve external refs
  const withResolvedExternalRefs = cloneDeepWith(apiSpecification, value => {
    if (value != null && typeof value === 'object' && value.$ref) {
      const refParts = value.$ref.split('#')
      const file = refParts[0]
      const pointer = refParts[1]

      if (!file) {
        // is an internal ref
        return value
      }

      if (pointer) {
        return jsonpointer.get(refContents[file], pointer)
      } else {
        return refContents[file]
      }
    }
  })

  // resolve internal refs
  const withResolvedInternalRefs = cloneDeepWith(
    withResolvedExternalRefs,
    value => {
      if (value != null && typeof value === 'object' && value.$ref) {
        const refParts = value.$ref.split('#')
        const pointer = refParts[1]
        return jsonpointer.get(withResolvedExternalRefs, pointer)
      }
    }
  )

  return withResolvedInternalRefs
}
