const shapeParser = require('../src/shapeParser')

describe('Shape Parser', () => {
  const fakeData = shapeParser({
    _id: 'random.uuid',
    person: {
      firstName: 'name.firstName',
      lastName: 'name.lastName',
      email: 'internet.email'
    },
    text: [{
      message: 'lorem.words,5'
    }],
    numbers: [
      'random.number',
      { number: 'random.number' }
    ]
  })

  // console.log(fakeData)
  it('Parses a String to a Faker value', () => {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    expect(uuidRegex.test(fakeData['_id'])).toBe(true)
  })

  it('Recursively applies parseObject method for Objects', () => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    expect(emailRegex.test(fakeData.person.email)).toBe(true)
  })

  it('Parse the elements of an Array', () => {
    expect(
      fakeData.numbers[0]
        .constructor
    ).toBe(Number)
  })

  it('Accepts an Array of Objects', () => {
    expect(
      fakeData.numbers[1]
        .number
        .constructor
    ).toBe(Number)
  })

  it('Accepts arguments after the declaration, separated by comma (,)', () => {
    expect(
      fakeData.text[0]
        .message
        .match(/\w+/g)
        .length
    ).toBe(5)
  })

  it('Throws an Error when calling an invalid Faker method', () => {
    expect(() => {
      shapeParser({ invalid: 'foo.bar' })
    }).toThrowError()
  })
})
