describe('request query validation', () => {
  let request
  let app

  beforeEach(() => {
    Object.keys(require.cache).forEach(function (key) {
      delete require.cache[key]
    })
    request = require('supertest')
    app = require('../examples/stranger-things')
  })

  it('invalid GET /search', () => {
    return request(app).get('/search').expect(400)
  })

  it('valid GET /search', () => {
    return request(app).get('/search?q=').expect(200)
  })

  it('valid GET /search (2)', () => {
    return request(app).get('/search?q=B').expect(200)
  })
})
