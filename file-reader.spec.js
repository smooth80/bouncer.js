describe('GIVEN server.js', () => {
  it('THEN doesnt throw on require and call', () => {
    const fileReader = require('./file-reader.js')

    expect(fileReader('demo')).toBeTruthy()
  })
})
