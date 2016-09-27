describe('base path', () => {
  let request
  let app

  beforeEach(() => {
    Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
    request = require('supertest')
    app = require('../examples/base-path')
  })

  it('404 on /api.yml', () => {
    return request(app)
      .get('/api.yml')
      .expect(404)
  })

  it('200 on /api/api.yml', () => {
    return request(app)
      .get('/api/api.yml')
      .expect(200)
  })

  it('200 on /api/api.json', () => {
    return request(app)
      .get('/api/api.json')
      .expect(200)
  })

  it('404 on /docs/', () => {
    return request(app)
      .get('/docs/')
      .expect(404)
  })

  it('200 on /docs', () => {
    return request(app)
      .get('/api/docs/')
      .expect(200)
  })

  it('404 on /hello', () => {
    return request(app)
      .get('/hello')
      .expect(404)
  })

  it('200 on /api/hello', () => {
    return request(app)
      .get('/api/hello')
      .expect(200)
  })
})
