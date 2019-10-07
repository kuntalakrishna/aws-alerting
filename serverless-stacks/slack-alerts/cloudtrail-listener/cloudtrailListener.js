var aws  = require('aws-sdk');
var zlib = require('zlib');
var async = require('async');
const fs = require('fs');

var EVENT_SOURCE_TO_TRACK = /ssm.amazonaws.com/;  
var EVENT_NAME_TO_TRACK   = /GetParameter/; 
var DEFAULT_SNS_REGION  = 'eu-west-2';

const ALERTS_PUBLISH_SNS_ARN = process.env.ALERTS_PUBLISH_SNS_ARN;

var s3 = new aws.S3();
var sns = new aws.SNS({
    apiVersion: '2010-03-31',
    region: DEFAULT_SNS_REGION
});

exports.handler = function(event, context, callback) {
    var srcBucket = event.Records[0].s3.bucket.name;
    var srcKey = event.Records[0].s3.object.key;
   
    async.waterfall([
        function fetchLogFromS3(next){
            console.log('Fetching compressed log from S3...');
            s3.getObject({
               Bucket: srcBucket,
               Key: srcKey
            },
            next);
        },
        function uncompressLog(response, next){
            console.log('Uncompressing log archive...');
            zlib.gunzip(response.Body, next);
        },
        function publishNotifications(jsonBuffer, next) {
            try {
                console.log('Reading event filters file: event-filters.json');
                var fileData = fs.readFileSync('cloudtrail-listener/event-filters.json');
                var eventFilters = JSON.parse(fileData);
                console.log(eventFilters);

                console.log('Filtering logs...');
                var json = jsonBuffer.toString();
                var records;
                try {
                    records = JSON.parse(json);
                } catch (err) {
                    next('Unable to parse CloudTrail JSON: ' + err);
                    return;
                }
                //console.log('\n' + json);
                var matchingRecords = records
                    .Records
                    .filter(function(record) {
                        // Reverse the negation returned from subsequent 'every' loop
                        var shouldInclude = !eventFilters
                            .events
                            .every(function(eventFilter) {
                                var isMatchingRecord = record.eventSource.match(eventFilter.eventSource)
                                    && record.eventName.match(eventFilter.eventType)
                                    && evaluateExclusions(record, eventFilter.exclusions);
                                
                                // Negate it so that 'every' loop will not break out. Dirty way because 'break;' does not work on 'forEach' loop
                                return !isMatchingRecord;
                            });
                        return shouldInclude;
                    });
                    
                console.log('Publishing ' + matchingRecords.length + ' notification(s)...');
                if(matchingRecords.length > 0) {
                    var message = ':rotating_light::rotating_light: *Access Alerts* :rotating_light::rotating_light:\n\n';
                    matchingRecords.forEach(function(record) {
                            console.log('Publishing notification: \n', JSON.stringify(record));
                            message += '```Event Id     : ' + record.eventID + '\nTime         : ' + formatDate(record.eventTime) + '\nResource ARN : ' + record.resources[0].ARN + '\nAccessed By  : ' + record.userIdentity.principalId.split(':')[1] + '```\n';
                        }
                    );
                    publishMessageToSNS(message);
                }
            } catch (error) {
                // Publish message to slack and re-throw the error
                var errorMessage = 'Errors while iterating through cloudtrail records:\n';
                errorMessage += '```' + error.stack + '```';
                publishMessageToSNS(errorMessage);
            }
        }
    ], function (err) {
        if (err) {
            console.error('Failed to publish notifications: ', err);
        } else {
            console.log('Successfully published all notifications.');
        }
        callback(null,'message');
    });
};

const evaluateExclusions = (record, exclusions) => {
    var shouldInclude = true;
    exclusions.forEach(function(exclusion) {
        var pathValue = record;
        exclusion.paramKey.split('.').forEach(function (item) {
            // If the value is an array, then pick up the 0th element
            if(pathValue[item] === undefined) {
                pathValue = pathValue[0][item];
            } else {
                pathValue = pathValue[item];
            }
        });
        shouldInclude = shouldInclude && !pathValue.includes(exclusion.pattern);
    });
    return shouldInclude;
};

const formatDate = (dateString) => {
    var date = new Date(dateString);
    var convertedString = date.toString().replace('GMT+0000 (Coordinated Universal Time)', 'GMT');
    return convertedString;
};

const publishMessageToSNS = (message) => {
    console.log('Publishing message to SNS: \n' + message);
    sns.publish({
        Message: message,
        TopicArn: ALERTS_PUBLISH_SNS_ARN
    }, function(err,data) {
        if (err) {
            console.log('Error sending a message', err);
        } else {
            console.log('Sent message:', data.MessageId);
        }
    });
};