describe('GIVEN server.js', () => {
  it('THEN doesnt throw on require and call', () => {
    const server = require('./server')

    expect(server('demo')).toBeTruthy()
  })
})
