const store = require('../src/store')
const { fromJS } = require('immutable')

describe('Store', () => {
  let jestStore = fromJS({
    todos: {
      data: [
        { _id: 1, author: 1, text: 'Test RIP Store', completed: false }
      ]
    },
    users: {
      data: [
        { _id: 1, email: 'foo@jest.com', name: 'Foo' },
        { _id: 2, email: 'bar@jest.com', name: 'Bar' }
      ]
    }
  })

  let jestRelationships = fromJS({
    todos: [
      { field: 'data.author', mustEmbed: 'users.data._id' }
    ]
  })

  it('Can set a Grave states', () => {
    store.setGraveState('todos', jestStore.get('todos'))
    store.setGraveState('users', jestStore.get('users'))
    expect(store.getGraveState('todos')).toBeDefined()
    expect(store.getGraveState('users')).toBeDefined()
  })

  it('Can retrieve a Grave state', () => {
    expect(store.getGraveState('todos')).toEqual(jestStore.get('todos'))
  })

  it('Can set Grave relationships', () => {
    store.setGraveRelationships('todos', jestRelationships.get('todos'))
    expect(store.getGraveRelationships('todos')).toEqual(jestRelationships.get('todos'))
  })

  it('createGraveStore returns an object able to manipulate a Grave state', () => {
    expect(typeof store.createGraveStore('todos')).toBe('object')
  })

  it('Updates a Grave state through the updater function', () => {
    const todosStore = store.createGraveStore('todos')
    jestStore = jestStore.updateIn(['todos', 'data'], todos => todos.push(fromJS({
      _id: 2,
      author: 1,
      text: 'Update Grave state',
      completed: false
    })))
    todosStore.updateState(jestStore.get('todos'))
    expect(store.getGraveState('todos').get('data').size).toBe(2)
  })

  it('Transform data based on Grave relationships', () => {
    const todoStore = store.createGraveStore('todos')
    const user = jestStore.getIn(['users', 'data'])
      .find(user => user.get('_id') === 1)
    const todo = todoStore.getState()
      .get('data')
      .find(todo => todo.getIn(['author', '_id']) === user.get('_id'))
    
    expect(todo.get('author')).toEqual(user)
  })
})
