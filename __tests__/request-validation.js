const request = require('supertest')
const app = require('../examples/stranger-things')

test('successful POST /characters', () => {
  return request(app)
    .post('/characters')
    .send({name: 'Nancy Wheeler'})
    .expect(201)
})

test('invalid POST /characters', () => {
  return request(app)
    .post('/characters')
    .expect(400)
})

test('invalid POST /characters (2)', () => {
  return request(app)
    .post('/characters')
    .send({name: 1})
    .expect(400)
})
