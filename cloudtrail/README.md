# Introduction
This serverless stack will create a cloudtrail and an S3 bucket (name: `<aws-account-id>-cloudtrail-logs`). The trails are stored for only 1 day in S3 bucket to minimize the cost and the triggers are added to notify a lambda when the trails are published by AWS. The trigger is added as part of stack creation of [slack-alerts](../slack-alerts/README.md).


**Note:** Please ignore the parameter ```--aws-profile <aws-profile-name>``` for all the serverless commands if you have only one profile setup for AWS CLI on your machine.

### Deploying cloudtrail serverless stack on AWS
```
serverless deploy --aws-profile <aws-profile-name> \
--region <region> \
--stage <stage>
```

### Destroying cloudtrail serverless stack
```
aws s3 rm s3://<aws-account-id>-cloudtrail-logs --profile <aws-profile-name> --recursive && \
serverless remove --aws-profile <aws-profile-name> \
--region eu-west-2 \
--stage dev
```