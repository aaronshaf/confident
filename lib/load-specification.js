const fs = require('fs')
const { safeLoad } = require('js-yaml')
const chalk = require('chalk')
const cloneDeepWith = require('lodash/cloneDeepWith')
const uniq = require('lodash/uniq')
const findNested = require('./utils/find-nested')
const path = require('path')
const jsonpointer = require('jsonpointer')

module.exports = (specification) => {
  if (!specification) {
    const errorMessage = `
${chalk.bold('specification')} is missing in your confident configuration. Example:
app.use(confident({
  specification: './api.yml',
  operations: {}
}))`.trim()
    console.log(chalk.red(errorMessage))
    process.exit(1)
  }
  const yaml = fs.readFileSync(specification, 'utf8')
  const apiSpecification = safeLoad(yaml)

  const refFiles = uniq(findNested(apiSpecification, '$ref'))
    .map((obj) => obj.$ref)
    .map(($ref) => $ref.split('#')[0])
    .filter((notEmpty) => notEmpty)

  const refContents = {}

  refFiles.forEach((file) => {
    const absPath = path.join(path.dirname(specification), file)
    const yaml = fs.readFileSync(absPath, 'utf8')
    refContents[file] = safeLoad(yaml)
  })

  // TODO: resolve internal refs within external ref

  // resolve external refs
  const withResolvedExternalRefs = cloneDeepWith(apiSpecification, (value) => {
    if (typeof value === 'object' && value.$ref) {
      const refParts = value.$ref.split('#')
      const file = refParts[0]
      const pointer = refParts[1]

      if (!file) { // is an internal ref
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
  const withResolvedInternalRefs = cloneDeepWith(withResolvedExternalRefs, (value) => {
    if (typeof value === 'object' && value.$ref) {
      const refParts = value.$ref.split('#')
      const pointer = refParts[1]
      return jsonpointer.get(withResolvedExternalRefs, pointer)
    }
  })

  return withResolvedInternalRefs
}
