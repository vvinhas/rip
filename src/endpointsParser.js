const endpointsParser = endpoints => {
  return endpoints.map(endpoint => {
    const { verb, path, shape } = endpoint
    if (!verb || !path || !shape) {
      throw new Error('You must specify a Verb, Path and Shape to a custom endpoint')
    }
    return {
      verb,
      path: `${path}/:num?`,
      shape
    }
  })
}

module.exports = endpointsParser
