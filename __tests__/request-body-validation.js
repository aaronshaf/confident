const assert = require('assert')
const request = require('supertest')

describe('request body invalidation', () => {
  let app

  describe('invalid POST /characters', done => {
    let characterCount

    before(() => {
      Object.keys(require.cache).forEach(function (key) {
        delete require.cache[key]
      })
      app = require('../examples/stranger-things')
    })

    before(done => {
      request(app).get('/characters').expect(200).end((error, response) => {
        characterCount = response.body.data.length
        done(error)
      })
    })

    before(done => {
      request(app).post('/characters').expect(400).end(done)
    })

    it('invalid request did not run route handler', done => {
      request(app)
        .get('/characters')
        .expect(200)
        .expect(response => {
          assert.equal(response.body.data.length, characterCount)
        })
        .end(done)
    })

    it('invalid POST /characters (2)', () => {
      return request(app).post('/characters').send({ name: 1 }).expect(400)
    })
  })
})

describe('successful request body validation', () => {
  let characterCount
  let app

  before(() => {
    Object.keys(require.cache).forEach(function (key) {
      delete require.cache[key]
    })
    app = require('../examples/stranger-things')
  })

  before(done => {
    request(app).get('/characters').expect(200).end((error, response) => {
      characterCount = response.body.data.length
      done(error)
    })
  })

  before(done => {
    request(app)
      .post('/characters')
      .send({ name: 'Nancy Wheeler' })
      .expect(201)
      .end(done)
  })

  it('route handler was run', done => {
    request(app)
      .get('/characters')
      .expect(200)
      .expect(response => {
        assert.equal(response.body.data.length, characterCount + 1)
      })
      .end(done)
  })
})
