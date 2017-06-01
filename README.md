# slamback
[![Build Status](https://travis-ci.org/totomz/slamback.svg?branch=master)](https://travis-ci.org/totomz/slamback)

Simple AWS Lambda function to post a message on a Slack! channel from AWS CodePipeline

To create a Slack token

1. Create a new Slack app
2. Add a bot user
3. Go on OAuth & Permissions, and select "Install app to team" under "OAuth Tokens & Redirect URLs"
4. Your token is `Bot User OAuth Access Token`
