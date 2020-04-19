module.exports.LOGO = "bouncer🚀";

module.exports.WORKERS = process.env.WORKERS || 0;

module.exports.CONNECTION_MESSAGE =
  process.env.CONNECTION_MESSAGE || "sticky-session:connection";

module.exports.PORT = process.env.PORT || 1337;

module.exports.ACCESS_CONTROL_ALLOW_HEADERS =
  process.env.ACCESS_CONTROL_ALLOW_HEADERS ||
  "X-Requested-With, Content-Type, Authorization";

module.exports.ACCESS_CONTROL_ALLOW_ORIGIN =
  process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
