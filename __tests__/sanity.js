const request = require('supertest')
const app = require('../examples/hello-world')

it('sanity tests', () => {
  return request(app)
    .get('/hello')
    .expect(200)
})

it('show api.yml', () => {
  return request(app)
    .get('/api.yml')
    .expect(200)
})
