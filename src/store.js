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

  function _transformEmbed(grave, data, params) {
    // Dive into the origin collection...
    return data.updateIn([grave, ...params.pathFrom], collection => {
      // If collection isn't a list, return itself
      if (!List.isList(collection)) {
        return collection
      }
      // Maps collection
      return collection.map(documentFrom => {
        if (Map.isMap(documentFrom.get(params.fieldFrom))) {
          return documentFrom
        }
        // Return the document if, params there's a match
        const match = data.getIn(params.pathTo).find(documentTo => {
          return documentTo.get(params.fieldTo) === documentFrom.get(params.fieldFrom)
        })
        // If there's a match, embed the result in the field
        return match ? documentFrom.set(params.fieldFrom, match) : documentFrom
      })
    })
  }

  function _transformReference(grave, data, params) {
    const { fieldFrom, fieldTo, pathFrom, pathTo } = params

    return data.updateIn([grave, ...pathFrom], collection => {
      if (collection.has('docs')) {
        collection = collection.get('docs')
      }

      const findRefs = () => {
        let refs = Map({})
        collection.forEach(doc => {
          const match = data.getIn([...pathTo]).find(value => value.get(fieldTo) === doc.get(fieldFrom))
          if (match) {
            if (refs.has(fieldFrom)) {
              // Verifica se já consta nas referências
              if (refs.get(fieldFrom).includes(match)) {
                return
              }
              refs = refs.update(fieldFrom, refs => refs.push(match))
            }
            refs = refs.set(fieldFrom, List([match]))
          }
        })
        return refs
      }      

      return Map({
        docs: collection,
        refs: findRefs()
      })
    })
  }
  
  function _transform(grave) {
    let newStore = store

    if (relationships.has(grave)) {
      relationships.get(grave).forEach(relationship => {
        if (_isRelationshipValid(relationship)) {
          const rel = _parseRelationship(relationship)
          if (rel.type === 'embed') {
            newStore = _transformEmbed(grave, newStore, rel)
          } else {
            newStore = _transformReference(grave, newStore, rel)
          }
        }
      })
    }
    
    return newStore.get(grave)
  }
  
  function setGraveState(grave, state) {
    store = store.set(grave, state)
  }

  function getGraveState(grave) {
    return _transform(grave, store)
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
