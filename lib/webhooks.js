var request = require('request');

module.exports = {
  trigger: function(credentials, hookBody, callback) {
    callback = callback || function(){};
    request({
      url: 'https://api.hook.rest/',
      method: 'POST',
      headers: {
        'X-Api-Key': credentials.key
      },
      auth: {
        user: credentials.user,
        pass: credentials.password
      },
      json: hookBody
    }, function(err, hookResponse, body) {
      if (err || !body) {
        // This should not happen.
        return callback(err || new Error('no body returned'));
      }
      callback(null, body);
    });
  }
};
