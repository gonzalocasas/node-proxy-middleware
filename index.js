var path = require('path')
  , url = require('url');

module.exports = function proxyMiddleware(urlString) {
  var parsedUrl = url.parse(urlString);
  var httpLib = parsedUrl.protocol === 'https:' ? 'https' : 'http';
  var request = require(httpLib).request;
  return function (req, resp, next) {
    var myReq = request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: path.join(parsedUrl.pathname, req.url),
      method: req.method,
      headers: req.headers,
    }, function (myRes) {
      resp.writeHead(myRes.statusCode, myRes.headers);
      myRes.pipe(resp);
    });
    req.on('error', function(err) {
      next(err);
    });
    req.pipe(myReq);
  };
};
