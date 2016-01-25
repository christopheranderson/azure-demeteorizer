var fs = require('fs'),
    _ = require('underscore'),
    path = require('path'),
    Promise = require('bluebird'),
    logger = require('./logger'),
    request = require('request'),
    rp = require('request-promise');

module.exports = {
    run: function (options) {
        return new Promise(function (resolve, reject) {
            var chain = Promise.resolve()

            if(options.clean) {
                chain = chain
                    .then(fetchProccessList(options.siteName, options.username, options.password))
                    .catch(reject)
                    .then(killProccesses(options.siteName, options.username, options.password, { name: 'node' }))
                    .catch(reject)
                    .then(cleanWwwRoot(options.siteName, options.username, options.password))
                    .catch(reject)
            }
            
            chain    
                .then(deployZip(options))
                .catch(reject)
                .then(resolve);
        })
    }
}

var fetchProccessList = function (sitename, username, password) {
    return function () {
        var options = {
            method: 'GET',
            uri: 'https://' + sitename + '.scm.azurewebsites.net/api/processes',
            auth: {
                user: username,
                password: password
            },
            json: true
        }

        var req = rp(options);

        req.then(function (body) {
            logger.silly(JSON.stringify(body));
            return body;
        });

        return req;
    }
}

var killProccesses = function (sitename, username, password, where) {
    return function (processes) {
        logger.silly('run-deploy', processes);

        logger.silly('run-deploy', 'Filtering processes ...');
        return Promise
            .all(_.where(processes, { 'name': 'node' }).map(function (process) {
                logger.silly('run-deploy', 'Killing process: ' + JSON.stringify(process));
                var options = {
                    mathod: 'DELETE',
                    uri: 'https://' + sitename + '.scm.azurewebsites.net/api/processes/' + process.id,
                    auth: {
                        user: username,
                        password: password
                    },
                    json: true
                }

                var req = rp(options);

                return req;
            }));
    }
}

var cleanWwwRoot = function (sitename, username, password) {
    return function () {
        logger.silly('run-deploy', 'Cleaning wwwroot before deploying new content');
        var options = {
            method: 'POST',
            uri: 'https://' + sitename + '.scm.azurewebsites.net/api/command',
            auth: {
                user: username,
                password: password
            },
            header: {
                "Content-Type": 'application/json'
            },
            body: {
                "command": "powershell \"Get-ChildItem -Exclude 'app_data' | rm -Recurse -Force\"",
                "dir": "site\\wwwroot"
            },
            json: true
        }

        var req = rp(options);

        return req;
    }
}

var deployZip = function (options) {
    return function () {
        return new Promise(function (resolve, reject) {
            var fileToStream = path.join(process.cwd(), '.demeteorized/bundle.zip');
            var fileSize = fs.statSync(fileToStream).size;

            logger.silly('run-deploy', 'Uploading file: ' + fileToStream);
            logger.silly('run-deploy', 'File size: ' + fileSize + ' BYTES');

            var status = logger.newStream('Uploading zip...', fileSize);
            
            // Read the .zip file into the request
            fs.createReadStream(fileToStream)
                .pipe(status)
                .pipe(request
                // PUT /api/zip/site/wwwroot -> body=bundle.zip
                // https://github.com/projectkudu/kudu/wiki/REST-API#zip
                    .put('https://' + options.siteName + '.scm.azurewebsites.net/api/zip/site/wwwroot')
                    .auth(options.username, options.password, true))
                .on('data', function (data) {
                    logger.silly(data);
                })
                .on('response', function (response) {
                    if (response.statusCode != 200) {
                        reject('Non 200 Status Code - Error with deployment. Use --loglevel silly to see full error message.');
                    }
                })
                .on('error', function (err) {
                    logger.error('run-deploy', 'Error while uploading zip');
                    reject(err);
                })
                .on('end', function (err) {
                    if (err) {
                        logger.error('run-deploy', 'Error while uploading zip');
                        return reject();
                    }
                    logger.info('run-deploy', 'Successfully uploaded zip');
                    resolve();
                });
        })
    }
}