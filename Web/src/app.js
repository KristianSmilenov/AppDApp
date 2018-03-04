'use strict';

var url = require('url');
const http = require('http');
const fs = require('fs');
const express = require('express');
const SwaggerExpress = require('swagger-express-mw');

//front-end server
http.createServer(function (req, res) {
  const prefix = "./Web/src/web_app";
  var q = url.parse(req.url, true);
  var filename = prefix + q.pathname;
  fs.readFile(filename, function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    }  
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}).listen(8080);


  //api server

const config = {
    configDir:  `${__dirname}\\api\\swagger\\config`,
    swaggerFile:`${__dirname}\\api\\swagger\\swagger.yaml`,
    appRoot: `${__dirname}`
};
  
const app = express();

SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { throw err; }
  
    // install middleware
    swaggerExpress.register(app);
    
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const swaggerDocument = YAML.load(config.swaggerFile)
  
    const port = process.env.PORT || 10010;
    if (process.env.HOST) {
      swaggerDocument.host = `${process.env.HOST}:${port}`;
    }
  
    // app.use(basicAuth({
    //     users: { 'admin': 'adminisawesome' },
    //     challenge: true
    // }));
  
    app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    
    app.listen(port);

    console.log('You can find Swagger at: http://127.0.0.1:' + port);
  });
  