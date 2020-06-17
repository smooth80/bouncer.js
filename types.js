/**
 * @typedef {BouncerMessageObject} Object
 * @desc each message in backend will have this as a parameter
 * @property {string} id origin socket id
 * @property {string} event event name
 * @property {string|object} data message payload
 */

/**
 * @typedef {BouncerConfig} Object
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
 * @typedef {BouncerCallResult} Object 
 * @desc This is what the export returns (api)
 * @property {function} join (ws, topic)
 * @property {function} leave (ws)
 * @property {function({ topic }, BouncerMessageObject)} broadcast 
 * @property {function(ws, BouncerMessageObject)} send
 * @property {uWebSockets.SSLApp|uWebSockets.App} bouncer
 * @property {BouncerConfig} config
 * @property {Map} rooms
 */
