var Promise = require('bluebird'),
    logger = require('./logger'),
    fs = require('fs'),
    path = require('path'),
    semver = require('semver');

var exec = Promise.promisify(require('child_process').exec);

var versionChecks = [{
    name: 'node',
    cmd: 'node -v',
    versions: '0.10.40'
},
{
    name: 'python',
    cmd: 'python ' + path.join(__dirname, '../version.py'), // for some reason, python --version doesn't return on stdout
    versions: '2.7.x'
},
{
    name: 'meteor',
    cmd: 'meteor --version',
    versions: '>0.8.1 || 1.x'
}]

module.exports = {
    run: function(options){
        logger.level = 'silly';
        return new Promise(function(resolve, reject){
            Promise.all(versionChecks.map(function(check){
                return validateVersion(check.name, check.cmd, check.versions);
            }))
            .catch(reject)
            .then(checkForVCR)
            .catch(reject)
            .then(resolve);
        });
    }
}

var validateVersion = function(name, cmd, versions) {
    return new Promise(function(resolve, reject) {
        exec(cmd)
        .catch(reject)
        .then(function(result){
            logger.silly(cmd + ' -> stdout: ' + result);
            var matches = result.match(/(\d+\.\d+\.\d+)/g);
            var curr = matches ? matches[0] : null;

            // Meteor 1.3 returns "Meteor 1.3" without a PATCH revision. This isn't semver compliant, so we need
            // to cater for MAJOR.MINOR. If found, append .0 to make it MAJOR.MINOR.PATCH so that semver works.
            if (matches == null) {
                matches = result.match(/(\d+\.\d+)/g);
                curr = matches ? matches[0] + '.0' : null;
            }

            if(curr && semver.satisfies(curr, versions)){
                logger.verbose('run-precheck', name + ' has a valid version. Current version: ' + curr + ' Valid version(s): ' + versions);
                resolve();
            } else {
                reject(name + ' has an invalid version. Current version: ' + curr + ' Valid version(s): ' + versions);
            }
        })
        .then(resolve, reject);
    })
}

var checkForVCR = function() {
    return new Promise(function(resolve, reject) {
        if(!process.env.windir) return resolve('Could not find windows directory');
        fs.readdir(path.resolve(process.env.windir, 'System32'), function(err, dirs){
            if(err) reject(err);
            dirs = dirs.filter(function(i) {
                if(i.indexOf('msvcr') > -1) {
                    return i;
                }
            });
            if(dirs.length > 0) {
                logger.verbose('run-precheck', 'Has a version of MSVCR installed');
                return resolve();
            } else {
                return reject('You need to install a Microsoft Visual C++ Redistributable. Consult node-gyp for more information. Installation will likely fail.');
            }
        })
    })
}