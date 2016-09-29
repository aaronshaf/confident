const request = require('supertest')

describe('hello-world', () => {
  let request
  let app

  beforeEach(() => {
    Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
    request = require('supertest')
    app = require('../examples/hello-world')
  })

  it('200 on GET /hello', () => {
    return request(app)
      .get('/hello')
      .expect(200)
  })

  it('404 on GET /waldo', () => {
    return request(app)
      .get('/waldo')
      .expect(404)
  })

  it('200 on GET /api/yml', () => {
    return request(app)
      .get('/api.yml')
      .expect(200)
  })

  it('200 on GET /docs/', () => {
    return request(app)
      .get('/docs/')
      .expect(200)
  })
})
