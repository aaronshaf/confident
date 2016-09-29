describe('internal-ref', () => {
  let request
  let app

  beforeEach(() => {
    Object.keys(require.cache).forEach(function (key) { delete require.cache[key] })
    request = require('supertest')
    app = require('../examples/internal-ref')
  })

  it('200 on GET /hello', () => {
    return request(app)
      .get('/hello')
      .expect(200)
  })
})
