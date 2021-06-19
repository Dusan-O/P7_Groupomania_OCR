const http = require('http');                // IMPORT HTTP
const app = require('./app')                 // IMPORT APP.JS

app.set('port, 3000')                        // PORT USED BY EXPRESS
const server = http.createServer(app);       

server.listen(3000);                         // REQUESTS PORT 3000