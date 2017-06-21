const shapeParser = require('../src/shapeParser')

describe('Shape Parser', () => {
  const fakeData = shapeParser({
    _id: 'random.uuid',
    person: {
      firstName: 'name.firstName',
      lastName: 'name.lastName',
      email: 'internet.email'
    },
    numbers: [
      'random.number',
      'random.number'
    ]
  })

  it('Parses a String to a Faker value', () => {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    expect(uuidRegex.test(fakeData['_id'])).toBe(true)
  })

  it('Recursively applies parseObject method for Objects', () => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    expect(emailRegex.test(fakeData.person.email)).toBe(true)
  })

  it('Parse the elements of an Array', () => {
    expect(fakeData.numbers[0].constructor).toBe(Number)
  })

  it('Throws an Error when calling an invalid Faker method', () => {
    expect(() => {
      shapeParser({ invalid: 'foo.bar' })
    }).toThrowError()
  })
})
