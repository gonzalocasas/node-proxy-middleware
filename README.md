[![Build Status](https://secure.travis-ci.org/superjoe30/connect-proxy.png)](http://travis-ci.org/superjoe30/connect-proxy)

### Usage:

```js
var connect = require('connect')
  , url = require('url')
  , proxy = require('proxy-middleware')

var app = connect();
connect.use('/api', proxy(url.parse("https://example.com/endpoint")));
```

### Documentation:

`proxyMiddleware(options)`

`options` allows any options that are permitted on the `http` or `https`
request options.
