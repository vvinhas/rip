const { Map, List } = require('immutable')

const Store = () => {
  let store = Map({})
  let relationships = Map({})

  function _isRelationshipValid(relationship) {
    const [...props] = relationship.keys()
    const shape = ['field', 'mustReference', 'mustEmbed']
    const valid = shape.filter(prop => props.indexOf(prop) >= 0)
    
    return (valid.length === 2 && relationship.get('field'))
  }

  function _parseRelationship(relationship) {
    let pathFrom, pathTo, fieldFrom, fieldTo, type
    
    pathFrom = relationship.get('field').split('.')
    fieldFrom = pathFrom.pop()
    if (relationship.get('mustEmbed')) {
      type = "embed"
      pathTo = relationship.get('mustEmbed').split('.')
    } else {
      type = "reference"
      pathTo = relationship.get('mustReference').split('.')
    }
    fieldTo = pathTo.pop()
    
    return { type, pathFrom, fieldFrom, pathTo, fieldTo }
  }

  function _transform(grave, newState) {
    // First, change Grave store to state
    let newStore = store.set(grave, newState)
    if (relationships.has(grave)) {
      relationships.get(grave).forEach(relationship => {
        if (_isRelationshipValid(relationship)) {
          const rel = _parseRelationship(relationship)
          if (rel.type === 'embed') {
            // Dive into the origin collection...
            newStore = newStore.updateIn([grave, ...rel.pathFrom], collection => {
              // If collection isn't a list, return itself
              if (!List.isList(collection)) {
                return collection
              }
              // Maps collection
              return collection.map(documentFrom => {
                if (Map.isMap(documentFrom.get(rel.fieldFrom))) {
                  return documentFrom
                }
                // Return the document if there's a match
                const match = newStore.getIn(rel.pathTo).find(documentTo => {
                  return documentTo.get(rel.fieldTo) === documentFrom.get(rel.fieldFrom)
                })
                // If there's a match, embed the result in the field
                return match ? documentFrom.set(rel.fieldFrom, match) : documentFrom
              })
            })
          }
        }
      })
    }
    return newStore
  }
  
  function setGraveState(grave, newState) {
    store = _transform(grave, newState)
  }

  function getGraveState(grave) {
    return store.get(grave)
  }

  function setGraveRelationships(grave, graveRelationships) {
    relationships = relationships.set(grave, graveRelationships)
  }

  function getGraveRelationships(grave) {
    return relationships.get(grave)
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
    getGraveRelationships,
    setGraveRelationships,
    createGraveStore
  }
}

module.exports = Store()
