[![Build Status](https://secure.travis-ci.org/superjoe30/connect-proxy.png)](http://travis-ci.org/superjoe30/connect-proxy)

Usage:

```js
var connect = require('connect');
var proxy = require('proxy-middleware');

var app = connect();
connect.use('/api', proxy("https://example.com/endpoint"));
```
