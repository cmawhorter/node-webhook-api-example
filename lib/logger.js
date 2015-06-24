'use strict';

var bunyan = require('bunyan');
var PrettyStream = require('bunyan-prettystream');

var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

var streams = [
  {
      level: 'info'
    , type: 'raw'
    , stream: prettyStdOut
  }
];

var logger = bunyan.createLogger({
  name: process.title,
  streams: streams,
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err,
    error: bunyan.stdSerializers.err
  }
});

var verbose = process.argv.indexOf('-v') > -1 || process.argv.indexOf('--verbose') > -1;
if (verbose) {
  logger.levels(0, 10);
}

console.log('Log Level: ' + logger.levels(0));

module.exports = logger;
