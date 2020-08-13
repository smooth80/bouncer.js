const BouncerJs = require("../index.js");
const fs = require("fs");
const path = require("path");
const chat = require("../chat.js");

const indexFile = fs.readFileSync(path.resolve(__dirname, "index.html"), {
  encoding: "utf8",
});

const { router, config, broadcast } = new BouncerJs({
  debug: true,
  plugins: { chat },
});

router.get("/*", (res, req) => {
  res.end(indexFile);
});
