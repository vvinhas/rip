module.exports = options => grave => {
  let state = null

  const set = data => { state = data }
  const get = () => Promise.resolve(state)

  return {
    set,
    get
  }
}
