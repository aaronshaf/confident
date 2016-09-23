const request = require('supertest')
const app = require('../examples/stranger-things')

test('sanity', () => {
  return request(app)
    .get('/search')
    .expect(200)
})
