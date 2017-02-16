const assert = require('assert')

describe('validate-responses', () => {
  let request
  let app

  beforeEach(() => {
    Object.keys(require.cache).forEach(function (key) {
      delete require.cache[key]
    })
    request = require('supertest')
    app = require('../examples/validate-responses')
  })

  it('200 on GET /hello', done => {
    request(app).get('/hello').expect(500).end((error, response) => {
      assert.deepEqual(response.body.errors[0], {
        keyword: 'type',
        dataPath: '',
        schemaPath: '#/type',
        params: {type: 'number'},
        message: 'should be number'
      })
      done(error)
    })
  })
})
