const confident = require('../../index') // require('confident')
const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')

app.use(cors())

let characters = [
  'Billy',
  'Jonathan Byers',
  'Joyce Byers',
  'Lonnie Byers',
  'Will Byers',
  'Callahan',
  'Coleman',
  'Diane',
  'Diane Hopper',
  'Donald Melvald'
]

function searchCharacters (req, res) {
  return res.json({ data: [] })
}

function getCharacters (req, res) {
  res.json({ data: characters })
}

function getCharacter (req, res) {
  res.json({
    data: characters[parseInt(req.params.characterId)]
  })
}

const postCharacter = express.Router()
  .use(
    (req, res) => {
      characters.push(req.body.name)
      res.status(201).end()
    }
)

app.use(confident({
  definition: path.join(__dirname, './api.yml'),
  operations: {
    getCharacters,
    getCharacter,
    postCharacter,
    searchCharacters
  }
}))

if (!module.parent) {
  app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
  })
}

module.exports = app
