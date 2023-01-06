const { searchForWorkspaceRoot } = require("vite");
const react = require("@vitejs/plugin-react");
const basicSsl = require("@vitejs/plugin-basic-ssl");
const paths = require("./paths");
const fs = require("fs");
const parseGitConfig = require("parse-git-config");

function sendJson(res, json) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(json));
}

// https://vitejs.dev/config/
const getViteConfigDev = (port, https) => ({
  root: paths.blocks + "/src",
  server: {
    port,
    https,
    hmr: {
      host: "localhost",
    },
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
  resolve: {
    alias: {
      "@user": process.cwd(),
      "@utils": process.cwd() + "/node_modules/@githubnext/blocks/dist",
    },
  },
  optimizeDeps: {
    // what else can we do here?
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "styled-components",
      "hoist-non-react-statics",
      "react-is",
      "lodash.uniqueid",
      "@primer/react",
      "picomatch-browser",
    ],
  },
  build: {
    commonjsOptions: {
      include: /node_modules/,
    },
  },
  plugins: [
    https ? basicSsl() : null,
    react(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Access-Control-Allow-Private-Network", "true");
          next();
        });
      },
    },
    {
      name: "dev-server-endpoints",
      configureServer: (server) => {
        server.middlewares.use("/blocks.config.json", (req, res) => {
          const json = fs.readFileSync("./blocks.config.json");
          sendJson(res, JSON.parse(json));
        });

        server.middlewares.use("/git.config.json", (req, res) => {
          sendJson(res, parseGitConfig.sync());
        });
      },
    },
  ],
});

module.exports = getViteConfigDev;
