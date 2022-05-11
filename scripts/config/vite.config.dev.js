const { defineConfig, searchForWorkspaceRoot } = require("vite")
const react = require("@vitejs/plugin-react")
const paths = require("./paths")

// https://vitejs.dev/config/
const config = defineConfig({
  root: paths.blocksDev,
  server: {
    port: 4000,
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
      ]
    }
  },
  resolve: {
    alias: {
      "@user": process.cwd(),
    }
  },
  optimizeDeps: {
    // what else can we do here?
    include: ['react', 'react-dom', 'react-dom/client', 'git-url-parse', 'styled-components', 'hoist-non-react-statics', 'react-is', 'lodash.uniqueid', '@primer/react', 'codesandbox-import-utils'],
  },
  build: {
    commonjsOptions: {
      include: /node_modules/,
    }
  },
  plugins: [react()],
});

module.exports = config;