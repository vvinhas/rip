const relationshipParser = require('./parsers/relationship')
const { Map, List, fromJS } = require('immutable')

const Store = (driver) => {
  let graves = {}

  /**
   * Creates a Store used by a grave
   * @param {*} initialState Initial State
   * @param {Object} options Available options
   */
  function grave (graveObj) {
    const { alias, api } = graveObj
    const initialState = fromJS(api.init(graveObj))
    const state = driver(alias)
    let relationships = Map({})
    // Set initial state to persistence driver, if there's no data
    state.get().then(data => {
      if (data === null) {
        state.set(initialState.toJS())
      }
    })
    // Sets the state
    const setState = newState => {
      state.set(newState)
    }
    // Set relationships
    const setRelationships = rels => {
      relationships = rels.map(relationshipParser)
    }
    // Returns a promise with data from the store
    const getState = async () => {
      try {
        const data = await state.get()
        return fromJS(data)
      } catch (err) {
        console.error(err)
      }
    }
    const getRelationships = () => relationships
    const output = async () => {
      let output = await getState()

      if (relationships) {
        relationships.map(rel => {
          const graveTo = graves[rel.graveTo]
          // If there's no grave defined, continue the loop...
          if (!graveTo) {
            return
          }

          switch (rel.type) {
            // BelongsTo relationships search for documents in the Store
            // and try to find a match based on the fields declared in a relationship
            // If there's a match, the value is then replaced by the document found
            case 'belongsTo':
              // Embed the related document
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
            // HasMany relationships try to find a match in another Store
            // that corresponds to values inside a List, based on the
            // field declared in the relationship.
            // It keeps doing that for each value inside the List.
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

                    return match || fieldFrom
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

  /**
   * Create a new grave and its Store
   * @param {string} graveName
   * @param {*} initialState
   * @param {Object} options
   */
  const createGrave = graveObj => {
    const { alias } = graveObj
    graves[alias] = grave(graveObj)
    return graves[alias]
  }

  return {
    createGrave
  }
}

module.exports = Store
