const request = require('supertest')
const crazyApp = require('../examples/base-path')

describe('base path', () => {
  test('404 on /api.yml', () => {
    return request(crazyApp)
      .get('/api.yml')
      .expect(404)
  })

  test('200 on /api/api.yml', () => {
    return request(crazyApp)
      .get('/api/api.yml')
      .expect(200)
  })

  test('200 on /api/api.json', () => {
    return request(crazyApp)
      .get('/api/api.json')
      .expect(200)
  })

  test('404 on /docs', () => {
    return request(crazyApp)
      .get('/docs/')
      .expect(404)
  })

  test('200 on /docs', () => {
    return request(crazyApp)
      .get('/api/docs/')
      .expect(200)
  })

  test('404 on /hello', () => {
    return request(crazyApp)
      .get('/hello')
      .expect(404)
  })

  test('200 on /api/hello', () => {
    return request(crazyApp)
      .get('/api/hello')
      .expect(200)
  })
})
