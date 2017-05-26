var AWS = require('aws-sdk'),
    WebClient = require('@slack/client').WebClient,
    Promise = require('promise'),
    AdmZip = require('adm-zip'),
    fs = require('fs'),

    slack;

/**
 * Was supposed to be a library, it ended being just a wrapper :(
 */

/**
 *
 * @param {Object} config - Configuration object
 * @param {String} config.slackToken - User token to interact with slack
 * @constructor
 */
function Slamback(config){
    this.config = config;
    if(!this.config.slackToken) {
        throw new Error(`Slack token is required!`);
    }
    slack = new WebClient(this.config.slackToken);
}

/**
 *
 * @param {String} message
 */
Slamback.prototype.postMessage = function (message) {
    return slack.chat.postMessage(this.config.slackChan, message);
};

/**
 * @see {@link https://api.slack.com/methods/files.upload|files.upload}
 *
 * @param {?} filename - Filename of file.
 * @param {Object=} opts
 * @param {?} opts.file - File contents via `multipart/form-data`. If omitting this parameter, you
 *   must submit `content`.
 * @param {?} opts.content - File contents via a POST variable. If omitting this parameter, you
 *   must provide a `file`.
 * @param {?} opts.filetype - A [file type](/types/file#file_types) identifier.
 * @param {?} opts.title - Title of file.
 * @param {?} opts.initial_comment - Initial comment to add to file.
 * @param {?} opts.channels - Comma-separated list of channel names or IDs where the file will be
 *   shared.
 * @returns {ManagedUpload|*|{shape}}
 */
Slamback.prototype.slackPostFile = function(opts){
    var path = opts.file;

    return new Promise(function(fulfill, reject) {
        fs.readdir(path, (err, files) => {
            if(err){
                return reject(err);
            }

            var filesToSend = files.map(file => {
                console.log(`Sending to slack channel ${opts.channels} file [${path}/${file}]`);
                opts.file = fs.createReadStream(`${path}/${file}`);
                return slack.files.upload(file, opts);
            });
            Promise.all(filesToSend)
                .done(fulfill, reject);
        })
    });
};

/**
 *
 * @param {String} zipPath - The absolute path to the zip file to unzip
 * @returns {String} The absolute path to the folder where zip has been unzipped
 */
Slamback.prototype.unzip = function (zipPath) {
    return new Promise((fulfill, reject) =>{
        destPath = `/tmp/${new Date().getTime()}`;
        new AdmZip(zipPath).extractAllTo(destPath, true);
        console.log(`Unzipped file in ${destPath}`);
        fulfill(destPath);
    });
};

/**
 * Download and save in the filesystem an S3 object
 * @param {Object} opt - Configuration object
 * @param {String} opt.bucket - S3 bucket to read from
 * @param {String} opt.key - S3 object key to read
 * @returns {String} Absolute path to the downloaded object
 */
Slamback.prototype.getS3Object = function (opt) {
    return new Promise((fulfill, reject) =>{
        var s3 = new AWS.S3({ region: process.env.AWS_REGION,"signatureVersion":"v4"}),
            temp = `/tmp/${new Date().getTime()}`,
            file = require('fs').createWriteStream(temp),
            params = {Bucket: opt.bucket,Key: opt.key};

        s3.getObject(params)
            .createReadStream()
            .pipe(file)
            .on('finish', (a) => {
                console.log(`Successfully downloaded object from S3 and saved in ${temp} - value was ${a}`);
                fulfill(temp);
            })
            .on('error', (e) => reject(e))
    });
};

module.exports = Slamback;