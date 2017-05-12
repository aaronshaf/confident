const express = require('express')
const path = require('path')
const fs = require('fs')

module.exports = docsEndpoint => {
  const router = express.Router({ mergeParams: true })
  const devModulePath = path.join(
    __dirname,
    '../node_modules/react-openapi/build/'
  )
  const prodModulePath = path.join(__dirname, '../../react-openapi/build/')
  let isDev = false
  let isProd = false
  try {
    // node is terrible at this
    fs.accessSync(prodModulePath)
    isProd = true
  } catch (error) {
    try {
      fs.accessSync(devModulePath)
      isDev = true
    } catch (error) {
      // bet quiet, eslint
    }
  }

  if (isProd) {
    router.use(docsEndpoint || '/docs', express.static(prodModulePath))
  } else if (isDev) {
    router.use(docsEndpoint || '/docs', express.static(devModulePath))
  }

  return router
}
