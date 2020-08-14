"use strict";

const sillyname = require("sillyname");
const wanakana = require("wanakana");

module.exports.LOGO = "bouncer 🐻";

module.exports.port = process.env.PORT || 1337;

module.exports.join = "/join";

module.exports.leave = "/leave";

module.exports.createSocketId = simpleId;

module.exports.plugins = {};

const ids = new Set();

function putSimpleId(id) {
  ids.add(id);

  return id;
}

function simpleId() {
  const id = sillyname();
  const toKana = wanakana.toHiragana(id);
  const trimmed = toKana.replace(/[a-z ]+/gi, "").replace(/(.{2})/gi, "$1");
  const scrambled = trimmed.split("").sort(randomize).slice(0, 4).join("");

  if (ids.has(scrambled)) {
    return simpleId();
  }

  return putSimpleId(scrambled);
}

function randomize(a, b) {
  return Math.random() - Math.random() < 0 ? -1 : 1;
}
