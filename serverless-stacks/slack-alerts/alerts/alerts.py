import json


import json
import logging
import os
import boto3
import urllib.request

# Read environment variables
SLACK_WEBHOOK_URL = os.environ['SLACK_WEBHOOK_URL']
SLACK_CHANNEL = os.environ['SLACK_CHANNEL']
SLACK_USER = os.environ['SLACK_USER']
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    
    logger.info(event)
    
    # Read message posted on SNS Topic
    message = event['Records'][0]['Sns']['Message']
    logger.info("Message: " + message)
    
    # Construct a slack message
    slack_message = {
        'channel': SLACK_CHANNEL,
        'username': SLACK_USER,
        'text': "%s" % (message)
    }
    with urllib.request.urlopen(SLACK_WEBHOOK_URL,data=bytes(json.dumps(slack_message), encoding="utf-8")) as f:
        resp = f.read()
        logger.info(resp)