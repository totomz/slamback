# slamback
[![Build Status](https://travis-ci.org/totomz/slamback.svg?branch=master)](https://travis-ci.org/totomz/slamback)

AWS Lambda function to post message/artifact from CodePipeline to a Slack! channel.

# Why do you need this
[AWS CodePipeline](http://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)is a must-to-use continuous delivery service .

This simple AWS Lambda function can be invoked at any stage of your Pipeline to send a message to a slack channel, or to post the artifact built from AWS CodeBuild

# How to use
## Create a Slack token
1. Create a new Slack app
2. Add a bot user
3. Go on OAuth & Permissions, and select "Install app to team" under "OAuth Tokens & Redirect URLs"
4. Your token is `Bot User OAuth Access Token`

## Create the Lambda function
As simple as using CloudFormation: ![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=slamback-stack&templateURL=https://s3-eu-west-1.amazonaws.com/slamback-release/aws_stack.json).
 
Put the Slack! token in the required parameter. 
 
 ## How to use
 In any pipeline stage, add an AWS Lambda action. Slamback is configured with `UserParams`:'
```json
{
  "slackChan":"The channe where the message is posted", 
  "message":"The message to post.", 
  "slackToken":"This will override the token set during the installation", 
  "artifact":"The name of the artifact to deploy in S3"
}
```

# Limitations
This is still in progress. I'm adding functionalities as needed. Current limitations are
- CodeDeploy must be configured to build artifacts without path
- Only 1 artifact can be published ~~somewhere~~ to S3