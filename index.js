/*jshint indent:2 globalstrict:true */
/*global module require */

"use strict";

function slashJoin(p1, p2) {
  if (p1.length && p1[p1.length - 1] === '/') {p1 = p1.substring(0, p1.length - 1); }
  if (p2.length && p2[0] === '/') {p2 = p2.substring(1); }
  return p1 + '/' + p2;
}

function extend(to, from) {
  for (var prop in from) {
    if (from.hasOwnProperty(prop)) {
      to[prop] = from[prop];
    }
  }
  return to;
}

module.exports = function proxyMiddleware(options) {
  var httpLib = options.protocol === 'https:' ? 'https' : 'http';
  var request = require(httpLib).request;
  options = options || {};
  options.hostname = options.hostname;
  options.port = options.port;
  return function (req, resp, next) {
    options.path = slashJoin(options.pathname, req.url);
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
    req.pipe(myReq);
  };
};

// Local Variables:
// js-indent-level: 2
// End:
