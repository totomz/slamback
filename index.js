var Slamback = require('./slamback');
var AWS = require('aws-sdk');


/**
 * Simple interaction between codePipeline and Slack.
 * If a build succeed, post the artifact in the slack channel
 *
 * It is configured using the UserParameter field:
 * UserParameters": "{\"slackChan\":\"#dev\", \"message\":\"a message\", \"slackToken\":\"slackToken\", \"artifact\":\"The artifact to post\"}"
 *
 * @param event
 * @param context
 * @param callback
 */
exports.handler = (event, context, callback) => {
    console.log("debug");
    console.log(JSON.stringify(event["CodePipeline.job"]));

    const codepipeline = new AWS.CodePipeline();
    const jobId = event["CodePipeline.job"].id;
    const config = JSON.parse(event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters);
    let artifact = event["CodePipeline.job"].data.inputArtifacts.filter(artifact => artifact.name === config.artifact);

    if(artifact.length != 1){
        callback(new Error(`Only 1 artifact is allowed - looking for ${config.artifact}`), 'Artifact NOT published!');
    }
    artifact = artifact[0];

    let slamback = new Slamback(config);
    slamback
        // .postMessage(config.slackChan, config.message)
        .getS3Object({
            bucket: artifact.location.s3Location.bucketName,
            key: artifact.location.s3Location.objectKey
        })
        .then(slamback.unzip)
        .then((file) => {
            return slamback.slackPostFile({
                title: config.artifact,
                channels: config.slackChan,
                initial_comment: config.message,
                file: file
            })
        })
        .done(
            function(fullfilled){
                console.log("===== SUCCESS =====");
                var params = {
                    jobId: jobId
                };
                codepipeline.putJobSuccessResult(params, function(err, data) {
                    if(err){
                        console.log(`Error setting putJobSuccessResult ${err} - but Slamback succeed`);
                        callback(err, 'Artifact published!');
                    }
                    else {
                        callback(null, 'Artifact published!');
                    }
                });
            },
            function(rejected){
                var params = {
                    jobId: jobId,
                    failureDetails: {
                        message: rejected.message,
                        type: 'JobFailed',
                        externalExecutionId: context.invokeid
                    }
                };
                codepipeline.putJobFailureResult(params, function(err, data) {
                    callback(rejected, 'Artifact NOT published!');
                });
            }
        );
};