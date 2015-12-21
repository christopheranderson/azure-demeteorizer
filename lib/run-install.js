var fs = require('fs'),
	_ = require('underscore'),
	path = require('path'),
	Promise = require('bluebird'),
	logger = require('./logger'),
    spawn = require('child_process').spawn;
	
var stat = Promise.promisify(fs.stat);

var pathToServer = './.demeteorized/bundle/programs/server';

module.exports = {
	run: function() {
		logger.info('run-install','Starting Installation');
        return new Promise(function(resolve, reject) {
            // Check that the file path exists
            stat(pathToServer)
            .catch(reject)
            .then(function() {
                logger.verbose('run-install','Changing directory to ', pathToServer);
                process.chdir(pathToServer);
            })
            // Installs npm packages required by demeteorized app
            .then(install)
            .catch(reject)
            // Copy the program.json file to the bundle directory (because meteor expects our Node app to start in the server folder...)
            .then(copyProgramsJson)
            .catch(reject)
            .then(function(){
                // Jump down to bundle 
                // TODO: this is pretty hacky
                logger.verbose('run-install','Changing directory to ', path.join(pathToServer, '../..'));
                process.chdir('../..');
            })
            // Copy the Web.config file into the root directory so IIS Node will use "main.js"
            .then(copyWebConfig)
            .catch(reject)
            .then(function() {
                // Return to where we started
                // TODO: this is pretty hacky too
                logger.verbose('run-install','Changing directory to ', path.join(pathToServer, '../../../..'))
                process.chdir('../..');
                resolve();
            });
        });
	}
}

var install = function() {
    return new Promise(function(resolve, reject) {
        // Run npm install
        logger.verbose('run-install','Installing packages for server');
        var isWin = /^win/.test(process.platform);
        var child = spawn(isWin ? 'cmd' : 'sh', [isWin?'/c':'-c', 'npm', 'install']);
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        child.on('error', function(err) {
            logger.error('run-install', err);
            reject(err);
        });
        child.on('exit', function(code) {
            if(code != 0) return reject(new Error('npm install failed, see npm-debug.log for more details'));
            resolve();
        });
    });
}

var copyFile = function(source, target) {
    // Took some ideas from: http://stackoverflow.com/a/14387791/3662111
    return new Promise(function(resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on("error", function(err) {
            reject(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function(err) {
            reject(err);
        });
        wr.on("close", function(ex) {
            resolve();
        });
        var status = logger.newStream('Moving file - ' + path.basename(source), fs.statSync(source).size);
        rd.pipe(status).pipe(wr);
    })
}

var copyWebConfig = function() {
    return copyFile(path.join(__dirname, '../resources/web.config'), path.join(process.cwd(), 'web.config'));
}

var copyProgramsJson = function() {
    return copyFile(path.join(process.cwd(), 'program.json'), path.join(process.cwd(), '../../program.json'));
}