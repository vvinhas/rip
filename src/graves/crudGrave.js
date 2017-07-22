const { v4 } = require('uuid')
const { fromJS } = require('immutable')
const shapeParser = require('../parsers/shapeParser')

// const findIndexById = (id, store) => store.getState()
//   .get('data')
//   .findIndex(data => data.get('_id') === id)

const _findIndexById = async (id, store) => {
  const state = await store.getState()
  return state
    .get('data')
    .findIndex(data => data.get('_id') === id)
}

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
    store.output().then(output => {
      console.log('Output', output)
      const data = output.get('data')
      res.json(data ? data.toJSON() : [])
    }, err => res.status(500).json({ err }))
  })

  // Get a single document
  router.get('/:id', (req, res) => {
    store.output().then(output => {
      const data = output
        .get('data')
        .find(document => req.params.id === document.get('_id'))

      if (!data) {
        res.status(404).end()
      }

      res.json(data.toJSON())
    }, err => res.status(500).json({ err }))
  })

  // Save a document
  router.post('/', (req, res) => {
    const document = createDocument(req.body)
    store.getState().then(state => {
      const newState = state.update('data', documents => {
        return documents.push(document)
      })
      store.setState(newState)
      res.json({ _id: document._id })
    }, err => res.status(500).json({ err }))
  })

  // Replace a document
  router.put('/:id', (req, res) => {
    const { id } = req.params
    _findIndexById(id, store).then(index => {
      if (validIndex(index)) {
        const document = createDocument({ _id: id, ...req.body })
        store.getState().then(state => {
          const newState = state.setIn(['data', index], document)
          store.setState(newState)
          res.status(200).end()
        })
      }

      res.status(400).end()
    }, err => res.status(500).json({ err }))
  })

  // Delete a document
  router.delete('/:id', (req, res) => {
    const { id } = req.params
    _findIndexById(id, store).then(index => {
      if (validIndex(index)) {
        store.getState().then(state => {
          const newState = state.deleteIn(['data', index])
          store.setState(newState)
          res.status(200).end()
        })
      }

      res.status(400).end()
    }, err => res.status(500).json({ err }))
  })

  return router
}

module.exports = {
  init,
  make
}
