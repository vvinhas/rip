const _ = require('lodash')

class RIPStore {
  constructor () {
    this._store = {}
    this._relations = {}
  }

  addGrave (name, initialState = {}) {
    this._store[name] = initialState
  }

  addGraveRelations (grave, relations) {
    this._relations[grave] = relations
  }

  _transform (grave, data) {
    const relations = this._relations[grave]

    const validShape = relation => {
      const props = Object.keys(relation)
      const shape = ['collection', 'prop', 'mapsTo', 'field']
      const valid = shape.filter(prop => props.indexOf(prop) > 0)

      return valid.length > 0
    }

    if (relations) {
      relations.forEach(relation => {
        if (!validShape(relation)) {
          throw new Error('Invalid shape for relation ' + relation)
        }

        const collection = _.get(data, relation.collection)
        if (_.isArray(collection)) {
          collection.forEach(row => {
            const mapCollection = _.get(this._store, relation.mapsTo)
            if (mapCollection) {
              const transformed = _.filter(mapCollection, { [relation.field]: row[relation.prop] })
              row[relation.prop] = _.isArray(transformed) ? transformed[0] : row[relation.prop]
            }
          })
        }
      })
    }

    return data
  }

  get (grave) {
    let data = this._transform(grave, this._store[grave])
    return data
  }

  set (grave, value) {
    this._store[grave] = value
  }

  getDeep (grave, path) {
    const data = this.get(grave)
    return _.get(data, path)
  }

  setDeep (grave, path, value) {
    _.set(this._store[grave], path, value)
  }
}

module.exports = new RIPStore()
