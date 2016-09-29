describe('no docs', () => {
  let request
  let app

  beforeEach(() => {
    Object.keys(require.cache).forEach(function (key) { delete require.cache[key] })
    request = require('supertest')
    app = require('../examples/no-docs')
  })

  it('404 on GET /docs/', () => {
    return request(app)
      .get('/docs/')
      .expect(404)
  })

  it('404 on GET /', () => {
    return request(app)
      .get('/')
      .expect(404)
  })
})
