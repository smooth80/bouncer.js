/**
 * @typedef {BouncerMessageObject} BouncerMessageObject
 * @desc each message in backend will have this as a parameter
 * @property {string} id origin socket id
 * @property {string} event event name
 * @property {string|object} data message payload
 */

/**
 * @typedef {BouncerConfig} BouncerConfig
 * @desc This is what the export eats
 * @property {boolean} debug false
 * @property {string} LOGO :)
 * @property {number} port 1337
 * @property {string} join /join
 * @property {string} leave /leave
 * @property {function} createSocketId () => string
 * @property {Object} plugins { function chat() {} }
 * @property {uWebSockets.App|uWebSockets.SSLApp} router
 */

/**
 * @typedef {class} BouncerJS
 * @desc BouncerJS class
 * @property {function} join (WebSocket, string) => boolean
 * @property {function} leave (WebSocket) => boolean
 * @property {function} broadcast ({ topic: string }, BouncerMessageObject) => void
 * @property {function} send (WebSocket, BouncerMessageObject) => void
 * @property {uWebSockets.App|uWebSockets.SSLApp} router
 * @property {BouncerConfig} config
 * @property {Map} rooms
 */
