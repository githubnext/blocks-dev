const chalk = require('chalk')
const { createServer } = require("vite")
const viteConfigDev = require('./config/vite.config.dev')
const paths = require('./config/paths');
const build = require('./build');
const chokidar = require('chokidar');

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

require('./config/env');

const main = async () => {
  const devServer = await createServer(
    viteConfigDev
  );

  console.log(chalk.cyan('Starting the development server...\n'));

  await devServer.listen();
  devServer.printUrls()

  if (process.env.CI !== 'true') {
    // Gracefully exit when stdin ends
    process.stdin.on('end', function () {
      devServer.close();
      process.exit();
    });
  }

  // build blocks bundles on changes to blocks folder
  // we need the bundles for mimicking "prod" behavior
  chokidar.watch(paths.blocksFolder, {
    persistent: true,
    ignoreInitial: false,
  }).on('all', async (event, path) => {
    if (event === 'change') {
      console.log(chalk.cyan(`Change detected in ${path}, rebuilding blocks bundles...`));
    } else if (event === 'add') {
      console.log(chalk.cyan(`File ${path} added, rebuilding blocks bundles...`));
    } else {
      console.log(chalk.cyan(`Rebuilding blocks bundles...`));
    }
    await build();
  })

}
main()