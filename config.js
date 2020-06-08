module.exports.LOGO = "bouncer 🤵";

module.exports.port = process.env.PORT || 1337;

module.exports.join = "/join";

module.exports.leave = "/leave";

module.exports.createSocketId = simpleId;

module.exports.plugins = {};

function simpleId() {
  return Math.random().toString(16).replace(".", "");
}
