var fs = require('fs'),
    _ = require('underscore'),
    path = require('path'),
    Promise = require('bluebird'),
    logger = require('./logger'),
    request = require('request');

module.exports = {
    run: function (options) {
        return new Promise(function (resolve, reject) {
            var fileToStream = path.join(process.cwd(), '.demeteorized/bundle.zip');
            var fileSize = fs.statSync(fileToStream).size;

            var status = logger.newStream('Uploading zip...', fileSize);
            
            // Read the .zip file into the request
            fs.createReadStream(fileToStream)
                .pipe(status)
                .pipe(request
                    // PUT /api/zip/site/wwwroot -> body=bundle.zip
                    // https://github.com/projectkudu/kudu/wiki/REST-API#zip
                    .put('https://' + options.siteName + '.scm.azurewebsites.net/api/zip/site/wwwroot')
                    .auth(options.username, options.password, true))
                .on('error', function (err) {
                    logger.error('run-deploy', 'Error while uploading zip');
                    reject(err);
                })
                .on('end', function () {
                    logger.info('run-deploy', 'Successfully uploaded zip');
                    resolve();
                });
        })
    }
}