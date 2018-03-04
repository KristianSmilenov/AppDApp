
const http = require('http');
const fs = require('fs');
const express = require('express');
const SwaggerExpress = require('swagger-express-mw');

//front-end server
http.createServer(function (req, res) {
    fs.readFile('./Web/src/index.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
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
  