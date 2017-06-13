const { v4 } = require('uuid')
const { fromJS } = require('immutable')

const findIndexById = (id, store) => store.getState()
  .get('data')
  .findIndex(data => data.get('_id') === id)

const validIndex = index => index >= 0

const init = () => ({ data: [] })

const make = (router, store) => {
  // Get all data
  router.get('/all', (req, res) => {
    const data = store.output().get('data')
    res.json(data ? data.toJSON() : [])
  })

  // Get a single document
  router.get('/:id', (req, res) => {
    const data = store.output()
      .get('data')
      .find(document => req.params.id === document._id)
    
    if (!data) {
      res.status(404).end()
    }

    res.json(data.toJSON())
  })

  // Save a document
  router.post('/', (req, res) => {
    const uid = v4()
    const newState = store.getState()
      .update('data', documents => documents.push(fromJS({ ...req.body, _id: uid })))
    store.setState(newState)
    res.json({ _id: uid })
  })

  // Replace a document
  router.put('/:id', (req, res) => {
    const { id } = req.params
    const index = findIndexById(id, store)
    
    if (validIndex()) {
      const newState = store.getState()
        .setIn(['data', index], req.body)
      store.setState(newState)
      res.status(200).end()
    }

    res.status(400).end()
  })

  // Delete a document
  router.delete('/:id', (req, res) => {
    const { id } = req.params
    const index = findIndexById(id, store)

    if (validIndex()) {
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