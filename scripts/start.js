const chalk = require("chalk");
const express = require("express");
const { createServer } = require("vite");
const viteConfigDev = require("./config/vite.config.dev");

process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

require("./config/env");

const main = async () => {
  const app = express();

  const vite = await createServer(viteConfigDev);
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
