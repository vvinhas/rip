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

  it('createGraveStore returns an object able to manipulate a Grave state', () => {
    expect(typeof store.createGraveStore('todos')).toBe('object')
  })

  it('Updates a Grave state through the updater function', () => {
    const graveStore = store.createGraveStore('todos')
    jestStore = jestStore.updateIn(['todos', 'data'], todos => todos.push(fromJS({
      _id: 2,
      author: 1,
      text: 'Adding new Todo',
      completed: false
    })))
    graveStore.updateState(jestStore.get('todos'))
    expect(store.getGraveState('todos')).toEqual(jestStore.get('todos'))
  })

  it('Transform data based on Grave relations', () => {
    store.setGraveState('users', jestStore.get('users'))
    store.setGraveRelations('todos', jestRelations.get('todos'))
    const todoStore = store.createGraveStore('todos')

    const user = jestStore.getIn(['users', 'data'])
      .find(user => user.get('_id') === 1)
    
    const todo = todoStore.getState()
      .get('data')
      .find(todo => todo.getIn(['author', '_id']) === user.get('_id'))
    
    expect(todo.get('author')).toEqual(user)
  })
})
