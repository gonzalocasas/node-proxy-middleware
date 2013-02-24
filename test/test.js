var connect = require('connect')
  , assert = require('assert')
  , proxy = require('../')
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , http = require('http')
  , exec = require('child_process').exec
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

  it("Can still proxy empty requests if the request stream has ended.", function(done) {
    var destServer = createServerWithLibName('http', function(req, resp) {
      resp.statusCode = 200;
      resp.write(req.url);
      resp.end();
    });

    var app = connect();
    //connect.directory causes the incoming request stream to be ended for GETs.
    app.use(connect.directory(path.resolve('.')));
    app.use('/foo', proxy(url.parse('http://localhost:8001/')));

    destServer.listen(8001, 'localhost', function() {
      app.listen(8000);
      http.get('http://localhost:8000/foo/test/', function(res) {
        var data = '';
        res.on('data', function (chunk) {
          data += chunk;
        });
        res.on('end', function () {
          assert.strictEqual(data, '/test/');
          done();
        });
      }).on('error', function () {
        assert.fail('Request proxy failed');
      });
    });
  });

  it("can proxy just the given route.", function(done) {
    var destServer = createServerWithLibName('http', function(req, resp) {
      resp.statusCode = 200;
      resp.write(req.url);
      resp.end();
    });

    var proxyOptions = url.parse('http://localhost:8003/');
    proxyOptions.route = '/foo';

    var app = connect(
      connect.directory(path.resolve('.')),
      // we must pass the route within the options here
      proxy(proxyOptions)
    );

    destServer.listen(8003, 'localhost', function() {
      app.listen(8002);
      http.get('http://localhost:8002/foo/test/', function(res) {
        var data = '';
        res.on('data', function (chunk) {
          data += chunk;
        });
        res.on('end', function () {
          assert.strictEqual(data, '/test/');
          done();
        });
      }).on('error', function () {
        assert.fail('Request proxy failed');
      });
    });
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
