[![Build Status](https://secure.travis-ci.org/superjoe30/connect-proxy.png)](http://travis-ci.org/superjoe30/connect-proxy)

### Usage:

```js
var connect = require('connect')
  , url = require('url')
  , proxy = require('proxy-middleware')

var app = connect();
app.use('/api', proxy(url.parse('https://example.com/endpoint')));
// now requests to '/api/x/y/z' are proxied to 'https://example.com/endpoint/x/y/z'
```

### Documentation:

`proxyMiddleware(options)`

`options` allows any options that are permitted on the [`http`](http://nodejs.org/api/http.html#http_http_request_options_callback) or [`https`](http://nodejs.org/api/https.html#https_https_request_options_callback) request options.

Other options:
- `route`: you can pass the route for connect middleware within the options, as well.

### Usage with route:

```js
var proxyOptions = url.parse('https://example.com/endpoint');
proxyOptions.route = '/api';

var middleWares = [proxy(proxyOptions) /*, ...*/];

// Grunt connect uses this method
connect(middleWares);
```
