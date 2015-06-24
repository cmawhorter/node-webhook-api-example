'use strict';

var credentials;
try {
  credentials = require('./credentials.json');
}
catch (err) {
  console.error('\nCredentials should never be stored in CVS and have not been included.\n\nA file called credentials.json has been created for you.  Please edit it with your credentials.\n');
  require('fs').writeFileSync(__dirname + '/credentials.json', JSON.stringify({ user: '[your https://www.hook.rest user]', password: '[your https://www.hook.rest password]', key: '[your https://www.hook.rest api key]' }, null, 2));
  process.exit(1);
}

var IS_DEV = process.env.NODE_ENV === 'development';

var www = require('./lib/www.js')
  , logger = require('./lib/logger.js');

if (IS_DEV) {
  logger.warn('*** DEVELOPMENT MODE ***');
}

var server = www(credentials, logger);

var portArgIndex = process.argv.indexOf('-p');
var port = (portArgIndex > -1 ? process.argv[portArgIndex + 1] : 3000) || 3000;

logger.debug({ port: port }, 'server starting');
server.listen(port, function() {
  logger.info({ port: port }, 'server started');
});

function exit() {
  logger.info({ pid: process.pid }, 'shutting down');
  try {
    logger.trace('closing server');
    server.close(function() {
      logger.trace('shutting down; exiting');
      process.exit(0);
    });
  }
  catch(err) {
    logger.error({ err: err }, 'shutting down; server error');
    process.exit(1);
  }
}

process.once('SIGINT', exit);
process.once('SIGTERM', exit);

