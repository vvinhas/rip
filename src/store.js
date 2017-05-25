const { Map, fromJS, toJS } = require('immutable')

class Store {
  constructor () {
    this._store = Map({})
    this._relations = Map({})
  }

  /**
   * Add a Grave to the Store
   * @param {string} name Name of the grave
   * @param {*} initialState Initial state for grave Store
   */
  addGraveStore (name, initialState = {}) {
    this._store = this._store.set(name, fromJS(initialState))
  }

  /**
   * Add relations to a Grave
   * @param {string} grave Name of the grave
   * @param {array} relations Array of relations
   */
  addGraveRelations (grave, relations) {
    this._relations = this._relations.set(grave, relations)
  }

  /**
   * Check if the object representing a relation is valid
   * @param {object} relation Relation object
   */
  _isRelationShapeValid (relation) {
    const props = Object.keys(relation)
    const shape = ['collection', 'prop', 'mapsTo', 'field']
    const valid = shape.filter(prop => props.indexOf(prop) > 0)

    return valid.length > 0
  }

  /**
   * Transform Grave store based on it's relations
   * @param {string} grave Name of the grave
   * @param {*} data Data to transform
   */
  _transform (grave, data) {
    const relations = this._relations.get(grave)

    if (relations) {
      relations.forEach(relation => {
        if (!this._isRelationShapeValid(relation)) {
          throw new Error('Invalid shape for relation ' + relation)
        }

        const collection = this._store
          .get(grave)
          .getIn(relation.collection)

        console.log('Collection', collection)
        // const collection = _.get(data, relation.collection)
        // if (_.isArray(collection)) {
        //   collection.forEach(row => {
        //     const mapCollection = _.get(this._store, relation.mapsTo)
        //     if (mapCollection) {
        //       const transformed = _.filter(mapCollection, { [relation.field]: row[relation.prop] })
        //       row[relation.prop] = _.isArray(transformed) ? transformed[0] : row[relation.prop]
        //     }
        //   })
        // }
      })
    }

    return data
  }

  getGraveStore (grave) {
    return this._store.get(grave).toJS()
  }

  graveStoreUpdater (grave) {
    return store => {
      this._store = this._store.set(grave, fromJS(store))
    }
  }
}

const todosStore = {
  data: [
    { _id: 1, author: 1, text: 'My todo', completed: false },
    { _id: 2, author: 1, text: 'My next todo', completed: false }
  ]
}

const usersStore = {
  data: [
    { _id: 1, email: 'vinhas@cdts.fiocruz.br', name: 'Vinicius Vinhas' }
  ]
}

// const store = new RIPStore()
// store.addGrave('todos', todosStore)
// store.addGrave('users', usersStore)
// store.addGraveRelations('todos', [
//   { collection: 'data', prop: 'author', mapsTo: 'users.data', field: '_id' }
// ])
// console.log(store.getGraveStore('todos'))
// const make = (store, update) => {
//   const newTodo = Map({ _id: 2, author: 1, text: 'Buy eggs' })
//   const newStore = store.get('data').push(newTodo)
//   update(newStore)
// }
// make(store.getGraveStore('todos'), store.saveGraveStore('todos'))
// console.log(
//   util.inspect(
//     store.getGraveStore('todos'),
//     { showHidden: true, depth: null }
//   )
// )

module.exports = new Store()
