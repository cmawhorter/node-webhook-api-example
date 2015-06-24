Node.js Restify API with Webhooks
==================================

This is an example of how to use [restify](http://mcavage.me/node-restify/) and [hook.rest](https://www.hook.rest/) to create a REST API that triggers webhooks (events) to call back to a URL of the end-user's choice.


## Quick Start

The first step is register for the free [hook.rest](https://www.hook.rest/), clone this project locally and then:

```
$ npm install
$ node app.js
$ vi credentials.json
$ node app.js
```

You now have a restify server running locally and taking requests.

## About the Example API

The example server does something that is not particularly useful and has two methods (Create and Get) that will log a message to the console and also return details about the logged message.

### Create Log Message

`POST /log(/:level)?`

cURL example:
```
curl -H 'Content-Type: application/json' \
  -d '{ "message": "hello world", "data": null, "callback": "http://requestb.in/sx8r7csx" }' \
  http://localhost:3000/log
```

Should contain a body like so:

```javascript
{
  // This is the message that gets logged to the console at the optional log level included in the path.
  "message": "",

  // An object to include along with the message being logged.
  "data": {},

  // The URL target of the webhook.  After the message is logged the webhook will be triggered.
  // Try a service like http://requestb.in/ or http://httpresponder.com/
  "callback": ""
}
```

#### Response:

The API will respond with an object that contains the numeric ID of the log entry. 

Additionally, the raw response from hook.rest is output to the console for debugging/testing purposes.

#### Example Response:

```javascript
{ 
  // ID of our log entry, returned from the example API
  "id": 0
}
```

### Get Log Message

`GET /log/:id`

cURL example:
```
curl http://localhost:3000/log/0
```

Returns details about that log entry associated with that ID.  
