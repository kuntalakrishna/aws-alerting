import json


import json
import logging
import os
import boto3
import urllib.request

# Read environment variables
EXCLUDED_STACKS = os.environ['EXCLUDED_STACKS']
logger = logging.getLogger()
logger.setLevel(logging.INFO)
sns = boto3.client('sns')

SLACK_ALERTS_SNS_ARN = os.environ['SLACK_ALERTS_SNS_ARN']

def get_active_stacks():
    statuses = ['ROLLBACK_COMPLETE', 'CREATE_COMPLETE', 'UPDATE_COMPLETE', 'CREATE_IN_PROGRESS', 'UPDATE_ROLLBACK_COMPLETE', 'DELETE_FAILED']
    cfn = boto3.resource('cloudformation')
    stacks = [stack for stack in cfn.stacks.all() if stack.stack_status in statuses]
    
    message = "```"
    counter = 0
    for stack in stacks:
        if stack.name not in (EXCLUDED_STACKS):
            counter = counter + 1
            message += str(counter) + '. '
            message += stack.name
            message += "\n"
    
    message += "```\n"
    return message if counter > 0 else ""

def lambda_handler(event, context):
    
    logger.info(event["inputMessage"])
    
    message = event["inputMessage"] +"\n\n"
    stacks_message = get_active_stacks()

    # Post message on SLACK_WEBHOOK_URL
    if stacks_message != "":
        # Construct a slack message
        slack_message = "%s" % (message + stacks_message)
        logger.info("Sending this message to slack:" + slack_message)
        # Publish a simple message to the specified SNS topic
        response = sns.publish(
            TopicArn=SLACK_ALERTS_SNS_ARN,    
            Message=slack_message,    
        )
        logger.info(response)
