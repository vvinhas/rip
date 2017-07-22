const { v4 } = require('uuid')
const { fromJS } = require('immutable')
const shapeParser = require('../parsers/shapeParser')

const findIndexById = (id, store) => store.getState()
  .get('data')
  .findIndex(data => data.get('_id') === id)

const validIndex = index => index >= 0

const createDocument = body => {
  const _id = typeof body._id === 'undefined' ? v4() : body._id
  return fromJS({ _id, ...body })
}

const init = options => {
  const data = []
  const { shape, fake } = options
  while (data.length < fake) {
    data.push(shapeParser(shape))
  }
  return { data }
}

const make = (router, store) => {
  // Get all data
  router.get('/', (req, res) => {
    const data = store.output().get('data')
    res.json(data ? data.toJSON() : [])
  })

  // Get a single document
  router.get('/:id', (req, res) => {
    const data = store.output()
      .get('data')
      .find(document => req.params.id === document.get('_id'))
    
    if (!data) {
      res.status(404).end()
    }

    res.json(data.toJSON())
  })

  // Save a document
  router.post('/', (req, res) => {
    const document = createDocument(req.body)
    const newState = store.getState()
      .update('data', documents => documents.push(document))
    store.setState(newState)
    res.json({ _id: document._id })
  })

  // Replace a document
  router.put('/:id', (req, res) => {
    const { id } = req.params
    const index = findIndexById(id, store)
    
    if (validIndex(index)) {
      const document = createDocument({ _id: id, ...req.body })
      const newState = store.getState()
        .setIn(['data', index], document)
      store.setState(newState)
      res.status(200).end()
    }

    res.status(400).end()
  })

  // Delete a document
  router.delete('/:id', (req, res) => {
    const { id } = req.params
    const index = findIndexById(id, store)

    if (validIndex(index)) {
      const newState = store.getState()
        .deleteIn(['data', index])
      store.setState(newState)
      res.status(200).end()
    }

    res.status(400).end()
  })

  return router
}

module.exports = {
  init,
  make
}
