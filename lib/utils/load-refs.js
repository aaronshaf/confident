
module.exports = function ({ajv, apiDefinition}) {
  for (let definitionSchema in apiDefinition.definitions) {
    ajv.addSchema(apiDefinition.definitions[definitionSchema], '#/definitions/' + definitionSchema)
  }
  for (let responseSchema in apiDefinition.responses) {
    ajv.addSchema(apiDefinition.responses[responseSchema].schema, '#/responses/' + responseSchema)
  }
}
