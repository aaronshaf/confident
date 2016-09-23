const request = require('supertest')
const helloWorldApp = require('../examples/hello-world')
const strangerThingsApp = require('../examples/stranger-things')

test('sanity', () => {
  return request(helloWorldApp)
    .get('/hello')
    .expect(200)
})

test('sanity', () => {
  return request(strangerThingsApp)
    .get('/characters/1')
    .expect(200)
})

test('404', () => {
  return request(helloWorldApp)
    .get('/waldo')
    .expect(404)
})

test('api.yml', () => {
  return request(helloWorldApp)
    .get('/api.yml')
    .expect(200)
})
