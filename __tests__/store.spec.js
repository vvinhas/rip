const store = require('../src/store')
const { fromJS } = require('immutable')
let api = fromJS(require('./data.json'))

describe('Store', () => {
  let booksGrave, personsGrave, orgsGrave
  
  it('Can create a Grave and set it\'s store initial state', () => {
    booksGrave = store.createGrave('books', api.get('books'))
    personsGrave = store.createGrave('persons', api.get('persons'))
    orgsGrave = store.createGrave('orgs', api.get('orgs'))

    expect(booksGrave.getState()).toBe(api.get('books'))
    expect(personsGrave.getState()).toBe(api.get('persons'))
    expect(orgsGrave.getState()).toBe(api.get('orgs'))
  })
  
  it('Can manipulate the store of a Grave', () => {
    api = api.updateIn(['books', 'data'], books => books.push(fromJS({
      _id: 3,
      name: 'JavaScript: The Definitive Guide',
      authors: 'David Flanagan',
      publisher: 'O\'Reilly Media'
    })))
    booksGrave.setState(api.get('books'))
    expect(booksGrave.getState()).toBe(api.get('books'))
  })

  it('Can manipulate the relationships of a Grave', () => {
    const booksRels = api.getIn(['config', 'books', 'relationships']).toJS()
    booksGrave.setRelationships(booksRels)
    
    expect(booksGrave.getRelationships()).toEqual([
      {
        type: 'hasMany',
        pathFrom: ['data'],
        fieldFrom: 'authors',
        graveTo: 'persons',
        pathTo: ['data'],
        fieldTo: '_id'
      },
      {
        type: 'belongsTo',
        pathFrom: ['data'],
        fieldFrom: 'publisher',
        graveTo: 'orgs',
        pathTo: ['data'],
        fieldTo: 'label'
      }
    ])
  })

  it('Can generate an object with methods to access it\'s public functions', () => {
    const booksAccess = booksGrave.accessCreator()
    expect(booksAccess.getState()).toBe(booksGrave.getState())
  })

  it('Can output transformed data based on grave relationships', () => {
    const booksAccess = booksGrave.accessCreator()
    const firstAuthorName = booksAccess.output()
      .getIn(['data', 0, 'authors', 0])
      .get('name')
    const secondAuthorName = booksAccess.output()
      .getIn(['data', 0, 'authors', 1])
      .get('name')
    const publisherName = booksAccess.output()
      .getIn(['data', 0, 'publisher'])
      .get('name')
    
    expect(firstAuthorName).toBe('Andrew Hunt')
    expect(secondAuthorName).toBe('Dave Thomas')
    expect(publisherName).toBe('Addison-Wesley Professional')
  })
})
