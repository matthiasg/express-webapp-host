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



## Api Installation

In Addition to installing a webapp it is also possible to install a namespaced webapi, which is often useful. 

There is a method called 'api' which expect an expressApp, prefix and function. The function will get passed an object which
it can use to register routes as if it where express, but in reality the registered paths are prefixed.

    
    webAppHost.api(app, '/url/to/api', apiFunction );
    
    function apiFunction(prefixedApp){
    
        prefixedApp.get('/test', function(req, res){
            res.send('GET test');
        };
        
    }
    
Note: When the api is in a nested path to the app above you have to put this statement first due to routing rules.


### Convenience 

In order to make it a little easier on the eyes you can also do the following which makes the calls a little
more symetrical:

    var express = require('express');
    var app = express();
    
    var webAppHost = require('express-webapp-host');
    var host = webAppHost(app);

    var apiToHost = require('./apiToHost');

    host.api('/app/api', api );
    host.webapp('/app', __dirname+'/webapp');

    app.listen(8080);





