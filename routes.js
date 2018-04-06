
var commonHeaders={'Content-type': "text/html"};
var querystring = require("querystring");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var https = require("https");
var http = require("http");
var util = require("util");

function Profile(username) {
    
        EventEmitter.call(this);
    
        profileEmitter = this;
    
        var request = https.get("https://teamtreehouse.com/" + username + ".json", function(response) {
            var body = "";
    
            if (response.statusCode !== 200) {
                request.abort();
                
                profileEmitter.emit("error", new Error("There was an error getting the profile for " + username + ". (" + http.STATUS_CODES[response.statusCode] + ")"));
            }
    
            
            response.on('data', function (chunk) {
                body += chunk;
                profileEmitter.emit("data", chunk);
            });
    
            response.on('end', function () {
                if(response.statusCode === 200) {
                    try {
                        
                        var profile = JSON.parse(body);
                        profileEmitter.emit("end", profile);
                    } catch (error) {
                        profileEmitter.emit("error", error);
                    }
                }
            }).on("error", function(error){
                profileEmitter.emit("error", error);
            });
        });
    }
    
    util.inherits( Profile, EventEmitter );

function mergeValues(values, content) {
 
  for(var key in values) {
    
    content = content.replace("{{" + key + "}}", values[key]);
  }
 
  return content;
}

function view(templateName, values, reponse) {
  
  var fileContents = fs.readFileSync('./html/' + templateName + '.html', {encoding: "utf8"});
  
  fileContents = mergeValues(values, fileContents);

  reponse.write(fileContents);
}
//Handle HTTP route GET / and POST / i.e. Home
function home(request, response) {
    //if url == "/" && GET
    if(request.url === "/") {
      if(request.method.toLowerCase() === "get") {
        //show search
        response.writeHead(200, commonHeaders);  
        view("index", {}, response);
        
        response.end();
      } else {
        //if url == "/" && POST
        
        //get the post data from body
        request.on("data", function(postBody) {
          //extract the username
          var query = querystring.parse(postBody.toString());
    //redirect to /:username
          response.writeHead(303,{"Location": "/"+ query.username});
          response.end();
        
        });
        
      }
    }
    
  }
  
  //Handle HTTP route GET /:username i.e. /chalkers
  function user(request, response) {
    //if url == "/...."
    var username = request.url.replace("/", "");
    if(username.length > 0) {
      response.writeHead(200, commonHeaders);  
         
      
      //get json from Treehouse
      var studentProfile = new Profile(username);
      //on "end"
      studentProfile.on("end", function(profileJSON){
        //show profile
        
        //Store the values which we need
        var values = {
          avatarUrl: profileJSON.gravatar_url, 
          username: profileJSON.profile_name,
          badges: profileJSON.badges.length,
          javascriptPoints: profileJSON.points.JavaScript
        }
        //Simple response
       view("profile", values, response);
        
        response.end();
      });
          
      //on "error"
      studentProfile.on("error", function(error){
        //show error
       view("error", {errorMessage: error.message}, response);
       
        response.end();
      });
        
    }
  }
  module.exports.home=home;
  module.exports.user=user;  
  
    