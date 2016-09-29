describe('stranger-things', () => {
  let request
  let app

  beforeEach(() => {
    Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
    request = require('supertest')
    app = require('../examples/stranger-things')
  })

  it('200 on GET /characters/1', () => {
    return request(app)
      .get('/characters/1')
      .expect(200)
  })
})
