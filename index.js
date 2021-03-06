'use strict';

var url = require('url'),
    path = require('path'),
    fs = require('fs'),
    express = require('express'),
    trumpet = require('trumpet'),
    methods = require('methods');

module.exports = function(expressApp){

  function WebAppHost(app){
    this.app = app;
  }
  
  WebAppHost.prototype.webapp = function(path, appDir) {
    this.app.use(path, module.exports.webapp(appDir));
  };

  WebAppHost.prototype.api = function(prefix, middleware, apiFunction, options, auth, server ) {
    module.exports.api( this.app, prefix, middleware, apiFunction, options, auth, server );
  };

  return new WebAppHost(expressApp);
};


module.exports.api = function(app, prefix, middleware, apiFunction, options, auth, server ){

  if( typeof(apiFunction) === 'function'){
  }
  else if( typeof(middleware) === 'function' ){
    server = auth;
    auth = options;
    options = apiFunction;
    apiFunction = middleware;
    middleware = null;
  }

  if(!options){
    options = {};
  }

  var namespacedRouter = createProxyToExpressRouter(app, prefix, middleware);
  apiFunction( namespacedRouter, options, auth, server );
};

function createProxyToExpressRouter( app, prefix, middleware )
{
  var namespacedRouter = {};

  methods.forEach( function wrapAHttpMethod(httpMethod){
    namespacedRouter[httpMethod] = function wrappedHttpMethod(){
      var args = Array.prototype.slice.call(arguments);
      var argumentsToUseInstead = [];

      var url = args.shift();
      var namespacedUrl = prefix + url;

      argumentsToUseInstead.push(namespacedUrl);
      
      if( middleware ) {
        argumentsToUseInstead.push(middleware);
      }

      for (var i = 0; i < args.length; i ++) {
        argumentsToUseInstead.push(args[i]);
      }

      var originalMethod = app[httpMethod];
      originalMethod.apply(app, argumentsToUseInstead);
    };
  });

  return namespacedRouter;
}

module.exports.webapp = function(webAppPath, browserMaxAge) {

  var indexHtmlPath = path.join(webAppPath,'index.html');

  var oneDay = 86400000;

  if(browserMaxAge==null){
    browserMaxAge = oneDay*7;
  }

  var tryServeIndex = serveIndexHtml(indexHtmlPath);
  var tryServeStatic = express.static(webAppPath, {
    redirect: false,
    maxAge: browserMaxAge
  });

  return function(req, res, next) {
    return tryServeIndex(req, res, function(err) {
      if (err) {
        return next(err);
      }
      return tryServeStatic(req, res, next);
    });
  };
};

var serveIndexHtml = function(indexHtmlPath) {
  return function(req, res, next) {
    var baseUrl, patchBaseTag;
    if (requestForFile(req)) {
      return next();
    }
    baseUrl = getBaseUrl(req);
    res.status(200);
    res.header('content-type' , 'text/html' );
    res.header('X-UA-Compatible' , 'IE=edge,chrome=1' );
    
    patchBaseTag = createBaseTagPatchStream(baseUrl);
    return fs.createReadStream(indexHtmlPath).pipe(patchBaseTag).pipe(res);
  };
};

var requestForFile = function(req) {
  var hasAnExtension, lastComponent, lastSlashIndex, requestUrl;
  requestUrl = url.parse(req.url);
  lastSlashIndex = requestUrl.pathname.lastIndexOf('/');
  lastComponent = requestUrl.pathname.substr(lastSlashIndex);

  if( lastComponent.toLowerCase() == '/index.html' )
    return false;

  hasAnExtension = lastComponent.indexOf('.') >= 0;
  return hasAnExtension;
};

var getBaseUrl = function(req) {

  var baseUrlPath;

  if (req.url === '/') {
    baseUrlPath = req.originalUrl;
  } else {
    var appLocalUrlLength = req.url.length;
    var originalUrlLength = req.originalUrl.length;
    var baseUrlLength = originalUrlLength - appLocalUrlLength + 1;
    baseUrlPath = req.originalUrl.substr(0, baseUrlLength);
  }

  if (baseUrlPath.substr(-1, 1) !== '/') {
    baseUrlPath += '/';
  }

  return req.protocol + '://' + req.headers.host + baseUrlPath;
};

var createBaseTagPatchStream = function(baseUrl) {
  var tr = trumpet();

  return tr.select('head > base', function(node) {
    return node.update('', {
      href: baseUrl
    });
  });
};
