[![Build Status](https://secure.travis-ci.org/superjoe30/connect-proxy.png)](http://travis-ci.org/superjoe30/connect-proxy)

### Usage:

```js
var connect = require('connect')
  , url = require('url')
  , proxy = require('proxy-middleware')

var app = connect();
app.use('/api', proxy(url.parse("https://example.com/endpoint")));
// now requests to "/api/x/y/z" are proxied to "https://example.com/endpoint/x/y/z"
```

### Documentation:

`proxyMiddleware(options)`

`options` allows any options that are permitted on the `http` or `https`
request options.
