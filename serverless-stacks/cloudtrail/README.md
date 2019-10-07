# Introduction
This serverless stack will create a cloudtrail and an S3 bucket (name: `<aws-account-id>-cloudtrail-logs`). The trails are stored in S3 bucket (stored only for 1 day to minimize S3 storage cost) and the triggers are added to notify a lambda when the trails are added. The trigger is added as part of stack creation of ../slack-alerts/README.md.

### Deploying cloudtrail serverless stack on AWS
```
serverless deploy --aws-profile <aws-profile-name> --region <region> --stage <stage>
```

### Destroying cloudtrail serverless stack
```
aws s3 rm s3://<aws-account-id>-cloudtrail-logs --profile <aws-profile-name> --recursive && serverless remove --aws-profile <aws-profile-name> --region eu-west-2 --stage dev
```