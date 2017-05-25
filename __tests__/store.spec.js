const store = require('../src/store')

describe('Store', () => {
  const todosStore = {
    data: [
      { _id: 1, author: 1, text: 'Testing Grave Store', completed: false }
    ]
  }
  
  const usersStore = {
    data: [
      { _id: 1, email: 'jest@localhost', name: 'Jest' }
    ]
  }

  const todosRelations = [
    { collection: 'data', prop: 'author', mapsTo: 'users.data', field: '_id' }
  ]

  it('Returns a Store instance', () => {
    expect(typeof store).toBe('object')
    expect(store.constructor.name).toBe('Store')
  })

  it('Can add a grave store', () => {
    store.addGraveStore('todos', todosStore)
    expect(store.getGraveStore('todos')).toBeDefined()
  })

  it('Can retrieve a grave store', () => {
    expect(store.getGraveStore('todos')).toEqual(todosStore)
  })

  it('Returns an updater function to manipulate store', () => {
    expect(typeof store.graveStoreUpdater('todos')).toBe('function')
  })

  it('Updates a grave store through an updater function', () => {
    const updater = store.graveStoreUpdater('todos')
    todosStore.data.push({ _id: 2, author: 1, text: 'Adding new Todo', completed: false })
    updater(todosStore)
    expect(store.getGraveStore('todos')).toEqual(todosStore)
  })

  it('Transform data based on grave relations', () => {
    store.addGraveStore('users', usersStore)
    store.addGraveRelations('todos', todosRelations)
    const newTodosStore = {
      ...todosStore,
      data: todosStore.data.map(todo => {
        const author = usersStore.data.find(user => user._id === todo.author)
        if (author) {
          todo.author = author
        }
        return todo
      })
    }
    expect(store.getGraveStore('todos')).toEqual(newTodosStore)
  })
})
