const request = require('supertest')
const app = require('../examples/external-ref')

describe('hello-world', () => {
  it('200 on GET /characters', () => {
    return request(app).get('/characters').expect(200)
  })

  it('201 on POST /characters with valid name', () => {
    return request(app).post('/characters').send({ name: 'test' }).expect(201)
  })

  it('400 on POST /characters with invalid name', () => {
    return request(app).post('/characters').send({ name: 123 }).expect(400)
  })
})
