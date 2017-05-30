const { Map, List } = require('immutable')

const Store = () => {
  let graves = {}

  function _isRelationshipValid(relationship) {
    const [...props] = Object.keys(relationship)
    const shape = ['field', 'belongsTo', 'hasMany']
    const valid = shape.filter(prop => props.indexOf(prop) >= 0)
    
    return (valid.length === 2 && relationship.field)
  }

  function _parseRelationship(relationship) {
    let type, pathFrom, fieldFrom, graveTo, pathTo, fieldTo

    if (!_isRelationshipValid(relationship)) {
      throw new Error('Wrong relationship declaration.')
    }
    
    pathFrom = relationship.field.split('.')
    fieldFrom = pathFrom.pop()

    if (relationship.belongsTo) {
      type = 'belongsTo'
      pathTo = relationship.belongsTo.split('.')
    } else {
      type = 'hasMany'
      pathTo = relationship.hasMany.split('.')
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
            case 'belongsTo':
              output = output.updateIn([...rel.pathFrom], docsFrom => {
                if (!List.isList(docsFrom)) {
                  return docsFrom
                }

                return docsFrom.map(docFrom => {
                  if (Map.isMap(docFrom.get(rel.fieldFrom))) {
                    return docFrom
                  }
                  // Return the document if, params there's a match
                  const match = graveTo.getState()
                    .getIn([...rel.pathTo])
                    .find(docTo => docTo.get(rel.fieldTo) === docFrom.get(rel.fieldFrom))
                  // If there's a match, embed the result in the field
                  return match ? docFrom.set(rel.fieldFrom, match) : docFrom
                })
              })
              break

            case 'hasMany':
              output = output.updateIn([...rel.pathFrom], docsFrom => {
                if (!List.isList(docsFrom)) {
                  return docsFrom
                }

                return docsFrom.map(docFrom => {
                  if (!List.isList(docFrom.get(rel.fieldFrom))) {
                    return docFrom
                  }

                  return docFrom.update(rel.fieldFrom, fieldFrom => fieldFrom.map(value => {
                    const match = graveTo.getState()
                      .getIn([...rel.pathTo])
                      .find(docTo => docTo.get(rel.fieldTo) === value)
                    
                    return match ? match : fieldFrom
                  }))
                })
              })
              break
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

  return {
    createGrave
  }
}

module.exports = Store()
