### Deploying function on AWS
npm install async
npm install fs

SLACK_CHANNEL='<SLACK-CHANNEL-NAME>' SLACK_WEBHOOK_URL='<SLACK-WEBHOOK-URL>' serverless deploy --aws-profile <aws-profile-name> --region <region> --stage <stage>

### Destroying serverless function
serverless remove --aws-profile <aws-profile-name> --region <region> --stage <stage>

#### Testing alerts.py
serverless invoke -f alerts --aws-profile <aws-profile-name> --region <region> --stage <stage> --path alerts/test/test-slack-alerts.json

#### Testing active_stacks.py
serverless invoke -f activeStacks --aws-profile <aws-profile-name> --region <region> --stage <stage> --path cloudformation-active-stacks/test/test-active-stacks.json

#### Testing cloudtrail-listener.js
#### Windows
7z a cloudtrail-listener/test/test-event.gz cloudtrail-listener/test/test-event.json && aws s3 rm s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && aws s3 cp cloudtrail-listener/test/test-event.gz s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && rm cloudtrail-listener/test/test-event.gz

#### Linux or MacOs
gzip -c cloudtrail-listener/test/test-event.json > cloudtrail-listener/test/test-event.gz && aws s3 rm s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && aws s3 cp cloudtrail-listener/test/test-event.gz s3://<aws-account-number>-cloudtrail-logs/test/test-event.gz --profile <aws-profile-name> && rm cloudtrail-listener/test/test-event.gz