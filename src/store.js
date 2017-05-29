const { Map, List } = require('immutable')

const Store = () => {
  let graves = {}

  function _isRelationshipValid(relationship) {
    const [...props] = relationship.keys()
    const shape = ['field', 'mustReference', 'mustEmbed']
    const valid = shape.filter(prop => props.indexOf(prop) >= 0)
    
    return (valid.length === 2 && relationship.get('field'))
  }

  function _parseRelationship(relationship) {
    let type, pathFrom, fieldFrom, graveTo, pathTo, fieldTo

    if (!_isRelationshipValid(relationship)) {
      throw new Error('Wrong relationship declaration.')
    }
    
    pathFrom = relationship.get('field').split('.')
    fieldFrom = pathFrom.pop()
    if (relationship.get('mustEmbed')) {
      type = "embed"
      pathTo = relationship.get('mustEmbed').split('.')
    } else {
      type = "reference"
      pathTo = relationship.get('mustReference').split('.')
    }
    graveTo = pathTo.shift()
    fieldTo = pathTo.pop()
    
    return { type, pathFrom, fieldFrom, graveTo, pathTo, fieldTo }
  }

  function grave(initialState) {
    let state = initialState
    let relationships = Map({})

    const setState = (newState) => {
      state = newState
    }
    const setRelationships = (rels) => {
      relationships = rels.map(rel => _parseRelationship(rel))
    }
    const getState = () => state
    const getRelationships = () => relationships
    const output = () => {
      let output = state
      
      if (relationships) {
        relationships.forEach(rel => {
          const graveTo = graves[rel.graveTo]
          // If there's no grave defined, continue the loop...
          if (!graveTo) {
            return
          }
          // Test for relationship type
          switch (rel.type) {
            // Embed type
            case 'embed':
              output = output.updateIn([...rel.pathFrom], docsFrom => {
                if (!List.isList(docsFrom)) {
                  return docsFrom
                }

                return docsFrom.map(docFrom => {
                  if (Map.isMap(docFrom.get(rel.fieldFrom))) {
                    return docFrom
                  }
                  // Return the document if, params there's a match
                  if (graveTo) {
                    const match = graveTo.getState().getIn([...rel.pathTo]).find(docTo => {
                      return docTo.get(rel.fieldTo) === docFrom.get(rel.fieldFrom)
                    })
                    // If there's a match, embed the result in the field
                    return match ? docFrom.set(rel.fieldFrom, match) : docFrom
                  }
                  return docFrom
                })
              })
            // Reference type
            case 'reference':
              /*  
              return data.updateIn([grave, ...pathFrom], collection => {
                let newCollection = collection
                if (collection.has('docs')) {
                  newCollection = collection.get('docs')
                }

                const findRefs = () => {
                  let refs = Map({})
                  newCollection.forEach(doc => {
                    const match = data.getIn([...pathTo]).find(value => {
                      value.get(fieldTo) === doc.get(fieldFrom)
                    })
                    console.log('Match:', match)
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
                  docs: newCollection,
                  refs: findRefs()
                })
              })
              */
              return
          }
        })
      }
      return output
    }

    const accessCreator = () => ({
      setState,
      getState,
      output
    })

    return {
      getState,
      setState,
      getRelationships,
      setRelationships,
      output,
      accessCreator
    }
  }
  
  const createGrave = (graveName, initialState) => {
    graves[graveName] = grave(initialState)
    return graves[graveName]
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
      let newCollection = collection
      if (collection.has('docs')) {
        newCollection = collection.get('docs')
      }

      const findRefs = () => {
        let refs = Map({})
        newCollection.forEach(doc => {
          const match = data.getIn([...pathTo]).find(value => {
            value.get(fieldTo) === doc.get(fieldFrom)
          })
          console.log('Match:', match)
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
        docs: newCollection,
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
    grave,
    createGrave,
    getGraveState,
    setGraveState,
    getGraveRelationships,
    setGraveRelationships,
    createGraveStore
  }
}

module.exports = Store()
