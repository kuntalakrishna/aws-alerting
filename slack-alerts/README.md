# Introduction
This stack creates a SNS topic, **slack-alerts** lambda, **cloudformation-active-stacks** lambda and **cloudtrail-listetner** lambda.

**slack-alerts:** Lambda listens to the events published on SNS topic and sends alerts to slack using `WEBHOOK_URL`. 

**cloudformation-actice-stacks:** Lambda is triggerred using Cloudwatch Rules everyday at `18:00` and `22:00` which finds out currently active cloudformation stacks in the AWS account. This lambda function can be extended to scan for any type of resource in AWS account. It currently accepts **EXCLUDED_STACKS** parameter in which comma seperated stack names can be specified which needs to be excluded from this alerting.

**cloudtrail-listetner** lambda registers itself to a trigger for cloudtrail S3 bucket's PUT events. Whenever a new trail is published to S3 bucket, this trigger will invoke **cloudtrail-listetner** lambda which will scan through the published trail (JSON) to find out the events of our interest. The events which needs to be alerted can be specified in [event-filters.yml](cloudtrail-listener/event-filters.yml) file. You can apply exclusions as well for these cloudtrail alerting. Exclusion is handy where you don't want to be alerted if the resource is accessed as a result of automated deployment. In most of the cases you want capture events only if someone manually tries to access the restricted resource.


**Note:** Please ignore the parameter ```--aws-profile <aws-profile-name>``` for all the serverless commands if you have only one profile setup for AWS CLI on your machine.

## Deploying serverless stack on AWS
```
cd slack-alerts
```

```
npm install

SLACK_CHANNEL='<SLACK-CHANNEL-NAME>' \
SLACK_WEBHOOK_URL='<SLACK-WEBHOOK-URL>' \
serverless deploy --aws-profile <aws-profile-name> \
--region <region> \
--stage <stage>
```

**SLACK-CHANNEL-NAME:** Name of the slack channel on which notifications to be sent

**SLACK-WEBHOOK-URL:** Slack webhook URL which can be obtained by following the steps listed [here](https://medium.com/@krishnakuntala/aws-codepipeline-slack-integration-41dfaff2414e#bc60).

## Testing
```
cd slack-alerts
```
### Testing slack-alerts function
```
serverless invoke -f alerts --aws-profile <aws-profile-name> \
--region <region> \
--stage <stage> \
--path alerts/test/test-slack-alerts.json
```

### Testing cloudformation-active-stacks function
```
serverless invoke -f activeStacks --aws-profile <aws-profile-name> \
--region <region> \
--stage <stage> \
--path cloudformation-active-stacks/test/test-active-stacks.json
```

### Testing cloudtrail-listener function
`7z` or `gzip` command creates an archive containing [test-event.json](test/test-event.json) file. Below command posts this archive to S3 bucket where cloudtrail publishes the logs. This put object will trigger cloudtrail-listener lambda which will scan through the json and process it to produce alerts message.

#### Windows
```
7z a cloudtrail-listener/test/test-event.gz cloudtrail-listener/test/test-event.json && \
aws s3 rm s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && \
aws s3 cp cloudtrail-listener/test/test-event.gz s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && \
rm cloudtrail-listener/test/test-event.gz
```

#### Linux or MacOs
```
gzip -c cloudtrail-listener/test/test-event.json > cloudtrail-listener/test/test-event.gz && \
aws s3 rm s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && \
aws s3 cp cloudtrail-listener/test/test-event.gz s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && \
rm cloudtrail-listener/test/test-event.gz
```

## Destroying serverless stack on AWS
```
cd slack-alerts
```
```
serverless remove --aws-profile <aws-profile-name> \
--region <region> \
--stage <stage>
```
