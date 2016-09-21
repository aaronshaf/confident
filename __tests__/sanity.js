const request = require('supertest')
const app = require('../examples/hello-world')

test('sanity tests', () => {
  return request(app)
    .get('/hello')
    .expect(200)
})
