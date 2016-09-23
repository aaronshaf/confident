const request = require('supertest')
const app = require('../examples/hello-world')

test('sanity', () => {
  return request(app)
    .get('/hello')
    .expect(200)
})

test('404', () => {
  return request(app)
    .get('/waldo')
    .expect(404)
})

test('api.yml', () => {
  return request(app)
    .get('/api.yml')
    .expect(200)
})
