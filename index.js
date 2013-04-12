var url = require('url'),
    path = require('path'),    
    fs = require('fs'),
    express = require('express'),
    _ = require('underscore'),
    trumpet = require('trumpet');

module.exports.webApp = function(webAppPath) {
  
  var indexHtmlPath = path.join(webAppPath,'index.html')

  var tryServeIndex = serveIndexHtml(indexHtmlPath);
  var tryServeStatic = express.static(webAppPath, {
    redirect: false
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
    res.set({
      'content-type': 'text/html'
    });
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
    var baseUrlLength = originalUrlLength - appLocalUrlLength;
    baseUrlPath = req.originalUrl.substr(0, baseUrlLength);
  }
  
  if (baseUrlPath.substr(-1, 1) !== '/') {
    baseUrlPath += '/';
  }

  return req.protocol + "://" + req.headers['host'] + baseUrlPath;
};

var createBaseTagPatchStream = function(baseUrl) {
  var tr = trumpet();

  return tr.select('head > base', function(node) {
    return node.update("", {
      href: baseUrl
    });
  });
};
