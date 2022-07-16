const fs = require("fs");
const chalk = require("chalk");
const express = require("express");
const { createServer } = require("vite");
const viteConfigDev = require("./config/vite.config.dev");
const parseGitConfig = require("parse-git-config");

process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

require("./config/env");

const main = async () => {
  const app = express();

  const vite = await createServer(viteConfigDev);

  app.get("/blocks.config.json", (req, res) => {
    const json = fs.readFileSync("./blocks.config.json");
    const obj = JSON.parse(json);
    res.json(obj);
  });

  app.get("/git.config.json", (req, res) => {
    res.json(parseGitConfig.sync());
  });

  app.use(vite.middlewares);

  console.log(
    chalk.cyan("Starting the development server at http://localhost:4000")
  );
  app.listen(4000);

  if (process.env.CI !== "true") {
    // Gracefully exit when stdin ends
    process.stdin.on("end", function () {
      app.close();
      process.exit();
    });
  }
};
main();
