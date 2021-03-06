var demeteorizer = require('demeteorizer'),
    _ = require('underscore'),
    path = require('path'),
    promise = require('bluebird'),
    logger = require('./logger');

demeteorizer = promise.promisify(demeteorizer);

module.exports = {
    run: function (options) {
        // Fill in options with defaults
        var meteorOptions = _.defaults(options.meteor || {}, {
            debug: false,
            input: process.cwd(),
            directory: path.join(process.cwd(), '.demeteorized'),
            json: {},
            architecture: null
        });

        logger.info('run-demeteorizer', 'Starting Demeteorizer');
        logger.verbose('run-demeteorizer', 'Options: ' + JSON.stringify(meteorOptions));
        
        // Run demeteorizer, which disassembles our meteor app into a node app.
        return demeteorizer(meteorOptions)
            .then(function () {
                logger.info('run-demeteorizer', 'Demeteorization Finished');
            }).catch(function (err) {
                logger.error('run-demeteorizer', 'Demeteorizer encountered an error');
                return promise.reject(err);
            });
    }
}