express-webapp-host
===================

Simple express middleware to host a static directory under a deeper url by rewriting the webapps index.html base tag

## index.html

The index.html base tag must be present.

    <meta charset="utf-8">
    <base href='http://localhost:8888/' />
    <title>My App</title>

It will be rewritten to the actual base path. Using the express example below when access via localhost it would rewrite it to:

    <meta charset="utf-8">
    <base href='http://localhost:8080/url/to/app/' />
    <title>My App</title>

All url in the app should be relative paths.

## usage with express

    var webAppHost = require('express-webapp-host');
    var express = require('express');
    var app = express();

    app.use('/url/to/app/', webAppHost.webApp('./path/to/app/on/disk'));
    app.listen(8080)

## angular.js

In combination with angular.js it is now possible to deep link when using Html5 Mode
    
    $locationProvider.html5Mode(true);

Make sure all paths are relative unless you explicitly want to leave the sub location ('/url/to/app/' in the example above)
