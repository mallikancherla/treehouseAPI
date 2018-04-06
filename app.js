var http = require("http");
var routes = require("./routes.js");

http.createServer(function(request, response){
    routes.home(request, response);
    routes.user(request, response);
  
}).listen(3000);
console.log("Server Running at\nhttp://127.0.0.1:3000\nhttp://localhost:3000");