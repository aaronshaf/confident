const request = require('supertest')
const app = require('../examples/stranger-things')

test('invalid GET /search', () => {
  return request(app)
    .get('/search')
    .expect(400)
})

test('valid GET /search', () => {
  return request(app)
    .get('/search?q=')
    .expect(200)
})

test('valid GET /search (2)', () => {
  return request(app)
    .get('/search?q=B')
    .expect(200)
})
