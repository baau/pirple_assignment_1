// Primary File for the API



// Dependencies

var http =  require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');


// Instantiating the https server
var httpServer = http.createServer(function(req,res){

 unifiedServer(req, res);

});

// Start the http server
httpServer.listen(config.httpPort, function(){
  //console.log("Config Variable", config);
  console.log("The server is now listening at port:" + config.httpPort );
})

// https server options
var httpsServerOptions = {
 'key': fs.readFileSync('./https/key.pem'),
 'cert': fs.readFileSync('./https/cert.pem')

};
// Indtantiate the https server
var httpsServer = https.createServer(httpsServerOptions, function(req, res){
  unifiedServer(req, res);
});

// Start the https server
httpsServer.listen(config.httpsPort, function(){
  //console.log("Config Variable", config);
  console.log("The server is now listening at port:" + config.httpsPort );
})

// All the server logic for both the http & https server
var unifiedServer = function(req, res){

  // Get the URL and pass it
var  parsedURL = url.parse(req.url, true);

  // Get the path
var path = parsedURL.pathname;
var trimmedPath = path.replace(/^\/+|\/+$/g, '');

// Get the query strinf as an object
var queryStringObject = parsedURL.query;

// Get the HTTP method
var method = req.method.toLowerCase();

// Get the headers as an queryStringObjec

var headers = req.headers;


// Get the payload if there is any
var decoder = new StringDecoder('utf-8');
var buffer = '';
req.on('data', function(data){
  buffer += decoder.write(data);
});

req.on('end', function(){
  buffer += decoder.end();
  // Choose the handler this request should go to, default is notFound
  var chosenHandler = typeof(router[trimmedPath])!== 'undefined'? router[trimmedPath]:handlers.notFound;

  // Construct the data object to send to the hanlder
  var data = {
    'trimmedPath': trimmedPath,
    'queryStringObject' : queryStringObject,
    'method': method,
    'header': headers,
    'payload': buffer
  };

// Route the request to the handler specified in the router
chosenHandler(data, function(statusCode, payload){
  //Use the statusCode called back by the handler , or default to 200
  statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

  // Use the payload calledback  by the handler
  payload = typeof(payload) == 'object'? payload: {};

  // Convert the payload to a string_decoder
 var payloadString = JSON.stringify(payload);

 // Send the response
 res.setHeader('Content-Type', 'application/json');
 res.writeHead(statusCode);
res.end(payloadString);
// Log the request
console.log('Returning this response: ' , statusCode,payloadString);
});




});
}

// Defining handlers
var handlers = {};

// ping handlers
handlers.ping = function(data, callback){
  // callback an http status code, and a payload object
  callback(200);

};

// Hello handler
handlers.hello = function(data, callback){
  callback(200,{welcome_message: "Hello there, welcome to the API!"  });
}

// Default handlers
handlers.notFound = function (data, callback){
 callback(404);
};

// Defining the request router
var router = {
  'ping': handlers.ping,
  'hello': handlers.hello

};
