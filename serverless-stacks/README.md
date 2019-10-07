# Introduction
These serverless stacks helps you monitor active cloudformation stacks and restricted resources access. The cost of this stack is almost $0.00/month and provides lots of benefits in terms of cost savings and AWS account security. For security compliance, the most important things are to protect the secure resources such as database passwords stored in Secret Manager or AWS Parameter Store, KMS keys, Security Groups for service access, etc. Checking CloudTrail logs manually or setting them up for alerting is always a big task. Also, for cost saving purposes, many organisations kill the non-production environments during the non-office hours or over the weekends. For some reasons, if these stacks are still active, people would like to know so that they can take down those environments to save the costs incurred against the idle resources on AWS cloud.

As part of this complete stack it creates
1. CloudTrail
2. S3 bucket for cloudtrail logs
3. SNS Topic for posting messages to slack
4. Slack Alerts Lambda
5. CloudTrail S3 bucket Listener Lambda
6. Periodic check for Active CloudFormation stacks to save the cost

## CloudTrail Serverless stack
This stack creates a CloudTrail which posts the trails periodically to S3. As AWS suggests, the first copy of CloudTrail is free, so this will not incurr any cost. Depending on the size of Trails, you might incurr S3 storage charges. However, these charges for S3 storage would be very minimal (either $0.00 or not more than few cents a month). To create this stack, follow the steps mentioned in cloudtrail/README.md

## Slack Alerts Serverless stack
As part of this stack, an SNS Topic is created to which a `slack-alerts` lambda is subscribed. As soon as a message is published on this SNS Topic, alerts lambda captures it and sends an alert to Slack by formatting a message which is consumable by Slack. `cloudformation-active-stacks` checks for the active stacks periodically (configurable value which is currently set as  everyday at `18:00` and `22:00` as part of this stack). If there are any stacks active, it constructs a message and posts it to the above mentioned SNS Topic which is in turn alerted on Slack. `cloudtrail-listener` lambda subscribes itself for cloudtrail S3 bucket put object events and parses the json data to find relative events. It only looks for the events configured in `event-filters.yml` file where you can specify ignore/exclude filters for particular events.

# Pre-requisites
* [Node package manager](https://www.npmjs.com/get-npm)
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
* [Serverless framework](https://serverless.com/framework/docs/getting-started/)