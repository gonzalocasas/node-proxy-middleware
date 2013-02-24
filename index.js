var owns = {}.hasOwnProperty;
module.exports = function proxyMiddleware(options) {
  var httpLib = options.protocol === 'https:' ? 'https' : 'http';
  var request = require(httpLib).request;
  options = options || {};
  options.hostname = options.hostname;
  options.port = options.port;
  return function (req, resp, next) {
    var url = req.url;
    // You can pass the route within the options, as well
    if (typeof options.route === 'string') {
      var route = slashJoin(options.route, '');
      if (url.slice(0, route.length) === route) {
        url = url.slice(route.length);
      } else {
        return next();
      }
    }
    options.path = slashJoin(options.pathname, url);
    options.method = req.method;
    options.headers = options.headers ? extend(req.headers, options.headers) : req.headers;
    var myReq = request(options, function (myRes) {
      resp.writeHead(myRes.statusCode, myRes.headers);
      myRes.on('error', function (err) {
        next(err);
      });
      myRes.pipe(resp);
    });
    myReq.on('error', function (err) {
      next(err);
    });
    if (!req.readable) {
      myReq.end();
    } else {
      req.pipe(myReq);
    }
  };
};

function slashJoin(p1, p2) {
  if (p1.length && p1[p1.length - 1] === '/') {p1 = p1.substring(0, p1.length - 1); }
  if (p2.length && p2[0] === '/') {p2 = p2.substring(1); }
  return p1 + '/' + p2;
}

function extend(obj, src) {
  for (var key in src) if (owns.call(src, key)) obj[key] = src[key];
  return obj;
}
