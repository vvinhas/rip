const { Map, List } = require('immutable')

const Store = () => {
  let store = Map({})
  let relations = Map({})

  function _isRelationShapeValid(relation) {
    const [...props] = relation.keys()
    const shape = ['collection', 'prop', 'mapsTo', 'field']
    const valid = shape.filter(prop => props.indexOf(prop) > 0)

    return valid.length > 0
  }

  function _transform(grave, state) {
    // Get the relations of a grave
    const graveRelations = relations.get(grave)
    // If there's any
    if (graveRelations) {
      // Iterates through each relation
      graveRelations.forEach(relation => {
        // Checks if the relation has a valid shape
        if (!_isRelationShapeValid(relation)) {
          throw new Error(`Invalid shape for relation ${relation}`)
        }
        // Get the collections
        const path = [grave, ...relation.get('collection').split('.')]
        const collection = state.getIn(path)
        const lookupPath = relation.get('mapsTo').split('.')
        const lookupCollection = state.getIn(lookupPath)
        // Check if both collections are of the List type
        if (List.isList(collection) && List.isList(lookupCollection)) {
          // Updates the grave state, associating each relation
          state = state.setIn(path, collection.map(item => {
            const transformed = lookupCollection.find(lookupItem => lookupItem.get(relation.get('field')) === item.get(relation.get('prop')))
            if (transformed) {
              item = item.set(relation.get('prop'), transformed)
            }
            return item
          }))
        }
      })
    }

    return state.get(grave)
  }

  function setGraveState(grave, state) {
    store = store.set(grave, state)
  }

  function setGraveRelations(grave, graveRelations) {
    relations = relations.set(grave, graveRelations)
  }

  function getGraveState(grave) {
    return _transform(grave, store)
  }

  function createGraveStateGetter(grave) {
    return () => {
      return getGraveState(grave)
    }
  }

  function createGraveStateUpdater(grave) {
    return newState => {
      setGraveState(grave, newState)
    }
  }

  function createGraveStore(grave) {
    return {
      getState: createGraveStateGetter(grave),
      updateState: createGraveStateUpdater(grave)
    }
  }

  return {
    getGraveState,
    setGraveState,
    setGraveRelations,
    createGraveStore
  }
}

module.exports = Store()
