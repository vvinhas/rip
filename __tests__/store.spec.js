const store = require('../src/store')
const { fromJS } = require('immutable')

describe('Store', () => {
  let jestStore = fromJS({
    todos: {
      data: [
        { _id: 1, author: 1, text: 'Testing Grave Store', completed: false }
      ]
    },
    users: {
      data: [
        { _id: 1, email: 'jest@localhost', name: 'Jest' }
      ]
    }
  })

  let jestRelations = fromJS({
    todos: [
      { collection: 'data', prop: 'author', mapsTo: 'users.data', field: '_id' }
    ]
  })

  it('Can set a Grave state', () => {
    store.setGraveState('todos', jestStore.get('todos'))
    expect(store.getGraveState('todos')).toBeDefined()
  })

  it('Can retrieve a Grave state', () => {
    expect(store.getGraveState('todos')).toEqual(jestStore.get('todos'))
  })

  it('Returns an updater function to manipulate a Grave state', () => {
    expect(typeof store.createGraveStateUpdater('todos')).toBe('function')
  })

  it('Updates a Grave state through an updater function', () => {
    const updateState = store.createGraveStateUpdater('todos')
    jestStore = jestStore.updateIn(['todos', 'data'], list => list.push(fromJS({
      _id: 2,
      author: 1,
      text: 'Adding new Todo',
      completed: false
    })))
    updateState(jestStore.get('todos'))
    expect(store.getGraveState('todos')).toEqual(jestStore.get('todos'))
  })

  it('Transform data based on Grave relations', () => {
    store.setGraveState('users', jestStore.get('users'))
    store.setGraveRelations('todos', jestRelations.get('todos'))

    const user = jestStore.getIn(['users', 'data'])
      .find(user => user.get('_id') === 1)
    
    const todo = store.getGraveState('todos')
      .get('data')
      .find(todo => todo.getIn(['author', '_id']) === user.get('_id'))
    
    expect(todo.get('author')).toEqual(user)
  })
})
