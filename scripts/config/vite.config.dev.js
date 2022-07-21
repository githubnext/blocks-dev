const { defineConfig, searchForWorkspaceRoot } = require("vite");
const react = require("@vitejs/plugin-react");
const paths = require("./paths");

// https://vitejs.dev/config/
const config = defineConfig({
  root: paths.blocks + "/src",
  server: {
    middlewareMode: true,
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
      "git-url-parse",
      "styled-components",
      "hoist-non-react-statics",
      "react-is",
      "lodash.uniqueid",
      "@primer/react",
      "picomatch-browser"
    ],
  },
  build: {
    commonjsOptions: {
      include: /node_modules/,
    },
  },
  plugins: [react()],
});

module.exports = config;
