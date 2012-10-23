var connect = require('connect')
  , assert = require('assert')
  , proxy = require('../')
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , key = fs.readFileSync(path.join(__dirname, "server.key"))
  , cert = fs.readFileSync(path.join(__dirname, "server.crt"))

describe("proxy", function() {
  it("http -> https", function(done) {
    testWith('http', 'https', done);
  });

  it("https -> http", function(done) {
    testWith('https', 'http', done);
  });

  it("http -> http", function(done) {
    testWith('http', 'http', done);
  });

  it("https -> https", function(done) {
    testWith('https', 'https', done);
  });
});

function createServerWithLibName(libName, requestListener) {
  var httpLib = require(libName);
  if (libName === "http") {
    return httpLib.createServer(requestListener);
  } else {
    return httpLib.createServer({key: key, cert: cert}, requestListener);
  }
}

function testWith (srcLibName, destLibName, cb) {
  var srcHttp = require(srcLibName);
  var destHttp = require(destLibName);

  var destServer = createServerWithLibName(destLibName, function(req, resp) {
    assert.strictEqual(req.method, 'GET');
    assert.strictEqual(req.headers['x-custom-header'], 'hello');
    assert.strictEqual(req.url, '/api/a/b/c/d');
    resp.statusCode = 200;
    resp.setHeader('x-custom-reply', "la la la");
    resp.write('this is your body.');
    resp.end();
  });
  destServer.listen(0, 'localhost', function() {
    var app = connect();
    var destEndpoint = destLibName + "://localhost:" + destServer.address().port + "/api";
    var reqOpts = url.parse(destEndpoint);
    reqOpts.rejectUnauthorized = false; // because we're self-signing for tests
    app.use(proxy(reqOpts));
    var srcServer = createServerWithLibName(srcLibName, app);
    srcServer.listen(0, 'localhost', function() {
      // make client request to proxy server
      var srcRequest = srcHttp.request({
        port: srcServer.address().port,
        method: "GET",
        path: "/a/b/c/d",
        headers: {
          "x-custom-header": "hello"
        },
        rejectUnauthorized: false,
      }, function (resp) {
        var buffer = "";
        assert.strictEqual(resp.statusCode, 200);
        assert.strictEqual(resp.headers['x-custom-reply'], 'la la la');
        resp.setEncoding('utf8');
        resp.on('data', function(data) {
          buffer += data;
        });
        resp.on('end', function() {
          assert.strictEqual(buffer, 'this is your body.');
          srcServer.close()
          destServer.close();
          cb();
        });
      });
      srcRequest.end();
    });
  });
}
