/**
 * Checks whether the relationship object is valid
 * @param {object} relationship Relationship raw object
 */
const isRelationshipValid = relationship => {
  const [...props] = Object.keys(relationship)
  const shape = ['field', 'belongsTo', 'hasMany']
  const valid = shape.filter(prop => props.indexOf(prop) >= 0)

  return (valid.length === 2 && relationship.field)
}

/**
 * Parse the relationship JSON to a readable object
 * @param {object} relationship
 */
const parseRelationship = relationship => {
  let type, pathFrom, fieldFrom, graveTo, pathTo, fieldTo

  if (!isRelationshipValid(relationship)) {
    throw new Error('Wrong relationship declaration.')
  }

  pathFrom = relationship.field.split('.')
  fieldFrom = pathFrom.pop()

  if (relationship.belongsTo) {
    type = 'belongsTo'
    pathTo = relationship.belongsTo.split('.')
  } else {
    type = 'hasMany'
    pathTo = relationship.hasMany.split('.')
  }
  graveTo = pathTo.shift()
  fieldTo = pathTo.pop()

  return { type, pathFrom, fieldFrom, graveTo, pathTo, fieldTo }
}

module.exports = parseRelationship
