const request = require('supertest')
const helloWorldApp = require('../examples/hello-world')
const strangerThingsApp = require('../examples/stranger-things')

describe('sanity', () => {
  test('200 on GET /hello', () => {
    return request(helloWorldApp)
      .get('/hello')
      .expect(200)
  })

  test('200 on GET /characters/1', () => {
    return request(strangerThingsApp)
      .get('/characters/1')
      .expect(200)
  })

  test('404 on GET /waldo', () => {
    return request(helloWorldApp)
      .get('/waldo')
      .expect(404)
  })

  test('200 on GET /api/yml', () => {
    return request(helloWorldApp)
      .get('/api.yml')
      .expect(200)
  })
})
