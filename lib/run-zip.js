var fs = require('fs'),
	_ = require('underscore'),
	path = require('path'),
	Promise = require('bluebird'),
	logger = require('./logger'),
    archiver = require('archiver');


module.exports = {
	run: function() {
        return new Promise(function(resolve, reject){
            logger.info('run-zip', 'Creating bundle.zip');
            
            // Create output stream to zip file
            var output = fs.createWriteStream(path.join(process.cwd(), '.demeteorized/bundle.zip'));
            output.on('error', function(err){               
                logger.error('run-zip', 'Error while writing to bundle.zip');
                reject(err);
            });
            output.on('close', function(){
                logger.verbose('run-zip', archive.pointer() + ' total bytes');
                logger.verbose('run-zip', 'bundle.zip finished being written to');
                resolve();
            });
            
            var archive = archiver('zip', {});
            logger.verbose('run-zip', 'Current Directory: ' + process.cwd());
            logger.verbose('run-zip', 'Target Directory for bundle' + (path.join(process.cwd(), '.demeteorized/bundle')));
            
            // Enqueues the bundle directory for file zipping
            archive.directory(path.join(process.cwd(), '.demeteorized/bundle'), false);
            archive.on('error', function(err) {
                logger.error('run-zip', 'Error while creating archive');
                reject(err);
            });
            
            // TODO create status stream - how to best estimate size?
            
            // Pipes content to output stream (.zip file)
            archive.pipe(output);
            
            // Signals archive that we're done queueing files
            archive.finalize();            
        });
    }
}