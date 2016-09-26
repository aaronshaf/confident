const request = require('supertest')
const rootDocsApp = require('../examples/root-docs')

describe('root docs', () => {
  test('404 on GET /docs', () => {
    return request(rootDocsApp)
      .get('/docs')
      .expect(404)
  })

  test('200 on GET /', () => {
    return request(rootDocsApp)
      .get('/')
      .expect(200)
  })
})
