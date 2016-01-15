
var logger = require('./lib/logger'),
    utils = require('./lib/utils'),
    demeteorizer = require('./lib/run-demeteorizer'),
    installer = require('./lib/run-install'),
    zip = require('./lib/run-zip'),
    deploy = require('./lib/run-deploy'),
    program = require('commander'),
    promise = require('bluebird');

/*
 * Private Functions
 */

var exitOnError = function (err) {
    logger.error('main', 'Error encountered');
    logger.error('main', err);
    process.exit(1);
}

var setLogLevel = function (logLevel, disableColor) {
    logger.level = logLevel
    if (disableColor) {
        logger.disableColor();
    }
    logger.verbose('main', 'Log level:', logger.level);
}

/*
 * Read in command line arguments
 */

program
    .version(require('./package.json').version);
	
/*
 * Build - Demeteorize your application
 */
program
    .command('build')
    .alias('b')
    .description('Builds a demeteorized bundle')
    .option('-l --loglevel [loglevel]', 'Set the logging level (silly|verbose|info|warn|error)', /^(silly|verbose|info|warn|error)$/i, 'info')
    .option('--nocolor', 'Disables colors')
    .action(function (options) {
        setLogLevel(options.loglevel, options.nocolor);
        promise.resolve(options)
            .then(function (options) {
                logger.info('main', 'Build started');
                return options;
            })
            .then(demeteorizer.run)
            .catch(exitOnError)
            .then(function () {
                logger.info('main', 'Build completed');
            });
    });

/*
 * Install - Install dependencies
 */
program
    .command('install')
    .alias('i')
    .description('Installs NPM packages & dependencies for App Service')
    .option('-l --loglevel [loglevel]', 'Set the logging level (silly|verbose|info|warn|error)', /^(silly|verbose|info|warn|error)$/i, 'info')
    .option('--nocolor', 'Disables colors')
    .action(function (options) {
        setLogLevel(options.loglevel, options.nocolor);
        promise.resolve(options)
            .then(function (options) {
                logger.info('main', 'Install started');
                return options;
            })
            .then(installer.run)
            .catch(exitOnError)
            .then(function () {
                logger.info('main', 'Install completed');
            });
    });

/*
 * Zip - Zip up the files for deployment
 */
program
    .command('zip')
    .alias('z')
    .description('Zips up the bundle for deployment to App Service')
    .option('-l --loglevel [loglevel]', 'Set the logging level (silly|verbose|info|warn|error)', /^(silly|verbose|info|warn|error)$/i, 'info')
    .option('--nocolor', 'Disables colors')
    .action(function (options) {
        setLogLevel(options.loglevel, options.nocolor);
        promise.resolve(options)
            .then(function (options) {
                logger.info('main', 'Zip started');
                return options;
            })
            .then(zip.run)
            .catch(exitOnError)
            .then(function () {
                logger.info('main', 'Zip completed');
            });
    });

/*
 * Deploy - Deploy the files to Azure
 */
program
    .command('deploy')
    .alias('d')
    .description('Deploys zipped bundle to App Service')
    .option('-s, --siteName [sitename]', 'Name of your App Service App')
    .option('-u, --username [username]', 'Username for Kudu Deployment')
    .option('-p, --password [password]', 'Password for Kudu Deployment')
    .option('-l --loglevel [loglevel]', 'Set the logging level (silly|verbose|info|warn|error)', /^(silly|verbose|info|warn|error)$/i, 'info')
    .option('--nocolor', 'Disables colors')
    .action(function (options) {
        if (!options.siteName || !options.username || !options.password) {
            return exitOnError('You must specify a sitename, username, and password when using the (d)eploy command.');
        }
        setLogLevel(options.loglevel, options.nocolor);
        promise.resolve(options)
            .then(function (options) {
                logger.info('main', 'Deploy started');
                return options;
            })
            .then(deploy.run)
            .catch(exitOnError)
            .then(function () {
                logger.info('main', 'Deploy completed');
            });
    });

program
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    utils.brand();
    program.outputHelp();
}

