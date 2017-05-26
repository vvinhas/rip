const Store = () => {
  let store = {}
  
  const getGraveState = grave => store[grave]
  const createGraveUpdater = grave => newStore => {
    // Check for Immutability
    if (newStore === store[grave]) {
      return
    }

    store = {
      ...store,
      [grave]: newStore
    }
  }

  return {
    getGraveState,
    createGraveUpdater
  }
}

module.exports = Store()
