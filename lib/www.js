'use strict';

var restify = require('restify');

var webhooks = require('./webhooks.js');

var LOG_LEVELS = [ 'info', 'warn', 'error', 'debug', 'trace' ];

module.exports = function(credentials, logger) {
  var server = restify.createServer({ log: logger });
  var FakeDB = [];

  server.on('after', function(req, res, route) {
    req.log.trace({ route: route, path: req.url.path, time: req.time() }, 'request completed');
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.authorizationParser());
  server.use(restify.dateParser());
  server.use(restify.jsonp());
  server.use(restify.gzipResponse());
  server.use(restify.bodyParser({
    maxBodySize: 262144, // 256k; 1048576 = 1mb
    mapParams: true,
    mapFiles: false,
    overrideParams: false
  }));
  server.use(restify.requestLogger());

  server.on('connection', function(socket) {
    socket.on('error', function(err) {
      logger.error({ err: err }, 'socket error');
    });
  });

  server.on('uncaughtException', function (req, res, route, err) {
    logger.error({ err: err, route: route, req: req, res: res }, 'uncaught exception');
    res.json(500, {
        code: 'InternalServerError'
      , message: 'unknown error; this error has been logged'
    });
    // uncaughtexceptions are fatal and should *never* happen
    process.exit(1);
  });

  server.get('/log/:id', function(req, res, next) {
    var entry = FakeDB[req.params.id];
    if (entry) {
      res.json(200, entry);
      next();
    }
    else {
      return next(new restify.NotFoundError('invalid ID'));
    }
  });

  function createHandler(req, res, next) {
    var logLevel = req.params.level && LOG_LEVELS.indexOf(req.params.level) > -1 ? req.params.level : 'info';

    // XXX: bad validation implementation. replace with something better in production.
    if ('message' in req.body && 'data' in req.body && 'callback' in req.body) {
      logger[logLevel](req.body.data || {}, req.body.message);

      var entryIndex = FakeDB.push({ headers: req.headers, url: req.url, body: req.body, params: req.params }) - 1;

      // We have now received the request from the end-user and inserted it safely into our "db".

      // Let the API client know:
      res.json(200, { id: entryIndex });
      next();

      // And now let's trigger our webhook/event.

      // Start by preparing your request to hook.rest which will handle the handle the request along
      // with all the retries and backing off.

      // The hook body could be any info and many other options are configurable.
      // See https://www.hook.rest/docs for more info.
      var hookOptions = {
        url: req.body.callback,
        method: 'POST',
        json: {
          id: entryIndex,
          timestamp: new Date(),
          hello: [
            'This is the webhook callback response. It',
            'includes an ID for your message that can be ',
            'used to retrieve a copy of your original request.'
          ]
        }
      };
      webhooks.trigger(credentials, hookOptions, logger.info.bind(logger));
    }
    else {
      return next(new restify.BadRequestError('invalid data'));
    }
  }

  server.post('/log', createHandler);
  server.post('/log/:level', createHandler);

  return server;
};
