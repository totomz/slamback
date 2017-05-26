require('dotenv').config();
var assert = require('chai').assert;
var expect = require('chai').expect;
var Slamback = require('../slamback');
const readFile = require('fs-readfile-promise');


// https://my-ideas-slack.slack.com
var configSet = {"slackChan":"#slamback-dev", "slackToken": process.env.SLACK_TOKEN};

// my-ideas.it@aws
var s3Config = {
    bucket: 'slamback-dev-001',
    key: 'sample-zipped-artifact/afile.csv.zip'
};

describe('Slamback unit test', function() {
    it('#constructor throw an Error if Slack token is missing', function () {
        expect(function () {
            var s = new new Slamback({});
        }).to.throw(Error);
    })

});

describe('Slamback integration test (requires Slack and S3 access)', function() {
    describe('#postMessage', function() {
        it("send a message to slack", () => {
            return new Slamback(configSet)
                .postMessage('A sample message')
                .then((response) => assert.equal(response.ok, true));
        });
    });

    describe('#getS3Object', function() {
        it("Get an object from S3 and put it in /tmp", function () {
            var s = new Slamback(configSet);
            return s.getS3Object(s3Config)
                .then(s.unzip)
                .then((path) => readFile(`${path}/afile.csv`))
                .then((message) => assert.equal(message.toString(), "C'era una volta una gatta"))
        });
    });

    describe('#slackPostFile', function() {
        it("Can post a file to a slack channel", function () {
            return new Slamback(configSet).slackPostFile({
                title: 'Elysium app',
                channels: '#slamback-dev',
                initial_comment: "Try the new release!",
                file: 'test-resources'
            })
            .then(response => assert.equal(response[0].ok, true));
        });
    });
});