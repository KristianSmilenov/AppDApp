'use strict';

const express = require('express');
const SwaggerExpress = require('swagger-express-mw');
const BasicAuth = require('express-basic-auth');

//front-end server

const mywebapp = express();
mywebapp.use(express.static(`${__dirname}\\web_app\\js`));
mywebapp.use(express.static(`${__dirname}\\web_app\\css`));
mywebapp.use(express.static(`${__dirname}\\web_app\\img`));
mywebapp.use(express.static(`${__dirname}\\web_app\\`));

//admin area - password protected
mywebapp.use(BasicAuth({
    users: { 'admin': '123' },
    challenge: true
}));
mywebapp.use('/admin/html', express.static(`${__dirname}\\web_app\\admin`));
mywebapp.use('/admin/js', express.static(`${__dirname}\\web_app\\js`));
mywebapp.use('/admin/css', express.static(`${__dirname}\\web_app\\css`));
mywebapp.use('/admin/img', express.static(`${__dirname}\\web_app\\img`));
mywebapp.listen(8080);

console.log('You can find the web application at: http://127.0.0.1:8080');

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

    console.log('You can find the REST API at: http://127.0.0.1:' + port);
  });
  